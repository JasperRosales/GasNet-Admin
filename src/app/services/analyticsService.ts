import type { IAnalyticsService, IDashboardService, ITransactionService } from "./interfaces";
import type { AiAnalyticsDTO, AnalyticsDTO } from "./types";

export class AnalyticsService implements IAnalyticsService {
  constructor(
    private readonly transactions: ITransactionService,
    private readonly dashboard: IDashboardService
  ) {}

  async get(params: {
    fromDate: string;
    toDate: string;
    branchId?: number;
    year?: number;
    month?: number;
  }): Promise<AnalyticsDTO> {
    const txns = (await this.transactions.list()).filter(
      (t) =>
        t.transactionDate >= params.fromDate &&
        t.transactionDate <= params.toDate &&
        (!params.branchId || t.branchId === params.branchId) &&
        (!params.year || t.transactionDate.slice(0, 4) === String(params.year)) &&
        (!params.month || Number(t.transactionDate.slice(5, 7)) === params.month)
    );
    const months = new Map<string, AnalyticsDTO["revenueByMonth"][number]>();
    const weeks = new Map<number, AnalyticsDTO["weeklyPerformance"][number]>();
    const daily = new Map<string, AnalyticsDTO["dailyPerformance"][number]>();
    const branches = new Map<number, AnalyticsDTO["branchPerformance"][number]>();
    const products = new Map<number, AnalyticsDTO["topProducts"][number]>();
    const days = new Map<string, number>();
    for (const t of txns) {
      const month = t.transactionDate.slice(0, 7);
      const m = months.get(month) ?? {
        month,
        label: month,
        revenue: 0,
        expenses: 0,
        profit: 0,
        transactionCount: 0,
        averageOrderValue: 0,
      };
      m.revenue += t.total;
      m.profit = m.revenue;
      m.transactionCount++;
      m.averageOrderValue = m.revenue / m.transactionCount;
      months.set(month, m);
      const d = daily.get(t.transactionDate) ?? {
        day: t.transactionDate,
        label: t.transactionDate,
        revenue: 0,
        transactions: 0,
      };
      d.revenue += t.total;
      d.transactions++;
      daily.set(t.transactionDate, d);
      const day = new Date(`${t.transactionDate}T00:00:00`);
      const wk = Math.min(5, Math.floor((day.getDate() - 1) / 7) + 1);
      const w = weeks.get(wk) ?? {
        day: `Week ${wk}`,
        label: `Week ${wk}`,
        InStore: 0,
        Commercial: 0,
        Delivery: 0,
        inStore: 0,
        commercial: 0,
        delivery: 0,
      };
      if (t.transactionType === "Commercial") {
        w.Commercial++;
        w.commercial++;
      } else if (t.transactionType === "Delivery") {
        w.Delivery++;
        w.delivery++;
      } else {
        w.InStore++;
        w.inStore++;
      }
      weeks.set(wk, w);
      const b = branches.get(t.branchId ?? 0) ?? {
        branchId: t.branchId ?? 0,
        branchName: t.branchName,
        name: t.branchName,
        revenue: 0,
        value: 0,
        transactionCount: 0,
      };
      b.revenue += t.total;
      b.value = b.revenue;
      b.transactionCount++;
      branches.set(b.branchId, b);
      for (const item of t.items ?? []) {
        const p = products.get(item.productId) ?? {
          productId: item.productId,
          productName: item.productName,
          name: item.productName,
          totalKg: 0,
          salesValue: 0,
        };
        p.totalKg += item.quantity * item.weightKg;
        p.salesValue += item.quantity * item.unitPrice;
        products.set(item.productId, p);
      }
      days.set(t.transactionDate, (days.get(t.transactionDate) ?? 0) + 1);
    }
    const peak = [...days].sort((a, b) => b[1] - a[1])[0];
    return {
      range: {
        fromDate: params.fromDate,
        toDate: params.toDate,
        branchId: params.branchId ?? null,
      },
      summary: {
        revenue: txns.reduce((n, t) => n + t.total, 0),
        transactionCount: txns.length,
        averageTransactionValue: txns.length
          ? txns.reduce((n, t) => n + t.total, 0) / txns.length
          : 0,
      },
      revenueByMonth: [...months.values()],
      weeklyPerformance: [...weeks.values()],
      dailyPerformance: [...daily.values()].sort((a, b) => a.day.localeCompare(b.day)),
      branchPerformance: [...branches.values()],
      topProducts: [...products.values()].sort(
        (a, b) => b.salesValue - a.salesValue || b.totalKg - a.totalKg
      ),
      peakDemandDay: peak ? { day: peak[0], transactionCount: peak[1] } : null,
    };
  }

  async getAiInsights(params: { fromDate: string; toDate: string }): Promise<AiAnalyticsDTO> {
    const a = await this.get(params);
    const d = await this.dashboard.get();
    const type = d.metrics.lowStockRecords ? "warning" : a.summary.revenue ? "positive" : "neutral";
    return {
      generatedAt: new Date().toISOString(),
      model: "Supabase deterministic insights",
      summary: "Insights derived from current Supabase records.",
      sentiment: type,
      insights: [
        {
          title: "Revenue",
          detail: `Selected-period revenue is ₱${a.summary.revenue.toLocaleString("en-PH")} across ${a.summary.transactionCount} transactions.`,
          type: "trend",
        },
        {
          title: "Inventory",
          detail: `${d.metrics.lowStockRecords} stock records are at or below reorder level.`,
          type: "inventory",
        },
      ],
    };
  }
}
