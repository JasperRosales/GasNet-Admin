import { Filter, RefreshCw } from "lucide-react";

interface AnalyticsControlsProps {
  onRefresh: () => void;
}

export function AnalyticsControls({ onRefresh }: AnalyticsControlsProps) {
  return (
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
          onClick={onRefresh}
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
      </div>
    </div>
  );
}
