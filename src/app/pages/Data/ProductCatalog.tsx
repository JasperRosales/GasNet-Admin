import { Pencil, Plus, X } from "lucide-react";
import { useState } from "react";
import type { CatalogPrice, ProductDTO } from "../../services/appService";

const buttonShadow = "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)";
const subtleShadow = "inset 0 2px 6px rgba(98,129,65,.1)";

export function ProductCatalog({
  prices,
  products,
  selectedBranchId,
  onSave,
  onAddProduct,
  onEditProduct,
  onSaveProduct,
}: {
  prices: CatalogPrice[];
  products: ProductDTO[];
  selectedBranchId: string;
  onSave: (branchId: number, productId: number, price: number) => Promise<void>;
  onAddProduct: () => void;
  onEditProduct: (product: ProductDTO) => void;
  onSaveProduct: (
    product: ProductDTO,
    name: string,
    weightKg: number,
    price: number
  ) => Promise<void>;
}) {
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<ProductDTO | null>(null);
  const [editName, setEditName] = useState("");
  const [editWeight, setEditWeight] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const branchId = Number(selectedBranchId);
  const branchPrices = new Map(
    prices.filter((row) => row.branchId === branchId).map((row) => [row.productId, row])
  );
  const save = async (product: ProductDTO) => {
    const key = String(product.id);
    const value = Number(edits[key] ?? branchPrices.get(product.id)?.price ?? 0);
    setSaving(key);
    setError("");
    try {
      await onSave(branchId, product.id, value);
      setEdits((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save price.");
    } finally {
      setSaving(null);
    }
  };
  const openEdit = (product: ProductDTO) => {
    setEditing(product);
    setEditName(product.name);
    setEditWeight(String(product.weightKg));
    setEditPrice(String(branchPrices.get(product.id)?.price ?? ""));
  };
  const saveEdit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editing) return;
    const price = Number(editPrice);
    if (
      !editName.trim() ||
      !Number.isFinite(Number(editWeight)) ||
      Number(editWeight) <= 0 ||
      !Number.isInteger(price) ||
      price < 0
    ) {
      setError("Enter a valid name, weight, and non-negative whole-number price.");
      return;
    }
    setSaving(String(editing.id));
    setError("");
    try {
      await onSaveProduct(editing, editName.trim(), Number(editWeight), price);
      setEditing(null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to save product.");
    } finally {
      setSaving(null);
    }
  };
  return (
    <div
      className="rounded-3xl bg-[#FFFDF1] p-6"
      style={{ boxShadow: "0 8px 32px rgba(98,129,65,.15), inset 0 2px 8px rgba(255,255,255,.6)" }}
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h3 className="text-xl text-[#1B211A]">Product Catalog</h3>
          <p className="text-sm text-[#628141] mt-1">Manage product prices by branch.</p>
        </div>
        <button
          onClick={onAddProduct}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-5 py-2.5 text-sm font-semibold text-[#FFFDF1]"
          style={{ boxShadow: buttonShadow }}
        >
          <Plus className="h-4 w-4" /> Add Product
        </button>
      </div>
      {error && (
        <p className="mb-4 rounded-xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</p>
      )}
      {!products.length ? (
        <p className="text-sm text-[#628141]">No products found.</p>
      ) : (
        <div
          className="overflow-x-auto rounded-3xl bg-[#FFFDF1]"
          style={{
            boxShadow:
              "0 8px 32px rgba(98,129,65,.15), inset 0 2px 8px rgba(255,255,255,.6), inset 0 -2px 8px rgba(98,129,65,.05)",
          }}
        >
          <table className="w-full">
            <thead className="bg-gradient-to-r from-[#628141] to-[#8BAE66]">
              <tr>
                <th className="px-6 py-4 text-left font-semibold text-[#FFFDF1]">Product</th>
                <th className="px-6 py-4 text-left font-semibold text-[#FFFDF1]">Weight</th>
                <th className="px-6 py-4 text-left font-semibold text-[#FFFDF1]">Branch price</th>
                <th className="px-6 py-4 text-right font-semibold text-[#FFFDF1]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product, index) => {
                const key = String(product.id);
                const current = branchPrices.get(product.id);
                return (
                  <tr
                    key={product.id}
                    className={`border-b border-[#8BAE66]/20 ${index % 2 === 0 ? "bg-[#FFFDF1]" : "bg-[#EBD5AB]/10"}`}
                  >
                    <td className="rounded-l-xl px-6 py-4 font-medium text-[#1B211A]">
                      {product.name}
                    </td>
                    <td className="px-6 py-4 text-[#628141]">{product.weightKg} kg</td>
                    <td className="px-5 py-4">
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={edits[key] ?? String(current?.price ?? "")}
                        placeholder="Not set"
                        onChange={(event) =>
                          setEdits((state) => ({ ...state, [key]: event.target.value }))
                        }
                        className="w-32 rounded-xl border border-[#628141]/25 bg-[#FFFDF1] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#8BAE66]"
                        style={{ boxShadow: subtleShadow }}
                      />
                    </td>
                    <td className="rounded-r-xl px-6 py-4">
                      <div className="flex justify-end gap-3">
                        <button
                          onClick={() => openEdit(product)}
                          className="inline-flex items-center gap-2 rounded-xl bg-[#EBD5AB]/35 px-4 py-2.5 text-sm font-semibold text-[#628141] transition hover:bg-[#EBD5AB]/55"
                          style={{ boxShadow: buttonShadow }}
                        >
                          <Pencil className="h-4 w-4" /> Edit
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {editing && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1B211A]/50 p-4">
          <form
            onSubmit={saveEdit}
            onKeyDown={(event) => {
              if (event.key === "Enter" && event.currentTarget !== event.target) {
                event.preventDefault();
                void saveEdit(event as unknown as React.FormEvent);
              }
            }}
            className="w-full max-w-lg rounded-3xl bg-[#FFFDF1] p-6 text-[#1B211A]"
            style={{ boxShadow: "0 20px 60px rgba(0,0,0,.4)" }}
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="text-xl font-semibold">Edit Product</h3>
              <button type="button" onClick={() => setEditing(null)} aria-label="Close edit dialog">
                <X className="h-5 w-5 text-[#628141]" />
              </button>
            </div>
            <div className="space-y-4">
              <label className="block text-sm text-[#628141]">
                Product name
                <input
                  required
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#628141]/25 px-4 py-3"
                />
              </label>
              <label className="block text-sm text-[#628141]">
                Weight (kg)
                <input
                  required
                  type="number"
                  min="0.1"
                  step="any"
                  value={editWeight}
                  onChange={(event) => setEditWeight(event.target.value)}
                  className="mt-2 w-full rounded-xl border border-[#628141]/25 px-4 py-3"
                />
              </label>
              <label className="block text-sm text-[#628141]">
                Price for selected branch
                <input
                  required
                  type="number"
                  min="0"
                  step="1"
                  value={editPrice}
                  onChange={(event) => setEditPrice(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void saveEdit(event as unknown as React.FormEvent);
                    }
                  }}
                  className="mt-2 w-full rounded-xl border border-[#628141]/25 px-4 py-3"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                type="submit"
                disabled={saving === String(editing.id)}
                className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-5 py-3 font-semibold text-[#FFFDF1] disabled:opacity-50"
                style={{ boxShadow: buttonShadow }}
              >
                {saving === String(editing.id) ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
