import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

export interface NotificationDTO { id: number; branchId: number; title: string; message: string; type: string; createdAt: string; isRead: boolean }
export type StaffRole = "Admin" | "Manager" | "Staff";
export interface GasUser { id: string; staffId: string; username: string; role: StaffRole; branchId: number; branchName: string }
export interface BranchDTO { id: number; name: string; location: string; contactNo: string }
export interface ProductDTO { id: number; name: string; weightKg: number; active: boolean; createdAt?: string; updatedAt?: string }
export interface InventoryDTO { stockId: number; branchId: number; branchName: string; productId: number; productName: string; weightKg: number | null; quantity: number; reorderLevel: number; lowStock?: boolean }
export interface TransactionDTO { salesId: number; trackingNo: string | null; guestName: string; guestPhone?: string | null; deliveryAddress?: string | null; transactionDate: string; branchId?: number; branchName: string; staffId?: string; staffUsername?: string; transactionType: string; subtotal: number; total: number; createdAt?: string; items?: Array<{ productId: number; productName: string; weightKg: number; quantity: number; unitPrice: number }> }
export interface StaffDTO extends GasUser {}
export interface BranchInput { name: string; location: string; contactNo: string }
export interface BranchSalesTargetDTO { id: number; branchId: number; periodStart: string; periodEnd: string; targetRevenue: number }
export interface BranchSalesTargetInput { branchId: number; periodStart: string; periodEnd: string; targetRevenue: number }
export interface ProductInput { name: string; weightKg: number }
export interface CatalogPrice { branchId: number; branchName: string; productId: number; productName: string; price: number }
export interface InventoryInput { stockId?: number; branchId: number; productId: number; quantity: number; reorderLevel: number }
export interface StaffInput { username?: string; email?: string; password?: string; role: StaffRole; branchId: number }
export interface DashboardBranch { branchId: number; branchName: string; name: string; totalCylinders: number; quantity: number; targetGoal: number; status: string; revenue: number; transactionCount: number }
export interface DashboardDTO { metrics: { revenue: number; transactions: number; cylindersInStock: number; lowStockRecords: number }; totalRevenue: number; totalCylinders: number; topBranch: string; targetReachedPercent: number; branchOverview: DashboardBranch[]; branchPerformance: DashboardBranch[] }
export interface AnalyticsMonthPoint { month: string; label: string; revenue: number; expenses: number; profit: number; transactionCount: number; averageOrderValue: number }
export interface AnalyticsWeeklyPoint { day: string; label: string; InStore: number; Commercial: number; Delivery: number; inStore: number; commercial: number; delivery: number }
export interface AnalyticsBranchPerformance { branchId: number; branchName: string; name: string; revenue: number; value: number; transactionCount: number }
export interface AnalyticsDailyPoint { day: string; label: string; revenue: number; transactions: number }
export interface AnalyticsProductPoint { productId: number; productName: string; name: string; totalKg: number; salesValue: number }
export interface AnalyticsDTO { range: { fromDate: string; toDate: string; branchId: number | null }; summary: { revenue: number; transactionCount: number; averageTransactionValue: number }; revenueByMonth: AnalyticsMonthPoint[]; weeklyPerformance: AnalyticsWeeklyPoint[]; dailyPerformance: AnalyticsDailyPoint[]; branchPerformance: AnalyticsBranchPerformance[]; topProducts: AnalyticsProductPoint[]; peakDemandDay: { day: string; transactionCount: number } | null }
export interface AiAnalyticsDTO { generatedAt: string; model: string; summary: string; sentiment: "positive" | "neutral" | "warning"; insights: Array<{ title: string; detail: string; type: string }> }
export interface BranchReadiness { branchId: number; branchName: string; covered: number; total: number; ready: boolean }
export interface HomeInsightsDTO {
  coverage: { branches: number; products: number; prices: number; stock: number; staff: number; targets: number; readyBranches: number; readiness: BranchReadiness[] };
  activity: Array<{ id: string; title: string; detail: string; createdAt: string; kind: "notification" | "sale" }>;
}

type Row = Record<string, unknown>;
const text = (v: unknown) => typeof v === "string" ? v : "";
const num = (v: unknown) => typeof v === "number" ? v : Number(v ?? 0);
function fail(context: string, error: { message: string } | null): never { throw new Error(error ? `${context}: ${error.message}` : `${context}: request failed.`); }
function rows(data: unknown): Row[] { return Array.isArray(data) ? data as Row[] : []; }
function role(v: unknown): StaffRole { return v === "Admin" || v === "Manager" ? v : "Staff"; }

export async function listNotifications(): Promise<NotificationDTO[]> { const { data, error } = await supabase.from("notifications").select("notification_id, branch_id, title, message, notification_type, created_at, is_read").order("created_at", { ascending: false }); if (error) fail("Unable to load notifications", error); return rows(data).map(r => ({ id: num(r.notification_id), branchId: num(r.branch_id), title: text(r.title), message: text(r.message), type: text(r.notification_type), createdAt: text(r.created_at), isRead: r.is_read === true })); }
export async function markNotificationsRead(ids: number[], isRead = true): Promise<void> { if (!ids.length) return; const { error } = await supabase.from("notifications").update({ is_read: isRead }).in("notification_id", ids); if (error) fail("Unable to update notifications", error); }
export async function deleteNotifications(ids: number[]): Promise<void> { if (!ids.length) return; const { error } = await supabase.from("notifications").delete().in("notification_id", ids); if (error) fail("Unable to delete notifications", error); }

export async function getGasUser(user: User): Promise<GasUser> {
  if (!user.email) throw new Error("This login is not linked to a staff account.");
  const { data, error } = await supabase.from("staff").select("staff_id, username, role, branch_id").eq("username", user.email.toLowerCase()).maybeSingle();
  if (error) fail("Unable to load staff profile", error);
  if (!data) throw new Error("This login is not linked to a staff account.");
  const branchResult = await supabase.from("branches").select("branch_name").eq("branch_id", data.branch_id).maybeSingle();
  if (branchResult.error) fail("Unable to load staff branch", branchResult.error);
  const branchName = text(branchResult.data?.branch_name);
  return { id: text(data.staff_id), staffId: text(data.staff_id), username: text(data.username), role: role(data.role), branchId: num(data.branch_id), branchName };
}

export async function listBranches(): Promise<BranchDTO[]> {
  const { data, error } = await supabase.from("branches").select("branch_id, branch_name, location, contact_no").order("branch_name");
  if (error) fail("Unable to load branches", error);
  return rows(data).map(r => ({ id: num(r.branch_id), name: text(r.branch_name), location: text(r.location), contactNo: text(r.contact_no) }));
}
export async function createBranch(v: BranchInput): Promise<BranchDTO> { const { data, error } = await supabase.from("branches").insert({ branch_name: v.name.trim(), location: v.location.trim(), contact_no: v.contactNo.trim() }).select("branch_id, branch_name, location, contact_no").single(); if (error) fail("Unable to create branch", error); return { id: num(data.branch_id), name: data.branch_name, location: data.location, contactNo: data.contact_no }; }
export async function updateBranch(id: number, v: BranchInput): Promise<BranchDTO> { const { data, error } = await supabase.from("branches").update({ branch_name: v.name.trim(), location: v.location.trim(), contact_no: v.contactNo.trim() }).eq("branch_id", id).select("branch_id, branch_name, location, contact_no").single(); if (error) fail("Unable to update branch", error); return { id: num(data.branch_id), name: data.branch_name, location: data.location, contactNo: data.contact_no }; }
export async function deleteBranch(id: number): Promise<void> { const { error } = await supabase.from("branches").delete().eq("branch_id", id); if (error) fail("Unable to delete branch", error); }

function monthlyPeriod(month: string): { periodStart: string; periodEnd: string } {
  const match = /^(\d{4})-(\d{2})$/.exec(month);
  if (!match) throw new Error("Target month is required.");
  const start = new Date(Date.UTC(Number(match[1]), Number(match[2]), 0));
  return { periodStart: `${match[1]}-${match[2]}-01`, periodEnd: start.toISOString().slice(0, 10) };
}
function mapTarget(r: Row): BranchSalesTargetDTO { return { id: num(r.target_id), branchId: num(r.branch_id), periodStart: text(r.period_start), periodEnd: text(r.period_end), targetRevenue: num(r.target_revenue) }; }
export async function listBranchSalesTargets(): Promise<BranchSalesTargetDTO[]> { const { data, error } = await supabase.from("revenue_targets").select("target_id, branch_id, period_start, period_end, target_revenue").order("period_start", { ascending: false }).order("branch_id"); if (error) fail("Unable to load branch sales targets", error); return rows(data).map(mapTarget); }
export async function createBranchSalesTarget(v: BranchSalesTargetInput): Promise<BranchSalesTargetDTO> { const { data, error } = await supabase.from("revenue_targets").insert({ branch_id: v.branchId, period_start: v.periodStart, period_end: v.periodEnd, target_revenue: v.targetRevenue }).select("target_id, branch_id, period_start, period_end, target_revenue").single(); if (error) fail("Unable to create branch sales target", error); return mapTarget(data); }
export async function updateBranchSalesTarget(id: number, v: BranchSalesTargetInput): Promise<BranchSalesTargetDTO> { const { data, error } = await supabase.from("revenue_targets").update({ branch_id: v.branchId, period_start: v.periodStart, period_end: v.periodEnd, target_revenue: v.targetRevenue }).eq("target_id", id).select("target_id, branch_id, period_start, period_end, target_revenue").single(); if (error) fail("Unable to update branch sales target", error); return mapTarget(data); }
export async function deleteBranchSalesTarget(id: number): Promise<void> { const { error } = await supabase.from("revenue_targets").delete().eq("target_id", id); if (error) fail("Unable to delete branch sales target", error); }

export async function listActiveProducts(): Promise<ProductDTO[]> { const { data, error } = await supabase.from("products").select("product_id, product_name, weight_kg, active").eq("active", true).order("weight_kg"); if (error) fail("Unable to load products", error); return rows(data).map(r => ({ id: num(r.product_id), name: text(r.product_name), weightKg: num(r.weight_kg), active: true })); }
export async function listAllProducts(): Promise<ProductDTO[]> { const { data, error } = await supabase.from("products").select("product_id, product_name, weight_kg, active").order("product_name"); if (error) fail("Unable to load products", error); return rows(data).map(r => ({ id: num(r.product_id), name: text(r.product_name), weightKg: num(r.weight_kg), active: r.active !== false })); }

export async function createProduct(v: ProductInput): Promise<ProductDTO> { const { data, error } = await supabase.from("products").insert({ product_name: v.name.trim(), weight_kg: v.weightKg, active: true }).select("product_id, product_name, weight_kg, active").single(); if (error) fail("Unable to create product", error); return { id: num(data.product_id), name: data.product_name, weightKg: num(data.weight_kg), active: true }; }

export async function listCatalogPrices(): Promise<CatalogPrice[]> { const { data, error } = await supabase.from("branch_product_prices").select("branch_id, product_id, price, branches(branch_name), products(product_name)").order("branch_id").order("product_id"); if (error) fail("Unable to load product catalog", error); return rows(data).map(r => ({ branchId: num(r.branch_id), branchName: text((r.branches as Row | null)?.branch_name), productId: num(r.product_id), productName: text((r.products as Row | null)?.product_name), price: num(r.price) })); }
export async function updateCatalogPrice(branchId: number, productId: number, price: number): Promise<void> { if (!Number.isInteger(price) || price < 0) throw new Error("Price must be a non-negative whole number."); const { error } = await supabase.from("branch_product_prices").upsert({ branch_id: branchId, product_id: productId, price }, { onConflict: "branch_id,product_id" }); if (error) fail("Unable to update product price", error); }

export async function updateProduct(id: number, v: ProductInput): Promise<ProductDTO> { const { data, error } = await supabase.from("products").update({ product_name: v.name.trim(), weight_kg: v.weightKg, active: true }).eq("product_id", id).select("product_id, product_name, weight_kg, active").single(); if (error) fail("Unable to update product", error); return { id: num(data.product_id), name: text(data.product_name), weightKg: num(data.weight_kg), active: true }; }
export async function deleteProduct(id: number): Promise<void> { const { error } = await supabase.from("products").update({ active: false }).eq("product_id", id); if (error) fail("Unable to archive product", error); }

export async function listInventory(params: { branchId?: number } = {}): Promise<InventoryDTO[]> { let q = supabase.from("branch_stock").select("stock_id, branch_id, product_id, quantity, reorder_level, branches(branch_name), products(product_name, weight_kg)").order("stock_id"); if (params.branchId) q = q.eq("branch_id", params.branchId); const { data, error } = await q; if (error) fail("Unable to load inventory", error); return rows(data).map(r => { const b = r.branches as Row; const p = r.products as Row; return { stockId: num(r.stock_id), branchId: num(r.branch_id), branchName: text(b?.branch_name), productId: num(r.product_id), productName: text(p?.product_name), weightKg: num(p?.weight_kg), quantity: num(r.quantity), reorderLevel: num(r.reorder_level), lowStock: num(r.quantity) <= num(r.reorder_level) }; }); }
export async function upsertInventory(v: InventoryInput): Promise<InventoryDTO> { const payload = { branch_id: v.branchId, product_id: v.productId, quantity: v.quantity, reorder_level: v.reorderLevel }; const query = v.stockId === undefined ? supabase.from("branch_stock").upsert(payload, { onConflict: "branch_id,product_id" }) : supabase.from("branch_stock").update(payload).eq("stock_id", v.stockId); const { data, error } = await query.select("stock_id, branch_id, product_id, quantity, reorder_level, branches(branch_name), products(product_name, weight_kg)").single(); if (error) fail("Unable to save inventory", error); const b = data.branches as Row; const p = data.products as Row; return { stockId: num(data.stock_id), branchId: num(data.branch_id), branchName: text(b?.branch_name), productId: num(data.product_id), productName: text(p?.product_name), weightKg: num(p?.weight_kg), quantity: num(data.quantity), reorderLevel: num(data.reorder_level) }; }
export async function deleteInventory(id: number): Promise<void> { const { error } = await supabase.from("branch_stock").delete().eq("stock_id", id); if (error) fail("Unable to delete inventory", error); }

export async function listTransactions(params: { branchId?: number } = {}): Promise<TransactionDTO[]> { let q = supabase.from("sales_transactions").select("sales_id, tracking_no, guest_name, guest_phone, delivery_address, transaction_date, branch_id, staff_id, transaction_type, subtotal, total, branches(branch_name), sales_transaction_items(line_id, product_id, quantity, unit_price_at_sale, products(product_name, weight_kg))").order("transaction_date", { ascending: false }); if (params.branchId) q = q.eq("branch_id", params.branchId); const { data, error } = await q; if (error) fail("Unable to load transactions", error); return rows(data).map(r => { const b = r.branches as Row; const items = Array.isArray(r.sales_transaction_items) ? r.sales_transaction_items as Row[] : []; return { salesId: num(r.sales_id), trackingNo: text(r.tracking_no) || null, guestName: text(r.guest_name), guestPhone: text(r.guest_phone) || null, deliveryAddress: text(r.delivery_address) || null, transactionDate: text(r.transaction_date), branchId: num(r.branch_id), branchName: text(b?.branch_name), staffId: text(r.staff_id), transactionType: text(r.transaction_type), subtotal: num(r.subtotal), total: num(r.total), items: items.map(item => ({ productId: num(item.product_id), productName: text((item.products as Row | null)?.product_name), weightKg: num((item.products as Row | null)?.weight_kg), quantity: num(item.quantity), unitPrice: num(item.unit_price_at_sale) })) }; }); }

export async function getHomeInsights(): Promise<HomeInsightsDTO> {
  const [branchesResult, productsResult, pricesResult, stockResult, staffResult, targetsResult, notificationsResult, transactionsResult] = await Promise.allSettled([
    listBranches(), listActiveProducts(), listCatalogPrices(), listInventory(), listStaff(), listBranchSalesTargets(), listNotifications(), listTransactions(),
  ]);
  const branches = branchesResult.status === "fulfilled" ? branchesResult.value : [];
  const products = productsResult.status === "fulfilled" ? productsResult.value : [];
  const prices = pricesResult.status === "fulfilled" ? pricesResult.value : [];
  const stock = stockResult.status === "fulfilled" ? stockResult.value : [];
  const staff = staffResult.status === "fulfilled" ? staffResult.value : [];
  const targets = targetsResult.status === "fulfilled" ? targetsResult.value : [];
  const notifications = notificationsResult.status === "fulfilled" ? notificationsResult.value : [];
  const transactions = transactionsResult.status === "fulfilled" ? transactionsResult.value : [];
  const expected = new Map(branches.map((branch) => [branch.id, products.length]));
  prices.forEach((price) => { if (expected.has(price.branchId)) expected.set(price.branchId, (expected.get(price.branchId) ?? 0) + (stock.some((row) => row.branchId === price.branchId && row.productId === price.productId) ? 1 : 0)); });
  const readiness = branches.map((branch) => { const covered = prices.filter((price) => price.branchId === branch.id && stock.some((row) => row.branchId === branch.id && row.productId === price.productId)).length; const total = expected.get(branch.id) ?? 0; return { branchId: branch.id, branchName: branch.name, covered, total, ready: total > 0 && covered === total }; });
  const month = new Date().toISOString().slice(0, 7);
  const currentTargets = new Set(targets.filter((target) => target.periodStart.slice(0, 7) === month).map((target) => target.branchId));
  const staffed = new Set(staff.map((member) => member.branchId));
  readiness.forEach((branch) => { branch.ready = branch.ready && currentTargets.has(branch.branchId) && staffed.has(branch.branchId); });
  const activity = [
    ...notifications.map((item) => ({ id: `n-${item.id}`, title: item.title || item.type || "Notification", detail: item.message || "New notification", createdAt: item.createdAt, kind: "notification" as const })),
    ...transactions.slice(0, 8).map((item) => ({ id: `s-${item.salesId}`, title: `Sale ${item.trackingNo || `#${item.salesId}`}`, detail: `${item.guestName || "Customer"} · ${item.branchName || "Branch"} · ${item.total.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}`, createdAt: item.transactionDate, kind: "sale" as const })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 8);
  return { coverage: { branches: branches.length, products: products.length, prices: prices.length, stock: stock.length, staff: staff.length, targets: currentTargets.size, readyBranches: readiness.filter((branch) => branch.ready).length, readiness }, activity };
}

export async function getDashboard(): Promise<DashboardDTO> {
  const [allSales, inventory, branches, targets] = await Promise.all([listTransactions(), listInventory(), listBranches(), listBranchSalesTargets()]);
  const month = new Date().toISOString().slice(0, 7);
  const sales = allSales.filter(t => t.transactionDate.slice(0, 7) === month);
  const targetByBranch = new Map(targets.filter(t => t.periodStart.slice(0, 7) === month).map(t => [t.branchId, t.targetRevenue]));
  const branchMap = new Map<number, DashboardBranch>(branches.map(b => [b.id, { branchId: b.id, branchName: b.name, name: b.name, totalCylinders: 0, quantity: 0, targetGoal: targetByBranch.get(b.id) ?? 0, status: "Pending", revenue: 0, transactionCount: 0 }]));
  for (const i of inventory) { const b = branchMap.get(i.branchId); if (b) { b.totalCylinders += i.quantity; b.quantity = b.totalCylinders; } }
  for (const t of sales) { const b = branchMap.get(t.branchId ?? 0); if (b) { b.revenue += t.total; b.transactionCount++; } }
  const list = [...branchMap.values()];
  for (const b of list) b.status = b.targetGoal > 0 ? (b.revenue >= b.targetGoal ? "Reached" : "In Progress") : "No Target";
  const top = [...list].sort((a, b) => b.revenue - a.revenue)[0];
  const totalTarget = list.reduce((sum, b) => sum + b.targetGoal, 0);
  const targetReachedPercent = totalTarget > 0 ? Math.round(list.reduce((sum, b) => sum + b.revenue, 0) / totalTarget * 100) : 0;
  return { metrics: { revenue: sales.reduce((n, t) => n + t.total, 0), transactions: sales.length, cylindersInStock: inventory.reduce((n, i) => n + i.quantity, 0), lowStockRecords: inventory.filter(i => i.lowStock).length }, totalRevenue: sales.reduce((n, t) => n + t.total, 0), totalCylinders: inventory.reduce((n, i) => n + i.quantity, 0), topBranch: top?.branchName ?? "—", targetReachedPercent, branchOverview: list, branchPerformance: list };
}

export async function getAnalytics(params: { fromDate: string; toDate: string; branchId?: number; year?: number; month?: number }): Promise<AnalyticsDTO> { const txns = (await listTransactions()).filter(t => t.transactionDate >= params.fromDate && t.transactionDate <= params.toDate && (!params.branchId || t.branchId === params.branchId) && (!params.year || t.transactionDate.slice(0, 4) === String(params.year)) && (!params.month || Number(t.transactionDate.slice(5, 7)) === params.month)); const months = new Map<string, AnalyticsMonthPoint>(); const weeks = new Map<number, AnalyticsWeeklyPoint>(); const daily = new Map<string, AnalyticsDailyPoint>(); const branches = new Map<number, AnalyticsBranchPerformance>(); const products = new Map<number, AnalyticsProductPoint>(); const days = new Map<string, number>(); for (const t of txns) { const month = t.transactionDate.slice(0,7); const m = months.get(month) ?? { month, label: month, revenue: 0, expenses: 0, profit: 0, transactionCount: 0, averageOrderValue: 0 }; m.revenue += t.total; m.profit = m.revenue; m.transactionCount++; m.averageOrderValue = m.revenue / m.transactionCount; months.set(month,m); const d = daily.get(t.transactionDate) ?? { day: t.transactionDate, label: t.transactionDate, revenue: 0, transactions: 0 }; d.revenue += t.total; d.transactions++; daily.set(t.transactionDate,d); const day = new Date(`${t.transactionDate}T00:00:00`); const wk = Math.min(5, Math.floor((day.getDate()-1)/7)+1); const w = weeks.get(wk) ?? { day: `Week ${wk}`, label: `Week ${wk}`, InStore: 0, Commercial: 0, Delivery: 0, inStore: 0, commercial: 0, delivery: 0 }; if (t.transactionType === "Commercial") { w.Commercial++; w.commercial++; } else if (t.transactionType === "Delivery") { w.Delivery++; w.delivery++; } else { w.InStore++; w.inStore++; } weeks.set(wk,w); const b = branches.get(t.branchId ?? 0) ?? { branchId: t.branchId ?? 0, branchName: t.branchName, name: t.branchName, revenue: 0, value: 0, transactionCount: 0 }; b.revenue += t.total; b.value = b.revenue; b.transactionCount++; branches.set(b.branchId,b); for (const item of t.items ?? []) { const p = products.get(item.productId) ?? { productId: item.productId, productName: item.productName, name: item.productName, totalKg: 0, salesValue: 0 }; p.totalKg += item.quantity * item.weightKg; p.salesValue += item.quantity * item.unitPrice; products.set(item.productId,p); } days.set(t.transactionDate,(days.get(t.transactionDate)??0)+1); } const peak = [...days].sort((a,b)=>b[1]-a[1])[0]; return { range: { fromDate: params.fromDate, toDate: params.toDate, branchId: params.branchId ?? null }, summary: { revenue: txns.reduce((n,t)=>n+t.total,0), transactionCount: txns.length, averageTransactionValue: txns.length ? txns.reduce((n,t)=>n+t.total,0)/txns.length : 0 }, revenueByMonth: [...months.values()], weeklyPerformance: [...weeks.values()], dailyPerformance: [...daily.values()].sort((a,b)=>a.day.localeCompare(b.day)), branchPerformance: [...branches.values()], topProducts: [...products.values()].sort((a,b)=>b.salesValue-a.salesValue || b.totalKg-a.totalKg), peakDemandDay: peak ? { day: peak[0], transactionCount: peak[1] } : null }; }
export async function getAiInsights(params: { fromDate: string; toDate: string }): Promise<AiAnalyticsDTO> { const a = await getAnalytics(params); const d = await getDashboard(); const type = d.metrics.lowStockRecords ? "warning" : a.summary.revenue ? "positive" : "neutral"; return { generatedAt: new Date().toISOString(), model: "Supabase deterministic insights", summary: "Insights derived from current Supabase records.", sentiment: type, insights: [{ title: "Revenue", detail: `Selected-period revenue is ₱${a.summary.revenue.toLocaleString("en-PH")} across ${a.summary.transactionCount} transactions.`, type: "trend" }, { title: "Inventory", detail: `${d.metrics.lowStockRecords} stock records are at or below reorder level.`, type: "inventory" }] }; }

export async function listStaff(): Promise<StaffDTO[]> { const { data, error } = await supabase.from("staff").select("staff_id, username, role, branch_id, branches(branch_name)").order("username"); if (error) fail("Unable to load staff", error); return rows(data).map(r => { const b = r.branches as Row; return { id: text(r.staff_id), staffId: text(r.staff_id), username: text(r.username), role: role(r.role), branchId: num(r.branch_id), branchName: text(b?.branch_name) }; }); }
export async function createStaff(v: StaffInput): Promise<StaffDTO> {
  const email = v.email?.trim().toLowerCase() ?? "";
  if (!email || !v.password) throw new Error("Email and password are required.");
  const auth = await supabase.auth.signUp({ email, password: v.password });
  if (auth.error) fail("Unable to create staff account", auth.error);
  if (!auth.data.user) throw new Error("Supabase did not create an Auth user.");
  const { data, error } = await supabase.from("staff").insert({ staff_id: auth.data.user.id, username: email, password: null, role: v.role, branch_id: v.branchId }).select("staff_id, username, role, branch_id").single();
  if (error) fail("Unable to create staff profile", error);
  const branch = await supabase.from("branches").select("branch_name").eq("branch_id", data.branch_id).maybeSingle();
  if (branch.error) fail("Unable to load staff branch", branch.error);
  return { id: text(data.staff_id), staffId: text(data.staff_id), username: text(data.username), role: role(data.role), branchId: num(data.branch_id), branchName: text(branch.data?.branch_name) };
}
export async function updateStaff(id: string, v: StaffInput): Promise<StaffDTO> { const { data, error } = await supabase.from("staff").update({ username: v.username.trim(), role: v.role, branch_id: v.branchId }).eq("staff_id", id).select("staff_id, username, role, branch_id, branches(branch_name)").single(); if (error) fail("Unable to update staff", error); const b = data.branches as Row; return { id: text(data.staff_id), staffId: text(data.staff_id), username: text(data.username), role: role(data.role), branchId: num(data.branch_id), branchName: text(b?.branch_name) }; }
export async function deleteStaff(id: string): Promise<void> { const { error } = await supabase.from("staff").delete().eq("staff_id", id); if (error) fail("Unable to delete staff profile", error); }

export const appService = { branches: { list: listBranches, create: createBranch, update: updateBranch, delete: deleteBranch }, salesTargets: { list: listBranchSalesTargets, create: createBranchSalesTarget, update: updateBranchSalesTarget, delete: deleteBranchSalesTarget }, products: { listActive: listActiveProducts, listAll: listAllProducts, create: createProduct, update: updateProduct, delete: deleteProduct }, catalog: { listPrices: listCatalogPrices, updatePrice: updateCatalogPrice }, inventory: { list: listInventory, upsert: upsertInventory, delete: deleteInventory }, transactions: { list: listTransactions }, dashboard: { get: getDashboard, getHomeInsights }, analytics: { get: getAnalytics, getAiInsights }, staff: { list: listStaff, create: createStaff, update: updateStaff, delete: deleteStaff }, notifications: { list: listNotifications, markRead: markNotificationsRead, delete: deleteNotifications } };
export type { Session };
