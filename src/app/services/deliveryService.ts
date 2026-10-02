import { supabase } from "./supabase";
import { fail, rows } from "./adapters";

export interface DeliveryRecord {
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  quantity: number;
  unitPriceAtSale: number;
}

type Row = Record<string, unknown>;

export class DeliveryService {
  async list(): Promise<DeliveryRecord[]> {
    const { data, error } = await supabase
      .from("delivery")
      .select("branch_id, product_id, quantity, unit_price_at_sale, branches(branch_name), products(product_name)")
      .order("created_at", { ascending: false });
    if (error) fail("Unable to load delivery items", error);
    return rows(data).map((row) => {
      const branch = row.branches as Row;
      const product = row.products as Row;
      return {
        branchId: Number(row.branch_id ?? 0),
        branchName: String(branch?.branch_name ?? "Unknown"),
        productId: Number(row.product_id ?? 0),
        productName: String(product?.product_name ?? "Unknown"),
        quantity: Number(row.quantity ?? 0),
        unitPriceAtSale: Number(row.unit_price_at_sale ?? 0),
      };
    });
  }
}
