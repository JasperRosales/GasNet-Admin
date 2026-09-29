import { supabase } from "./supabase";
import type { IInventoryService } from "./interfaces";
import type { InventoryDTO, InventoryInput } from "./types";
import { fail, num, rows, text } from "./adapters";

type Row = Record<string, unknown>;

export class InventoryService implements IInventoryService {
  async list(params: { branchId?: number } = {}): Promise<InventoryDTO[]> {
    let q = supabase
      .from("branch_stock")
      .select(
        "stock_id, branch_id, product_id, quantity, reorder_level, branches(branch_name), products(product_name, weight_kg)"
      )
      .order("stock_id");
    if (params.branchId) q = q.eq("branch_id", params.branchId);
    const { data, error } = await q;
    if (error) fail("Unable to load inventory", error);
    return rows(data).map((r) => {
      const b = r.branches as Row;
      const p = r.products as Row;
      return {
        stockId: num(r.stock_id),
        branchId: num(r.branch_id),
        branchName: text(b?.branch_name),
        productId: num(r.product_id),
        productName: text(p?.product_name),
        weightKg: num(p?.weight_kg),
        quantity: num(r.quantity),
        reorderLevel: num(r.reorder_level),
        lowStock: num(r.quantity) <= num(r.reorder_level),
      };
    });
  }

  async upsert(input: InventoryInput): Promise<InventoryDTO> {
    const payload = {
      branch_id: input.branchId,
      product_id: input.productId,
      quantity: input.quantity,
      reorder_level: input.reorderLevel,
    };
    const query =
      input.stockId === undefined
        ? supabase.from("branch_stock").upsert(payload, { onConflict: "branch_id,product_id" })
        : supabase.from("branch_stock").update(payload).eq("stock_id", input.stockId);
    const { data, error } = await query
      .select(
        "stock_id, branch_id, product_id, quantity, reorder_level, branches(branch_name), products(product_name, weight_kg)"
      )
      .single();
    if (error) fail("Unable to save inventory", error);
    const b = data.branches as Row;
    const p = data.products as Row;
    return {
      stockId: num(data.stock_id),
      branchId: num(data.branch_id),
      branchName: text(b?.branch_name),
      productId: num(data.product_id),
      productName: text(p?.product_name),
      weightKg: num(p?.weight_kg),
      quantity: num(data.quantity),
      reorderLevel: num(data.reorder_level),
    };
  }

  async remove(id: number): Promise<void> {
    const { error } = await supabase.from("branch_stock").delete().eq("stock_id", id);
    if (error) fail("Unable to delete inventory", error);
  }
}
