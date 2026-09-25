import { Pencil, Plus, Save } from "lucide-react";
import { useState } from "react";
import type { CatalogPrice, ProductDTO } from "../../services/appService";

const buttonShadow = "0 4px 12px rgba(98,129,65,.3), inset 0 2px 6px rgba(255,255,255,.2)";
const subtleShadow = "inset 0 2px 6px rgba(98,129,65,.1)";

export function ProductCatalog({ prices, products, selectedBranchId, onSave, onAddProduct, onEditProduct }: { prices: CatalogPrice[]; products: ProductDTO[]; selectedBranchId: string; onSave: (branchId: number, productId: number, price: number) => Promise<void>; onAddProduct: () => void; onEditProduct: (product: ProductDTO) => void }) {
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [error, setError] = useState("");
  const branchId = Number(selectedBranchId);
  const branchPrices = new Map(prices.filter((row) => row.branchId === branchId).map((row) => [row.productId, row]));
  const save = async (product: ProductDTO) => {
    const key = String(product.id); const value = Number(edits[key] ?? branchPrices.get(product.id)?.price ?? 0);
    setSaving(key); setError("");
    try { await onSave(branchId, product.id, value); setEdits((current) => { const next = { ...current }; delete next[key]; return next; }); }
    catch (cause) { setError(cause instanceof Error ? cause.message : "Unable to save price."); }
    finally { setSaving(null); }
  };
  return <div className="rounded-3xl bg-[#FFFDF1] p-6" style={{ boxShadow: "0 8px 32px rgba(98,129,65,.15), inset 0 2px 8px rgba(255,255,255,.6)" }}>
    <div className="flex flex-wrap items-center justify-between gap-4 mb-5"><div><h3 className="text-xl text-[#1B211A]">Product Catalog</h3><p className="text-sm text-[#628141] mt-1">Manage product prices by branch.</p></div><button onClick={onAddProduct} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-5 py-2.5 text-sm font-semibold text-[#FFFDF1]" style={{ boxShadow: buttonShadow }}><Plus className="h-4 w-4" /> Add Product</button></div>
        {error && <p className="mb-4 rounded-xl bg-red-100/70 px-4 py-3 text-sm text-red-700">{error}</p>}
    {!products.length ? <p className="text-sm text-[#628141]">No products found.</p> : <div className="overflow-x-auto rounded-3xl bg-[#FFFDF1]" style={{ boxShadow: "0 8px 32px rgba(98,129,65,.15), inset 0 2px 8px rgba(255,255,255,.6), inset 0 -2px 8px rgba(98,129,65,.05)" }}><table className="w-full"><thead className="bg-gradient-to-r from-[#628141] to-[#8BAE66]"><tr><th className="px-6 py-4 text-left font-semibold text-[#FFFDF1]">Product</th><th className="px-6 py-4 text-left font-semibold text-[#FFFDF1]">Weight</th><th className="px-6 py-4 text-left font-semibold text-[#FFFDF1]">Branch price</th><th className="px-6 py-4 text-right font-semibold text-[#FFFDF1]">Actions</th></tr></thead><tbody>{products.map((product, index) => { const key = String(product.id); const current = branchPrices.get(product.id); return <tr key={product.id} className={`border-b border-[#8BAE66]/20 ${index % 2 === 0 ? "bg-[#FFFDF1]" : "bg-[#EBD5AB]/10"}`}><td className="rounded-l-xl px-6 py-4 font-medium text-[#1B211A]">{product.name}</td><td className="px-6 py-4 text-[#628141]">{product.weightKg} kg</td><td className="px-5 py-4"><input type="number" min="0" step="1" value={edits[key] ?? String(current?.price ?? "")} placeholder="Not set" onChange={event => setEdits(state => ({ ...state, [key]: event.target.value }))} className="w-32 rounded-xl border border-[#628141]/25 bg-[#FFFDF1] px-4 py-2.5 outline-none focus:ring-2 focus:ring-[#8BAE66]" style={{ boxShadow: subtleShadow }} /></td><td className="rounded-r-xl px-6 py-4"><div className="flex justify-end gap-3"><button onClick={() => onEditProduct(product)} className="inline-flex items-center gap-2 rounded-xl bg-[#EBD5AB]/35 px-4 py-2.5 text-sm font-semibold text-[#628141] transition hover:bg-[#EBD5AB]/55" style={{ boxShadow: buttonShadow }}><Pencil className="h-4 w-4" /> Edit</button><button onClick={() => void save(product)} disabled={!branchId || saving === key} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2.5 text-sm font-semibold text-[#FFFDF1] disabled:cursor-not-allowed disabled:opacity-50" style={{ boxShadow: buttonShadow }}><Save className="h-4 w-4" /> {saving === key ? "Saving..." : "Save Price"}</button></div></td></tr>; })}</tbody></table></div>}
  </div>;
}
