import { Globe, Plus } from "lucide-react";
import type { BranchSetting } from "./types";

interface BranchManagementProps {
  branches: BranchSetting[];
  loading: boolean;
  error: string;
  onAdd: () => void;
  onEdit: (branch: BranchSetting) => void;
}

export function BranchManagement({
  branches,
  loading,
  error,
  onAdd,
  onEdit,
}: BranchManagementProps) {
  return (
    <div
      className="p-6 rounded-3xl bg-[#FFFDF1]"
      style={{
        boxShadow:
          "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
      }}
    >
      <div className="flex items-start justify-between mb-6 gap-4">
        <div className="flex items-center gap-4">
          <div
            className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Globe className="w-6 h-6 text-[#FFFDF1]" />
          </div>
          <div>
            <h3 className="text-[#1B211A]">Branch Management</h3>
            <p className="text-[#628141] text-sm">
              Overview and settings for all branches
            </p>
          </div>
        </div>
        <button
          onClick={onAdd}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] text-sm flex items-center gap-2"
          style={{
            boxShadow:
              "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
          }}
        >
          <Plus className="w-4 h-4" />
          Add Branch
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {loading ? (
        <div className="rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">
          Loading branches...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {branches.map((branch) => (
            <div
              key={branch.id}
              className="p-4 rounded-2xl bg-gradient-to-br from-[#628141]/10 to-[#8BAE66]/10"
              style={{
                boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-[#1B211A]">{branch.name}</h4>
                <span className="px-3 py-1 rounded-full bg-[#8BAE66]/30 text-[#628141] text-xs">
                  Active
                </span>
              </div>
              <div className="space-y-1">
                <p className="text-[#628141] text-sm">{branch.location}</p>
                <p className="text-[#628141] text-sm">{branch.contactNo}</p>
              </div>
              <button
                onClick={() => onEdit(branch)}
                className="mt-3 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] text-sm"
                style={{
                  boxShadow:
                    "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }}
              >
                Manage Branch
              </button>
            </div>
          ))}
          {!branches.length && (
            <div className="col-span-full rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">
              No branches found yet.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
