import { useCallback, useEffect, useState } from "react";
import { appService, type ProductDTO } from "../services/appService";
import { DataControls } from "./Data/DataControls";
import { DataHeader } from "./Data/DataHeader";
import { DataTabs } from "./Data/DataTabs";
import { ExportReportModal } from "./Data/ExportReportModal";
import { InventoryDeleteModal } from "./Data/InventoryDeleteModal";
import { InventoryModal } from "./Data/InventoryModal";
import { InventorySection } from "./Data/InventorySection";
import { ProductCatalog } from "./Data/ProductCatalog";
import { ProductModal } from "./Data/ProductModal";
import { TransactionsTable } from "./Data/TransactionsTable";
import { filterTransactions, formatAmount, formatDisplayDate, getInventoryStatusMeta, getStatusBadgeClass, REPORT_MONTHS } from "./Data/dataUtils";
import { useDataLoader } from "./Data/useDataLoader";
import { useInventoryControls } from "./Data/useInventoryControls";
import { useReportExport } from "./Data/useReportExport";

export function DataPage() {
  const [refreshTick, setRefreshTick] = useState(0);
  const [activeTab, setActiveTab] = useState<"inventory" | "transactions" | "catalog">("inventory");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const data = useDataLoader(refreshTick);
  const reloadInventory = useCallback(async () => { await data.loadInventoryMetadata(); await data.loadInventory(); }, [data.loadInventory, data.loadInventoryMetadata]);
  const inventory = useInventoryControls(data.inventoryItems, data.branchOptions, data.productOptions, reloadInventory);
  const report = useReportExport(data.transactions);

  useEffect(() => {
    if (activeTab === "catalog" && data.branchOptions.length) {
      const bayan = data.branchOptions.find((branch) => branch.name.toLowerCase() === "bayan") ?? data.branchOptions[0];
      inventory.setSelectedBranchId(String(bayan.id));
    }
  }, [activeTab, data.branchOptions]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let interval: number | undefined;
    const start = () => { if (document.visibilityState === "visible" && interval === undefined) interval = window.setInterval(() => setRefreshTick((value) => value + 1), 60_000); };
    const stop = () => { if (interval !== undefined) { window.clearInterval(interval); interval = undefined; } };
    const onVisibilityChange = () => { if (document.visibilityState === "hidden") stop(); else start(); };
    start(); document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibilityChange); };
  }, []);

  const visibleTransactions = filterTransactions(data.transactions, data.branchOptions, inventory.selectedBranchId, transactionSearch, transactionType);
  const editCatalogProduct = async (product: ProductDTO) => {
    const name = window.prompt("Product name", product.name); if (name === null) return;
    const weight = Number(window.prompt("Weight in kg", String(product.weightKg)));
    if (!name.trim() || !Number.isFinite(weight) || weight <= 0) return;
    await appService.products.update(product.id, { name, weightKg: weight });
    data.setProductOptions((current) => current.map((item) => item.id === product.id ? { ...item, label: name.trim(), weight } : item));
  };
  const saveCatalogProduct = async (product: ProductDTO, name: string, weightKg: number, price: number) => {
    await appService.products.update(product.id, { name, weightKg });
    await appService.catalog.updatePrice(Number(inventory.selectedBranchId), product.id, price);
    data.setCatalogProducts((current) => current.map((item) => item.id === product.id ? { ...item, name, weightKg } : item));
    data.setCatalogPrices((current) => [...current.filter((item) => !(item.branchId === Number(inventory.selectedBranchId) && item.productId === product.id)), { branchId: Number(inventory.selectedBranchId), branchName: data.branchOptions.find((branch) => branch.id === Number(inventory.selectedBranchId))?.name ?? "", productId: product.id, productName: name, price }]);
  };
  const saveCatalogPrice = async (branchId: number, productId: number, price: number) => { await appService.catalog.updatePrice(branchId, productId, price); data.setCatalogPrices((current) => current.map((row) => row.branchId === branchId && row.productId === productId ? { ...row, price } : row)); };

  return <div className="space-y-8">
    <DataHeader /><DataTabs activeTab={activeTab} onChange={setActiveTab} />
    <DataControls onOpenExport={() => report.setOpen(true)} branchOptions={data.branchOptions} selectedBranchId={inventory.selectedBranchId} showBranchFilter={activeTab === "catalog"} onBranchChange={inventory.setSelectedBranchId} showTransactionSearch={activeTab === "transactions"} searchTerm={transactionSearch} onSearchTermChange={setTransactionSearch} transactionType={transactionType} onTransactionTypeChange={setTransactionType} onRefresh={() => setRefreshTick((value) => value + 1)} />
    {activeTab === "inventory" ? <InventorySection inventoryColumns={data.inventoryColumns} inventoryRows={inventory.rows} inventoryLoading={data.inventoryLoading} inventoryError={data.inventoryError} activeStatus={inventory.status} onStatusChange={inventory.setStatus} onAddInventoryData={inventory.addInventory} onCreateProduct={inventory.createProduct} onEditInventoryRow={inventory.addBranchInventory} getInventoryStatusMeta={getInventoryStatusMeta} getStatusBadgeClass={getStatusBadgeClass} />
      : activeTab === "transactions" ? <TransactionsTable transactions={visibleTransactions} loading={data.transactionsLoading} error={data.transactionsError} formatAmount={formatAmount} formatDisplayDate={formatDisplayDate} />
      : <ProductCatalog prices={data.catalogPrices} products={data.catalogProducts} selectedBranchId={inventory.selectedBranchId} onSave={saveCatalogPrice} onAddProduct={inventory.createProduct} onEditProduct={(product) => void editCatalogProduct(product)} onSaveProduct={saveCatalogProduct} />}
    <ExportReportModal open={report.open} reportType={report.type} reportYear={report.year} reportMonth={report.month} reportWeek={report.week} availableYears={report.years} months={REPORT_MONTHS} reportPreview={report.preview} onClose={() => report.setOpen(false)} onExport={report.exportReport} onReportTypeChange={report.setType} onReportYearChange={report.setYear} onReportMonthChange={report.setMonth} onReportWeekChange={report.setWeek} />
    <InventoryModal open={inventory.inventoryOpen} branches={data.branchOptions} products={data.productOptions} inventoryItems={data.inventoryItems} form={inventory.form} editingStockId={inventory.editingStockId} error={inventory.inventoryError} isSaving={inventory.saving} isDeleting={inventory.deleting} onClose={inventory.closeInventory} onSubmit={inventory.submit} onFieldChange={inventory.changeForm} onEditItem={inventory.editItem} onDeleteItem={inventory.requestDelete} />
    <ProductModal open={inventory.productOpen} form={inventory.productForm} error={inventory.productError} isSaving={inventory.productSaving} onClose={inventory.closeProduct} onSubmit={inventory.submitProduct} onFieldChange={inventory.changeProduct} />
    {inventory.deleteTarget && <InventoryDeleteModal target={inventory.deleteTarget} deleting={inventory.deleting} onClose={() => inventory.setDeleteTarget(null)} onConfirm={inventory.confirmDelete} />}
  </div>;
}

export default DataPage;
