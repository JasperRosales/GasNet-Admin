import { AuthService } from "./authService";
import { BranchService } from "./branchService";
import { SalesTargetService } from "./salesTargetService";
import { ProductService } from "./productService";
import { InventoryService } from "./inventoryService";
import { TransactionService } from "./transactionService";
import { NotificationService } from "./notificationService";
import { StaffService } from "./staffService";
import { DashboardService } from "./dashboardService";
import { AnalyticsService } from "./analyticsService";

const authService = new AuthService();
const branchService = new BranchService();
const salesTargetService = new SalesTargetService();
const productService = new ProductService();
const inventoryService = new InventoryService();
const transactionService = new TransactionService();
const notificationService = new NotificationService();
const staffService = new StaffService();
const dashboardService = new DashboardService(
  branchService,
  inventoryService,
  transactionService,
  salesTargetService,
  staffService,
  notificationService,
  productService
);
const analyticsService = new AnalyticsService(transactionService, dashboardService);

export const appService = {
  branches: {
    list: branchService.list.bind(branchService),
    create: branchService.create.bind(branchService),
    update: branchService.update.bind(branchService),
    delete: branchService.remove.bind(branchService),
  },
  salesTargets: {
    list: salesTargetService.list.bind(salesTargetService),
    create: salesTargetService.create.bind(salesTargetService),
    update: salesTargetService.update.bind(salesTargetService),
    delete: salesTargetService.remove.bind(salesTargetService),
  },
  products: {
    listActive: productService.listActive.bind(productService),
    listAll: productService.listAll.bind(productService),
    create: productService.create.bind(productService),
    update: productService.update.bind(productService),
    delete: productService.remove.bind(productService),
  },
  catalog: {
    listPrices: productService.listCatalogPrices.bind(productService),
    updatePrice: productService.updateCatalogPrice.bind(productService),
  },
  inventory: {
    list: inventoryService.list.bind(inventoryService),
    upsert: inventoryService.upsert.bind(inventoryService),
    delete: inventoryService.remove.bind(inventoryService),
  },
  transactions: { list: transactionService.list.bind(transactionService) },
  dashboard: {
    get: dashboardService.get.bind(dashboardService),
    getHomeInsights: dashboardService.getHomeInsights.bind(dashboardService),
  },
  analytics: {
    get: analyticsService.get.bind(analyticsService),
    getAiInsights: analyticsService.getAiInsights.bind(analyticsService),
  },
  staff: {
    list: staffService.list.bind(staffService),
    create: staffService.create.bind(staffService),
    update: staffService.update.bind(staffService),
    delete: staffService.remove.bind(staffService),
  },
  notifications: {
    list: notificationService.list.bind(notificationService),
    markRead: notificationService.markRead.bind(notificationService),
    delete: notificationService.remove.bind(notificationService),
  },
};

export const getGasUser = authService.getGasUser.bind(authService);

export type {
  NotificationDTO,
  StaffRole,
  GasUser,
  BranchDTO,
  ProductDTO,
  InventoryDTO,
  TransactionDTO,
  StaffDTO,
  BranchInput,
  BranchSalesTargetDTO,
  BranchSalesTargetInput,
  ProductInput,
  CatalogPrice,
  InventoryInput,
  StaffInput,
  DashboardBranch,
  DashboardDTO,
  AnalyticsMonthPoint,
  AnalyticsWeeklyPoint,
  AnalyticsBranchPerformance,
  AnalyticsDailyPoint,
  AnalyticsProductPoint,
  AnalyticsDTO,
  AiAnalyticsDTO,
  BranchReadiness,
  HomeInsightsDTO,
} from "./types";
