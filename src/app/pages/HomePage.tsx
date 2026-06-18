import { useEffect, useState } from "react";
import { Users, Package, DollarSign, Activity } from "lucide-react";
import { unwrapRelation } from "../utils/relations";
import { supabase } from "../utils/supabase";

interface BranchOverview {
  name: string;
  totalCylinders: number;
  targetGoal: number;
  status: string;
}

const formatCurrency = (value: number) =>
  `₱${value.toLocaleString("en-PH")}`;

export function HomePage() {
  const [stats, setStats] = useState([
    { icon: DollarSign, label: "Total Revenue", value: "—", change: "Live", positive: true },
    { icon: Package, label: "LPG Cylinders", value: "—", change: "Live", positive: true },
    { icon: Users, label: "Top Perfoming Branch", value: "—", change: "Live", positive: true },
    { icon: Activity, label: "Total Target Reached", value: "—", change: "Live", positive: true },
  ]);
  const [branchOverview, setBranchOverview] = useState<BranchOverview[]>([]);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setDashboardError("");
      const [salesResponse, stockResponse] = await Promise.all([
        supabase
          .from("sales_transactions")
          .select("total, branch:branches(branch_id, branch_name)"),
        supabase
          .from("branch_stock")
          .select(
            "quantity, reorder_level, branch:branches(branch_id, branch_name)",
          ),
      ]);

      if (!isMounted) return;

      if (salesResponse.error || stockResponse.error) {
        setDashboardError(
          salesResponse.error?.message ??
            stockResponse.error?.message ??
            "Unable to load dashboard data.",
        );
      }

      const salesData = salesResponse.data ?? [];
      const stockData = stockResponse.data ?? [];

      const totalRevenue = salesData.reduce(
        (sum, row) => sum + (row.total ?? 0),
        0,
      );
      const totalCylinders = stockData.reduce(
        (sum, row) => sum + (row.quantity ?? 0),
        0,
      );

      const branchSales = new Map<string, number>();
      salesData.forEach((row) => {
        const branch = unwrapRelation(row.branch);
        const name = branch?.branch_name ?? "Unknown";
        branchSales.set(name, (branchSales.get(name) ?? 0) + (row.total ?? 0));
      });
      const topBranch = Array.from(branchSales.entries()).sort(
        (a, b) => b[1] - a[1],
      )[0]?.[0];

      const totalTargets = stockData.length;
      const targetsReached = stockData.filter(
        (row) => (row.quantity ?? 0) >= (row.reorder_level ?? 0),
      ).length;
      const targetReachedPercent = totalTargets
        ? Math.round((targetsReached / totalTargets) * 100)
        : 0;

      const branchTotals = new Map<string, number>();
      stockData.forEach((row) => {
        const branch = unwrapRelation(row.branch);
        const name = branch?.branch_name ?? "Unknown";
        branchTotals.set(name, (branchTotals.get(name) ?? 0) + (row.quantity ?? 0));
      });
      const branchCards = Array.from(branchTotals.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, total]) => ({
          name,
          totalCylinders: total,
          targetGoal: total,
          status: total > 0 ? "Reached" : "Pending",
        }));

      setStats([
        {
          icon: DollarSign,
          label: "Total Revenue",
          value: formatCurrency(totalRevenue),
          change: "Live",
          positive: true,
        },
        {
          icon: Package,
          label: "LPG Cylinders",
          value: totalCylinders.toLocaleString("en-PH"),
          change: "Live",
          positive: true,
        },
        {
          icon: Users,
          label: "Top Perfoming Branch",
          value: topBranch ?? "—",
          change: "Live",
          positive: true,
        },
        {
          icon: Activity,
          label: "Total Target Reached",
          value: `${targetReachedPercent}%`,
          change: "Live",
          positive: true,
        },
      ]);
      setBranchOverview(branchCards);
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[#1B211A] mb-2">Dashboard Overview</h1>
        <p className="text-[#628141]">Welcome back! Here's what's happening with your LPG business today.</p>
      </div>
      {dashboardError && (
        <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
          {dashboardError}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div
            key={index}
            className="p-6 rounded-3xl bg-[#FFFDF1]"
            style={{
              boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div 
                className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
                style={{
                  boxShadow: '0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
                }}
              >
                <stat.icon className="w-6 h-6 text-[#FFFDF1]" />
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${stat.positive ? 'bg-[#8BAE66]/20 text-[#628141]' : 'bg-red-100 text-red-600'}`}>
                {stat.change}
              </span>
            </div>
            <h3 className="text-[#1B211A] mb-1">{stat.value}</h3>
            <p className="text-[#628141] text-sm">{stat.label}</p>
          </div>
        ))}
      </div>

      
  

      {/* Branch Quick View */}
      <div
        className="p-6 rounded-3xl bg-[#FFFDF1]"
        style={{
          boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
        }}
      >
        <h3 className="text-[#1B211A] mb-6">Branch Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchOverview.map((branch, index) => (
            <div
              key={index}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#628141]/10 to-[#8BAE66]/10"
              style={{
                boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)',
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[#1B211A]">{branch.name}</h4>
                <span className="px-3 py-1 rounded-full bg-[#8BAE66] text-[#FFFDF1] text-xs">
                  {branch.status}
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[#628141] text-sm">
                  Total Cylinders: {branch.totalCylinders}
                </p>
                <p className="text-[#628141] text-sm">
                  Target Goal: {branch.targetGoal} Cylinders
                </p>
              </div>
            </div>
          ))}
          {!branchOverview.length && (
            <div className="col-span-full rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">
              No branch inventory data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
