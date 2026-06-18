import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BookAIcon } from "lucide-react";
import type { WeeklyDelivery } from "./types";

interface WeeklyPerformanceCardProps {
  data: WeeklyDelivery[];
}

export function WeeklyPerformanceCard({ data }: WeeklyPerformanceCardProps) {
  return (
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
      </div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
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
  );
}
