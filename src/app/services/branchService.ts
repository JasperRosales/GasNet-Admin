import { supabase } from "./supabase";
import type { IBranchService } from "./interfaces";
import type { BranchDTO, BranchInput } from "./types";
import { fail, num, rows, text } from "./adapters";

export class BranchService implements IBranchService {
  async list(): Promise<BranchDTO[]> {
    const { data, error } = await supabase
      .from("branches")
      .select("branch_id, branch_name, location, contact_no")
      .order("branch_name");
    if (error) fail("Unable to load branches", error);
    return rows(data).map((r) => ({
      id: num(r.branch_id),
      name: text(r.branch_name),
      location: text(r.location),
      contactNo: text(r.contact_no),
    }));
  }

  async create(input: BranchInput): Promise<BranchDTO> {
    const { data, error } = await supabase
      .from("branches")
      .insert({
        branch_name: input.name.trim(),
        location: input.location.trim(),
        contact_no: input.contactNo.trim(),
      })
      .select("branch_id, branch_name, location, contact_no")
      .single();
    if (error) fail("Unable to create branch", error);
    return {
      id: num(data.branch_id),
      name: data.branch_name,
      location: data.location,
      contactNo: data.contact_no,
    };
  }

  async update(id: number, input: BranchInput): Promise<BranchDTO> {
    const { data, error } = await supabase
      .from("branches")
      .update({
        branch_name: input.name.trim(),
        location: input.location.trim(),
        contact_no: input.contactNo.trim(),
      })
      .eq("branch_id", id)
      .select("branch_id, branch_name, location, contact_no")
      .single();
    if (error) fail("Unable to update branch", error);
    return {
      id: num(data.branch_id),
      name: data.branch_name,
      location: data.location,
      contactNo: data.contact_no,
    };
  }

  async remove(id: number): Promise<void> {
    const { error } = await supabase.from("branches").delete().eq("branch_id", id);
    if (error) fail("Unable to delete branch", error);
  }
}
