import type { User } from "@supabase/supabase-js";
import type {
  BranchDTO,
  BranchInput,
  BranchSalesTargetDTO,
  BranchSalesTargetInput,
  CatalogPrice,
  DashboardDTO,
  GasUser,
  HomeInsightsDTO,
  InventoryDTO,
  InventoryInput,
  NotificationDTO,
  ProductDTO,
  ProductInput,
  StaffDTO,
  StaffInput,
  TransactionDTO,
  AnalyticsDTO,
  AiAnalyticsDTO,
} from "./types";

export interface IAuthService {
  getGasUser(user: User): Promise<GasUser>;
}

export interface IBranchService {
  list(): Promise<BranchDTO[]>;
  create(input: BranchInput): Promise<BranchDTO>;
  update(id: number, input: BranchInput): Promise<BranchDTO>;
  remove(id: number): Promise<void>;
}

export interface ISalesTargetService {
  list(): Promise<BranchSalesTargetDTO[]>;
  create(input: BranchSalesTargetInput): Promise<BranchSalesTargetDTO>;
  update(id: number, input: BranchSalesTargetInput): Promise<BranchSalesTargetDTO>;
  remove(id: number): Promise<void>;
}

export interface IProductService {
  listActive(): Promise<ProductDTO[]>;
  listAll(): Promise<ProductDTO[]>;
  create(input: ProductInput): Promise<ProductDTO>;
  update(id: number, input: ProductInput): Promise<ProductDTO>;
  remove(id: number): Promise<void>;
  listCatalogPrices(): Promise<CatalogPrice[]>;
  updateCatalogPrice(branchId: number, productId: number, price: number): Promise<void>;
}

export interface IInventoryService {
  list(params?: { branchId?: number }): Promise<InventoryDTO[]>;
  upsert(input: InventoryInput): Promise<InventoryDTO>;
  remove(id: number): Promise<void>;
}

export interface ITransactionService {
  list(params?: { branchId?: number }): Promise<TransactionDTO[]>;
}

export interface INotificationService {
  list(): Promise<NotificationDTO[]>;
  markRead(ids: number[], isRead?: boolean): Promise<void>;
  remove(ids: number[]): Promise<void>;
}

export interface IDashboardService {
  get(): Promise<DashboardDTO>;
  getHomeInsights(): Promise<HomeInsightsDTO>;
}

export interface IAnalyticsService {
  get(params: {
    fromDate: string;
    toDate: string;
    branchId?: number;
    year?: number;
    month?: number;
  }): Promise<AnalyticsDTO>;
  getAiInsights(params: { fromDate: string; toDate: string }): Promise<AiAnalyticsDTO>;
}

export interface IStaffService {
  list(): Promise<StaffDTO[]>;
  create(input: StaffInput): Promise<StaffDTO>;
  update(id: string, input: StaffInput): Promise<StaffDTO>;
  remove(id: string): Promise<void>;
}
