import { Database } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import { BranchManagement } from "./Settings/BranchManagement";
import { BranchModal } from "./Settings/BranchModal";
import { DeleteConfirmModal } from "./Settings/DeleteConfirmModal";
import { SettingsHeader } from "./Settings/SettingsHeader";
import { SettingsSectionList } from "./Settings/SettingsSectionList";
import { StaffManagement } from "./Settings/StaffManagement";
import { StaffModal } from "./Settings/StaffModal";
import type {
  BranchForm,
  BranchSetting,
  DeleteTarget,
  SettingSection,
  StaffForm,
  StaffRole,
  StaffSetting,
} from "./Settings/types";
import { unwrapRelation } from "../utils/relations";
import { supabase } from "../utils/supabase";

const EMPTY_BRANCH_FORM: BranchForm = {
  name: "",
  location: "",
  contactNo: "",
};

const EMPTY_STAFF_FORM: StaffForm = {
  username: "",
  password: "",
  role: "Staff",
  branchId: "",
};

const generateStaffId = () => {
  const cryptoObject = globalThis.crypto;
  if (!cryptoObject) {
    throw new Error("Secure UUID generation is not available in this browser.");
  }
  if (cryptoObject.randomUUID) {
    return cryptoObject.randomUUID();
  }
  const bytes = new Uint8Array(16);
  cryptoObject.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const toHex = (value: number) => value.toString(16).padStart(2, "0");
  return (
    `${toHex(bytes[0])}${toHex(bytes[1])}${toHex(bytes[2])}${toHex(bytes[3])}` +
    `-${toHex(bytes[4])}${toHex(bytes[5])}` +
    `-${toHex(bytes[6])}${toHex(bytes[7])}` +
    `-${toHex(bytes[8])}${toHex(bytes[9])}` +
    `-${toHex(bytes[10])}${toHex(bytes[11])}${toHex(bytes[12])}${toHex(bytes[13])}${toHex(bytes[14])}${toHex(bytes[15])}`
  );
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

  useEffect(() => {
    const loadBranches = async () => {
      setBranchLoading(true);
      setBranchError("");
      const { data, error } = await supabase
        .from("branches")
        .select("branch_id, branch_name, location, contact_no")
        .order("branch_name");

      if (error) {
        setBranchError(error.message);
        setBranchSettings([]);
        setBranchLoading(false);
        return;
      }

      const mapped =
        data?.map((branch) => ({
          id: branch.branch_id,
          name: branch.branch_name,
          location: branch.location,
          contactNo: branch.contact_no,
        })) ?? [];

      setBranchSettings(mapped);
      setBranchLoading(false);
    };

    loadBranches();
  }, []);

  useEffect(() => {
    const loadStaff = async () => {
      setStaffLoading(true);
      setStaffError("");
      const { data, error } = await supabase
        .from("staff")
        .select(
          "staff_id, username, role, branch_id, branch:branches(branch_name)",
        )
        .order("username");

      if (error) {
        setStaffError(error.message);
        setStaffSettings([]);
        setStaffLoading(false);
        return;
      }

      const mapped =
        data?.map((staff) => {
          const branch = unwrapRelation(staff.branch);
          return {
            id: staff.staff_id,
            username: staff.username,
            role: staff.role as StaffRole,
            branchId: staff.branch_id,
            branchName: branch?.branch_name ?? "Unknown",
          };
        }) ?? [];

      setStaffSettings(mapped);
      setStaffLoading(false);
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

  const openAddStaffModal = () => {
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

    if (editingBranchId !== null) {
      const { data, error } = await supabase
        .from("branches")
        .update({
          branch_name: branchForm.name,
          location: branchForm.location,
          contact_no: branchForm.contactNo,
        })
        .eq("branch_id", editingBranchId)
        .select("branch_id, branch_name, location, contact_no")
        .single();

      if (error) {
        setBranchError(error.message);
        setIsSaving(false);
        return;
      }

      setBranchSettings((prev) =>
        prev.map((branch) =>
          branch.id === editingBranchId
            ? {
                id: data.branch_id,
                name: data.branch_name,
                location: data.location,
                contactNo: data.contact_no,
              }
            : branch,
        ),
      );
    } else {
      const { data, error } = await supabase
        .from("branches")
        .insert({
          branch_name: branchForm.name,
          location: branchForm.location,
          contact_no: branchForm.contactNo,
        })
        .select("branch_id, branch_name, location, contact_no")
        .single();

      if (error) {
        setBranchError(error.message);
        setIsSaving(false);
        return;
      }

      setBranchSettings((prev) => [
        ...prev,
        {
          id: data.branch_id,
          name: data.branch_name,
          location: data.location,
          contactNo: data.contact_no,
        },
      ]);
    }

    setIsSaving(false);
    closeBranchModal();
  };

  const handleStaffSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsStaffSaving(true);
    setStaffError("");

    if (!staffForm.branchId) {
      setStaffError("Select a branch before saving staff.");
      setIsStaffSaving(false);
      return;
    }

    if (!editingStaffId && !staffForm.password.trim()) {
      setStaffError("Password is required for new staff.");
      setIsStaffSaving(false);
      return;
    }

    const passwordValue = staffForm.password.trim();
    const hashedPassword = passwordValue
      ? await bcrypt.hash(passwordValue, 10)
      : null;

    if (editingStaffId !== null) {
      const updates: {
        branch_id: number;
        username: string;
        role: StaffRole;
        password?: string;
      } = {
        branch_id: Number(staffForm.branchId),
        username: staffForm.username,
        role: staffForm.role,
      };

      if (hashedPassword) {
        updates.password = hashedPassword;
      }

      const { data, error } = await supabase
        .from("staff")
        .update(updates)
        .eq("staff_id", editingStaffId)
        .select(
          "staff_id, username, role, branch_id, branch:branches(branch_name)",
        )
        .single();

      if (error) {
        setStaffError(error.message);
        setIsStaffSaving(false);
        return;
      }

      setStaffSettings((prev) =>
        prev.map((staff) =>
          staff.id === editingStaffId
            ? {
                id: data.staff_id,
                username: data.username,
                role: data.role as StaffRole,
                branchId: data.branch_id,
                branchName: unwrapRelation(data.branch)?.branch_name ?? "Unknown",
              }
            : staff,
        ),
      );
    } else {
      let staffId: string;
      try {
        staffId = generateStaffId();
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Unable to generate staff ID.";
        setStaffError(message);
        setIsStaffSaving(false);
        return;
      }

      const { data, error } = await supabase
        .from("staff")
        .insert({
          staff_id: staffId,
          branch_id: Number(staffForm.branchId),
          username: staffForm.username,
          role: staffForm.role,
          password: hashedPassword ?? "",
        })
        .select(
          "staff_id, username, role, branch_id, branch:branches(branch_name)",
        )
        .single();

      if (error) {
        setStaffError(error.message);
        setIsStaffSaving(false);
        return;
      }

      setStaffSettings((prev) => [
        ...prev,
        {
          id: data.staff_id,
          username: data.username,
          role: data.role as StaffRole,
          branchId: data.branch_id,
          branchName: unwrapRelation(data.branch)?.branch_name ?? "Unknown",
        },
      ]);
    }

    setIsStaffSaving(false);
    closeStaffModal();
  };

  const handleDeleteBranch = async (branchId: number) => {
    setIsDeleting(true);
    setBranchError("");
    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("branch_id", branchId);

    if (error) {
      setBranchError(error.message);
      setIsDeleting(false);
      return false;
    }

    setBranchSettings((prev) =>
      prev.filter((branch) => branch.id !== branchId),
    );
    setIsDeleting(false);
    closeBranchModal();
    return true;
  };

  const handleDeleteStaff = async (staffId: string) => {
    setIsStaffDeleting(true);
    setStaffError("");
    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("staff_id", staffId);

    if (error) {
      setStaffError(error.message);
      setIsStaffDeleting(false);
      return false;
    }

    setStaffSettings((prev) =>
      prev.filter((staff) => staff.id !== staffId),
    );
    setIsStaffDeleting(false);
    closeStaffModal();
    return true;
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
        onAdd={openAddStaffModal}
        onEdit={openEditStaffModal}
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
