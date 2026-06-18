import { Download, Filter, RefreshCw, Search } from "lucide-react";

interface DataControlsProps {
  onOpenExport: () => void;
}

export function DataControls({ onOpenExport }: DataControlsProps) {
  return (
    <div
      className="p-4 rounded-3xl bg-[#FFFDF1] flex flex-wrap gap-4 items-center justify-between"
      style={{
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <div className="flex gap-3 flex-1">
        <div
          className="flex items-center gap-2 px-4 py-2 rounded-2xl flex-1 max-w-md"
          style={{
            background: "rgba(235, 213, 171, 0.3)",
            boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
          }}
        >
          <Search className="w-5 h-5 text-[#628141]" />
          <input
            type="text"
            placeholder="Search data..."
            className="flex-1 bg-transparent border-none outline-none text-[#1B211A] placeholder:text-[#628141]/50"
          />
        </div>
        <button
          onClick={onOpenExport}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
          style={{
            boxShadow:
              "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
          }}
        >
          <Search className="w-5 h-5" />
          Search
        </button>
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
          Sort
        </button>
      </div>
      <div className="flex gap-3">
        <button
          className="px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141] flex items-center gap-2"
          style={{
            boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
          }}
        >
          <RefreshCw className="w-5 h-5" />
          Refresh
        </button>
        <button
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
          style={{
            boxShadow:
              "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
          }}
        >
          <Download className="w-5 h-5" />
          Export
        </button>
      </div>
    </div>
  );
}
