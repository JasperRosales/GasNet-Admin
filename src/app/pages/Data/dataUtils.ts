import type { InventoryRow, InventoryStatusTab, StatusTone, TransactionRecord } from "./types";

export const REPORT_MONTHS = [
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
const MAX_FLOW_QTY = 40;
const branchFlowProfile: Record<string, "None" | "Few" | "Plenty"> = {
  Bayan: "Plenty",
  Gulod: "None",
  Agoncillo: "Few",
  Caloocan: "Plenty",
  Cuenca: "Few",
  "Sta. Teresita": "None",
};

const getFlowRates = (status: "None" | "Few" | "Plenty") =>
  status === "None"
    ? { outgoingRate: 0, returnRate: 0 }
    : status === "Few"
      ? { outgoingRate: 0.3, returnRate: 0.1 }
      : { outgoingRate: 0.8, returnRate: 0.8 };

export const getFlowQuantities = (
  stock: number,
  branch: string,
  totals: Record<string, number>
) => {
  const { outgoingRate, returnRate } = getFlowRates(branchFlowProfile[branch] ?? "Few");
  const branchTotal = totals[branch] ?? 0;
  const outgoingTotal = Math.min(MAX_FLOW_QTY, Math.round(branchTotal * outgoingRate));
  const returnedTotal = Math.min(outgoingTotal, Math.round(branchTotal * returnRate));
  const share = branchTotal > 0 ? stock / branchTotal : 0;
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

export const getInventoryStatusMeta = (
  total: number,
  activeStatus: InventoryStatusTab
): { label: string; tone: StatusTone } => {
  if (activeStatus !== "Stock") return { label: "None", tone: "low" };
  if (total < 120) return { label: "Low", tone: "low" };
  if (total < 160) return { label: "Moderate", tone: "moderate" };
  return { label: "Plenty", tone: "high" };
};

export const getStatusBadgeClass = (tone: StatusTone) =>
  tone === "low"
    ? "bg-[#EBD5AB]/45 text-[#1B211A]"
    : tone === "moderate"
      ? "bg-[#8BAE66]/25 text-[#628141]"
      : "bg-[#628141] text-[#FFFDF1]";

export const formatAmount = (amount: number) => `₱${amount.toLocaleString("en-PH")}`;
export const toLocalDate = (value: string) => new Date(`${value}T00:00:00`);
export const getMonthLabel = (date: Date) => REPORT_MONTHS[date.getMonth()] ?? "";
export const formatDisplayDate = (value: string) => {
  const date = toLocalDate(value);
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

export const buildInventoryRows = (
  items: import("./types").InventoryItem[],
  selectedBranchId: string,
  activeStatus: InventoryStatusTab
): InventoryRow[] => {
  const branchStockTotals = items.reduce((acc: Record<string, number>, item) => {
    acc[item.branchName] = (acc[item.branchName] ?? 0) + item.quantity;
    return acc;
  }, {});
  const rowMap = new Map<string, InventoryRow>();
  items.forEach((item: any) => {
    if (selectedBranchId && item.branchId !== Number(selectedBranchId)) return;
    const row = rowMap.get(item.branchName) ?? {
      branchId: item.branchId,
      branchName: item.branchName,
      quantities: {},
      outgoingTotal: 0,
      returnedTotal: 0,
    };
    const flow = getFlowQuantities(item.quantity, item.branchName, branchStockTotals);
    row.quantities[item.productId] = activeStatus === "Stock" ? item.quantity : 0;
    row.outgoingTotal += flow.outgoingQty;
    row.returnedTotal += flow.returnedQty;
    rowMap.set(item.branchName, row);
  });
  return Array.from(rowMap.values());
};

export const filterTransactions = (
  transactions: TransactionRecord[],
  branchOptions: { id: number; name: string }[],
  selectedBranchId: string,
  search: string,
  type: string
) => {
  const query = search.trim().toLowerCase();
  return transactions.filter((transaction) => {
    const branchMatches =
      !selectedBranchId ||
      branchOptions.find((option) => option.name === transaction.branchName)?.id ===
        Number(selectedBranchId);
    const searchMatches =
      !query ||
      [
        transaction.guestName,
        transaction.trackingNo ?? "",
        transaction.branchName,
        transaction.transactionType,
      ].some((value) => value.toLowerCase().includes(query));
    return branchMatches && searchMatches && (!type || transaction.transactionType === type);
  });
};
