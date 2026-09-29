import { useState } from "react";
import { useAuth } from "../utils/auth";
import { BranchManagement } from "./Settings/BranchManagement";
import { BranchModal } from "./Settings/BranchModal";
import { DeleteConfirmModal } from "./Settings/DeleteConfirmModal";
import { SettingsHeader } from "./Settings/SettingsHeader";
import { StaffManagement } from "./Settings/StaffManagement";
import { StaffModal } from "./Settings/StaffModal";
import { TargetModal } from "./Settings/TargetModal";
import { useBranchSettings } from "./Settings/useBranchSettings";
import { useStaffSettings } from "./Settings/useStaffSettings";
import { useTargetSettings } from "./Settings/useTargetSettings";
import type { DeleteTarget } from "./Settings/types";

export function SettingsPage() {
  const branch = useBranchSettings();
  const staff = useStaffSettings(branch.branches);
  const target = useTargetSettings(branch.setBranches);
  const { user } = useAuth();
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const confirmBranch = () => {
    if (branch.editingId !== null)
      setDeleteTarget({
        type: "branch",
        id: branch.editingId,
        name: branch.branches.find((b) => b.id === branch.editingId)?.name ?? "this branch",
      });
  };
  const confirmStaff = () => {
    if (staff.editingId !== null)
      setDeleteTarget({
        type: "staff",
        id: staff.editingId,
        name: staff.staff.find((s) => s.id === staff.editingId)?.username ?? "this staff member",
      });
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const ok =
      deleteTarget.type === "branch"
        ? await branch.remove(deleteTarget.id)
        : await staff.remove(deleteTarget.id);
    if (ok) setDeleteTarget(null);
  };
  return (
    <div className="space-y-8">
      <SettingsHeader />
      <BranchManagement
        branches={branch.branches}
        loading={branch.loading}
        error={branch.error}
        onAdd={branch.openAdd}
        onEdit={branch.openEdit}
        onTarget={target.show}
      />
      <StaffManagement
        staff={staff.staff}
        loading={staff.loading}
        error={staff.error}
        onCreate={user?.role === "Admin" ? staff.openCreate : undefined}
        onEdit={user?.role === "Admin" ? staff.openEdit : undefined}
      />
      <BranchModal
        open={branch.isOpen}
        isEditing={branch.isEditing}
        branchForm={branch.form}
        branchError={branch.error}
        isSaving={branch.saving}
        isDeleting={branch.deleting}
        onClose={branch.close}
        onSubmit={(e) => {
          e.preventDefault();
          void branch.save();
        }}
        onFieldChange={branch.change}
        onDelete={confirmBranch}
      />
      <TargetModal
        open={target.open}
        isEditing={target.id !== null}
        branches={branch.branches}
        branchId={target.branchId}
        month={target.month}
        amount={target.amount}
        error={target.error}
        saving={target.saving}
        onClose={target.close}
        onSubmit={(e) => {
          e.preventDefault();
          void target.save();
        }}
        onBranchChange={target.setBranchId}
        onMonthChange={target.setMonth}
        onAmountChange={target.setAmount}
        onDelete={() => {
          void target.remove();
        }}
      />
      <StaffModal
        open={staff.isOpen}
        isEditing={staff.isEditing}
        staffForm={staff.form}
        staffError={staff.error}
        isSaving={staff.saving}
        isDeleting={staff.deleting}
        branches={branch.branches}
        onClose={staff.close}
        onSubmit={(e) => {
          e.preventDefault();
          void staff.save();
        }}
        onFieldChange={staff.change}
        onDelete={confirmStaff}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          isBusy={deleteTarget.type === "branch" ? branch.deleting : staff.deleting}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={() => {
            void confirmDelete();
          }}
        />
      )}
    </div>
  );
}
