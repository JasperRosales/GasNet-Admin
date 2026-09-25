import { type FormEvent, useCallback, useMemo, useState } from "react";
import { appService } from "../../services/appService";
import type { BranchOption, InventoryDeleteTarget, InventoryForm, InventoryItem, InventoryStatusTab, ProductForm, ProductOption } from "./types";
import { buildInventoryRows } from "./dataUtils";

const EMPTY_INVENTORY_FORM: InventoryForm = { branchId: "", productId: "", quantity: "", reorderLevel: "1" };
const EMPTY_PRODUCT_FORM: ProductForm = { name: "", weightKg: "" };

export function useInventoryControls(items: InventoryItem[], branches: BranchOption[], products: ProductOption[], reload: () => Promise<void>) {
  const [status, setStatus] = useState<InventoryStatusTab>("Stock");
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [inventoryOpen, setInventoryOpen] = useState(false);
  const [form, setForm] = useState<InventoryForm>(EMPTY_INVENTORY_FORM);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [inventoryError, setInventoryError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<InventoryDeleteTarget | null>(null);
  const [productOpen, setProductOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [productError, setProductError] = useState("");
  const [productSaving, setProductSaving] = useState(false);

  const closeInventory = () => { setInventoryOpen(false); setEditingStockId(null); setForm(EMPTY_INVENTORY_FORM); setInventoryError(""); setSaving(false); setDeleting(false); };
  const closeProduct = () => { setProductOpen(false); setProductForm(EMPTY_PRODUCT_FORM); setProductError(""); setProductSaving(false); };
  const addInventory = () => { setEditingStockId(null); setInventoryError(""); setForm({ branchId: branches[0] ? String(branches[0].id) : "", productId: products[0] ? String(products[0].id) : "", quantity: "", reorderLevel: "1" }); setInventoryOpen(true); };
  const addBranchInventory = (branchId: number) => { setEditingStockId(null); setInventoryError(""); setForm({ branchId: String(branchId), productId: products[0] ? String(products[0].id) : "", quantity: "", reorderLevel: "1" }); setInventoryOpen(true); };
  const editItem = (item: InventoryItem) => { setEditingStockId(item.stockId); setInventoryError(""); setForm({ branchId: String(item.branchId), productId: String(item.productId), quantity: String(item.quantity), reorderLevel: String(item.reorderLevel) }); setInventoryOpen(true); };
  const changeForm = (field: keyof InventoryForm, value: string) => setForm((prev) => ({ ...prev, [field]: value }));
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setSaving(true); setInventoryError("");
    const branchId = Number(form.branchId), productId = Number(form.productId), quantity = Number(form.quantity), reorderLevel = Number(form.reorderLevel);
    if (!branchId || !productId) { setInventoryError("Select a branch and product."); setSaving(false); return; }
    if (Number.isNaN(quantity) || Number.isNaN(reorderLevel)) { setInventoryError("Quantity and reorder level must be numbers."); setSaving(false); return; }
    const stockId = editingStockId ?? items.find((item) => item.branchId === branchId && item.productId === productId)?.stockId;
    try { await appService.inventory.upsert({ ...(stockId === undefined ? {} : { stockId }), branchId, productId, quantity, reorderLevel }); await reload(); setSaving(false); closeInventory(); }
    catch (error) { setInventoryError(error instanceof Error ? error.message : "Unable to save inventory."); setSaving(false); }
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return; setDeleting(true); setInventoryError("");
    try { await appService.inventory.delete(deleteTarget.stockId); await reload(); setDeleting(false); setDeleteTarget(null); if (editingStockId === deleteTarget.stockId) closeInventory(); }
    catch (error) { setInventoryError(error instanceof Error ? error.message : "Unable to delete inventory."); setDeleting(false); }
  };
  const createProduct = () => { setProductError(""); setProductForm(EMPTY_PRODUCT_FORM); setProductOpen(true); };
  const changeProduct = (field: keyof ProductForm, value: string) => setProductForm((prev) => ({ ...prev, [field]: value }));
  const submitProduct = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setProductSaving(true); setProductError(""); const name = productForm.name.trim(), weightKg = Number.parseFloat(productForm.weightKg);
    if (!name) { setProductError("Product name is required."); setProductSaving(false); return; }
    if (!Number.isFinite(weightKg) || weightKg <= 0) { setProductError("Weight must be a positive decimal number."); setProductSaving(false); return; }
    try { await appService.products.create({ name, weightKg }); await reload(); setProductSaving(false); closeProduct(); }
    catch (error) { setProductError(error instanceof Error ? error.message : "Unable to create the product."); setProductSaving(false); }
  };
  const rows = useMemo(() => buildInventoryRows(items, selectedBranchId, status), [items, selectedBranchId, status]);
  return { status, setStatus, selectedBranchId, setSelectedBranchId, rows, inventoryOpen, form, editingStockId, inventoryError, saving, deleting, deleteTarget, setDeleteTarget, addInventory, addBranchInventory, editItem, requestDelete: (item: InventoryItem) => setDeleteTarget({ stockId: item.stockId, branchName: item.branchName, productName: item.productName }), closeInventory, submit, changeForm, confirmDelete, productOpen, productForm, productError, productSaving, createProduct, closeProduct, submitProduct, changeProduct };
}
