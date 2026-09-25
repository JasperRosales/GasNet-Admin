import type { LucideIcon } from "lucide-react";

export type MonthlyPerformancePoint = {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  transactionCount: number;
  averageOrderValue: number;
};

export type DailySalesPoint = { day: string; label: string; revenue: number; transactions: number };
export type ProductRankingPoint = { productId: number; productName: string; name: string; totalKg: number; salesValue: number };

export type WeeklyDeliveryPoint = {
  day: string;
  InStore: number;
  Commercial: number;
  Delivery: number;
};

export type BranchPerformancePoint = {
  name: string;
  value: number;
};

export type AnalyticsMetric = {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
};
