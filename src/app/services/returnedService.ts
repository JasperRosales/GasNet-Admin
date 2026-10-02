import { supabase } from "./supabase";
import { fail, num, rows, text } from "./adapters";

export interface ReturnedRecord {
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  quantity: number;
  trackingNo: string | null;
  transactionDate?: string;
}

type Row = Record<string, unknown>;

export class ReturnedService {
  async searchItems(trackingNo: string): Promise<ReturnedRecord[]> {
    const query = trackingNo.trim();
    if (!query) return [];

    const { data, error } = await supabase
      .from("sales_transaction_items")
      .select("tracking_no, quantity, products(product_name), sales_transactions(transaction_date, branches(branch_name))")
      .ilike("tracking_no", `%${query}%`)
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) fail("Unable to search tracking numbers", error);

    return rows(data).map((row) => {
      const sell = row.sales_transactions as Row;
      const product = row.products as Row;
      const branch = sell?.branches as Row;
      return {
        branchId: Number(sell?.branch_id ?? 0),
        branchName: String(branch?.branch_name ?? "Unknown"),
        productId: Number(product?.product_id ?? 0),
        productName: String(product?.product_name ?? "Unknown"),
        quantity: Number(row.quantity ?? 0),
        trackingNo: row.tracking_no ? String(row.tracking_no) : null,
        transactionDate: sell?.transaction_date && typeof sell.transaction_date === "string" ? sell.transaction_date : "",
      };
    });
  }

  async list(): Promise<ReturnedRecord[]> {
    const { data, error } = await supabase
      .from("returned")
      .select("branch_id, product_id, quantity, tracking_no, branches(branch_name), products(product_name)")
      .order("created_at", { ascending: false });
    if (error) fail("Unable to load returned items", error);
    return rows(data).map((row) => {
      const branch = row.branches as Row;
      const product = row.products as Row;
      return {
        branchId: Number(row.branch_id ?? 0),
        branchName: String(branch?.branch_name ?? "Unknown"),
        productId: Number(row.product_id ?? 0),
        productName: String(product?.product_name ?? "Unknown"),
        quantity: Number(row.quantity ?? 0),
        trackingNo: row.tracking_no ? String(row.tracking_no) : null,
      };
    });
  }

  async recordReturn(input: {
    trackingNo: string;
    quantity: number;
    reason?: string;
  }): Promise<void> {
    const trackingNo = input.trackingNo.trim();
    if (!trackingNo) throw new Error("A tracking number is required.");
    if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
      throw new Error("Quantity must be a positive whole number.");
    }

    const item = await supabase
      .from("sales_transaction_items")
      .select("sales_id, product_id, quantity")
      .eq("tracking_no", trackingNo)
      .maybeSingle();
    if (item.error) fail("Unable to read sale item", item.error);
    if (!item.data) throw new Error("No sale item found with this tracking number.");

    const itemRow = item.data as Row;
    const salesId = num(itemRow.sales_id);
    const productId = num(itemRow.product_id);
    const purchasedQuantity = num(itemRow.quantity);

    const sale = await supabase
      .from("sales_transactions")
      .select("branch_id")
      .eq("sales_id", salesId)
      .maybeSingle();
    if (sale.error) fail("Unable to find the sale", sale.error);
    if (!sale.data) throw new Error("No sale found for that item.");
    const branchId = num((sale.data as Row).branch_id);

    const returned = await supabase
      .from("returned")
      .select("quantity")
      .eq("tracking_no", trackingNo);
    if (returned.error) fail("Unable to check existing returns", returned.error);
    const alreadyReturned = (returned.data ?? []).reduce((sum, row) => sum + num((row as Row).quantity), 0);

    if (alreadyReturned + input.quantity > purchasedQuantity) {
      throw new Error(
        `Only ${purchasedQuantity - alreadyReturned} unit(s) remain returnable for that tracking number.`
      );
    }

    const stock = await supabase
      .from("branch_stock")
      .select("quantity")
      .eq("branch_id", branchId)
      .eq("product_id", productId)
      .maybeSingle();
    if (stock.error) fail("Unable to read stock", stock.error);
    if (!stock.data) throw new Error("No stock record found for that product in that branch.");

    const { error: stockError } = await supabase
      .from("branch_stock")
      .update({ quantity: num((stock.data as Row).quantity) + input.quantity })
      .eq("branch_id", branchId)
      .eq("product_id", productId);
    if (stockError) fail("Unable to update stock", stockError);

    const { error: insertError } = await supabase.from("returned").insert({
      sales_id: salesId,
      branch_id: branchId,
      product_id: productId,
      quantity: input.quantity,
      tracking_no: trackingNo,
      reason: input.reason?.trim() || null,
    });
    if (insertError) fail("Unable to record the return", insertError);
  }
}
