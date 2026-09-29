import type { User } from "@supabase/supabase-js";
import { supabase } from "./supabase";
import type { IAuthService } from "./interfaces";
import type { GasUser } from "./types";
import { fail, num, role, text } from "./adapters";

export class AuthService implements IAuthService {
  async getGasUser(user: User): Promise<GasUser> {
    if (!user.email) throw new Error("This login is not linked to a staff account.");
    const { data, error } = await supabase
      .from("staff")
      .select("staff_id, username, role, branch_id")
      .eq("username", user.email.toLowerCase())
      .maybeSingle();
    if (error) fail("Unable to load staff profile", error);
    if (!data) throw new Error("This login is not linked to a staff account.");
    const branchResult = await supabase
      .from("branches")
      .select("branch_name")
      .eq("branch_id", data.branch_id)
      .maybeSingle();
    if (branchResult.error) fail("Unable to load staff branch", branchResult.error);
    const branchName = text(branchResult.data?.branch_name);
    return {
      id: text(data.staff_id),
      staffId: text(data.staff_id),
      username: text(data.username),
      role: role(data.role),
      branchId: num(data.branch_id),
      branchName,
    };
  }
}
