import { supabase } from "./supabase";
import type { IStaffService } from "./interfaces";
import type { StaffDTO, StaffInput } from "./types";
import { fail, num, role, rows, text } from "./adapters";

type Row = Record<string, unknown>;

export class StaffService implements IStaffService {
  async list(): Promise<StaffDTO[]> {
    const { data, error } = await supabase
      .from("staff")
      .select("staff_id, username, role, branch_id, branches(branch_name)")
      .order("username");
    if (error) fail("Unable to load staff", error);
    return rows(data).map((r) => {
      const b = r.branches as Row;
      return {
        id: text(r.staff_id),
        staffId: text(r.staff_id),
        username: text(r.username),
        role: role(r.role),
        branchId: num(r.branch_id),
        branchName: text(b?.branch_name),
      };
    });
  }

  async create(input: StaffInput): Promise<StaffDTO> {
    const email = input.email?.trim().toLowerCase() ?? "";
    if (!email || !input.password) throw new Error("Email and password are required.");
    const auth = await supabase.auth.signUp({ email, password: input.password });
    if (auth.error) fail("Unable to create staff account", auth.error);
    if (!auth.data.user) throw new Error("Supabase did not create an Auth user.");
    const { data, error } = await supabase
      .from("staff")
      .insert({
        staff_id: auth.data.user.id,
        username: email,
        password: null,
        role: input.role,
        branch_id: input.branchId,
      })
      .select("staff_id, username, role, branch_id")
      .single();
    if (error) fail("Unable to create staff profile", error);
    const branch = await supabase
      .from("branches")
      .select("branch_name")
      .eq("branch_id", data.branch_id)
      .maybeSingle();
    if (branch.error) fail("Unable to load staff branch", branch.error);
    return {
      id: text(data.staff_id),
      staffId: text(data.staff_id),
      username: text(data.username),
      role: role(data.role),
      branchId: num(data.branch_id),
      branchName: text(branch.data?.branch_name),
    };
  }

  async update(id: string, input: StaffInput): Promise<StaffDTO> {
    const { data, error } = await supabase
      .from("staff")
      .update({ username: input.username.trim(), role: input.role, branch_id: input.branchId })
      .eq("staff_id", id)
      .select("staff_id, username, role, branch_id, branches(branch_name)")
      .single();
    if (error) fail("Unable to update staff", error);
    const b = data.branches as Row;
    return {
      id: text(data.staff_id),
      staffId: text(data.staff_id),
      username: text(data.username),
      role: role(data.role),
      branchId: num(data.branch_id),
      branchName: text(b?.branch_name),
    };
  }

  async remove(id: string): Promise<void> {
    const { error } = await supabase.from("staff").delete().eq("staff_id", id);
    if (error) fail("Unable to delete staff profile", error);
  }
}
