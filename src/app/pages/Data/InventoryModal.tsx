import { ChevronDown, X } from "lucide-react";
import type { FormEvent } from "react";
import type {
  BranchOption,
  InventoryForm,
  InventoryItem,
  ProductOption,
} from "./types";

interface InventoryModalProps {
  open: boolean;
  branches: BranchOption[];
  products: ProductOption[];
  inventoryItems: InventoryItem[];
  form: InventoryForm;
  editingStockId: number | null;
  error: string;
  isSaving: boolean;
  isDeleting: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onFieldChange: (field: keyof InventoryForm, value: string) => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (item: InventoryItem) => void;
}

export function InventoryModal({
  open,
  branches,
  products,
  inventoryItems,
  form,
  editingStockId,
  error,
  isSaving,
  isDeleting,
  onClose,
  onSubmit,
  onFieldChange,
  onEditItem,
  onDeleteItem,
}: InventoryModalProps) {
  if (!open) return null;

  const selectedBranchId = Number(form.branchId);
  const selectedBranchItems = inventoryItems.filter(
    (item) => item.branchId === selectedBranchId,
  );
  const reorderLevelValue =
    editingStockId === null ? form.reorderLevel || "1" : form.reorderLevel;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B211A]/40 p-4">
      <div
        className="w-full max-w-5xl rounded-3xl bg-[#FFFDF1] p-6"
        style={{
          boxShadow:
            "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 -2px 8px rgba(98, 129, 65, 0.1)",
        }}
      >
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-[#1B211A]">
              {editingStockId !== null
                ? "Edit Inventory Data"
                : "Add Inventory Data"}
            </h3>
            <p className="text-sm text-[#628141]">
              Update quantities and reorder levels for branch stock.
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

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <form className="space-y-4" onSubmit={onSubmit}>
            <div>
              <label className="mb-2 block text-sm text-[#628141]">Branch</label>
              <div className="relative">
                <select
                  value={form.branchId}
                  onChange={(event) => onFieldChange("branchId", event.target.value)}
                  disabled={editingStockId !== null}
                  className="w-full appearance-none rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 pr-10 text-[#1B211A] outline-none"
                  required
                >
                  <option value="">Select a branch</option>
                  {branches.map((branch) => (
                    <option key={branch.id} value={String(branch.id)}>
                      {branch.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#628141]" />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm text-[#628141]">Product</label>
              <div className="relative">
                <select
                  value={form.productId}
                  onChange={(event) => onFieldChange("productId", event.target.value)}
                  className="w-full appearance-none rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 pr-10 text-[#1B211A] outline-none"
                  required
                >
                  <option value="">Select a product</option>
                  {products.map((product) => (
                    <option key={product.id} value={String(product.id)}>
                      {product.label}
                      {product.weight ? ` (${product.weight}kg)` : ""}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#628141]" />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Quantity
                </label>
                <input
                  type="number"
                  min={0}
                  value={form.quantity}
                  onChange={(event) => onFieldChange("quantity", event.target.value)}
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-[#628141]">
                  Reorder Level
                </label>
                <input
                  type="number"
                  min={0}
                  value={reorderLevelValue}
                  onChange={(event) =>
                    onFieldChange("reorderLevel", event.target.value)
                  }
                  className="w-full rounded-2xl bg-[#EBD5AB]/20 px-4 py-3 text-[#1B211A] outline-none"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="rounded-2xl bg-red-100/70 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
              {editingStockId !== null && (
                <button
                  type="button"
                  onClick={() => {
                    const target = selectedBranchItems.find(
                      (item) => item.stockId === editingStockId,
                    );
                    if (target) onDeleteItem(target);
                  }}
                  disabled={isSaving || isDeleting}
                  className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                  style={{
                    boxShadow:
                      "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete Item"}
                </button>
              )}
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
                  ? "Saving..."
                  : editingStockId !== null
                    ? "Save Changes"
                    : "Add Data"}
              </button>
            </div>
          </form>

          <div
            className="rounded-3xl bg-[#FFFDF1] p-4"
            style={{
              boxShadow:
                "inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
            }}
          >
            <div className="mb-4">
              <h4 className="text-[#1B211A]">Current branch stock</h4>
              <p className="text-sm text-[#628141]">
                {selectedBranchItems.length
                  ? `${selectedBranchItems.length} item(s) on this branch`
                  : "No items found for this branch yet."}
              </p>
            </div>

            <div className="space-y-3">
              {selectedBranchItems.map((item) => (
                <div
                  key={item.stockId}
                  className="rounded-2xl bg-[#EBD5AB]/15 p-4"
                  style={{
                    boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[#1B211A]">{item.productName}</p>
                      <p className="text-xs text-[#628141]">
                        Qty {item.quantity} · Reorder {item.reorderLevel}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => onEditItem(item)}
                        className="rounded-xl bg-[#8BAE66]/20 px-3 py-2 text-xs text-[#628141]"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteItem(item)}
                        className="rounded-xl bg-[#628141] px-3 py-2 text-xs text-[#FFFDF1]"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
