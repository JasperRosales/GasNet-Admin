import { useEffect, useState } from "react";
import { appService } from "../../services/appService";
import { registerStaff } from "./staffService";
import type { StaffForm, StaffSetting } from "./types";

const emptyForm: StaffForm = { username: "", email: "", password: "", role: "Staff", branchId: "" };

export function useStaffSettings(branches: { id: number }[]) {
  const [staff, setStaff] = useState<StaffSetting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<StaffForm>(emptyForm);

  useEffect(() => {
    let active = true;
    appService.staff.list().then((data) => {
      if (active) setStaff(data.map((s) => ({ id: s.id, username: s.username, role: s.role, branchId: s.branchId, branchName: s.branchName || "Unknown" })));
    }).catch((e) => { if (active) { setError(e instanceof Error ? e.message : "Unable to load staff."); setStaff([]); } }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const close = () => { setOpen(false); setEditingId(null); setForm(emptyForm); };
  const openCreate = () => { setForm({ ...emptyForm, branchId: branches[0] ? String(branches[0].id) : "" }); setEditingId(null); setOpen(true); };
  const openEdit = (item: StaffSetting) => { setForm({ username: item.username, email: "", password: "", role: item.role, branchId: String(item.branchId) }); setEditingId(item.id); setOpen(true); };
  const change = (field: keyof StaffForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const save = async () => {
    setSaving(true); setError(""); const email = form.email.trim(), password = form.password.trim();
    if (!email) { setError("Email is required for staff."); setSaving(false); return; }
    if (!form.branchId) { setError("Select a branch before saving staff."); setSaving(false); return; }
    if (!editingId && !password) { setError("Password is required for new staff."); setSaving(false); return; }
    try {
      if (editingId) {
        const updated = await appService.staff.update(editingId, { username: form.username, role: form.role, branchId: Number(form.branchId), ...(password ? { password } : {}) });
        setStaff((prev) => prev.map((s) => s.id === editingId ? { id: updated.id, username: updated.username, role: updated.role, branchId: updated.branchId, branchName: updated.branchName || "Unknown" } : s));
      } else {
        const created = await registerStaff({ email, password, role: form.role, branchId: Number(form.branchId) });
        setStaff((prev) => [...prev, created]);
      }
      close();
    } catch (e) { setError(e instanceof Error ? e.message : editingId ? "Unable to update the staff account." : "Unable to create the staff account."); }
    finally { setSaving(false); }
  };
  const remove = async (id: string) => { setDeleting(true); setError(""); try { await appService.staff.delete(id); setStaff((prev) => prev.filter((s) => s.id !== id)); close(); return true; } catch (e) { setError(e instanceof Error ? e.message : "Unable to delete the staff account."); return false; } finally { setDeleting(false); } };
  return { staff, loading, error, saving, deleting, editingId, isOpen: open, isEditing: editingId !== null, form, openCreate, openEdit, close, change, save, remove };
}
