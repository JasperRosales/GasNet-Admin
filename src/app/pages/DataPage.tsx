import { Search, Filter, Download, RefreshCw, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../utils/supabase";

interface InventoryItem {
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  weightKg: number | null;
  quantity: number;
}

interface ProductColumn {
  id: number;
  label: string;
  weight: number | null;
}

interface TransactionRecord {
  salesId: number;
  trackingNo: string | null;
  guestName: string;
  branchName: string;
  subtotal: number;
  total: number;
  transactionDate: string;
  transactionType: string;
}

type InventoryStatusTab = "Stock" | "Delivered" | "Returned";
type StatusTone = "low" | "moderate" | "high";
type FlowStatus = "None" | "Few" | "Plenty";
type ReportType = "weekly" | "monthly" | "annual";
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

const getStatusQuantity = (
  stock: number,
  branch: string,
  activeStatus: InventoryStatusTab,
  branchStockTotals: Record<string, number>,
) => {
  if (activeStatus === "Delivered" || activeStatus === "Returned") {
    const { netDeliveredQty, returnedQty } = getFlowQuantities(
      stock,
      branch,
      branchStockTotals,
    );

    if (activeStatus === "Returned") return returnedQty;
    return netDeliveredQty;
  }

  return stock;
};

const getInventoryStatusMeta = (
  total: number,
  activeStatus: InventoryStatusTab,
  outgoingTotal = 0,
  returnedTotal = 0,
): { label: string; tone: StatusTone } => {
  if (activeStatus === "Stock") {
    if (total < 120) return { label: "Low", tone: "low" };
    if (total < 160) return { label: "Moderate", tone: "moderate" };
    return { label: "Plenty", tone: "high" };
  }

  if (activeStatus === "Returned") {
    if (returnedTotal === 0) return { label: "None", tone: "low" };
    if (outgoingTotal > 0 && returnedTotal >= outgoingTotal) {
      return { label: "Recovered", tone: "high" };
    }
    return { label: "Partial", tone: "moderate" };
  }

  if (total === 0) return { label: "None", tone: "low" };
  if (total < 20) return { label: "Few", tone: "moderate" };
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

const formatAmount = (amount: number) => `₱${amount.toLocaleString("en-PH")}`;
const toLocalDate = (value: string) => new Date(`${value}T00:00:00`);
const getMonthLabel = (date: Date) => REPORT_MONTHS[date.getMonth()] ?? "";
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
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [inventoryColumns, setInventoryColumns] = useState<ProductColumn[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState("");
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [transactionsLoading, setTransactionsLoading] = useState(true);
  const [transactionsError, setTransactionsError] = useState("");
  const [activeTab, setActiveTab] = useState<"inventory" | "transactions">(
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

  useEffect(() => {
    const loadInventory = async () => {
      setInventoryLoading(true);
      setInventoryError("");
      const { data, error } = await supabase
        .from("branch_stock")
        .select(
          "quantity, branch:branches(branch_id, branch_name), product:products(product_id, product_name, weight_kg)",
        );

      if (error) {
        setInventoryError(error.message);
        setInventoryItems([]);
        setInventoryColumns([]);
        setInventoryLoading(false);
        return;
      }

      const mapped =
        (data ?? [])
          .map((row) => {
            const branch = row.branch;
            const product = row.product;
            if (!branch || !product) return null;
            return {
              branchId: branch.branch_id,
              branchName: branch.branch_name,
              productId: product.product_id,
              productName: product.product_name,
              weightKg: product.weight_kg,
              quantity: row.quantity,
            };
          })
          .filter((item): item is InventoryItem => Boolean(item)) ?? [];

      const columnMap = new Map<number, ProductColumn>();
      mapped.forEach((item) => {
        if (!columnMap.has(item.productId)) {
          columnMap.set(item.productId, {
            id: item.productId,
            label: item.productName,
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
      setInventoryLoading(false);
    };

    loadInventory();
  }, []);

  useEffect(() => {
    const loadTransactions = async () => {
      setTransactionsLoading(true);
      setTransactionsError("");
      const { data, error } = await supabase
        .from("sales_transactions")
        .select(
          "sales_id, tracking_no, guest_name, subtotal, total, transaction_date, transaction_type, branch:branches(branch_name)",
        )
        .order("transaction_date", { ascending: false })
        .order("sales_id", { ascending: false });

      if (error) {
        setTransactionsError(error.message);
        setTransactions([]);
        setTransactionsLoading(false);
        return;
      }

      const mapped =
        data?.map((row) => ({
          salesId: row.sales_id,
          trackingNo: row.tracking_no,
          guestName: row.guest_name,
          branchName: row.branch?.branch_name ?? "Unknown",
          subtotal: row.subtotal,
          total: row.total,
          transactionDate: row.transaction_date,
          transactionType: row.transaction_type,
        })) ?? [];

      setTransactions(mapped);
      setTransactionsLoading(false);
    };

    loadTransactions();
  }, []);

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
    const rowMap = new Map<
      string,
      {
        branchId: number;
        branchName: string;
        quantities: Record<number, number>;
        outgoingTotal: number;
        returnedTotal: number;
      }
    >();

    inventoryItems.forEach((item) => {
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

      row.quantities[item.productId] = getStatusQuantity(
        item.quantity,
        item.branchName,
        activeInventoryStatus,
        branchStockTotals,
      );
      row.outgoingTotal += flowQuantities.outgoingQty;
      row.returnedTotal += flowQuantities.returnedQty;

      if (!existing) {
        rowMap.set(item.branchName, row);
      }
    });

    return Array.from(rowMap.values());
  }, [activeInventoryStatus, branchStockTotals, inventoryItems]);

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-[#1B211A] mb-2">Distribution Management</h1>
        <p className="text-[#628141]">
          Access and manage all your LPG trading data
        </p>
      </div>

      {/* Tab Switcher */}
      <div
        className="inline-flex p-2 rounded-3xl bg-[#FFFDF1]"
        style={{
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-6 py-3 rounded-2xl transition-all ${
            activeTab === "inventory"
              ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
              : "text-[#628141]"
          }`}
          style={
            activeTab === "inventory"
              ? {
                  boxShadow:
                    "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }
              : {}
          }
        >
          Inventory Data
        </button>
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-6 py-3 rounded-2xl transition-all ${
            activeTab === "transactions"
              ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
              : "text-[#628141]"
          }`}
          style={
            activeTab === "transactions"
              ? {
                  boxShadow:
                    "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                }
              : {}
          }
        >
          Transaction History
        </button>
      </div>

      {/* Controls */}
      <div
        className="p-4 rounded-3xl bg-[#FFFDF1] flex flex-wrap gap-4 items-center justify-between"
        style={{
          boxShadow:
            "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
        }}
      >
        <div className="flex gap-3 flex-1">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-2xl flex-1 max-w-md"
            style={{
              background: "rgba(235, 213, 171, 0.3)",
              boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
            }}
          >
            <Search className="w-5 h-5 text-[#628141]" />
            <input
              type="text"
              placeholder="Search data..."
              className="flex-1 bg-transparent border-none outline-none text-[#1B211A] placeholder:text-[#628141]/50"
            />
          </div>
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Search className="w-5 h-5" />
            Search
          </button>
          <button
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Filter className="w-5 h-5" />
            Branch
          </button>
           <button
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Filter className="w-5 h-5" />
            Sort
          </button>
         
        </div>
        <div className="flex gap-3">
          <button
            className="px-4 py-2 rounded-2xl bg-[#8BAE66]/20 text-[#628141] flex items-center gap-2"
            style={{
              boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
            }}
          >
            <RefreshCw className="w-5 h-5" />
            Refresh
          </button>
          <button
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1] flex items-center gap-2"
            style={{
              boxShadow:
                "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
            }}
          >
            <Download className="w-5 h-5" />
            Export
          </button>
        </div>
      </div>

      {/* Data Table */}
      {activeTab === "inventory" ? (
        <div className="space-y-4">
          <div
            className="inline-flex p-2 rounded-3xl bg-[#FFFDF1]"
            style={{
              boxShadow:
                "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
            }}
          >
            {(["Stock", "Delivered", "Returned"] as const).map((statusTab) => (
              <button
                key={statusTab}
                onClick={() => setActiveInventoryStatus(statusTab)}
                className={`px-6 py-2 rounded-2xl transition-all ${
                  activeInventoryStatus === statusTab
                    ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                    : "text-[#628141]"
                }`}
                style={
                  activeInventoryStatus === statusTab
                    ? {
                        boxShadow:
                          "0 4px 16px rgba(98, 129, 65, 0.3), inset 0 2px 6px rgba(255, 255, 255, 0.2)",
                      }
                    : {}
                }
              >
                {statusTab}
              </button>
            ))}
          </div>
          <div
            className="rounded-3xl bg-[#FFFDF1] overflow-hidden"
            style={{
              boxShadow:
                "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
            }}
          >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#628141] to-[#8BAE66]">
                <tr>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">ID</th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">Branch</th>
                  {inventoryColumns.map((column) => (
                    <th
                      key={column.id}
                      className="px-6 py-4 text-left text-[#FFFDF1]"
                    >
                      {column.label}
                    </th>
                  ))}
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">Total</th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">Status</th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">
                    Last Update
                  </th>
                </tr>
              </thead>
              <tbody>
                {inventoryLoading ? (
                  <tr>
                    <td
                      colSpan={inventoryColumns.length + 5}
                      className="px-6 py-6 text-center text-sm text-[#628141]"
                    >
                      Loading inventory...
                    </td>
                  </tr>
                ) : inventoryError ? (
                  <tr>
                    <td
                      colSpan={inventoryColumns.length + 5}
                      className="px-6 py-6 text-center text-sm text-red-600"
                    >
                      {inventoryError}
                    </td>
                  </tr>
                ) : inventoryRows.length ? (
                  inventoryRows.map((row, index) => {
                    const total = inventoryColumns.reduce(
                      (sum, column) => sum + (row.quantities[column.id] ?? 0),
                      0,
                    );

                    const statusMeta = getInventoryStatusMeta(
                      total,
                      activeInventoryStatus,
                      row.outgoingTotal,
                      row.returnedTotal,
                    );

                    return (
                      <tr
                        key={row.branchName}
                        className={`border-b border-[#8BAE66]/20 ${
                          index % 2 === 0 ? "bg-[#FFFDF1]" : "bg-[#EBD5AB]/10"
                        }`}
                      >
                        <td className="px-6 py-4 text-[#1B211A]">
                          {row.branchId}
                        </td>
                        <td className="px-6 py-4 text-[#628141]">
                          {row.branchName}
                        </td>
                        {inventoryColumns.map((column) => (
                          <td key={column.id} className="px-6 py-4">
                            {row.quantities[column.id] ?? 0}
                          </td>
                        ))}
                        <td className="px-6 py-4">{total}</td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm ${getStatusBadgeClass(statusMeta.tone)}`}
                          >
                            {statusMeta.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-[#628141] text-sm">
                          —
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={inventoryColumns.length + 5}
                      className="px-6 py-6 text-center text-sm text-[#628141]"
                    >
                      No inventory data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        </div>
      ) : (
        <div
          className="rounded-3xl bg-[#FFFDF1] overflow-hidden"
          style={{
            boxShadow:
              "0 8px 32px rgba(98, 129, 65, 0.15), inset 0 2px 8px rgba(255, 255, 255, 0.6), inset 0 -2px 8px rgba(98, 129, 65, 0.05)",
          }}
        >
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-[#628141] to-[#8BAE66]">
                <tr>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">
                    ID
                  </th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">
                    Tracking No
                  </th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">Branch</th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">
                    Subtotal
                  </th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">Total</th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">Date</th>
                  <th className="px-6 py-4 text-left text-[#FFFDF1]">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactionsLoading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-6 text-center text-sm text-[#628141]"
                    >
                      Loading transactions...
                    </td>
                  </tr>
                ) : transactionsError ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-6 text-center text-sm text-red-600"
                    >
                      {transactionsError}
                    </td>
                  </tr>
                ) : (
                  transactions.map((txn, index) => (
                    <tr
                      key={txn.salesId}
                      className={`border-b border-[#8BAE66]/20 ${index % 2 === 0 ? "bg-[#FFFDF1]" : "bg-[#EBD5AB]/10"}`}
                    >
                      <td className="px-6 py-4 text-[#1B211A]">
                        {txn.salesId}
                      </td>
                      <td className="px-6 py-4 text-[#628141]">
                        {txn.trackingNo ?? "—"}
                      </td>
                      <td className="px-6 py-4 text-[#628141]">
                        {txn.guestName}
                      </td>
                      <td className="px-6 py-4 text-[#628141]">
                        {txn.branchName}
                      </td>
                      <td className="px-6 py-4 text-[#1B211A]">
                        {formatAmount(txn.subtotal)}
                      </td>
                      <td className="px-6 py-4 text-[#1B211A]">
                        {formatAmount(txn.total)}
                      </td>
                      <td className="px-6 py-4 text-[#628141] text-sm">
                        {formatDisplayDate(txn.transactionDate)}
                      </td>
                      <td className="px-6 py-4">
                        <span className="px-3 py-1 rounded-full text-sm bg-[#8BAE66]/20 text-[#628141]">
                          {txn.transactionType}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#1B211A]/40 p-4">
          <div
            className="w-full max-w-3xl rounded-3xl bg-[#FFFDF1] p-6"
            style={{
              boxShadow:
                "0 12px 48px rgba(27, 33, 26, 0.3), inset 0 2px 8px rgba(255, 255, 255, 0.8), inset 0 -2px 8px rgba(98, 129, 65, 0.1)",
            }}
          >
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-[#1B211A]">Export Distribution Report</h3>
                <p className="text-sm text-[#628141]">
                  Configure weekly, monthly, or annual report export.
                </p>
              </div>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-xl p-2 text-[#628141] hover:bg-[#EBD5AB]/30"
                title="Close"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <button
                onClick={() => setReportType("weekly")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  reportType === "weekly"
                    ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                    : "bg-[#8BAE66]/20 text-[#628141]"
                }`}
              >
                Weekly Report
              </button>
              <button
                onClick={() => setReportType("monthly")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  reportType === "monthly"
                    ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                    : "bg-[#8BAE66]/20 text-[#628141]"
                }`}
              >
                Monthly Report
              </button>
              <button
                onClick={() => setReportType("annual")}
                className={`rounded-xl px-4 py-2 text-sm ${
                  reportType === "annual"
                    ? "bg-gradient-to-r from-[#628141] to-[#8BAE66] text-[#FFFDF1]"
                    : "bg-[#8BAE66]/20 text-[#628141]"
                }`}
              >
                Annual Report
              </button>
            </div>

            <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <select
                value={reportYear}
                onChange={(event) => setReportYear(event.target.value)}
                className="rounded-xl bg-[#EBD5AB]/20 px-3 py-2 text-[#1B211A] outline-none"
              >
                {(availableYears.length ? availableYears : ["2026"]).map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>

              {(reportType === "weekly" || reportType === "monthly") && (
                <select
                  value={reportMonth}
                  onChange={(event) => setReportMonth(event.target.value)}
                  className="rounded-xl bg-[#EBD5AB]/20 px-3 py-2 text-[#1B211A] outline-none"
                >
                  {REPORT_MONTHS.map((month) => (
                    <option key={month} value={month}>
                      {month}
                    </option>
                  ))}
                </select>
              )}

              {reportType === "weekly" && (
                <select
                  value={reportWeek}
                  onChange={(event) => setReportWeek(event.target.value)}
                  className="rounded-xl bg-[#EBD5AB]/20 px-3 py-2 text-[#1B211A] outline-none"
                >
                  {[1, 2, 3, 4, 5].map((week) => (
                    <option key={week} value={String(week)}>
                      Week {week}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div
              className="mb-4 rounded-2xl bg-[#EBD5AB]/15 p-4"
              style={{
                boxShadow: "inset 0 2px 6px rgba(98, 129, 65, 0.1)",
              }}
            >
              <p className="mb-2 text-sm text-[#628141]">Report Preview</p>
              <pre className="whitespace-pre-wrap text-sm text-[#1B211A]">
                {reportPreview}
              </pre>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="rounded-xl bg-[#8BAE66]/20 px-4 py-2 text-[#628141]"
              >
                Cancel
              </button>
              <button
                onClick={handleExportReport}
                className="rounded-xl bg-gradient-to-r from-[#628141] to-[#8BAE66] px-4 py-2 text-[#FFFDF1]"
              >
                Export Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
