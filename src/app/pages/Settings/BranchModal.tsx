import { X } from "lucide-react";
import type { FormEvent } from "react";
import type { BranchForm } from "./types";

interface BranchModalProps {
  open: boolean;
  isEditing: boolean;
  branchForm: BranchForm;
  branchError: string;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof BranchForm, value: string) => void;
  onDelete: () => void;
}

export function BranchModal({
  open,
  isEditing,
  branchForm,
  branchError,
  isSaving,
  isDeleting,
  onClose,
  onSubmit,
  onFieldChange,
  onDelete,
}: BranchModalProps) {
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
              {isEditing ? "Edit Branch" : "Add Branch"}
            </h3>
            <p className="text-sm text-[#628141]">
              {isEditing
                ? "Update branch details and contact info."
                : "Create a new branch profile for management."}
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
            <label className="mb-2 block text-sm text-[#628141]">
              Branch Name
            </label>
            <input
              type="text"
              value={branchForm.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              style={{
                boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
              }}
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#628141]">Location</label>
            <input
              type="text"
              value={branchForm.location}
              onChange={(event) => onFieldChange("location", event.target.value)}
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
              onChange={(event) => onFieldChange("contactNo", event.target.value)}
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
                {isDeleting ? "Deleting..." : "Delete Branch"}
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
                {isSaving ? "Saving..." : isEditing ? "Save Changes" : "Add Branch"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
