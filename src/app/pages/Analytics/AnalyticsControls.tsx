import { Filter, RefreshCw } from "lucide-react";

export type AnalyticsFilters = { branchId?: number; year?: number; month?: number };
interface Props { onRefresh: () => void; onChange: (filters: AnalyticsFilters) => void; branches: Array<{ id: number; name: string }>; years: number[]; months: number[]; filters: AnalyticsFilters; }
export function AnalyticsControls({ onRefresh, onChange, branches, years, months, filters }: Props) {
  const filterClass = "flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141]";
  const selectClass = "bg-transparent outline-none text-[#628141] cursor-pointer";
  return <div className="p-4 rounded-3xl bg-[#FFFDF1] flex flex-wrap gap-4 items-center justify-between" style={{ boxShadow: "0 8px 32px rgba(98,129,65,.15), inset 0 2px 8px rgba(255,255,255,.6), inset 0 -2px 8px rgba(98,129,65,.05)" }}>
    <div className="flex gap-3 flex-wrap items-center"><span className="text-sm text-[#628141]">Filter analytics by:</span>
      <label className={filterClass}><Filter className="w-5 h-5" /><select aria-label="Filter by branch" className={selectClass} value={filters.branchId ?? ""} onChange={e => onChange({ ...filters, branchId: e.target.value ? Number(e.target.value) : undefined })}><option value="">All branches</option>{branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>
      <label className={filterClass}><Filter className="w-5 h-5" /><select aria-label="Filter by year" className={selectClass} value={filters.year ?? ""} onChange={e => onChange({ ...filters, year: e.target.value ? Number(e.target.value) : undefined, month: undefined })}><option value="">All years</option>{years.map(y => <option key={y} value={y}>{y}</option>)}</select></label>
      <label className={filterClass}><Filter className="w-5 h-5" /><select aria-label="Filter by month" className={selectClass} value={filters.month ?? ""} onChange={e => onChange({ ...filters, month: e.target.value ? Number(e.target.value) : undefined })}><option value="">All months</option>{months.map(m => <option key={m} value={m}>{new Date(2000, m - 1, 1).toLocaleString("en", { month: "long" })}</option>)}</select></label>
    </div><button className="px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141] flex items-center gap-2" onClick={onRefresh}><RefreshCw className="w-5 h-5" />Refresh</button>
  </div>;
}
