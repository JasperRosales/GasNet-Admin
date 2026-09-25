import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Activity, DollarSign, Package, Pencil, Users } from "lucide-react";
import { appService, type BranchSalesTargetDTO, type DashboardBranch, type HomeInsightsDTO } from "../services/appService";
import { MonthlyTargetModal } from "./Home/MonthlyTargetModal";

interface BranchOverview {
  branchId: number;
  name: string;
  currentRevenue: number;
  targetGoal: number;
  status: string;
}

const currentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const monthPeriod = (month: string) => {
  const [year, monthNumber] = month.split("-").map(Number);
  return {
    periodStart: `${year}-${String(monthNumber).padStart(2, "0")}-01`,
    periodEnd: new Date(year, monthNumber, 0).toISOString().slice(0, 10),
  };
};

const formatCurrency = (value: number) => `₱${value.toLocaleString("en-PH")}`;

const formatActivityTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  return `${isToday ? "Today" : date.toLocaleDateString("en-PH", { month: "short", day: "numeric" })}, ${date.toLocaleTimeString("en-PH", { hour: "numeric", minute: "2-digit" })}`;
};

export function HomePage() {
  const [stats, setStats] = useState([
    { icon: DollarSign, label: "Total Revenue", value: "—", change: "", positive: true },
    { icon: Package, label: "LPG Cylinders", value: "—", change: "", positive: true },
    { icon: Users, label: "Top Perfoming Branch", value: "—", change: "", positive: true },
    { icon: Activity, label: "Total Target Reached", value: "—", change: "", positive: true },
  ]);
  const [branchOverview, setBranchOverview] = useState<BranchOverview[]>([]);
  const [insights, setInsights] = useState<HomeInsightsDTO | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [editingBranch, setEditingBranch] = useState<BranchOverview | null>(null);
  const [targets, setTargets] = useState<BranchSalesTargetDTO[]>([]);
  const [targetMonth, setTargetMonth] = useState(currentMonth());
  const [targetAmount, setTargetAmount] = useState("");
  const [targetError, setTargetError] = useState("");
  const [targetSaving, setTargetSaving] = useState(false);

  const loadDashboard = useCallback(async () => {
    setDashboardError("");
    try {
      const [dashboard, monthlyTargets, homeInsights] = await Promise.all([
        appService.dashboard.get(),
        appService.salesTargets.list(),
        appService.dashboard.getHomeInsights(),
      ]);
      const totalRevenue = typeof dashboard.totalRevenue === "number" ? dashboard.totalRevenue : Number(dashboard.metrics?.revenue ?? 0);
      const totalCylinders = typeof dashboard.totalCylinders === "number" ? dashboard.totalCylinders : Number(dashboard.metrics?.cylindersInStock ?? 0);
      const topBranch = dashboard.topBranch ?? dashboard.topPerformingBranch ?? dashboard.branchPerformance?.[0]?.branchName ?? dashboard.branchPerformance?.[0]?.name;
      const targetReachedPercent = Number(dashboard.targetReachedPercent ?? (dashboard.metrics?.lowStockRecords === undefined ? 0 : 100));
      const branchSource = dashboard.branchOverview ?? dashboard.branches ?? dashboard.branchPerformance ?? [];
      const branchCards: BranchOverview[] = branchSource.map((branch: DashboardBranch) => {
        const name = String(branch.name ?? branch.branchName ?? "Unknown");
        const total = Number(branch.revenue ?? 0);
        return { branchId: branch.branchId, name, currentRevenue: total, targetGoal: Number(branch.targetGoal ?? 0), status: String(branch.status ?? (total > 0 ? "Reached" : "Pending")) };
      }).sort((a, b) => a.name.localeCompare(b.name));
      setStats([
        { icon: DollarSign, label: "Total Revenue", value: formatCurrency(totalRevenue), change: "", positive: true },
        { icon: Package, label: "LPG Cylinders", value: totalCylinders.toLocaleString("en-PH"), change: "", positive: true },
        { icon: Users, label: "Top Perfoming Branch", value: topBranch ?? "—", change: "", positive: true },
        { icon: Activity, label: "Total Target Reached", value: `${targetReachedPercent}%`, change: "", positive: true },
      ]);
      setBranchOverview(branchCards);
      setTargets(monthlyTargets);
      setInsights(homeInsights);
    } catch (error) {
      setDashboardError(error instanceof Error ? error.message : "Unable to load dashboard data.");
    }
  }, []);

  useEffect(() => { void loadDashboard(); }, [loadDashboard]);

  const selectedTarget = editingBranch
    ? targets.find((target) => target.branchId === editingBranch.branchId && target.periodStart.slice(0, 7) === targetMonth)
    : undefined;
  const displayedAmount = selectedTarget ? String(selectedTarget.targetRevenue) : targetAmount;

  const openTarget = (branch: BranchOverview) => {
    const month = currentMonth();
    const target = targets.find((item) => item.branchId === branch.branchId && item.periodStart.slice(0, 7) === month);
    setEditingBranch(branch);
    setTargetMonth(month);
    setTargetAmount(target ? String(target.targetRevenue) : "");
    setTargetError("");
  };
  const closeTarget = () => { if (!targetSaving) { setEditingBranch(null); setTargetError(""); } };
  const changeMonth = (month: string) => {
    setTargetMonth(month);
    const target = editingBranch && targets.find((item) => item.branchId === editingBranch.branchId && item.periodStart.slice(0, 7) === month);
    setTargetAmount(target ? String(target.targetRevenue) : "");
    setTargetError("");
  };
  const saveTarget = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!editingBranch) return;
    const amount = Number(targetAmount);
    if (!targetMonth || !Number.isFinite(amount) || amount < 0) { setTargetError("Enter a valid month and a non-negative target revenue."); return; }
    setTargetSaving(true);
    setTargetError("");
    try {
      const input = { branchId: editingBranch.branchId, ...monthPeriod(targetMonth), targetRevenue: amount };
      if (selectedTarget) await appService.salesTargets.update(selectedTarget.id, input);
      else await appService.salesTargets.create(input);
      setEditingBranch(null);
      await loadDashboard();
    } catch (error) {
      setTargetError(error instanceof Error ? error.message : "Unable to save monthly target.");
    } finally {
      setTargetSaving(false);
    }
  };
  const deleteTarget = async () => {
    if (!selectedTarget) return;
    setTargetSaving(true);
    setTargetError("");
    try {
      await appService.salesTargets.delete(selectedTarget.id);
      setEditingBranch(null);
      await loadDashboard();
    } catch (error) {
      setTargetError(error instanceof Error ? error.message : "Unable to delete monthly target.");
    } finally {
      setTargetSaving(false);
    }
  };

  return (
    <div className="space-y-8 page-fade-in">
      <div className="border-b border-[#8BAE66]/30 pb-4"><h1 className="text-[#1B211A] mb-2">Dashboard Overview</h1><p className="text-[#628141]">Welcome back! Here's what's happening with your LPG business today.</p></div>
      {dashboardError && <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{dashboardError}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => <div key={index} className="p-6 rounded-3xl bg-[#FFFDF1]" style={{ boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)' }}><div className="flex items-start justify-between mb-4"><div className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66]" style={{ boxShadow: '0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)' }}><stat.icon className="w-6 h-6 text-[#FFFDF1]" /></div><span className="h-6 w-6 rounded-full bg-gradient-to-br from-[#628141] to-[#8BAE66]" style={{ boxShadow: '0 2px 5px rgba(98,129,65,.45), inset 0 1px 2px rgba(255,255,255,.5)' }} /></div><h3 className="text-2xl text-[#1B211A] mb-1">{stat.value}</h3><p className="text-[#628141] text-sm">{stat.label}</p></div>)}
      </div>
<div className="p-6 rounded-3xl bg-[#FFFDF1]" style={{ boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)' }}>
        <h3 className="text-[#1B211A] mb-6">Branch Status Overview</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branchOverview.map((branch) => <div key={branch.branchId} className="p-4 rounded-2xl bg-gradient-to-br from-[#628141]/10 to-[#8BAE66]/10" style={{ boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)' }}>
            <div className="mb-2 flex items-center justify-between gap-2"><h4 className="text-[#1B211A]">{branch.name}</h4><div className="flex items-center gap-2"><span className="px-3 py-1 rounded-full bg-[#8BAE66] text-[#FFFDF1] text-xs">{branch.status}</span><button type="button" onClick={() => openTarget(branch)} aria-label={`Edit ${branch.name} monthly target`} className="rounded-lg bg-[#FFFDF1] p-1.5 text-[#628141] hover:bg-[#8BAE66]/20"><Pencil className="h-4 w-4" /></button></div></div>
            <div className="space-y-1"><p className="text-[#628141] text-sm">Current-Month Sales: {formatCurrency(branch.currentRevenue)}</p><p className="text-[#628141] text-sm">Target Revenue: {formatCurrency(branch.targetGoal)}</p></div>
          </div>)}
          {!branchOverview.length && <div className="col-span-full rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">No branch sales data available.</div>}
        </div>
      </div>
      <MonthlyTargetModal open={editingBranch !== null} branchName={editingBranch?.name ?? ""} month={targetMonth} amount={displayedAmount} exists={selectedTarget !== undefined} saving={targetSaving} error={targetError} onMonthChange={changeMonth} onAmountChange={setTargetAmount} onClose={closeTarget} onSubmit={(event) => { void saveTarget(event); }} onDelete={() => { void deleteTarget(); }} />
    </div>
  );
}
