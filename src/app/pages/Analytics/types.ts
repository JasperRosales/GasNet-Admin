import type { LucideIcon } from "lucide-react";

export interface Metric {
  icon: LucideIcon;
  label: string;
  value: string;
  change: string;
}

export interface MonthlyPerformance {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface WeeklyDelivery {
  day: string;
  InStore: number;
  Commercial: number;
}

export interface BranchDatum {
  name: string;
  value: number;
}
