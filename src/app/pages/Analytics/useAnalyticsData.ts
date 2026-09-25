import { useEffect, useState } from "react";
import { appService } from "../../services/appService";
import { createInitialMetrics, mapAnalyticsData } from "./analyticsData";
import { buildSalesDecisionInsights, type SalesDecisionInsight } from "./useSalesDecisionInsights";
import type { AnalyticsMetric, BranchPerformancePoint, DailySalesPoint, MonthlyPerformancePoint, ProductRankingPoint, WeeklyDeliveryPoint } from "./types";

const toDateString = (value: Date) => value.toISOString().slice(0, 10);

export function useAnalyticsData(filters: { branchId?: number; year?: number; month?: number } = {}) {
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>(createInitialMetrics);
  const [monthlyPerformance, setMonthlyPerformance] = useState<MonthlyPerformancePoint[]>([]);
  const [weeklyDeliveries, setWeeklyDeliveries] = useState<WeeklyDeliveryPoint[]>([]);
  const [branchData, setBranchData] = useState<BranchPerformancePoint[]>([]);
  const [dailySales, setDailySales] = useState<DailySalesPoint[]>([]);
  const [productRanking, setProductRanking] = useState<ProductRankingPoint[]>([]);
  const [analyticsError, setAnalyticsError] = useState("");
  const [salesInsights, setSalesInsights] = useState<SalesDecisionInsight[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);
  const [availableMonths, setAvailableMonths] = useState<number[]>([]);
  const [availableBranches, setAvailableBranches] = useState<Array<{ id: number; name: string }>>([]);

  useEffect(() => {
    let isMounted = true;
    const now = new Date();
    const analyticsParams = {
      fromDate: toDateString(new Date(now.getFullYear(), now.getMonth() - 5, 1)),
      toDate: toDateString(now),
      ...filters,
    };

    const loadAnalytics = async () => {
      setAnalyticsError("");

      try {
        const [analytics, transactions] = await Promise.all([
          appService.analytics.get(analyticsParams),
          appService.transactions.list(),
        ]);
        if (!isMounted) return;
        const mapped = mapAnalyticsData(analytics, now);
        setMetrics(mapped.metrics);
        setMonthlyPerformance(mapped.monthlyPerformance);
        setWeeklyDeliveries(mapped.weeklyDeliveries);
        setBranchData(mapped.branchData);
        setDailySales(mapped.dailySales);
        setProductRanking(mapped.productRanking);
        setSalesInsights(buildSalesDecisionInsights(transactions, now));
        const uniqueBranches = new Map(transactions.map(t => [t.branchId ?? 0, t.branchName]).filter(([id, name]) => Number(id) > 0 && name));
        setAvailableBranches([...uniqueBranches].map(([id, name]) => ({ id: Number(id), name: String(name) })));
        setAvailableYears([...new Set(transactions.map(t => Number(t.transactionDate.slice(0, 4))).filter(Boolean))].sort((a, b) => b - a));
        setAvailableMonths([...new Set(transactions.map(t => Number(t.transactionDate.slice(5, 7))).filter(Boolean))].sort());
      } catch (error) {
        if (isMounted) setAnalyticsError(error instanceof Error ? error.message : "Unable to load analytics data.");
      }
    };

    loadAnalytics();
    return () => { isMounted = false; };
  }, [filters.branchId, filters.year, filters.month]);

  return { metrics, monthlyPerformance, weeklyDeliveries, branchData, dailySales, productRanking, analyticsError, salesInsights, availableYears, availableMonths, availableBranches };
}
