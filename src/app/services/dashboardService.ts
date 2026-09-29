import type {
  IDashboardService,
  IBranchService,
  IInventoryService,
  ISalesTargetService,
  IStaffService,
  ITransactionService,
  INotificationService,
  IProductService,
} from "./interfaces";
import type { DashboardDTO, HomeInsightsDTO } from "./types";

export class DashboardService implements IDashboardService {
  constructor(
    private readonly branches: IBranchService,
    private readonly inventory: IInventoryService,
    private readonly transactions: ITransactionService,
    private readonly salesTargets: ISalesTargetService,
    private readonly staff: IStaffService,
    private readonly notifications: INotificationService,
    private readonly products: IProductService
  ) {}

  async get(): Promise<DashboardDTO> {
    const [allSales, inventory, branches, targets] = await Promise.all([
      this.transactions.list(),
      this.inventory.list(),
      this.branches.list(),
      this.salesTargets.list(),
    ]);
    const month = new Date().toISOString().slice(0, 7);
    const sales = allSales.filter((t) => t.transactionDate.slice(0, 7) === month);
    const targetByBranch = new Map(
      targets
        .filter((t) => t.periodStart.slice(0, 7) === month)
        .map((t) => [t.branchId, t.targetRevenue])
    );
    const branchMap = new Map<number, DashboardDTO["branchOverview"][number]>(
      branches.map((b) => [
        b.id,
        {
          branchId: b.id,
          branchName: b.name,
          name: b.name,
          totalCylinders: 0,
          quantity: 0,
          targetGoal: targetByBranch.get(b.id) ?? 0,
          status: "Pending",
          revenue: 0,
          transactionCount: 0,
        },
      ])
    );
    for (const i of inventory) {
      const b = branchMap.get(i.branchId);
      if (b) {
        b.totalCylinders += i.quantity;
        b.quantity = b.totalCylinders;
      }
    }
    for (const t of sales) {
      const b = branchMap.get(t.branchId ?? 0);
      if (b) {
        b.revenue += t.total;
        b.transactionCount++;
      }
    }
    const list = [...branchMap.values()];
    for (const b of list)
      b.status =
        b.targetGoal > 0 ? (b.revenue >= b.targetGoal ? "Reached" : "In Progress") : "No Target";
    const top = [...list].sort((a, b) => b.revenue - a.revenue)[0];
    const totalTarget = list.reduce((sum, b) => sum + b.targetGoal, 0);
    const targetReachedPercent =
      totalTarget > 0
        ? Math.round((list.reduce((sum, b) => sum + b.revenue, 0) / totalTarget) * 100)
        : 0;
    return {
      metrics: {
        revenue: sales.reduce((n, t) => n + t.total, 0),
        transactions: sales.length,
        cylindersInStock: inventory.reduce((n, i) => n + i.quantity, 0),
        lowStockRecords: inventory.filter((i) => i.lowStock).length,
      },
      totalRevenue: sales.reduce((n, t) => n + t.total, 0),
      totalCylinders: inventory.reduce((n, i) => n + i.quantity, 0),
      topBranch: top?.branchName ?? "—",
      targetReachedPercent,
      branchOverview: list,
      branchPerformance: list,
    };
  }

  async getHomeInsights(): Promise<HomeInsightsDTO> {
    const [
      branchesResult,
      productsResult,
      pricesResult,
      stockResult,
      staffResult,
      targetsResult,
      notificationsResult,
      transactionsResult,
    ] = await Promise.allSettled([
      this.branches.list(),
      this.products.listActive(),
      this.products.listCatalogPrices(),
      this.inventory.list(),
      this.staff.list(),
      this.salesTargets.list(),
      this.notifications.list(),
      this.transactions.list(),
    ]);
    const branches = branchesResult.status === "fulfilled" ? branchesResult.value : [];
    const products = productsResult.status === "fulfilled" ? productsResult.value : [];
    const prices = pricesResult.status === "fulfilled" ? pricesResult.value : [];
    const stock = stockResult.status === "fulfilled" ? stockResult.value : [];
    const staff = staffResult.status === "fulfilled" ? staffResult.value : [];
    const targets = targetsResult.status === "fulfilled" ? targetsResult.value : [];
    const notifications =
      notificationsResult.status === "fulfilled" ? notificationsResult.value : [];
    const transactions = transactionsResult.status === "fulfilled" ? transactionsResult.value : [];
    const expected = new Map(branches.map((branch) => [branch.id, products.length]));
    prices.forEach((price) => {
      if (expected.has(price.branchId))
        expected.set(
          price.branchId,
          (expected.get(price.branchId) ?? 0) +
            (stock.some(
              (row) => row.branchId === price.branchId && row.productId === price.productId
            )
              ? 1
              : 0)
        );
    });
    const readiness = branches.map((branch) => {
      const covered = prices.filter(
        (price) =>
          price.branchId === branch.id &&
          stock.some((row) => row.branchId === branch.id && row.productId === price.productId)
      ).length;
      const total = expected.get(branch.id) ?? 0;
      return {
        branchId: branch.id,
        branchName: branch.name,
        covered,
        total,
        ready: total > 0 && covered === total,
      };
    });
    const month = new Date().toISOString().slice(0, 7);
    const currentTargets = new Set(
      targets
        .filter((target) => target.periodStart.slice(0, 7) === month)
        .map((target) => target.branchId)
    );
    const staffed = new Set(staff.map((member) => member.branchId));
    readiness.forEach((branch) => {
      branch.ready =
        branch.ready && currentTargets.has(branch.branchId) && staffed.has(branch.branchId);
    });
    const activity = [
      ...notifications.map((item) => ({
        id: `n-${item.id}`,
        title: item.title || item.type || "Notification",
        detail: item.message || "New notification",
        createdAt: item.createdAt,
        kind: "notification" as const,
      })),
      ...transactions
        .slice(0, 8)
        .map((item) => ({
          id: `s-${item.salesId}`,
          title: `Sale ${item.trackingNo || `#${item.salesId}`}`,
          detail: `${item.guestName || "Customer"} · ${item.branchName || "Branch"} · ${item.total.toLocaleString("en-PH", { style: "currency", currency: "PHP" })}`,
          createdAt: item.transactionDate,
          kind: "sale" as const,
        })),
    ]
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
      .slice(0, 8);
    return {
      coverage: {
        branches: branches.length,
        products: products.length,
        prices: prices.length,
        stock: stock.length,
        staff: staff.length,
        targets: currentTargets.size,
        readyBranches: readiness.filter((branch) => branch.ready).length,
        readiness,
      },
      activity,
    };
  }
}
