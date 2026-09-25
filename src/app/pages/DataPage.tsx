import { type FormEvent, useEffect, useMemo, useState } from "react";
import { DataControls } from "./Data/DataControls";
import { DataHeader } from "./Data/DataHeader";
import { DataTabs } from "./Data/DataTabs";
import { ExportReportModal } from "./Data/ExportReportModal";
import { InventorySection } from "./Data/InventorySection";
import { InventoryModal } from "./Data/InventoryModal";
import { ProductModal } from "./Data/ProductModal";
import { ProductCatalog } from "./Data/ProductCatalog";
import { TransactionsTable } from "./Data/TransactionsTable";
import type {
  BranchOption,
  InventoryItem,
  InventoryDeleteTarget,
  InventoryForm,
  InventoryRow,
  InventoryStatusTab,
  ProductColumn,
  ProductOption,
  ProductForm,
  ReportType,
  StatusTone,
  TransactionRecord,
} from "./Data/types";
import {
  appService,
  type BranchDTO,
  type ProductDTO,
  type TransactionDTO,
  type CatalogPrice,
} from "../services/appService";
import { useAuth } from "../utils/auth";

type FlowStatus = "None" | "Few" | "Plenty";
const MAX_FLOW_QTY = 40;

const branchFlowProfile: Record<string, FlowStatus> = {
  Bayan: "Plenty",
  Gulod: "None",
  Agoncillo: "Few",
  Caloocan: "Plenty",
  Cuenca: "Few",
  "Sta. Teresita": "None",
};

const getFlowRates = (flowStatus: FlowStatus) => {
  if (flowStatus === "None") return { outgoingRate: 0, returnRate: 0 };
  if (flowStatus === "Few") return { outgoingRate: 0.3, returnRate: 0.1 };
  return { outgoingRate: 0.8, returnRate: 0.8 };
};

const getFlowQuantities = (
  stock: number,
  branch: string,
  branchStockTotals: Record<string, number>,
) => {
  const branchStatus = branchFlowProfile[branch] ?? "Few";
  const { outgoingRate, returnRate } = getFlowRates(branchStatus);
  const branchStockTotal = branchStockTotals[branch] ?? 0;
  const outgoingTotal = Math.min(
    MAX_FLOW_QTY,
    Math.round(branchStockTotal * outgoingRate),
  );
  const returnedTotal = Math.min(
    outgoingTotal,
    Math.round(branchStockTotal * returnRate),
  );
  const share = branchStockTotal > 0 ? stock / branchStockTotal : 0;
  const outgoingQty = Math.floor(outgoingTotal * share);
  const returnedQty = Math.floor(returnedTotal * share);

  return {
    outgoingTotal,
    returnedTotal,
    outgoingQty,
    returnedQty,
    netDeliveredQty: Math.max(0, outgoingQty - returnedQty),
  };
};

const getStatusQuantity = (stock: number, _branch: string, activeStatus: InventoryStatusTab, _branchStockTotals: Record<string, number>) => activeStatus === "Stock" ? stock : 0;

const getInventoryStatusMeta = (total: number, activeStatus: InventoryStatusTab): { label: string; tone: StatusTone } => {
  if (activeStatus !== "Stock") return { label: "None", tone: "low" };
  if (total < 120) return { label: "Low", tone: "low" };
  if (total < 160) return { label: "Moderate", tone: "moderate" };
  return { label: "Plenty", tone: "high" };
};

const getStatusBadgeClass = (tone: StatusTone) => {
  if (tone === "low") return "bg-[#EBD5AB]/45 text-[#1B211A]";
  if (tone === "moderate") return "bg-[#8BAE66]/25 text-[#628141]";
  return "bg-[#628141] text-[#FFFDF1]";
};

const REPORT_MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const formatAmount = (amount: number) => `â‚±${amount.toLocaleString("en-PH")}`;
const toLocalDate = (value: string) => new Date(`${value}T00:00:00`);
const getMonthLabel = (date: Date) => REPORT_MONTHS[date.getMonth()] ?? "";
const EMPTY_INVENTORY_FORM: InventoryForm = {
  branchId: "",
  productId: "",
  quantity: "",
  reorderLevel: "1",
};
const EMPTY_PRODUCT_FORM: ProductForm = {
  name: "",
  weightKg: "",
};

const formatDisplayDate = (value: string) => {
  const date = toLocalDate(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

export function DataPage() {
  const { user } = useAuth();
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryColumns, setInventoryColumns] = useState<ProductColumn[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");
  const [branchOptions, setBranchOptions] = useState<BranchOption[]>([]);
  const [productOptions, setProductOptions] = useState<ProductOption[]>([]);
  const [catalogPrices, setCatalogPrices] = useState<CatalogPrice[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<ProductDTO[]>([]);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productForm, setProductForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [productMutationError, setProductMutationError] = useState("");
  const [isProductSaving, setIsProductSaving] = useState(false);
  const [inventoryModalOpen, setInventoryModalOpen] = useState(false);
  const [inventoryForm, setInventoryForm] =
    useState<InventoryForm>(EMPTY_INVENTORY_FORM);
  const [editingStockId, setEditingStockId] = useState<number | null>(null);
  const [inventoryMutationError, setInventoryMutationError] = useState("");
  const [isInventorySaving, setIsInventorySaving] = useState(false);
  const [isInventoryDeleting, setIsInventoryDeleting] = useState(false);
  const [inventoryDeleteTarget, setInventoryDeleteTarget] =
    useState<InventoryDeleteTarget | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [refreshTick, setRefreshTick] = useState(0);
  const [selectedBranchId, setSelectedBranchId] = useState("");
  const [transactionSearch, setTransactionSearch] = useState("");
  const [transactionType, setTransactionType] = useState("");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "transactions" | "catalog">(
    "inventory",
  );
  const [activeInventoryStatus, setActiveInventoryStatus] =
    useState<InventoryStatusTab>("Stock");
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>("weekly");
  const [reportYear, setReportYear] = useState(
    String(new Date().getFullYear()),
  );
  const [reportMonth, setReportMonth] = useState(
    REPORT_MONTHS[new Date().getMonth()] ?? "Jan",
  );
  const [reportWeek, setReportWeek] = useState("1");

  const loadInventory = async () => {
    setInventoryLoading(true);
    setInventoryError("");
    try {
      const rows = await appService.inventory.list();
      const mapped: InventoryItem[] = rows.map((row) => ({
        stockId: row.stockId,
        branchId: row.branchId,
        branchName: row.branchName || "Unknown",
        productId: row.productId,
        productName: row.productName || "Unknown",
        weightKg: row.weightKg,
        quantity: row.quantity,
        reorderLevel: row.reorderLevel,
      }));

      const columnMap = new Map<number, ProductColumn>();
      mapped.forEach((item) => {
        if (!columnMap.has(item.productId)) {
          columnMap.set(item.productId, {
            id: item.productId,
            label:
              item.weightKg !== null ? `${item.weightKg} kg` : item.productName,
            weight: item.weightKg,
          });
        }
      });

      const columns = Array.from(columnMap.values()).sort((a, b) => {
        const weightDelta = (a.weight ?? 0) - (b.weight ?? 0);
        if (weightDelta !== 0) return weightDelta;
        return a.label.localeCompare(b.label);
      });

      setInventoryItems(mapped);
      setInventoryColumns(columns);
    } catch (error) {
      setInventoryError(
        error instanceof Error ? error.message : "Unable to load inventory.",
      );
      setInventoryItems([]);
      setInventoryColumns([]);
    } finally {
      setInventoryLoading(false);
    }
  };

  const loadInventoryMetadata = async () => {
    try {
      const [branchData, productData] = await Promise.all([
        appService.branches.list(),
        appService.products.listActive(),
      ]);
      setBranchOptions(
        branchData.map((branch: BranchDTO) => ({
          id: branch.id,
          name: branch.name,
        })),
      );
      setProductOptions(
        productData.map((product: ProductDTO) => ({
          id: product.id,
          label: product.name,
          weight: product.weightKg,
        })),
      );
    } catch (error) {
      setInventoryError(
        error instanceof Error
          ? error.message
          : "Unable to load inventory options.",
      );
    }
  };

  useEffect(() => {
    void loadInventory();
  }, [refreshTick]);

  useEffect(() => {
    void loadInventoryMetadata();
  }, [refreshTick]);

  useEffect(() => {
    void Promise.all([appService.catalog.listPrices(), appService.products.listAll()]).then(([priceRows, productRows]) => { setCatalogPrices(priceRows); setCatalogProducts(productRows); }).catch(() => { setCatalogPrices([]); setCatalogProducts([]); });
  }, [refreshTick]);

  useEffect(() => {
    if (activeTab === "catalog" && branchOptions.length) {
      const bayan = branchOptions.find((branch) => branch.name.toLowerCase() === "bayan") ?? branchOptions[0];
      setSelectedBranchId(String(bayan.id));
    }
  }, [activeTab, branchOptions]);

  useEffect(() => {
    let interval: number | undefined;
    const start = () => {
      if (document.visibilityState === "visible" && interval === undefined) {
        interval = window.setInterval(() => setRefreshTick((value) => value + 1), 60_000);
      }
    };
    const stop = () => {
      if (interval !== undefined) { window.clearInterval(interval); interval = undefined; }
    };
    const onVisibilityChange = () => { if (document.visibilityState === "hidden") stop(); else start(); };
    start();
    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => { stop(); document.removeEventListener("visibilitychange", onVisibilityChange); };
  }, []);

  useEffect(() => {
    setUserRole(user?.role ?? null);
  }, [user]);

  useEffect(() => {
    const loadTransactions = async () => {
      setTransactionsLoading(true);
      setTransactionsError("");
      try {
        const rows = await appService.transactions.list();
        const mapped: TransactionRecord[] = rows.map((row: TransactionDTO) => ({
          salesId: row.salesId,
          trackingNo: row.trackingNo,
          guestName: row.guestName,
          branchName: row.branchName || "Unknown",
          subtotal: row.subtotal,
          total: row.total,
          transactionDate: row.transactionDate,
          transactionType: row.transactionType,
        }));
        setTransactions(mapped);
      } catch (error) {
        setTransactionsError(
          error instanceof Error ? error.message : "Unable to load transactions.",
        );
        setTransactions([]);
      } finally {
        setTransactionsLoading(false);
      }
    };

    void loadTransactions();
  }, [refreshTick]);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    transactions.forEach((txn) => {
      const date = toLocalDate(txn.transactionDate);
      if (!Number.isNaN(date.getTime())) {
        years.add(String(date.getFullYear()));
      }
    });
    return Array.from(years).sort();
  }, [transactions]);

  useEffect(() => {
    if (!availableYears.length) return;
    if (!availableYears.includes(reportYear)) {
      setReportYear(availableYears[0]);
    }
  }, [availableYears, reportYear]);

  const branchStockTotals = useMemo(
    () =>
      inventoryItems.reduce(
        (acc, item) => {
          acc[item.branchName] = (acc[item.branchName] ?? 0) + item.quantity;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [inventoryItems],
  );

  const inventoryRows = useMemo(() => {
    const rowMap = new Map<string, InventoryRow>();

    inventoryItems.forEach((item) => {
      if (selectedBranchId && item.branchId !== Number(selectedBranchId)) return;
      const existing = rowMap.get(item.branchName);
      const row =
        existing ??
        {
          branchId: item.branchId,
          branchName: item.branchName,
          quantities: {},
          outgoingTotal: 0,
          returnedTotal: 0,
        };

      const flowQuantities = getFlowQuantities(
        item.quantity,
        item.branchName,
        branchStockTotals,
      );

      row.quantities[item.productId] = getStatusQuantity(item.quantity, item.branchName, activeInventoryStatus, branchStockTotals);
      row.outgoingTotal += flowQuantities.outgoingQty;
      row.returnedTotal += flowQuantities.returnedQty;

      if (!existing) {
        rowMap.set(item.branchName, row);
      }
    });

    return Array.from(rowMap.values());
  }, [activeInventoryStatus, branchStockTotals, inventoryItems, selectedBranchId]);

  const closeInventoryModal = () => {
    setInventoryModalOpen(false);
    setEditingStockId(null);
    setInventoryForm(EMPTY_INVENTORY_FORM);
    setInventoryMutationError("");
    setIsInventorySaving(false);
    setIsInventoryDeleting(false);
  };

  const closeProductModal = () => {
    setProductModalOpen(false);
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductMutationError("");
    setIsProductSaving(false);
  };

  const openAddInventoryData = () => {
    setEditingStockId(null);
    setInventoryMutationError("");
    setInventoryForm({
      branchId: branchOptions[0] ? String(branchOptions[0].id) : "",
      productId: productOptions[0] ? String(productOptions[0].id) : "",
      quantity: "",
      reorderLevel: "1",
    });
    setInventoryModalOpen(true);
  };

  const openCreateProduct = () => {
    setProductMutationError("");
    setProductForm(EMPTY_PRODUCT_FORM);
    setProductModalOpen(true);
  };

  const openEditInventoryRow = (branchId: number) => {
    setEditingStockId(null);
    setInventoryMutationError("");
    setInventoryForm({
      branchId: String(branchId),
      productId: productOptions[0] ? String(productOptions[0].id) : "",
      quantity: "",
      reorderLevel: "1",
    });
    setInventoryModalOpen(true);
  };

  const editInventoryItem = (item: InventoryItem) => {
    setEditingStockId(item.stockId);
    setInventoryMutationError("");
    setInventoryForm({
      branchId: String(item.branchId),
      productId: String(item.productId),
      quantity: String(item.quantity),
      reorderLevel: String(item.reorderLevel),
    });
    setInventoryModalOpen(true);
  };

  const requestDeleteInventoryItem = (item: InventoryItem) => {
    setInventoryDeleteTarget({
      stockId: item.stockId,
      branchName: item.branchName,
      productName: item.productName,
    });
  };

  const handleInventorySubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsInventorySaving(true);
    setInventoryMutationError("");

    const branchId = Number(inventoryForm.branchId);
    const productId = Number(inventoryForm.productId);
    const quantity = Number(inventoryForm.quantity);
    const reorderLevel = Number(inventoryForm.reorderLevel);

    if (!branchId || !productId) {
      setInventoryMutationError("Select a branch and product.");
      setIsInventorySaving(false);
      return;
    }

    if (Number.isNaN(quantity) || Number.isNaN(reorderLevel)) {
      setInventoryMutationError("Quantity and reorder level must be numbers.");
      setIsInventorySaving(false);
      return;
    }

    const existingItem = inventoryItems.find(
      (item) => item.branchId === branchId && item.productId === productId,
    );
    const targetStockId = editingStockId ?? existingItem?.stockId;

    try {
      await appService.inventory.upsert({
        ...(targetStockId === undefined ? {} : { stockId: targetStockId }),
        branchId,
        productId,
        quantity,
        reorderLevel,
      });
      await loadInventory();
      setIsInventorySaving(false);
      closeInventoryModal();
    } catch (error) {
      setInventoryMutationError(
        error instanceof Error ? error.message : "Unable to save inventory.",
      );
      setIsInventorySaving(false);
    }
  };

  const confirmDeleteInventoryItem = async () => {
    if (!inventoryDeleteTarget) return;

    setIsInventoryDeleting(true);
    setInventoryMutationError("");

    try {
      await appService.inventory.delete(inventoryDeleteTarget.stockId);
      await loadInventory();
      setIsInventoryDeleting(false);
      setInventoryDeleteTarget(null);

      if (editingStockId === inventoryDeleteTarget.stockId) {
        closeInventoryModal();
      }
    } catch (error) {
      setInventoryMutationError(
        error instanceof Error ? error.message : "Unable to delete inventory.",
      );
      setIsInventoryDeleting(false);
    }
  };

  const handleInventoryFormChange = (
    field: keyof InventoryForm,
    value: string,
  ) => {
    setInventoryForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductFormChange = (
    field: keyof ProductForm,
    value: string,
  ) => {
    setProductForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleProductSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();
    setIsProductSaving(true);
    setProductMutationError("");

    const name = productForm.name.trim();
    const weightKg = Number.parseFloat(productForm.weightKg);

    if (!name) {
      setProductMutationError("Product name is required.");
      setIsProductSaving(false);
      return;
    }

    if (!Number.isFinite(weightKg) || weightKg <= 0) {
      setProductMutationError("Weight must be a positive decimal number.");
      setIsProductSaving(false);
      return;
    }

    try {
      await appService.products.create({ name, weightKg });
      await loadInventoryMetadata();
      await loadInventory();
      setIsProductSaving(false);
      closeProductModal();
    } catch (error) {
      setProductMutationError(
        error instanceof Error ? error.message : "Unable to create the product.",
      );
      setIsProductSaving(false);
    }
  };

  const generateWeeklyReport = () => {
    const week = Number(reportWeek);
    const startDay = (week - 1) * 7 + 1;
    const endDay = week === 5 ? 31 : week * 7;

    const filteredTransactions = transactions.filter((txn) => {
      const date = toLocalDate(txn.transactionDate);
      if (Number.isNaN(date.getTime())) return false;
      if (getMonthLabel(date) !== reportMonth) return false;
      if (String(date.getFullYear()) !== reportYear) return false;
      const day = date.getDate();
      return day >= startDay && day <= endDay;
    });

    if (!filteredTransactions.length) {
      return `WEEKLY REPORT\nPeriod: ${reportMonth} ${startDay}-${endDay}, ${reportYear}\n\nNo transactions found for the selected week.`;
    }

    const totalSales = filteredTransactions.reduce(
      (sum, txn) => sum + txn.total,
      0,
    );
    const byBranch = filteredTransactions.reduce(
      (acc, txn) => {
        acc[txn.branchName] = (acc[txn.branchName] ?? 0) + txn.total;
        return acc;
      },
      {} as Record<string, number>,
    );

    const branchSummary = Object.entries(byBranch)
      .map(([branch, value]) => `- ${branch}: ${formatAmount(value)}`)
      .join("\n");

    return `WEEKLY REPORT\nPeriod: ${reportMonth} ${startDay}-${endDay}, ${reportYear}\nTransactions: ${filteredTransactions.length}\nTotal Sales: ${formatAmount(totalSales)}\n\nBranch Breakdown:\n${branchSummary}`;
  };

  const generateMonthlyReport = () => {
    const filteredTransactions = transactions.filter((txn) => {
      const date = toLocalDate(txn.transactionDate);
      if (Number.isNaN(date.getTime())) return false;
      return (
        getMonthLabel(date) === reportMonth &&
        String(date.getFullYear()) === reportYear
      );
    });

    if (!filteredTransactions.length) {
      return `MONTHLY REPORT\nPeriod: ${reportMonth} ${reportYear}\n\nNo transactions found for the selected month.`;
    }

    const dailySales = filteredTransactions.reduce(
      (acc, txn) => {
        const key = txn.transactionDate;
        if (!acc[key]) {
          acc[key] = { sales: 0, transactions: 0 };
        }
        acc[key].sales += txn.total;
        acc[key].transactions += 1;
        return acc;
      },
      {} as Record<string, { sales: number; transactions: number }>,
    );

    const dailyEntries = Object.entries(dailySales).sort(
      ([a], [b]) =>
        toLocalDate(a).getDate() - toLocalDate(b).getDate(),
    );

    const dailySummary = dailyEntries
      .map(
        ([day, info]) =>
          `- ${day}: ${formatAmount(info.sales)} (${info.transactions} transactions)`,
      )
      .join("\n");

    const peakDay = dailyEntries.reduce((best, current) =>
      current[1].sales > best[1].sales ? current : best,
    );

    return `MONTHLY REPORT\nPeriod: ${reportMonth} ${reportYear}\n\nDaily Sales Summary:\n${dailySummary}\n\nBrief Explanation:\n- Sales peaked on ${peakDay[0]} at ${formatAmount(peakDay[1].sales)}.\n- This month highlights daily movement to support operational planning.`;
  };

  const generateAnnualReport = () => {
    const filteredTransactions = transactions.filter((txn) => {
      const date = toLocalDate(txn.transactionDate);
      if (Number.isNaN(date.getTime())) return false;
      return String(date.getFullYear()) === reportYear;
    });

    if (!filteredTransactions.length) {
      return `ANNUAL REPORT\nYear: ${reportYear}\n\nNo transactions found for the selected year.`;
    }

    const monthlySales = filteredTransactions.reduce(
      (acc, txn) => {
        const month = getMonthLabel(toLocalDate(txn.transactionDate));
        if (!acc[month]) {
          acc[month] = { sales: 0, transactions: 0 };
        }
        acc[month].sales += txn.total;
        acc[month].transactions += 1;
        return acc;
      },
      {} as Record<string, { sales: number; transactions: number }>,
    );

    const monthSummary = REPORT_MONTHS.filter((month) => monthlySales[month]).map(
      (month) =>
        `- ${month}: ${formatAmount(monthlySales[month].sales)} (${monthlySales[month].transactions} transactions)`,
    );

    const annualTotal = Object.values(monthlySales).reduce(
      (sum, month) => sum + month.sales,
      0,
    );

    return `ANNUAL REPORT\nYear: ${reportYear}\n\nMonthly Combined Summary:\n${monthSummary.join("\n")}\n\nAnnual Total Sales: ${formatAmount(annualTotal)}`;
  };

  const reportPreview =
    reportType === "weekly"
      ? generateWeeklyReport()
      : reportType === "monthly"
        ? generateMonthlyReport()
        : generateAnnualReport();

  const handleExportReport = () => {
    const blob = new Blob([reportPreview], {
      type: "text/plain;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${reportType}-report-${reportYear}-${reportMonth}.txt`;
    link.click();
    URL.revokeObjectURL(url);
    setIsExportModalOpen(false);
  };

  const handleCatalogProductEdit = async (product: ProductDTO) => {
    const name = window.prompt("Product name", product.name);
    if (name === null) return;
    const weight = Number(window.prompt("Weight in kg", String(product.weightKg)));
    if (!name.trim() || !Number.isFinite(weight) || weight <= 0) return;
    await appService.products.update(product.id, { name, weightKg: weight });
    setProductOptions((current) => current.map((item) => item.id === product.id ? { ...item, name: name.trim(), weightKg: weight } : item));
  };
  const handleCatalogProductArchive = async (product: ProductDTO) => {
    if (!window.confirm(`Archive ${product.name}?`)) return;
    await appService.products.delete(product.id);
    setProductOptions((current) => current.filter((item) => item.id !== product.id));
  };

  const handleCatalogPriceSave = async (branchId: number, productId: number, price: number) => {
    await appService.catalog.updatePrice(branchId, productId, price);
    setCatalogPrices((current) => current.map((row) => row.branchId === branchId && row.productId === productId ? { ...row, price } : row));
  };

  const visibleTransactions = transactions.filter((transaction) => {
    const branchMatches = !selectedBranchId || branchOptions.find((option) => option.name === transaction.branchName)?.id === Number(selectedBranchId);
    const query = transactionSearch.trim().toLowerCase();
    const searchMatches = !query || [transaction.guestName, transaction.trackingNo ?? "", transaction.branchName, transaction.transactionType].some((value) => value.toLowerCase().includes(query));
    const typeMatches = !transactionType || transaction.transactionType === transactionType;
    return branchMatches && searchMatches && typeMatches;
  });

  return (
    <div className="space-y-8">
      <DataHeader />
      <DataTabs activeTab={activeTab} onChange={setActiveTab} />
      <DataControls
        onOpenExport={() => setIsExportModalOpen(true)}
        branchOptions={branchOptions}
        selectedBranchId={selectedBranchId}
        showBranchFilter={activeTab === "catalog"}
        onBranchChange={setSelectedBranchId}
        showTransactionSearch={activeTab === "transactions"}
        searchTerm={transactionSearch}
        onSearchTermChange={setTransactionSearch}
        transactionType={transactionType}
        onTransactionTypeChange={setTransactionType}
        onRefresh={() => setRefreshTick((value) => value + 1)}
      />
      {activeTab === "inventory" ? (
        <InventorySection
          inventoryColumns={inventoryColumns}
          inventoryRows={inventoryRows}
          inventoryLoading={inventoryLoading}
          inventoryError={inventoryError}
          activeStatus={activeInventoryStatus}
          onStatusChange={setActiveInventoryStatus}
          onAddInventoryData={openAddInventoryData}
          onCreateProduct={openCreateProduct}
          onEditInventoryRow={openEditInventoryRow}
          getInventoryStatusMeta={getInventoryStatusMeta}
          getStatusBadgeClass={getStatusBadgeClass}
        />
      ) : activeTab === "transactions" ? (
        <TransactionsTable
          transactions={visibleTransactions}
          loading={transactionsLoading}
          error={transactionsError}
          formatAmount={formatAmount}
          formatDisplayDate={formatDisplayDate}
        />
      ) : (
        <ProductCatalog
          prices={catalogPrices}
          products={catalogProducts}
          selectedBranchId={selectedBranchId}
          onSave={handleCatalogPriceSave}
          onAddProduct={openCreateProduct}
          onEditProduct={(product) => void handleCatalogProductEdit(product)}
        />
      )}

      <ExportReportModal
        open={isExportModalOpen}
        reportType={reportType}
        reportYear={reportYear}
        reportMonth={reportMonth}
        reportWeek={reportWeek}
        availableYears={availableYears}
        months={REPORT_MONTHS}
        reportPreview={reportPreview}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExportReport}
        onReportTypeChange={setReportType}
        onReportYearChange={setReportYear}
        onReportMonthChange={setReportMonth}
        onReportWeekChange={setReportWeek}
      />
      <InventoryModal
        open={inventoryModalOpen}
        branches={branchOptions}
        products={productOptions}
        inventoryItems={inventoryItems}
        form={inventoryForm}
        editingStockId={editingStockId}
        error={inventoryMutationError}
        isSaving={isInventorySaving}
        isDeleting={isInventoryDeleting}
        onClose={closeInventoryModal}
        onSubmit={handleInventorySubmit}
        onFieldChange={handleInventoryFormChange}
        onEditItem={editInventoryItem}
        onDeleteItem={requestDeleteInventoryItem}
      />
      <ProductModal
        open={productModalOpen}
        form={productForm}
        error={productMutationError}
        isSaving={isProductSaving}
        onClose={closeProductModal}
        onSubmit={handleProductSubmit}
        onFieldChange={handleProductFormChange}
      />
      {inventoryDeleteTarget && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#1B211A]/50 p-4">
          <div
            className="w-full max-w-md rounded-3xl bg-[#FFFDF1] p-6"
            style={{
              boxShadow:
                "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 -2px 8px rgba(98, 129, 65, 0.1)",
            }}
          >
            <div className="mb-6 space-y-2">
              <h3 className="text-[#1B211A]">Confirm deletion</h3>
              <p className="text-sm text-[#628141]">
                Delete {inventoryDeleteTarget.productName} from{" "}
                {inventoryDeleteTarget.branchName}? This cannot be undone.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setInventoryDeleteTarget(null)}
                disabled={isInventoryDeleting}
                className="rounded-xl bg-[#8BAE66]/20 px-4 py-2 text-[#628141]"
                style={{
                  boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDeleteInventoryItem}
                disabled={isInventoryDeleting}
                className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
                style={{
                  boxShadow:
                    "0 4px 12px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }}
              >
                {isInventoryDeleting ? "Deleting..." : "Delete Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataPage;
