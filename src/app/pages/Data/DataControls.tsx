import { Download, Filter, RefreshCw, Search } from "lucide-react";

interface BranchOption {
  id: number;
  name: string;
}
interface DataControlsProps {
  onOpenExport: () => void;
  branchOptions: BranchOption[];
  selectedBranchId: string;
  onBranchChange: (value: string) => void;
  showTransactionSearch?: boolean;
  searchTerm?: string;
  onSearchTermChange?: (value: string) => void;
  onRefresh?: () => void;
  showBranchFilter?: boolean;
  transactionType?: string;
  onTransactionTypeChange?: (value: string) => void;
}

export function DataControls({
  onOpenExport,
  branchOptions,
  selectedBranchId,
  onBranchChange,
  showTransactionSearch = false,
  searchTerm = "",
  onSearchTermChange,
  onRefresh,
  showBranchFilter = false,
  transactionType = "",
  onTransactionTypeChange,
}: DataControlsProps) {
  return (
    <div
      className="p-4 rounded-3xl bg-[#FFFDF1] flex flex-wrap gap-4 items-center justify-between"
      style={{
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <div className="flex gap-3 flex-1 flex-wrap items-center">
        {showTransactionSearch && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl flex-1 min-w-56 max-w-md"
            style={{
              background: "rgba(235, 213, 171, 0.3)",
              boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
            }}
          >
            <Search className="w-5 h-5 text-[#628141]" />
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => onSearchTermChange?.(event.target.value)}
              placeholder="Search transactions..."
              className="flex-1 bg-transparent border-none outline-none text-[#1B211A] placeholder:text-[#628141]/50"
            />
          </div>
        )}
        <label className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141]">
          <Filter className="w-5 h-5" />
          <select
            aria-label="Filter by branch"
            value={selectedBranchId}
            onChange={(event) => onBranchChange(event.target.value)}
            className="bg-transparent outline-none text-[#628141]"
          >
            <option value="">All branches</option>
            {branchOptions.map((branch) => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </label>
        {showTransactionSearch && (
          <label className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141]">
            <Filter className="w-4 h-4" />
            <select
              aria-label="Filter by sale type"
              value={transactionType}
              onChange={(event) => onTransactionTypeChange?.(event.target.value)}
              className="bg-transparent outline-none text-[#628141]"
            >
              <option value="">All sales</option>
              <option value="Instore">In-store sales</option>
              <option value="Commercial">Commercial sales</option>
              <option value="Delivery">Delivery sales</option>
            </select>
          </label>
        )}
      </div>
      <div className="flex gap-3">
        <button
          onClick={onRefresh}
          title="Refresh data"
          aria-label="Refresh data"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] transition hover:brightness-105"
          style={{
            boxShadow: "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)",
          }}
        >
          <RefreshCw className="h-5 w-5" />
        </button>
        <button
          onClick={onOpenExport}
          className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
          style={{
            boxShadow:
              "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
          }}
        >
          <Download className="w-5 h-5" />
          Export Report
        </button>
      </div>
    </div>
  );
}
