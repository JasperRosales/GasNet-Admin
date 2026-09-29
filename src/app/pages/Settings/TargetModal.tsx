import { X } from "lucide-react";
import type { FormEvent } from "react";

interface TargetModalProps {
  open: boolean;
  branches: Array<{ id: number; name: string }>;
  isEditing: boolean;
  branchId: string;
  month: string;
  amount: string;
  error: string;
  saving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onBranchChange: (value: string) => void;
  onMonthChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onDelete: () => void;
}

export function TargetModal(props: TargetModalProps) {
  if (!props.open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B211A]/40 p-4">
      <div
        className="w-full max-w-lg rounded-3xl bg-[#FFFDF1] p-6"
        style={{
          boxShadow: "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255,255,255,.8)",
        }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-[#1B211A]">
              {props.isEditing ? "Edit Monthly Sales Target" : "Set Monthly Sales Target"}
            </h3>
            <p className="text-sm text-[#628141]">
              Compare this month's branch revenue against the configured amount.
            </p>
          </div>
          <button
            onClick={props.onClose}
            className="rounded-xl p-2 text-[#628141] hover:bg-[#EBD5AB]/30"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={props.onSubmit}>
          <div>
            <label className="mb-2 block text-sm text-[#628141]">Branch</label>
            <select
              value={props.branchId}
              onChange={(e) => props.onBranchChange(e.target.value)}
              disabled={props.isEditing}
              className="w-full appearance-none rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              required
            >
              <option value="">Select branch</option>
              {props.branches.map((branch) => (
                <option key={branch.id} value={branch.id}>
                  {branch.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#628141]">Month</label>
            <input
              type="month"
              value={props.month}
              onChange={(e) => props.onMonthChange(e.target.value)}
              className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              required
            />
          </div>
          <div>
            <label className="mb-2 block text-sm text-[#628141]">Target Amount (₱)</label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={props.amount}
              onChange={(e) => props.onAmountChange(e.target.value)}
              className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              required
            />
          </div>
          {props.error && (
            <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
              {props.error}
            </div>
          )}
          <div className="flex justify-end gap-3 pt-2">
            {props.isEditing && (
              <button
                type="button"
                onClick={props.onDelete}
                className="mr-auto rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                style={{
                  boxShadow: "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)",
                }}
              >
                Delete Target
              </button>
            )}
            <button
              type="button"
              onClick={props.onClose}
              className="rounded-xl bg-[#8BAE66]/20 px-4 py-2 text-[#628141]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={props.saving}
              className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
            >
              {props.saving ? "Saving..." : "Save Target"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
