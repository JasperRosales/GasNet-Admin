import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { MapPin } from "lucide-react";
import type { BranchDatum } from "./types";

interface BranchPerformanceCardProps {
  data: BranchDatum[];
  colors: string[];
}

export function BranchPerformanceCard({ data, colors }: BranchPerformanceCardProps) {
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
          <MapPin className="w-5 h-5 text-[#FFFDF1]" />
        </div>
        <div>
          <h3 className="text-[#1B211A]">Branch Performance</h3>
          <p className="text-[#628141] text-sm">Sales distribution across 6 branches</p>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
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
  );
}
