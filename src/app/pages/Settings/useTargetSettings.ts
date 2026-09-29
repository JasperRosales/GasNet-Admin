import { useState, type Dispatch, type SetStateAction } from "react";
import { appService } from "../../services/appService";
import { monthEnd } from "./settingsUtils";
import type { BranchSetting } from "./types";

export function useTargetSettings(setBranches: Dispatch<SetStateAction<BranchSetting[]>>) {
  const [open, setOpen] = useState(false);
  const [id, setId] = useState<number | null>(null);
  const [branchId, setBranchId] = useState("");
  const [month, setMonth] = useState(new Date().toISOString().slice(0, 7));
  const [amount, setAmount] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const show = (b: BranchSetting) => {
    setId(b.targetId);
    setBranchId(String(b.id));
    setMonth(b.periodStart.slice(0, 7));
    setAmount(b.targetRevenue > 0 ? String(b.targetRevenue) : "");
    setError("");
    setOpen(true);
  };
  const close = () => {
    setOpen(false);
    setError("");
  };
  const save = async () => {
    const value = Number(amount);
    if (!branchId || !month || !Number.isInteger(value) || value <= 0) {
      setError("Select a branch, month, and a valid positive whole-number amount.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const input = {
        branchId: Number(branchId),
        periodStart: `${month}-01`,
        periodEnd: monthEnd(month),
        targetRevenue: value,
      };
      const saved =
        id === null
          ? await appService.salesTargets.create(input)
          : await appService.salesTargets.update(id, input);
      setBranches((prev) =>
        prev.map((b) =>
          b.id === saved.branchId
            ? {
                ...b,
                targetRevenue: saved.targetRevenue,
                periodStart: saved.periodStart,
                periodEnd: saved.periodEnd,
                targetId: saved.id,
              }
            : b
        )
      );
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to save the monthly target.");
    } finally {
      setSaving(false);
    }
  };
  const remove = async () => {
    if (id === null) return;
    setSaving(true);
    try {
      await appService.salesTargets.delete(id);
      setBranches((prev) =>
        prev.map((b) =>
          b.id === Number(branchId) ? { ...b, targetRevenue: 0, targetId: null } : b
        )
      );
      close();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to delete the monthly target.");
    } finally {
      setSaving(false);
    }
  };
  return {
    open,
    id,
    branchId,
    month,
    amount,
    saving,
    error,
    show,
    close,
    save,
    remove,
    setBranchId,
    setMonth,
    setAmount,
  };
}
