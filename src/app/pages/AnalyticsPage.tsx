import { useState } from "react";
import { AnalyticsControls, type AnalyticsFilters } from "./Analytics/AnalyticsControls";
import { PerformanceSection, RevenueSection } from "./Analytics/AnalyticsSections";
import { SalesDecisionInsights } from "./Analytics/SalesDecisionInsightsView";
import { useAnalyticsData } from "./Analytics/useAnalyticsData";

export function AnalyticsPage() {
  const [filters, setFilters] = useState<AnalyticsFilters>({});
  const { monthlyPerformance, weeklyDeliveries, branchData, dailySales, productRanking, analyticsError, salesInsights, availableYears, availableMonths, availableBranches } = useAnalyticsData(filters);

  return (
    <div className="space-y-8">
      <div className="border-b border-[#8BAE66]/30 pb-4"><h1 className="text-[#1B211A] mb-2">Business Analytics</h1><p className="text-[#628141]">Comprehensive insights into your LPG trading performance</p></div>
      {analyticsError && <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{analyticsError}</div>}
      <SalesDecisionInsights insights={salesInsights} />
      <AnalyticsControls onRefresh={() => window.location.reload()} onChange={setFilters} branches={availableBranches} years={availableYears} months={availableMonths} filters={filters} />
      <RevenueSection data={monthlyPerformance} />
      <PerformanceSection weekly={weeklyDeliveries} branches={branchData} daily={dailySales} products={productRanking} />
    </div>
  );
}
