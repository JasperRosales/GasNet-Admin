import { useEffect, useState } from "react";
import { Users, Package, DollarSign, Activity } from "lucide-react";
import { appService, type DashboardBranch } from "../services/appService";

interface BranchOverview {
  name: string;
  totalCylinders: number;
  targetGoal: number;
  status: string;
}

const formatCurrency = (value: number) =>
  `â‚±${value.toLocaleString("en-PH")}`;

export function HomePage() {
  const [stats, setStats] = useState([
    { icon: DollarSign, label: "Total Revenue", value: "â€”", change: "Live", positive: true },
    { icon: Package, label: "LPG Cylinders", value: "â€”", change: "Live", positive: true },
    { icon: Users, label: "Top Perfoming Branch", value: "â€”", change: "Live", positive: true },
    { icon: Activity, label: "Total Target Reached", value: "â€”", change: "Live", positive: true },
  ]);
  const [branchOverview, setBranchOverview] = useState<BranchOverview[]>([]);
  const [dashboardError, setDashboardError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setDashboardError("");
      try {
        const dashboard = await appService.dashboard.get();

        if (!isMounted) return;

        const totalRevenue =
          typeof dashboard.totalRevenue === "number"
            ? dashboard.totalRevenue
            : Number(dashboard.metrics?.revenue ?? 0);
        const totalCylinders =
          typeof dashboard.totalCylinders === "number"
            ? dashboard.totalCylinders
            : Number(dashboard.metrics?.cylindersInStock ?? 0);
        const topBranch =
          dashboard.topBranch ??
          dashboard.topPerformingBranch ??
          dashboard.branchPerformance?.[0]?.branchName ??
          dashboard.branchPerformance?.[0]?.name;
        const targetReachedPercent = Number(
          dashboard.targetReachedPercent ??
            (dashboard.metrics?.lowStockRecords === undefined
              ? 0
              : 100),
        );

        const branchSource =
          dashboard.branchOverview ??
          dashboard.branches ??
          dashboard.branchPerformance ??
          [];
        const branchCards: BranchOverview[] = branchSource
          .map((branch: DashboardBranch) => {
            const name = String(branch.name ?? branch.branchName ?? "Unknown");
            const total = Number(branch.totalCylinders ?? branch.quantity ?? 0);
            return {
              name,
              totalCylinders: total,
              targetGoal: Number(branch.targetGoal ?? total),
              status: String(branch.status ?? (total > 0 ? "Reached" : "Pending")),
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

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
          value: topBranch ?? "â€”",
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
      } catch (error) {
        if (!isMounted) return;
        setDashboardError(
          error instanceof Error ? error.message : "Unable to load dashboard data.",
        );
      }
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
