import type { TransactionDTO } from "../../services/types";

export interface SalesDecisionInsight {
  id: "trend" | "products" | "channels" | "delivery";
  category: string;
  title: string;
  value: string;
  context: string;
  recommendation: string;
}

const money = (value: number) => `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 0 })}`;
const movingAverage = (values: number[]) => values.length ? values.reduce((a, b) => a + b, 0) / values.length : 0;

export function buildSalesDecisionInsights(transactions: TransactionDTO[], now = new Date()): SalesDecisionInsight[] {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const daily = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().slice(0, 10);
    const rows = transactions.filter(t => t.transactionDate.slice(0, 10) === key);
    return rows.reduce((sum, t) => sum + t.total, 0);
  });
  const current = daily[6];
  const baseline = movingAverage(daily.slice(0, 6));
  const momentum = baseline ? ((current - baseline) / baseline) * 100 : 0;
  const last28 = transactions.filter(t => {
    const days = (today.getTime() - new Date(`${t.transactionDate}T00:00:00`).getTime()) / 86400000;
    return days >= 0 && days < 28;
  });
  const products = new Map<string, { name: string; revenue: number; quantity: number }>();
  for (const t of last28) for (const item of t.items) {
    const p = products.get(item.productId.toString()) ?? { name: item.productName || `Product #${item.productId}`, revenue: 0, quantity: 0 };
    p.revenue += item.quantity * item.unitPrice;
    p.quantity += item.quantity;
    products.set(item.productId.toString(), p);
  }
  const leader = [...products.values()].sort((a, b) => b.revenue - a.revenue)[0];
  const channels = { "In-Store": 0, Commercial: 0, Delivery: 0 } as Record<string, number>;
  for (const t of last28) {
    const type = t.transactionType === "Delivery" ? "Delivery" : t.transactionType === "Commercial" ? "Commercial" : "In-Store";
    channels[type] += t.total;
  }
  const top = Object.entries(channels).sort((a, b) => b[1] - a[1])[0];
  const total = last28.reduce((sum, t) => sum + t.total, 0);
  const avg = last28.length ? total / last28.length : 0;
  const deliveries = last28.filter(t => t.transactionType === "Delivery");
  const deliveryCount = deliveries.length;

  return [
    {
      id: "trend", category: "Daily sales",
      title: momentum >= 0 ? "Keep today’s sales momentum going" : "Boost sales above the recent daily average",
      value: `${momentum >= 0 ? "+" : ""}${momentum.toFixed(1)}% vs. daily average`,
      context: baseline ? `Today: ${money(current)}. Baseline: ${money(baseline)} average across the previous 6 days.` : `Today: ${money(current)}. There is no prior 6-day sales baseline to compare.`,
      recommendation: momentum >= 0 ? "Replenish the products in today’s strongest orders and repeat the sales activities driving today’s result." : "Feature proven products today, then check stock availability and pricing by branch.",
    },
    {
      id: "products", category: "Top product",
      title: leader ? "Keep the top-selling product in stock" : "Product sales details are missing",
      value: leader?.name ?? "Not available",
      context: leader ? `Last 28 days: ${money(leader.revenue)} from ${leader.quantity.toLocaleString("en-PH")} units sold.` : "Last 28 days: no product lines were included in recorded sales.",
      recommendation: leader ? `Prioritize ${leader.name} for replenishment and prominent shelf or sales-team attention.` : "Record the products included in sales before deciding what to reorder.",
    },
    {
      id: "channels", category: "Best sales channel",
      title: top?.[1] ? `Focus resources on ${top[0].toLowerCase()} sales` : "No sales channel results yet",
      value: top?.[1] ? `${money(top[1])} · ${total ? (top[1] / total * 100).toFixed(1) : "0"}% of sales` : "Not available",
      context: last28.length ? `Last 28 days: ${last28.length} orders totaling ${money(total)}; ${money(avg)} per order.` : "Last 28 days: no sales orders were recorded for comparison.",
      recommendation: top?.[1] ? `Match staffing and inventory to ${top[0].toLowerCase()} demand, then test one promising sales channel.` : "Confirm sales are being recorded before setting sales channel targets.",
    },
    {
      id: "delivery", category: "Delivery sales",
      title: deliveryCount ? "Schedule delivery around proven demand" : "Confirm whether delivery sales are being recorded",
      value: deliveryCount ? `${money(channels.Delivery)} · ${total ? (channels.Delivery / total * 100).toFixed(1) : "0"}% of sales` : "Not available",
      context: deliveryCount ? `Last 28 days: ${deliveryCount} delivery orders totaling ${money(channels.Delivery)}.` : "Last 28 days: no delivery orders were found in the recorded sales.",
      recommendation: deliveryCount ? "Set delivery capacity around recorded demand and review whether each route remains profitable." : "Check how delivery orders are recorded before estimating delivery demand.",
    },
  ];
}
