import { Globe, Database, Plus, X, Users } from "lucide-react";
import { type FormEvent, useEffect, useState } from "react";
import bcrypt from "bcryptjs";
import { supabase } from "../utils/supabase";

type StaffRole = "Admin" | "Staff" | "Manager";

interface BranchSetting {
  id: number;
  name: string;
  location: string;
  contactNo: string;
}

interface StaffSetting {
  id: string;
  username: string;
  role: StaffRole;
  branchId: number;
  branchName: string;
}

interface BranchForm {
  name: string;
  location: string;
  contactNo: string;
}

interface StaffForm {
  username: string;
  password: string;
  role: StaffRole;
  branchId: string;
}

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
        data?.map((staff) => ({
          id: staff.staff_id,
          username: staff.username,
          role: staff.role as StaffRole,
          branchId: staff.branch_id,
          branchName: staff.branch?.branch_name ?? "Unknown",
        })) ?? [];

      setStaffSettings(mapped);
      setStaffLoading(false);
    };

    loadStaff();
  }, []);

  const settingSections = [
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
                branchName: data.branch?.branch_name ?? "Unknown",
              }
            : staff,
        ),
      );
    } else {
      const { data, error } = await supabase
        .from("staff")
        .insert({
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
          branchName: data.branch?.branch_name ?? "Unknown",
        },
      ]);
    }

    setIsStaffSaving(false);
    closeStaffModal();
  };

  const handleDeleteBranch = async () => {
    if (editingBranchId === null) return;
    const branchName = branchSettings.find(
      (branch) => branch.id === editingBranchId,
    )?.name;
    const confirmed = window.confirm(
      `Delete branch "${branchName ?? "this branch"}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsDeleting(true);
    setBranchError("");
    const { error } = await supabase
      .from("branches")
      .delete()
      .eq("branch_id", editingBranchId);

    if (error) {
      setBranchError(error.message);
      setIsDeleting(false);
      return;
    }

    setBranchSettings((prev) =>
      prev.filter((branch) => branch.id !== editingBranchId),
    );
    setIsDeleting(false);
    closeBranchModal();
  };

  const handleDeleteStaff = async () => {
    if (editingStaffId === null) return;
    const staffName = staffSettings.find(
      (staff) => staff.id === editingStaffId,
    )?.username;
    const confirmed = window.confirm(
      `Delete staff "${staffName ?? "this staff member"}"? This cannot be undone.`,
    );
    if (!confirmed) return;

    setIsStaffDeleting(true);
    setStaffError("");
    const { error } = await supabase
      .from("staff")
      .delete()
      .eq("staff_id", editingStaffId);

    if (error) {
      setStaffError(error.message);
      setIsStaffDeleting(false);
      return;
    }

    setStaffSettings((prev) =>
      prev.filter((staff) => staff.id !== editingStaffId),
    );
    setIsStaffDeleting(false);
    closeStaffModal();
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[#1B211A] mb-2">Settings</h1>
        <p className="text-[#628141]">Manage your LPG Trading dashboard preferences</p>
      </div>

      {/* Main Settings Sections */}
      <div className="space-y-6">
        {settingSections.map((section, index) => (
          <div
            key={index}
            className="p-6 rounded-3xl bg-[#FFFDF1]"
            style={{
              boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
            }}
          >
            {/* Section Header */}
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
                style={{
                  boxShadow: '0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
                }}
              >
                <section.icon className="w-6 h-6 text-[#FFFDF1]" />
              </div>
              <div>
                <h3 className="text-[#1B211A]">{section.title}</h3>
                <p className="text-[#628141] text-sm">{section.description}</p>
              </div>
            </div>

            {/* Fields */}
            {section.fields && (
              <div className="space-y-4">
                {section.fields.map((field, idx) => (
                  <div key={idx}>
                    <label className="text-[#628141] text-sm mb-2 block">{field.label}</label>
                    <input
                      type={field.type}
                      defaultValue={field.value}
                      readOnly={field.readonly}
                      className={`w-full px-4 py-3 rounded-2xl bg-[#EBD5AB]/20 text-[#1B211A] border-none outline-none ${field.readonly ? 'cursor-not-allowed opacity-70' : ''}`}
                      style={{
                        boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)',
                      }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Toggles */}
            {section.toggles && (
              <div className="space-y-4 mt-4">
                {section.toggles.map((toggle, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <span className="text-[#1B211A]">{toggle.label}</span>
                    <button
                      onClick={() => toggle.setter(!toggle.state)}
                      className={`relative w-14 h-7 rounded-full transition-colors ${
                        toggle.state ? 'bg-gradient-to-r from-[#628141] to-[#8BAE66]' : 'bg-[#EBD5AB]'
                      }`}
                      style={{
                        boxShadow: toggle.state 
                          ? '0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)'
                          : 'inset 0 2px 6px rgba(98, 129, 65, 0.1)',
                      }}
                    >
                      <span
                        className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-[#FFFDF1] transition-transform ${
                          toggle.state ? 'translate-x-7' : 'translate-x-0'
                        }`}
                        style={{
                          boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
                        }}
                      />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Branch Management */}
      <div
        className="p-6 rounded-3xl bg-[#FFFDF1]"
        style={{
          boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
        }}
      >
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div 
              className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
              style={{
                boxShadow: '0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
              }}
            >
              <Globe className="w-6 h-6 text-[#FFFDF1]" />
            </div>
            <div>
              <h3 className="text-[#1B211A]">Branch Management</h3>
              <p className="text-[#628141] text-sm">Overview and settings for all branches</p>
            </div>
          </div>
          <button
            onClick={openAddBranchModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] text-sm flex items-center gap-2"
            style={{
              boxShadow: '0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Branch
          </button>
        </div>

        {branchError && (
          <div className="mb-4 rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
            {branchError}
          </div>
        )}
        {branchLoading ? (
          <div className="rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">
            Loading branches...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {branchSettings.map((branch) => (
              <div
                key={branch.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#628141]/10 to-[#8BAE66]/10"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)',
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
                  onClick={() => openEditBranchModal(branch)}
                  className="mt-3 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] text-sm"
                  style={{
                    boxShadow: '0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Manage Branch
                </button>
              </div>
            ))}
            {!branchSettings.length && (
              <div className="col-span-full rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">
                No branches found yet.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Staff Management */}
      <div
        className="p-6 rounded-3xl bg-[#FFFDF1]"
        style={{
          boxShadow: '0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)',
        }}
      >
        <div className="flex items-start justify-between mb-6 gap-4">
          <div className="flex items-center gap-4">
            <div
              className="p-3 rounded-2xl bg-gradient-to-br from-[#628141] to-[#8BAE66]"
              style={{
                boxShadow: '0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
              }}
            >
              <Users className="w-6 h-6 text-[#FFFDF1]" />
            </div>
            <div>
              <h3 className="text-[#1B211A]">Staff Management</h3>
              <p className="text-[#628141] text-sm">Manage staff access and assignments</p>
            </div>
          </div>
          <button
            onClick={openAddStaffModal}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] text-sm flex items-center gap-2"
            style={{
              boxShadow: '0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
            }}
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </button>
        </div>

        {staffError && (
          <div className="mb-4 rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
            {staffError}
          </div>
        )}
        {staffLoading ? (
          <div className="rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">
            Loading staff...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {staffSettings.map((staff) => (
              <div
                key={staff.id}
                className="p-4 rounded-2xl bg-gradient-to-br from-[#628141]/10 to-[#8BAE66]/10"
                style={{
                  boxShadow: 'inset 0 2px 6px rgba(98, 129, 65, 0.1)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-[#1B211A]">{staff.username}</h4>
                  <span className="px-3 py-1 rounded-full bg-[#8BAE66]/30 text-[#628141] text-xs">
                    {staff.role}
                  </span>
                </div>
                <div className="space-y-1">
                  <p className="text-[#628141] text-sm">{staff.branchName}</p>
                  <p className="text-[#628141] text-xs">
                    ID: {staff.id.slice(0, 8)}...
                  </p>
                </div>
                <button
                  onClick={() => openEditStaffModal(staff)}
                  className="mt-3 w-full px-4 py-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] text-sm"
                  style={{
                    boxShadow: '0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)',
                  }}
                >
                  Manage Staff
                </button>
              </div>
            ))}
            {!staffSettings.length && (
              <div className="col-span-full rounded-2xl bg-[#EBD5AB]/15 px-4 py-6 text-center text-sm text-[#628141]">
                No staff records found yet.
              </div>
            )}
          </div>
        )}
      </div>

      {(isAddModalOpen || editingBranchId !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B211A]/40 p-4">
          <div
            className="w-full max-w-xl rounded-3xl bg-[#FFFDF1] p-6"
            style={{
              boxShadow:
                "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 -2px 8px rgba(98, 129, 65, 0.1)",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-[#1B211A]">
                  {editingBranchId !== null ? "Edit Branch" : "Add Branch"}
                </h3>
                <p className="text-sm text-[#628141]">
                  {editingBranchId !== null
                    ? "Update branch details and contact info."
                    : "Create a new branch profile for management."}
                </p>
              </div>
              <button
                onClick={closeBranchModal}
                className="rounded-xl p-2 text-[#628141] hover:bg-[#EBD5AB]/30"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleBranchSubmit}>
              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Branch Name
                </label>
                <input
                  type="text"
                  value={branchForm.name}
                  onChange={(event) =>
                    handleBranchFormChange("name", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Location
                </label>
                <input
                  type="text"
                  value={branchForm.location}
                  onChange={(event) =>
                    handleBranchFormChange("location", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Contact Number
                </label>
                <input
                  type="text"
                  value={branchForm.contactNo}
                  onChange={(event) =>
                    handleBranchFormChange("contactNo", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                  required
                />
              </div>

              {branchError && (
                <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
                  {branchError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {editingBranchId !== null ? (
                  <button
                    type="button"
                    onClick={handleDeleteBranch}
                    disabled={isDeleting || isSaving}
                    className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {isDeleting ? "Deleting..." : "Delete Branch"}
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeBranchModal}
                    className="rounded-xl bg-[#8BAE66]/20 px-4 py-2 text-[#628141]"
                    style={{
                      boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving || isDeleting}
                    className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {isSaving
                      ? "Saving..."
                      : editingBranchId !== null
                        ? "Save Changes"
                        : "Add Branch"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {(isStaffModalOpen || editingStaffId !== null) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B211A]/40 p-4">
          <div
            className="w-full max-w-xl rounded-3xl bg-[#FFFDF1] p-6"
            style={{
              boxShadow:
                "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 -2px 8px rgba(98, 129, 65, 0.1)",
            }}
          >
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-[#1B211A]">
                  {editingStaffId !== null ? "Edit Staff" : "Add Staff"}
                </h3>
                <p className="text-sm text-[#628141]">
                  {editingStaffId !== null
                    ? "Update staff role and branch assignment."
                    : "Create a staff profile for a new team member."}
                </p>
              </div>
              <button
                onClick={closeStaffModal}
                className="rounded-xl p-2 text-[#628141] hover:bg-[#EBD5AB]/30"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form className="space-y-4" onSubmit={handleStaffSubmit}>
              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Username
                </label>
                <input
                  type="text"
                  value={staffForm.username}
                  onChange={(event) =>
                    handleStaffFormChange("username", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Password
                </label>
                <input
                  type="password"
                  value={staffForm.password}
                  onChange={(event) =>
                    handleStaffFormChange("password", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                  placeholder={
                    editingStaffId !== null ? "Leave blank to keep current" : ""
                  }
                  required={editingStaffId === null}
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Role
                </label>
                <select
                  value={staffForm.role}
                  onChange={(event) =>
                    handleStaffFormChange("role", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                >
                  <option value="Admin">Admin</option>
                  <option value="Manager">Manager</option>
                  <option value="Staff">Staff</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Branch
                </label>
                <select
                  value={staffForm.branchId}
                  onChange={(event) =>
                    handleStaffFormChange("branchId", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                >
                  <option value="">Select a branch</option>
                  {branchSettings.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              </div>

              {staffError && (
                <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
                  {staffError}
                </div>
              )}

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                {editingStaffId !== null ? (
                  <button
                    type="button"
                    onClick={handleDeleteStaff}
                    disabled={isStaffDeleting || isStaffSaving}
                    className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {isStaffDeleting ? "Deleting..." : "Delete Staff"}
                  </button>
                ) : (
                  <span />
                )}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeStaffModal}
                    className="rounded-xl bg-[#8BAE66]/20 px-4 py-2 text-[#628141]"
                    style={{
                      boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isStaffSaving || isStaffDeleting}
                    className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                    style={{
                      boxShadow:
                        "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                    }}
                  >
                    {isStaffSaving
                      ? "Saving..."
                      : editingStaffId !== null
                        ? "Save Changes"
                        : "Add Staff"}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
