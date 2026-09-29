import { supabase } from "./supabase";
import type { ISalesTargetService } from "./interfaces";
import type { BranchSalesTargetDTO, BranchSalesTargetInput } from "./types";
import { fail, num, rows, text } from "./adapters";

type Row = Record<string, unknown>;

function monthlyPeriod(month: string): { periodStart: string; periodEnd: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw new Error("Target month is required.");
  const start = new Date(Date.UTC(Number(match[1]), Number(match[2]), 0));
  return { periodStart: `${match[1]}-${match[2]}-01`, periodEnd: start.toISOString().slice(0, 10) };
}

function mapTarget(r: Row): BranchSalesTargetDTO {
  return {
    id: num(r.target_id),
    branchId: num(r.branch_id),
    periodStart: text(r.period_start),
    periodEnd: text(r.period_end),
    targetRevenue: num(r.target_revenue),
  };
}

export class SalesTargetService implements ISalesTargetService {
  async list(): Promise<BranchSalesTargetDTO[]> {
    const { data, error } = await supabase
      .from("revenue_targets")
      .select("target_id, branch_id, period_start, period_end, target_revenue")
      .order("period_start", { ascending: false })
      .order("branch_id");
    if (error) fail("Unable to load branch sales targets", error);
    return rows(data).map(mapTarget);
  }

  async create(input: BranchSalesTargetInput): Promise<BranchSalesTargetDTO> {
    const { data, error } = await supabase
      .from("revenue_targets")
      .insert({
        branch_id: input.branchId,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        target_revenue: input.targetRevenue,
      })
      .select("target_id, branch_id, period_start, period_end, target_revenue")
      .single();
    if (error) fail("Unable to create branch sales target", error);
    return mapTarget(data);
  }

  async update(id: number, input: BranchSalesTargetInput): Promise<BranchSalesTargetDTO> {
    const { data, error } = await supabase
      .from("revenue_targets")
      .update({
        branch_id: input.branchId,
        period_start: input.periodStart,
        period_end: input.periodEnd,
        target_revenue: input.targetRevenue,
      })
      .eq("target_id", id)
      .select("target_id, branch_id, period_start, period_end, target_revenue")
      .single();
    if (error) fail("Unable to update branch sales target", error);
    return mapTarget(data);
  }

  async remove(id: number): Promise<void> {
    const { error } = await supabase.from("revenue_targets").delete().eq("target_id", id);
    if (error) fail("Unable to delete branch sales target", error);
  }
}
