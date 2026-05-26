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
} from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabase";

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

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH")}`;

const toLocalDate = (value: string) => new Date(`${value}T00:00:00`);

const toDateString = (value: Date) =>
  value.toISOString().slice(0, 10);

export function AnalyticsPage() {
  const [metrics, setMetrics] = useState([
    { icon: Clock, label: "Peak Demand Day", value: "—", change: "Last 30 days" },
    { icon: TrendingUp, label: "Growth Rate", value: "—", change: "MoM" },
    { icon: Cylinder, label: "Top Stocked Cylinder", value: "—", change: "Current stock" },
    { icon: TrendingUpDownIcon, label: "Next Month Revenue", value: "—", change: "Estimate" },
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

  useEffect(() => {
    let isMounted = true;

    const loadAnalytics = async () => {
      setAnalyticsError("");
      const now = new Date();
      const startMonth = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const startWeek = new Date(now);
      startWeek.setDate(now.getDate() - 6);
      const start30Days = new Date(now);
      start30Days.setDate(now.getDate() - 29);

      const [salesResponse, stockResponse] = await Promise.all([
        supabase
          .from("sales_transactions")
          .select(
            "total, transaction_date, transaction_type, guest_name, branch:branches(branch_name)",
          )
          .gte("transaction_date", toDateString(startMonth)),
        supabase
          .from("branch_stock")
          .select("quantity, product:products(product_name)"),
      ]);

      if (!isMounted) return;

      if (salesResponse.error || stockResponse.error) {
        setAnalyticsError(
          salesResponse.error?.message ??
            stockResponse.error?.message ??
            "Unable to load analytics data.",
        );
      }

      const salesData = salesResponse.data ?? [];
      const stockData = stockResponse.data ?? [];

      const monthBuckets = Array.from({ length: 6 }, (_, index) => {
        const date = new Date(now.getFullYear(), now.getMonth() - 5 + index, 1);
        return {
          key: `${date.getFullYear()}-${date.getMonth()}`,
          month: MONTH_LABELS[date.getMonth()],
          revenue: 0,
          expenses: 0,
          profit: 0,
        };
      });

      const monthMap = new Map(monthBuckets.map((bucket) => [bucket.key, bucket]));
      salesData.forEach((row) => {
        const date = toLocalDate(row.transaction_date);
        if (Number.isNaN(date.getTime()) || date < startMonth) return;
        const key = `${date.getFullYear()}-${date.getMonth()}`;
        const bucket = monthMap.get(key);
        if (!bucket) return;
        bucket.revenue += row.total ?? 0;
      });

      monthBuckets.forEach((bucket) => {
        bucket.expenses = 0;
        bucket.profit = bucket.revenue - bucket.expenses;
      });

      const branchSales = new Map<string, number>();
      salesData.forEach((row) => {
        const name = row.branch?.branch_name ?? "Unknown";
        branchSales.set(name, (branchSales.get(name) ?? 0) + (row.total ?? 0));
      });

      const branchSeries = Array.from(branchSales.entries())
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value);

      const weeklyMap = new Map(
        Array.from({ length: 7 }, (_, offset) => {
          const day = new Date(startWeek);
          day.setDate(startWeek.getDate() + offset);
          const label = DAY_LABELS[day.getDay()];
          return [label, { day: label, InStore: 0, Commercial: 0 }];
        }),
      );

      salesData.forEach((row) => {
        const date = toLocalDate(row.transaction_date);
        if (Number.isNaN(date.getTime()) || date < startWeek || date > now) return;
        const label = DAY_LABELS[date.getDay()];
        const entry = weeklyMap.get(label);
        if (!entry) return;
        if (row.transaction_type === "Commercial") {
          entry.Commercial += 1;
        } else {
          entry.InStore += 1;
        }
      });

      const weeklySeries = Array.from(weeklyMap.values());

      const demandCounts = new Map<string, number>();
      salesData.forEach((row) => {
        const date = toLocalDate(row.transaction_date);
        if (Number.isNaN(date.getTime()) || date < start30Days) return;
        const label = DAY_LABELS[date.getDay()];
        demandCounts.set(label, (demandCounts.get(label) ?? 0) + 1);
      });
      const peakDay = Array.from(demandCounts.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];

      const monthlyRevenues = monthBuckets.map((bucket) => bucket.revenue);
      const latestRevenue = monthlyRevenues[monthlyRevenues.length - 1] ?? 0;
      const previousRevenue = monthlyRevenues[monthlyRevenues.length - 2] ?? 0;
      const growthRate =
        previousRevenue > 0
          ? ((latestRevenue - previousRevenue) / previousRevenue) * 100
          : null;

      const projectionSource = monthlyRevenues
        .slice(-3)
        .filter((value) => value > 0);
      const projectedRevenue =
        projectionSource.length
          ? projectionSource.reduce((sum, value) => sum + value, 0) /
            projectionSource.length
          : null;

      const productTotals = new Map<string, number>();
      stockData.forEach((row) => {
        const productName = row.product?.product_name ?? "Unknown";
        productTotals.set(productName, (productTotals.get(productName) ?? 0) + (row.quantity ?? 0));
      });
      const topProduct = Array.from(productTotals.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];

      setMonthlyPerformance(monthBuckets);
      setBranchData(branchSeries);
      setWeeklyDeliveries(weeklySeries);
      setMetrics([
        {
          icon: Clock,
          label: "Peak Demand Day",
          value: peakDay ?? "—",
          change: "Last 30 days",
        },
        {
          icon: TrendingUp,
          label: "Growth Rate",
          value: growthRate !== null ? `${growthRate.toFixed(1)}%` : "—",
          change: "MoM",
        },
        {
          icon: Cylinder,
          label: "Top Stocked Cylinder",
          value: topProduct ?? "—",
          change: "Current stock",
        },
        {
          icon: TrendingUpDownIcon,
          label: "Next Month Revenue",
          value: projectedRevenue !== null ? formatCurrency(projectedRevenue) : "—",
          change: "Estimate",
        },
      ]);
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

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className="p-6 rounded-3xl bg-[#FFFDF1]"
            style={{
              boxShadow:
                "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
            }}
          >
            <div
              className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66] w-fit mb-4"
              style={{
                boxShadow:
                  "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
              }}
            >
              <metric.icon className="w-6 h-6 text-[#FFFDF1]" />
            </div>
            <h3 className="text-[#1B211A] mb-1">{metric.value}</h3>
            <p className="text-[#628141] text-sm mb-2">{metric.label}</p>
            <span className="text-[#8BAE66] text-sm">
              {metric.change} from last month
            </span>
          </div>
        ))}
      </div>
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
