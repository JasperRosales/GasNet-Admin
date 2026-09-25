import { Database } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import { appService, type BranchDTO, type StaffDTO } from "../services/appService";
import { useAuth } from "../utils/auth";
import { BranchManagement } from "./Settings/BranchManagement";
import { BranchModal } from "./Settings/BranchModal";
import { DeleteConfirmModal } from "./Settings/DeleteConfirmModal";
import { SettingsHeader } from "./Settings/SettingsHeader";
import { SettingsSectionList } from "./Settings/SettingsSectionList";
import { StaffManagement } from "./Settings/StaffManagement";
import { StaffModal } from "./Settings/StaffModal";
import { registerStaff } from "./Settings/staffService";
import type {
  BranchForm,
  BranchSetting,
  DeleteTarget,
  SettingSection,
  StaffForm,
  StaffSetting,
} from "./Settings/types";

const EMPTY_BRANCH_FORM: BranchForm = {
  name: "",
  location: "",
  contactNo: "",
};

const EMPTY_STAFF_FORM: StaffForm = {
  username: "",
  email: "",
  password: "",
  role: "Staff",
  branchId: "",
};

export function SettingsPage() {
  const [autoSync, setAutoSync] = useState(true);
  const [branchSettings, setBranchSettings] = useState<BranchSetting[]>([]);
  const [branchLoading, setBranchLoading] = useState(true);
  const [branchError, setBranchError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBranchId, setEditingBranchId] = useState<number | null>(null);
  const [branchForm, setBranchForm] = useState<BranchForm>(EMPTY_BRANCH_FORM);
  const [staffSettings, setStaffSettings] = useState<StaffSetting[]>([]);
  const [staffLoading, setStaffLoading] = useState(true);
  const [staffError, setStaffError] = useState("");
  const [isStaffSaving, setIsStaffSaving] = useState(false);
  const [isStaffDeleting, setIsStaffDeleting] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingStaffId, setEditingStaffId] = useState<string | null>(null);
  const [staffForm, setStaffForm] = useState<StaffForm>(EMPTY_STAFF_FORM);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const { user } = useAuth();
  const canManageStaff = user?.role === "Admin";

  useEffect(() => {
    const loadBranches = async () => {
      setBranchLoading(true);
      setBranchError("");
      try {
        const data = await appService.branches.list();
        const mapped = data.map((branch: BranchDTO) => ({
          id: branch.id,
          name: branch.name,
          location: branch.location,
          contactNo: branch.contactNo,
        }));

        setBranchSettings(mapped);
      } catch (loadError) {
        setBranchError(
          loadError instanceof Error
            ? loadError.message
            : "Unable to load branches.",
        );
        setBranchSettings([]);
      } finally {
        setBranchLoading(false);
      }
    };

    loadBranches();
  }, []);

  useEffect(() => {
    const loadStaff = async () => {
      setStaffLoading(true);
      setStaffError("");
      try {
        const data = await appService.staff.list();
        const mapped = data.map((staff: StaffDTO) => ({
          id: staff.id,
          username: staff.username,
          role: staff.role,
          branchId: staff.branchId,
          branchName: staff.branchName || "Unknown",
        }));

        setStaffSettings(mapped);
      } catch (loadError) {
        setStaffError(
          loadError instanceof Error ? loadError.message : "Unable to load staff.",
        );
        setStaffSettings([]);
      } finally {
        setStaffLoading(false);
      }
    };

    loadStaff();
  }, []);

  const settingSections: SettingSection[] = [
    {
      icon: Database,
      title: "Data Management",
      description: "Control data synchronization and backup",
      toggles: [
        { label: "Auto-Sync Data", state: autoSync, setter: setAutoSync },
      ],
      fields: [
        { label: "Last Backup", value: "Feb 18, 2026 - 08:30 AM", type: "text", readonly: true },
      ],
    },
  ];

  const closeBranchModal = () => {
    setIsAddModalOpen(false);
    setEditingBranchId(null);
    setBranchForm(EMPTY_BRANCH_FORM);
  };

  const openAddBranchModal = () => {
    setBranchForm(EMPTY_BRANCH_FORM);
    setEditingBranchId(null);
    setIsAddModalOpen(true);
  };

  const openEditBranchModal = (branch: BranchSetting) => {
    setBranchForm({
      name: branch.name,
      location: branch.location,
      contactNo: branch.contactNo,
    });
    setEditingBranchId(branch.id);
    setIsAddModalOpen(false);
  };

  const closeStaffModal = () => {
    setIsStaffModalOpen(false);
    setEditingStaffId(null);
    setStaffForm(EMPTY_STAFF_FORM);
  };

  const openCreateStaffModal = () => {
    setStaffForm({
      ...EMPTY_STAFF_FORM,
      branchId: branchSettings[0] ? String(branchSettings[0].id) : "",
    });
    setEditingStaffId(null);
    setIsStaffModalOpen(true);
  };

  const openEditStaffModal = (staff: StaffSetting) => {
    setStaffForm({
      username: staff.username,
      email: "",
      password: "",
      role: staff.role,
      branchId: String(staff.branchId),
    });
    setEditingStaffId(staff.id);
    setIsStaffModalOpen(true);
  };

  const handleBranchFormChange = (field: keyof BranchForm, value: string) => {
    setBranchForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleStaffFormChange = (field: keyof StaffForm, value: string) => {
    setStaffForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const openDeleteBranchConfirm = () => {
    if (editingBranchId === null) return;
    const branchName =
      branchSettings.find((branch) => branch.id === editingBranchId)?.name ??
      "this branch";
    setDeleteTarget({ type: "branch", id: editingBranchId, name: branchName });
  };

  const openDeleteStaffConfirm = () => {
    if (editingStaffId === null) return;
    const staffName =
      staffSettings.find((staff) => staff.id === editingStaffId)?.username ??
      "this staff member";
    setDeleteTarget({ type: "staff", id: editingStaffId, name: staffName });
  };

  const closeDeleteConfirm = () => {
    setDeleteTarget(null);
  };

  const handleBranchSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSaving(true);
    setBranchError("");

    try {
      const branch = editingBranchId === null
        ? await appService.branches.create({
            name: branchForm.name,
            location: branchForm.location,
            contactNo: branchForm.contactNo,
          })
        : await appService.branches.update(editingBranchId, {
            name: branchForm.name,
            location: branchForm.location,
            contactNo: branchForm.contactNo,
          });

      const mapped = {
        id: branch.id,
        name: branch.name,
        location: branch.location,
        contactNo: branch.contactNo,
      };
      setBranchSettings((prev) =>
        editingBranchId === null
          ? [...prev, mapped]
          : prev.map((item) => (item.id === editingBranchId ? mapped : item)),
      );
      setIsSaving(false);
      closeBranchModal();
    } catch (error) {
      setBranchError(
        error instanceof Error ? error.message : "Unable to save the branch.",
      );
      setIsSaving(false);
    }
  };

  const handleStaffSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsStaffSaving(true);
    setStaffError("");

    const emailValue = staffForm.email.trim();
    const passwordValue = staffForm.password.trim();

    if (!emailValue) {
      setStaffError("Email is required for staff.");
      setIsStaffSaving(false);
      return;
    }

    if (!staffForm.branchId) {
      setStaffError("Select a branch before saving staff.");
      setIsStaffSaving(false);
      return;
    }

    if (!editingStaffId && !passwordValue) {
      setStaffError("Password is required for new staff.");
      setIsStaffSaving(false);
      return;
    }

    if (editingStaffId !== null) {
      try {
        const updatedStaff = await appService.staff.update(editingStaffId, {
          username: usernameValue,
          role: staffForm.role,
          branchId: Number(staffForm.branchId),
          ...(passwordValue ? { password: passwordValue } : {}),
        });
        setStaffSettings((prev) =>
          prev.map((staff) =>
            staff.id === editingStaffId
              ? {
                  id: updatedStaff.id,
                  username: updatedStaff.username,
                  role: updatedStaff.role,
                  branchId: updatedStaff.branchId,
                  branchName: updatedStaff.branchName || "Unknown",
                }
              : staff,
          ),
        );
      } catch (error) {
        setStaffError(
          error instanceof Error ? error.message : "Unable to update the staff account.",
        );
        setIsStaffSaving(false);
        return;
      }
    } else {
      try {
        const createdStaff = await registerStaff({
          email: emailValue,
          password: passwordValue,
          role: staffForm.role,
          branchId: Number(staffForm.branchId),
        });

        setStaffSettings((prev) => [...prev, createdStaff]);
      } catch (error) {
        setStaffError(
          error instanceof Error
            ? error.message
            : "Unable to create the staff account.",
        );
        setIsStaffSaving(false);
        return;
      }
    }

    setIsStaffSaving(false);
    closeStaffModal();
  };

  const handleDeleteBranch = async (branchId: number) => {
    setIsDeleting(true);
    setBranchError("");
    try {
      await appService.branches.delete(branchId);
      setBranchSettings((prev) => prev.filter((branch) => branch.id !== branchId));
      setIsDeleting(false);
      closeBranchModal();
      return true;
    } catch (error) {
      setBranchError(
        error instanceof Error ? error.message : "Unable to delete the branch.",
      );
      setIsDeleting(false);
      return false;
    }
  };

  const handleDeleteStaff = async (staffId: string) => {
    setIsStaffDeleting(true);
    setStaffError("");
    try {
      await appService.staff.delete(staffId);
      setStaffSettings((prev) => prev.filter((staff) => staff.id !== staffId));
      setIsStaffDeleting(false);
      closeStaffModal();
      return true;
    } catch (error) {
      setStaffError(
        error instanceof Error ? error.message : "Unable to delete the staff account.",
      );
      setIsStaffDeleting(false);
      return false;
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    if (deleteTarget.type === "branch") {
      await handleDeleteBranch(deleteTarget.id);
    } else {
      await handleDeleteStaff(deleteTarget.id);
    }
    closeDeleteConfirm();
  };

  const deleteBusy =
    deleteTarget?.type === "branch"
      ? isDeleting
      : deleteTarget?.type === "staff"
        ? isStaffDeleting
        : false;

  const isBranchModalOpen = isAddModalOpen || editingBranchId !== null;
  const isBranchEditing = editingBranchId !== null;
  const isStaffModalOpenComputed = isStaffModalOpen || editingStaffId !== null;
  const isStaffEditing = editingStaffId !== null;

  return (
    <div className="space-y-8">
      <SettingsHeader />
      <SettingsSectionList sections={settingSections} />
      <BranchManagement
        branches={branchSettings}
        loading={branchLoading}
        error={branchError}
        onAdd={openAddBranchModal}
        onEdit={openEditBranchModal}
      />
      <StaffManagement
        staff={staffSettings}
        loading={staffLoading}
        error={staffError}
        onCreate={canManageStaff ? openCreateStaffModal : undefined}
        onEdit={canManageStaff ? openEditStaffModal : undefined}
      />
      <BranchModal
        open={isBranchModalOpen}
        isEditing={isBranchEditing}
        branchForm={branchForm}
        branchError={branchError}
        isSaving={isSaving}
        isDeleting={isDeleting}
        onClose={closeBranchModal}
        onSubmit={handleBranchSubmit}
        onFieldChange={handleBranchFormChange}
        onDelete={openDeleteBranchConfirm}
      />
      <StaffModal
        open={isStaffModalOpenComputed}
        isEditing={isStaffEditing}
        staffForm={staffForm}
        staffError={staffError}
        isSaving={isStaffSaving}
        isDeleting={isStaffDeleting}
        branches={branchSettings}
        onClose={closeStaffModal}
        onSubmit={handleStaffSubmit}
        onFieldChange={handleStaffFormChange}
        onDelete={openDeleteStaffConfirm}
      />
      {deleteTarget && (
        <DeleteConfirmModal
          target={deleteTarget}
          isBusy={deleteBusy}
          onCancel={closeDeleteConfirm}
          onConfirm={handleConfirmDelete}
        />
      )}
    </div>
  );
}
