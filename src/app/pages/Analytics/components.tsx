import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { PieLabelRenderProps } from "recharts";
import { Filter, RefreshCw } from "lucide-react";
import type { ReactNode } from "react";
import type { BranchPerformancePoint, DailySalesPoint, MonthlyPerformancePoint, ProductRankingPoint, WeeklyDeliveryPoint } from "./types";

const COLORS = ["#628141", "#8BAE66", "#8BAE66", "#1B211A", "#628141", "#8BAE66"];
const cardStyle = { boxShadow: "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)" };
const iconStyle = { boxShadow: "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 1px 4px rgba(255, 255, 255, 0.2)" };
const tooltipStyle = { backgroundColor: "#FFFDF1", border: "1px solid #8BAE66", borderRadius: "12px", boxShadow: "0 4px 12px rgba(98, 129, 65, 0.2)" };

export function ChartCard({ icon, title, description, children }: { icon: ReactNode; title: string; description: string; children: ReactNode }) {
  return <div className="p-6 rounded-3xl bg-[#FFFDF1]" style={cardStyle}>
    <div className="flex items-center gap-3 mb-6"><div className="p-2 rounded-xl bg-gradient-to-br from-[#628141] to-[#8BAE66]" style={iconStyle}>{icon}</div><div><h3 className="text-[#1B211A]">{title}</h3><p className="text-[#628141] text-sm">{description}</p></div></div>
    {children}
  </div>;
}

export function AnalyticsControls() {
  const filterClass = "px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2";
  const filterStyle = { boxShadow: "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)" };
  return <div className="p-4 rounded-3xl bg-[#FFFDF1] flex flex-wrap gap-4 items-center justify-between" style={{ boxShadow: `${cardStyle.boxShadow}, inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)` }}>
    <div className="flex gap-3 flex-1">{["Branch", "Year", "Month"].map((label) => <button key={label} className={filterClass} style={filterStyle}><Filter className="w-5 h-5" />{label}</button>)}</div>
    <div className="flex gap-3"><button className="px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141] flex items-center gap-2" style={{ boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)" }} onClick={() => window.location.reload()}><RefreshCw className="w-5 h-5" />Refresh</button></div>
  </div>;
}

export function RevenueChart({ data }: { data: MonthlyPerformancePoint[] }) {
  return <ResponsiveContainer width="100%" height={350}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#EBD5AB" /><XAxis dataKey="month" stroke="#628141" /><YAxis yAxisId="revenue" stroke="#628141" /><YAxis yAxisId="average" orientation="right" stroke="#8BAE66" /><Tooltip contentStyle={tooltipStyle} /><Legend /><Bar yAxisId="revenue" dataKey="revenue" name="Revenue" fill="#628141" radius={[8, 8, 0, 0]} /><Bar yAxisId="average" dataKey="averageOrderValue" name="Average order value" fill="#8BAE66" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>;
}

export function WeeklySalesChart({ data }: { data: WeeklyDeliveryPoint[] }) {
  return <ResponsiveContainer width="100%" height={300}><BarChart data={data}><CartesianGrid strokeDasharray="3 3" stroke="#EBD5AB" /><XAxis dataKey="day" stroke="#628141" /><YAxis stroke="#628141" /><Tooltip contentStyle={tooltipStyle} /><Legend /><Bar dataKey="InStore" name="In-Store" fill="#628141" radius={[8, 8, 0, 0]} /><Bar dataKey="Commercial" fill="#8BAE66" radius={[8, 8, 0, 0]} /></BarChart></ResponsiveContainer>;
}

export function DailySalesChart({ data }: { data: DailySalesPoint[] }) {
  const trend = data.reduce((result, point) => { const revenue = (result.at(-1)?.cumulative ?? 0) + point.revenue; const average = point.transactions ? point.revenue / point.transactions : 0; return [...result, { ...point, cumulative: revenue, average }]; }, [] as Array<DailySalesPoint & { cumulative: number; average: number }>);
  return <ResponsiveContainer width="100%" height={300}><BarChart data={trend}><CartesianGrid strokeDasharray="3 3" stroke="#EBD5AB" /><XAxis dataKey="label" stroke="#628141" /><YAxis stroke="#628141" /><Tooltip contentStyle={tooltipStyle} /><Legend /><Bar dataKey="cumulative" name="Cumulative revenue" fill="#628141" radius={[6, 6, 0, 0]} /><Bar dataKey="average" name="Avg transaction" fill="#8BAE66" radius={[6, 6, 0, 0]} /></BarChart></ResponsiveContainer>;
}
export function ProductRankingChart({ data }: { data: ProductRankingPoint[] }) {
  const formatKg = (value: number) => `${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })} kg`;
  const formatSales = (value: number) => `₱${value.toLocaleString("en-PH", { maximumFractionDigits: 2 })}`;
  return <ResponsiveContainer width="100%" height={300}>
    <BarChart data={data.slice(0, 8)} layout="vertical" margin={{ right: 20 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#EBD5AB" />
      <XAxis type="number" stroke="#628141" />
      <YAxis type="category" dataKey="name" width={140} stroke="#628141" />
      <Tooltip contentStyle={tooltipStyle} formatter={(value: number, name: string) => [name === "Total weight (kg)" ? formatKg(value) : formatSales(value), name]} />
      <Legend />
      <Bar dataKey="totalKg" name="Total weight (kg)" fill="#628141" radius={[0, 6, 6, 0]} />
      <Bar dataKey="salesValue" name="Sales value (₱)" fill="#8BAE66" radius={[0, 6, 6, 0]} />
    </BarChart>
  </ResponsiveContainer>;
}

export function BranchChart({ data }: { data: BranchPerformancePoint[] }) {
  const renderBranchLabel = ({ percent, payload }: PieLabelRenderProps) => {
    const branchValue = payload as unknown as { name?: unknown; branchName?: unknown; percent?: unknown } | undefined;
    const labelName = typeof branchValue?.name === "string" ? branchValue.name : typeof branchValue?.branchName === "string" ? branchValue.branchName : "Branch";
    const percentage = typeof percent === "number" && Number.isFinite(percent) ? percent * 100 : typeof branchValue?.percent === "number" ? branchValue.percent * 100 : 0;
    const shortenedName = labelName.split(/\s+/).slice(0, 2).join(" ");
    return `${shortenedName}: ${percentage.toFixed(0)}%`;
  };
   
  return <ResponsiveContainer width="100%" height={250}><PieChart><Pie data={data} cx="50%" cy="50%" labelLine={false} label={renderBranchLabel} outerRadius={80} fill="#8884d8" dataKey="value">{data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}</Pie><Tooltip contentStyle={tooltipStyle} /></PieChart></ResponsiveContainer>;
}
