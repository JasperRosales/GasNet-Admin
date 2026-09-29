import { Clock, Cylinder, TrendingUp, TrendingUpDownIcon } from "lucide-react";
import type {
  AnalyticsMetric,
  BranchPerformancePoint,
  MonthlyPerformancePoint,
  WeeklyDeliveryPoint,
} from "./types";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatCurrency = (value: number) => `₱${value.toLocaleString("en-PH")}`;

export const createInitialMetrics = (): AnalyticsMetric[] => [
  { icon: Clock, label: "Peak Demand Day", value: "â€”", change: "Last 30 days" },
  { icon: TrendingUp, label: "Growth Rate", value: "â€”", change: "MoM" },
  { icon: Cylinder, label: "Top Stocked Cylinder", value: "â€”", change: "Current stock" },
  { icon: TrendingUpDownIcon, label: "Next Month Revenue", value: "â€”", change: "Estimate" },
];

export function mapAnalyticsData(analytics: any, now: Date) {
  const monthSource = analytics.revenueByMonth ?? analytics.monthlyPerformance ?? [];
  const monthlyPerformance: MonthlyPerformancePoint[] = monthSource.map(
    (point: any, index: number) => {
      const rawMonth = String(point.month ?? point.label ?? "");
      const monthNumber = Number(rawMonth.slice(5, 7));
      const fallbackDate = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
      const revenue = Number(point.revenue ?? 0);
      const expenses = Number(point.expenses ?? 0);
      return {
        month: MONTH_LABELS[monthNumber - 1] ?? MONTH_LABELS[fallbackDate.getMonth()],
        revenue,
        expenses,
        profit: Number(point.profit ?? revenue - expenses),
        transactionCount: Number(point.transactionCount ?? 0),
        averageOrderValue: Number(
          point.averageOrderValue ??
            (Number(point.transactionCount ?? 0) ? revenue / Number(point.transactionCount) : 0)
        ),
      };
    }
  );

  const dailySales: DailySalesPoint[] = (analytics.dailyPerformance ?? []).map((point: any) => ({
    day: String(point.day),
    label: String(point.label ?? point.day),
    revenue: Number(point.revenue ?? 0),
    transactions: Number(point.transactions ?? 0),
  }));
  const productRanking: ProductRankingPoint[] = (analytics.topProducts ?? [])
    .map((product: any) => {
      const productName = String(product.productName ?? product.name ?? "Unknown");
      return {
        productId: Number(product.productId),
        productName,
        name: productName,
        totalKg: Number(product.totalKg ?? 0),
        salesValue: Number(product.salesValue ?? 0),
      };
    })
    .sort((a, b) => b.salesValue - a.salesValue || b.totalKg - a.totalKg);

  const branchData: BranchPerformancePoint[] = (analytics.branchPerformance ?? [])
    .map((branch: any) => ({
      name: String(branch.branchName ?? branch.name ?? "Unknown"),
      value: Number(branch.revenue ?? branch.value ?? 0),
    }))
    .sort((a, b) => b.value - a.value);

  const weeklySource = analytics.weeklyDeliveries ?? analytics.weeklyPerformance ?? [];
  const weeklyDeliveries: WeeklyDeliveryPoint[] = weeklySource.map((point: any) => ({
    day: String(point.day ?? point.label ?? "â€”"),
    InStore: Number(point.InStore ?? point.inStore ?? 0),
    Commercial: Number(point.Commercial ?? point.commercial ?? 0),
    Delivery: Number(point.Delivery ?? point.delivery ?? 0),
  }));

  const monthlyRevenues = monthlyPerformance.map((bucket) => bucket.revenue);
  const latestRevenue = monthlyRevenues.at(-1) ?? 0;
  const previousRevenue = monthlyRevenues.at(-2) ?? 0;
  const growthRate =
    previousRevenue > 0 ? ((latestRevenue - previousRevenue) / previousRevenue) * 100 : null;
  const projectionSource = monthlyRevenues.slice(-3).filter((value) => value > 0);
  const projectedRevenue = projectionSource.length
    ? projectionSource.reduce((sum, value) => sum + value, 0) / projectionSource.length
    : null;
  const topProduct = analytics.topProducts?.[0]
    ? String(analytics.topProducts[0].productName ?? analytics.topProducts[0].name ?? "Unknown")
    : undefined;

  const metrics: AnalyticsMetric[] = [
    {
      icon: Clock,
      label: "Peak Demand Day",
      value: analytics.peakDemandDay?.day ?? "â€”",
      change: "Last 30 days",
    },
    {
      icon: TrendingUp,
      label: "Growth Rate",
      value: growthRate !== null ? `${growthRate.toFixed(1)}%` : "â€”",
      change: "MoM",
    },
    {
      icon: Cylinder,
      label: "Top Stocked Cylinder",
      value: topProduct ?? "â€”",
      change: "Current stock",
    },
    {
      icon: TrendingUpDownIcon,
      label: "Next Month Revenue",
      value: projectedRevenue !== null ? formatCurrency(projectedRevenue) : "â€”",
      change: "Estimate",
    },
  ];

  return { metrics, monthlyPerformance, weeklyDeliveries, branchData, dailySales, productRanking };
}
