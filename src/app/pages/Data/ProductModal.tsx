import { X } from "lucide-react";
import type { FormEvent } from "react";
import type { ProductForm } from "./types";

interface ProductModalProps {
  open: boolean;
  form: ProductForm;
  error: string;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof ProductForm, value: string) => void;
}

export function ProductModal({
  open,
  form,
  error,
  isSaving,
  onClose,
  onSubmit,
  onFieldChange,
}: ProductModalProps) {
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
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[#1B211A]">Create Product</h3>
            <p className="text-sm text-[#628141]">Add a new product for inventory and pricing.</p>
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
            <label className="mb-2 block text-sm text-[#628141]">Product Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(event) => onFieldChange("name", event.target.value)}
              className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-[#628141]">Weight (kg)</label>
            <input
              type="number"
              min={0.1}
              step="any"
              value={form.weightKg}
              onChange={(event) => onFieldChange("weightKg", event.target.value)}
              className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
              required
            />
          </div>

          {error && (
            <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</div>
          )}

          <div className="flex justify-end gap-3 pt-2">
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
              disabled={isSaving}
              className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
              style={{
                boxShadow:
                  "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
              }}
            >
              {isSaving ? "Saving..." : "Create Product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
