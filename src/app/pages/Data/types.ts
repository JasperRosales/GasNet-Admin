export interface InventoryItem {
  stockId: number;
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  weightKg: number | null;
  quantity: number;
  reorderLevel: number;
}

export interface ProductColumn {
  id: number;
  label: string;
  weight: number | null;
}

export interface TransactionRecord {
  salesId: number;
  trackingNo: string | null;
  guestName: string;
  branchName: string;
  subtotal: number;
  total: number;
  transactionDate: string;
  transactionType: string;
}

export interface InventoryRow {
  branchId: number;
  branchName: string;
  quantities: Record<number, number>;
  outgoingTotal: number;
  returnedTotal: number;
}

export interface InventoryForm {
  branchId: string;
  productId: string;
  quantity: string;
  reorderLevel: string;
}

export interface BranchOption {
  id: number;
  name: string;
}

export interface ProductOption {
  id: number;
  label: string;
  weight: number | null;
}

export interface ProductForm {
  name: string;
  weightKg: string;
}

export interface InventoryDeleteTarget {
  stockId: number;
  branchName: string;
  productName: string;
}

export type InventoryStatusTab = "Stock" | "Delivered" | "Returned";
export type ReportType = "weekly" | "monthly" | "annual";
export type StatusTone = "low" | "moderate" | "high";
