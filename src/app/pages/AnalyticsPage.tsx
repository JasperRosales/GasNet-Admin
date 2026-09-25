import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Cell,
  Pie,
} from "recharts";
import {
  TrendingUp,
  MapPin,
  BookAIcon,
  Cylinder,
  Clock,
  TrendingUpDownIcon,
  RefreshCw,
  Filter,
  Search,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { appService, type AiAnalyticsDTO } from "../services/appService";

const COLORS = [
  "#628141",
  "#8BAE66",
  "#8BAE66",
  "#1B211A",
  "#628141",
  "#8BAE66",
];

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

const formatCurrency = (value: number) =>
  `â‚±${value.toLocaleString("en-PH")}`;

const toDateString = (value: Date) =>
  value.toISOString().slice(0, 10);

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState([
    { icon: Clock, label: "Peak Demand Day", value: "â€”", change: "Last 30 days" },
    { icon: TrendingUp, label: "Growth Rate", value: "â€”", change: "MoM" },
    { icon: Cylinder, label: "Top Stocked Cylinder", value: "â€”", change: "Current stock" },
    { icon: TrendingUpDownIcon, label: "Next Month Revenue", value: "â€”", change: "Estimate" },
  ]);
  const [monthlyPerformance, setMonthlyPerformance] = useState<
    { month: string; revenue: number; expenses: number; profit: number }[]
  >([]);
  const [weeklyDeliveries, setWeeklyDeliveries] = useState<
    { day: string; InStore: number; Commercial: number }[]
  >([]);
  const [branchData, setBranchData] = useState<
    { name: string; value: number }[]
  >([]);
  const [analyticsError, setAnalyticsError] = useState("");
  const [aiAnalytics, setAiAnalytics] = useState<AiAnalyticsDTO | null>(null);
  const [aiAnalyticsLoading, setAiAnalyticsLoading] = useState(true);
  const [aiAnalyticsError, setAiAnalyticsError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setAnalyticsError("");
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);

      const analyticsParams = {
        fromDate: toDateString(startMonth),
        toDate: toDateString(now),
      };

      try {
        setAiAnalyticsLoading(true);
        setAiAnalyticsError("");
        appService.analytics
          .getAiInsights(analyticsParams)
          .then((result) => {
            if (isMounted) setAiAnalytics(result);
          })
          .catch((error) => {
            if (isMounted) {
              setAiAnalyticsError(
                error instanceof Error
                  ? error.message
                  : "AI insights are temporarily unavailable.",
              );
            }
          })
          .finally(() => {
            if (isMounted) setAiAnalyticsLoading(false);
          });

        const analytics = await appService.analytics.get(analyticsParams);

        if (!isMounted) return;

        const monthSource = analytics.revenueByMonth ?? analytics.monthlyPerformance ?? [];
        const monthBuckets = monthSource.map((point, index) => {
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
          };
        });

        const branchSource = analytics.branchPerformance ?? [];
        const branchSeries = branchSource
          .map((branch) => ({
            name: String(branch.branchName ?? branch.name ?? "Unknown"),
            value: Number(branch.revenue ?? branch.value ?? 0),
          }))
          .sort((a, b) => b.value - a.value);

        const weeklySource = analytics.weeklyDeliveries ?? analytics.weeklyPerformance ?? [];
        const weeklySeries = weeklySource.map((point) => ({
          day: String(point.day ?? point.label ?? "â€”"),
          InStore: Number(point.InStore ?? point.inStore ?? 0),
          Commercial: Number(point.Commercial ?? point.commercial ?? 0),
        }));

        const monthlyRevenues = monthBuckets.map((bucket) => bucket.revenue);
        const latestRevenue = monthlyRevenues[monthlyRevenues.length - 1] ?? 0;
        const previousRevenue = monthlyRevenues[monthlyRevenues.length - 2] ?? 0;
        const growthRate =
          previousRevenue > 0
            ? ((latestRevenue - previousRevenue) / previousRevenue) * 100
            : null;

        const projectionSource = monthlyRevenues.slice(-3).filter((value) => value > 0);
        const projectedRevenue = projectionSource.length
          ? projectionSource.reduce((sum, value) => sum + value, 0) / projectionSource.length
          : null;

        const topProduct = analytics.topProducts?.[0]
          ? String(
              analytics.topProducts[0].productName ??
                analytics.topProducts[0].name ??
                "Unknown",
            )
          : undefined;
        const peakDay = analytics.peakDemandDay?.day;

        setMonthlyPerformance(monthBuckets);
        setBranchData(branchSeries);
        setWeeklyDeliveries(weeklySeries);
        setMetrics([
          {
            icon: Clock,
            label: "Peak Demand Day",
            value: peakDay ?? "â€”",
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
        ]);
      } catch (error) {
        if (!isMounted) return;
        setAnalyticsError(
          error instanceof Error ? error.message : "Unable to load analytics data.",
        );
      }
    };

    loadAnalytics();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[#1B211A] mb-2">Business Analytics</h1>
        <p className="text-[#628141]">
          Comprehensive insights into your LPG trading performance
        </p>
      </div>
      {analyticsError && (
        <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
          {analyticsError}
        </div>
      )}

      <section>
        <div className="mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-[#628141]" />
          <h2 className="text-lg font-semibold text-[#1B211A]">AI Business Insights</h2>
        </div>
        {aiAnalyticsLoading ? (
          <div className="rounded-3xl bg-[#FFFDF1] p-6 text-sm text-[#628141]">Generating insights from current business dataâ€¦</div>
        ) : aiAnalytics ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            {aiAnalytics.insights.map((insight, index) => (
              <article key={`${insight.title}-${index}`} className="rounded-3xl bg-[#FFFDF1] p-5" style={{ boxShadow: "0 8px 32px rgba(98, 129, 65, 0.15)" }}>
                <span className="text-xs font-semibold uppercase tracking-wide text-[#8BAE66]">{insight.type}</span>
                <h3 className="mt-2 font-semibold text-[#1B211A]">{insight.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#4B5543]">{insight.detail}</p>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl bg-[#FFFDF1] p-5 text-sm text-[#8A5A44]">{aiAnalyticsError}</div>
        )}
      </section>

      {/* Controls */}
      <div
        className="p-4 rounded-3xl bg-[#FFFDF1] flex flex-wrap gap-4 items-center justify-between"
        style={{
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <div className="flex gap-3 flex-1">
          <button
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Filter className="w-5 h-5" />
            Branch
          </button>
           <button
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Filter className="w-5 h-5" />
            Year
          </button>
           <button
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Filter className="w-5 h-5" />
            Month
          </button>
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141] flex items-center gap-2"
            style={{
              boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
            }}
            onClick={() => window.location.reload()}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
        </div>
      </div>
      {/* Revenue & Profit Analysis */}
      <div
        className="p-6 rounded-3xl bg-[#FFFDF1]"
        style={{
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <div className="flex items-center gap-3 mb-6">
          <div
            className="p-2 rounded-xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
            style={{
              boxShadow:
                "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 1px 4px rgba(255, 255, 255, 0.2)",
            }}
          >
            <MapPin className="w-5 h-5 text-[#FFFDF1]" />
          </div>
          <div>
            <h3 className="text-[#1B211A]">Revenue & Profit Analysis</h3>
            <p className="text-[#628141] text-sm">
              Accumulated profits across 6 branches in the last 6 months
            </p>
          </div>
        </div>{" "}
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={monthlyPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="#EBD5AB" />
            <XAxis dataKey="month" stroke="#628141" />
            <YAxis stroke="#628141" />
            <Tooltip
              contentStyle={{
                backgroundColor: "#FFFDF1",
                border: "1px solid #8BAE66",
                borderRadius: "12px",
                boxShadow: "0 4px 12px rgba(98, 129, 65, 0.2)",
              }}
            />
            <Legend />
            <Bar dataKey="revenue" fill="#628141" radius={[8, 8, 0, 0]} />
            <Bar dataKey="expenses" fill="#EBD5AB" radius={[8, 8, 0, 0]} />
            <Bar dataKey="profit" fill="#8BAE66" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Delivery Performance & Customer Growth */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Weekly Deliveries */}
        <div
          className="p-6 rounded-3xl bg-[#FFFDF1]"
          style={{
            boxShadow:
              "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
              style={{
                boxShadow:
                  "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 1px 4px rgba(255, 255, 255, 0.2)",
              }}
            >
              <BookAIcon className="w-5 h-5 text-[#FFFDF1]" />
            </div>
            <div>
              <h3 className="text-[#1B211A]">Weekly Sales Performance</h3>
              <p className="text-[#628141] text-sm">
                Indicator for In-Store and Commercial transactions
              </p>
            </div>
          </div>{" "}
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyDeliveries}>
              <CartesianGrid strokeDasharray="3 3" stroke="#EBD5AB" />
              <XAxis dataKey="day" stroke="#628141" />
              <YAxis stroke="#628141" />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFDF1",
                  border: "1px solid #8BAE66",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(98, 129, 65, 0.2)",
                }}
              />
              <Legend />
              <Bar dataKey="InStore" fill="#628141" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Commercial" fill="#8BAE66" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Branch Distribution */}
        <div
          className="p-6 rounded-3xl bg-[#FFFDF1]"
          style={{
            boxShadow:
              "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-2 rounded-xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
              style={{
                boxShadow:
                  "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 1px 4px rgba(255, 255, 255, 0.2)",
              }}
            >
              <MapPin className="w-5 h-5 text-[#FFFDF1]" />
            </div>
            <div>
              <h3 className="text-[#1B211A]">Branch Performance</h3>
              <p className="text-[#628141] text-sm">
                Sales distribution across 6 branches
              </p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={branchData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {branchData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFDF1",
                  border: "1px solid #8BAE66",
                  borderRadius: "12px",
                  boxShadow: "0 4px 12px rgba(98, 129, 65, 0.2)",
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
