import { supabase } from "./supabase";
import type { ITransactionService } from "./interfaces";
import type { TransactionDTO } from "./types";
import { fail, num, rows, text } from "./adapters";

type Row = Record<string, unknown>;

export class TransactionService implements ITransactionService {
  async list(params: { branchId?: number } = {}): Promise<TransactionDTO[]> {
    let q = supabase
      .from("sales_transactions")
      .select(
        "sales_id, tracking_no, guest_name, guest_phone, delivery_address, transaction_date, branch_id, staff_id, transaction_type, subtotal, total, branches(branch_name), sales_transaction_items(line_id, product_id, quantity, unit_price_at_sale, products(product_name, weight_kg))"
      )
      .order("transaction_date", { ascending: false });
    if (params.branchId) q = q.eq("branch_id", params.branchId);
    const { data, error } = await q;
    if (error) fail("Unable to load transactions", error);
    return rows(data).map((r) => {
      const b = r.branches as Row;
      const items = Array.isArray(r.sales_transaction_items)
        ? (r.sales_transaction_items as Row[])
        : [];
      return {
        salesId: num(r.sales_id),
        trackingNo: text(r.tracking_no) || null,
        guestName: text(r.guest_name),
        guestPhone: text(r.guest_phone) || null,
        deliveryAddress: text(r.delivery_address) || null,
        transactionDate: text(r.transaction_date),
        branchId: num(r.branch_id),
        branchName: text(b?.branch_name),
        staffId: text(r.staff_id),
        transactionType: text(r.transaction_type),
        subtotal: num(r.subtotal),
        total: num(r.total),
        items: items.map((item) => ({
          productId: num(item.product_id),
          productName: text((item.products as Row | null)?.product_name),
          weightKg: num((item.products as Row | null)?.weight_kg),
          quantity: num(item.quantity),
          unitPrice: num(item.unit_price_at_sale),
        })),
      };
    });
  }
}
