import { useEffect, useState } from "react";
import { appService } from "../../services/appService";
import { monthEnd } from "./settingsUtils";
import type { BranchForm, BranchSetting } from "./types";

const emptyForm: BranchForm = { name: "", location: "", contactNo: "" };

export function useBranchSettings() {
  const [branches, setBranches] = useState<BranchSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<BranchForm>(emptyForm);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      try {
        const [data, targets] = await Promise.all([appService.branches.list(), appService.salesTargets.list()]);
        const month = new Date().toISOString().slice(0, 7);
        const map = new Map(targets.filter((t) => t.periodStart.slice(0, 7) === month).map((t) => [t.branchId, t]));
        if (active) setBranches(data.map((b) => ({ id: b.id, name: b.name, location: b.location, contactNo: b.contactNo, targetRevenue: map.get(b.id)?.targetRevenue ?? 0, periodStart: map.get(b.id)?.periodStart ?? `${month}-01`, periodEnd: map.get(b.id)?.periodEnd ?? monthEnd(month), targetId: map.get(b.id)?.id ?? null })));
      } catch (e) { if (active) { setError(e instanceof Error ? e.message : "Unable to load branches."); setBranches([]); } }
      finally { if (active) setLoading(false); }
    };
    load();
    return () => { active = false; };
  }, []);

  const close = () => { setOpen(false); setEditingId(null); setForm(emptyForm); };
  const openAdd = () => { setForm(emptyForm); setEditingId(null); setOpen(true); };
  const openEdit = (branch: BranchSetting) => { setForm({ name: branch.name, location: branch.location, contactNo: branch.contactNo }); setEditingId(branch.id); setOpen(true); };
  const change = (field: keyof BranchForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const save = async () => {
    setSaving(true); setError("");
    try {
      const branch = editingId === null ? await appService.branches.create(form) : await appService.branches.update(editingId, form);
      const old = branches.find((item) => item.id === (editingId ?? branch.id));
      setBranches((prev) => editingId === null ? [...prev, { ...branch, targetRevenue: old?.targetRevenue ?? 0, periodStart: old?.periodStart ?? `${new Date().toISOString().slice(0, 7)}-01`, periodEnd: old?.periodEnd ?? monthEnd(new Date().toISOString().slice(0, 7)), targetId: old?.targetId ?? null }] : prev.map((item) => item.id === editingId ? { ...branch, targetRevenue: old?.targetRevenue ?? 0, periodStart: old.periodStart, periodEnd: old.periodEnd, targetId: old.targetId } : item));
      close();
    } catch (e) { setError(e instanceof Error ? e.message : "Unable to save the branch."); }
    finally { setSaving(false); }
  };
  const remove = async (id: number) => { setDeleting(true); setError(""); try { await appService.branches.delete(id); setBranches((prev) => prev.filter((b) => b.id !== id)); close(); return true; } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete the branch."); return false; } finally { setDeleting(false); } };
  return { branches, setBranches, loading, error, saving, deleting, editingId, isOpen: open, isEditing: editingId !== null, form, openAdd, openEdit, close, change, save, remove };
}
