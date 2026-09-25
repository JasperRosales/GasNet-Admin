import { ChevronDown, X } from "lucide-react";
import type { FormEvent } from "react";
import type { BranchSetting, StaffForm } from "./types";

interface StaffModalProps {
  open: boolean;
  isEditing: boolean;
  staffForm: StaffForm;
  staffError: string;
  isSaving: boolean;
  isDeleting: boolean;
  branches: BranchSetting[];
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof StaffForm, value: string) => void;
  onDelete: () => void;
}

export function StaffModal({
  open,
  isEditing,
  staffForm,
  staffError,
  isSaving,
  isDeleting,
  branches,
  onClose,
  onSubmit,
  onFieldChange,
  onDelete,
}: StaffModalProps) {
  if (!open) return null;

  return (
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
              {isEditing ? "Edit Staff" : "Create Staff"}
            </h3>
            <p className="text-sm text-[#628141]">
              {isEditing
                ? "Update the account email, role, and branch assignment."
                : "Create a Supabase Auth account and staff profile."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-[#628141] hover:bg-[#EBD5AB]/30"
            title="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form className="space-y-4" onSubmit={onSubmit}>
          <div>
            <label htmlFor="staff-email" className="mb-2 block text-sm text-[#628141]">
              Account email
            </label>
            <input
              id="staff-email"
              type="email"
              value={staffForm.email}
              onChange={(event) => onFieldChange("email", event.target.value)}
              className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              style={{
                boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
              }}
              placeholder="Enter the account email"
              autoComplete="email"
              maxLength={254}
              required
            />
          </div>

          <div>
            <label htmlFor="staff-password" className="mb-2 block text-sm text-[#628141]">
              Password
            </label>
            <input
              id="staff-password"
              type="password"
              value={staffForm.password}
              onChange={(event) => onFieldChange("password", event.target.value)}
              className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              style={{
                boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
              }}
              placeholder={isEditing ? "Leave blank to keep current" : "Enter an initial password"}
              autoComplete="new-password"
              minLength={8}
              required={!isEditing}
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#628141]">Role</label>
            <div className="relative">
              <select
                value={staffForm.role}
                onChange={(event) => onFieldChange("role", event.target.value)}
                className="w-full appearance-none rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 pr-10 text-[#1B211A] outline-none"
                style={{
                  boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                }}
              >
                <option value="Admin">Admin</option>
                <option value="Manager">Manager</option>
                <option value="Staff">Staff</option>
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#628141]" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#628141]">Branch</label>
            <div className="relative">
              <select
                value={staffForm.branchId}
                onChange={(event) => onFieldChange("branchId", event.target.value)}
                required
                className="w-full appearance-none rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 pr-10 text-[#1B211A] outline-none"
                style={{
                  boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                }}
              >
                <option value="">Select a branch</option>
                {branches.map((branch) => (
                  <option key={branch.id} value={branch.id}>
                    {branch.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#628141]" />
            </div>
          </div>

          {staffError && (
            <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
              {staffError}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            {isEditing ? (
              <button
                type="button"
                onClick={onDelete}
                disabled={isDeleting || isSaving}
                className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                style={{
                  boxShadow:
                    "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }}
              >
                {isDeleting ? "Deleting..." : "Delete Staff"}
              </button>
            ) : (
              <span />
            )}
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
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
                  ? isEditing
                    ? "Saving..."
                    : "Creating..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Staff"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
