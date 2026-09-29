export interface NotificationDTO {
  id: number;
  branchId: number;
  title: string;
  message: string;
  type: string;
  createdAt: string;
  isRead: boolean;
}
export type StaffRole = "Admin" | "Manager" | "Staff";
export interface GasUser {
  id: string;
  staffId: string;
  username: string;
  role: StaffRole;
  branchId: number;
  branchName: string;
}
export interface BranchDTO {
  id: number;
  name: string;
  location: string;
  contactNo: string;
}
export interface ProductDTO {
  id: number;
  name: string;
  weightKg: number;
  active: boolean;
  createdAt?: string;
  updatedAt?: string;
}
export interface InventoryDTO {
  stockId: number;
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  weightKg: number | null;
  quantity: number;
  reorderLevel: number;
  lowStock?: boolean;
}
export interface TransactionDTO {
  salesId: number;
  trackingNo: string | null;
  guestName: string;
  guestPhone?: string | null;
  deliveryAddress?: string | null;
  transactionDate: string;
  branchId?: number;
  branchName: string;
  staffId?: string;
  staffUsername?: string;
  transactionType: string;
  subtotal: number;
  total: number;
  createdAt?: string;
  items?: Array<{
    productId: number;
    productName: string;
    weightKg: number;
    quantity: number;
    unitPrice: number;
  }>;
}
export interface StaffDTO extends GasUser {}
export interface BranchInput {
  name: string;
  location: string;
  contactNo: string;
}
export interface BranchSalesTargetDTO {
  id: number;
  branchId: number;
  periodStart: string;
  periodEnd: string;
  targetRevenue: number;
}
export interface BranchSalesTargetInput {
  branchId: number;
  periodStart: string;
  periodEnd: string;
  targetRevenue: number;
}
export interface ProductInput {
  name: string;
  weightKg: number;
}
export interface CatalogPrice {
  branchId: number;
  branchName: string;
  productId: number;
  productName: string;
  price: number;
}
export interface InventoryInput {
  stockId?: number;
  branchId: number;
  productId: number;
  quantity: number;
  reorderLevel: number;
}
export interface StaffInput {
  username?: string;
  email?: string;
  password?: string;
  role: StaffRole;
  branchId: number;
}
export interface DashboardBranch {
  branchId: number;
  branchName: string;
  name: string;
  totalCylinders: number;
  quantity: number;
  targetGoal: number;
  status: string;
  revenue: number;
  transactionCount: number;
}
export interface DashboardDTO {
  metrics: {
    revenue: number;
    transactions: number;
    cylindersInStock: number;
    lowStockRecords: number;
  };
  totalRevenue: number;
  totalCylinders: number;
  topBranch: string;
  targetReachedPercent: number;
  branchOverview: DashboardBranch[];
  branchPerformance: DashboardBranch[];
}
export interface AnalyticsMonthPoint {
  month: string;
  label: string;
  revenue: number;
  expenses: number;
  profit: number;
  transactionCount: number;
  averageOrderValue: number;
}
export interface AnalyticsWeeklyPoint {
  day: string;
  label: string;
  InStore: number;
  Commercial: number;
  Delivery: number;
  inStore: number;
  commercial: number;
  delivery: number;
}
export interface AnalyticsBranchPerformance {
  branchId: number;
  branchName: string;
  name: string;
  revenue: number;
  value: number;
  transactionCount: number;
}
export interface AnalyticsDailyPoint {
  day: string;
  label: string;
  revenue: number;
  transactions: number;
}
export interface AnalyticsProductPoint {
  productId: number;
  productName: string;
  name: string;
  totalKg: number;
  salesValue: number;
}
export interface AnalyticsDTO {
  range: { fromDate: string; toDate: string; branchId: number | null };
  summary: { revenue: number; transactionCount: number; averageTransactionValue: number };
  revenueByMonth: AnalyticsMonthPoint[];
  weeklyPerformance: AnalyticsWeeklyPoint[];
  dailyPerformance: AnalyticsDailyPoint[];
  branchPerformance: AnalyticsBranchPerformance[];
  topProducts: AnalyticsProductPoint[];
  peakDemandDay: { day: string; transactionCount: number } | null;
}
export interface AiAnalyticsDTO {
  generatedAt: string;
  model: string;
  summary: string;
  sentiment: "positive" | "neutral" | "warning";
  insights: Array<{ title: string; detail: string; type: string }>;
}
export interface BranchReadiness {
  branchId: number;
  branchName: string;
  covered: number;
  total: number;
  ready: boolean;
}
export interface HomeInsightsDTO {
  coverage: {
    branches: number;
    products: number;
    prices: number;
    stock: number;
    staff: number;
    targets: number;
    readyBranches: number;
    readiness: BranchReadiness[];
  };
  activity: Array<{
    id: string;
    title: string;
    detail: string;
    createdAt: string;
    kind: "notification" | "sale";
  }>;
}
