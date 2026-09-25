import { X } from "lucide-react";
import type { FormEvent } from "react";

interface MonthlyTargetModalProps {
  open: boolean;
  branchName: string;
  month: string;
  amount: string;
  exists: boolean;
  saving: boolean;
  error: string;
  onMonthChange: (month: string) => void;
  onAmountChange: (amount: string) => void;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onDelete: () => void;
}

export function MonthlyTargetModal({
  open,
  branchName,
  month,
  amount,
  exists,
  saving,
  error,
  onMonthChange,
  onAmountChange,
  onClose,
  onSubmit,
  onDelete,
}: MonthlyTargetModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B211A]/40 p-4">
      <div className="w-full max-w-md rounded-3xl bg-[#FFFDF1] p-6 shadow-2xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h3 className="text-[#1B211A]">{exists ? "Edit Monthly Target" : "Set Monthly Target"}</h3>
            <p className="mt-1 text-sm text-[#628141]">{branchName}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close target editor" className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] p-2 text-[#FFFDF1]" style={{ boxShadow: "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)" }}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="target-month" className="mb-2 block text-sm text-[#628141]">Month</label>
            <input id="target-month" type="month" value={month} onChange={(event) => onMonthChange(event.target.value)} className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none focus:ring-2 focus:ring-[#8BAE66]" required />
          </div>
          <div>
            <label htmlFor="target-amount" className="mb-2 block text-sm text-[#628141]">Target Revenue (₱)</label>
            <input id="target-amount" type="number" min="0" step="0.01" value={amount} onChange={(event) => onAmountChange(event.target.value)} className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none focus:ring-2 focus:ring-[#8BAE66]" required />
          </div>
          {error && <div role="alert" className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</div>}
          <div className="flex justify-end gap-3 pt-2">
            {exists && <button type="button" onClick={onDelete} disabled={saving} className="mr-auto rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1] disabled:opacity-60" style={{ boxShadow: "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)" }}>Delete</button>}
            <button type="button" onClick={onClose} className="rounded-xl bg-white px-4 py-2 text-[#628141]" style={{ boxShadow: "0 4px 12px rgba(98,129,65,.18), inset 0 2px 6px rgba(255,255,255,.8)" }}>Cancel</button>
            <button type="submit" disabled={saving} className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1] disabled:opacity-60" style={{ boxShadow: "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)" }}>{saving ? "Saving..." : "Save Target"}</button>
          </div>
        </form>
      </div>
    </div>
  );
}
