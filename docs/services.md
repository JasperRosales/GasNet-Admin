# Services

Two service modules in `src/app/services/` provide all backend communication.

---

## Supabase Client (`supabase.ts`)

Creates and exports the singleton Supabase client with auth persistence.

### Configuration

| Environment Variable | Required | Description |
|---------------------|----------|-------------|
| `VITE_SUPABASE_URL` | Yes | Supabase project URL |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Yes | Supabase anonymous/publishable key |

### Auth Configuration

```typescript
auth: {
  persistSession: true,
  autoRefreshToken: true,
  detectSessionInUrl: true,
}
```

### Exports

| Export | Type | Description |
|--------|------|-------------|
| `supabase` | `SupabaseClient` | Singleton client instance |

---

## App Service (`appService.ts`)

The central data-access layer. Contains all Supabase queries and business logic for every domain entity.

### Exported Interfaces/DTOs

| Interface | Description |
|-----------|-------------|
| `NotificationDTO` | Notification with branch, title, message, type, read status |
| `GasUser` | Authenticated user profile |
| `BranchDTO` | Branch with ID, name, location, contact |
| `ProductDTO` | Product with ID, name, weight, active status |
| `InventoryDTO` | Stock record with branch, product, quantity, reorder level |
| `TransactionDTO` | Transaction with items, customer, branch, type, total |
| `StaffDTO` | Staff member with username, role, branch |
| `BranchInput` | Input for creating/updating a branch |
| `BranchSalesTargetDTO` | Monthly sales target for a branch |
| `BranchSalesTargetInput` | Input for creating/updating a target |
| `ProductInput` | Input for creating a product |
| `CatalogPrice` | Product price for a specific branch |
| `InventoryInput` | Input for creating/updating inventory |
| `StaffInput` | Input for creating/updating staff |
| `DashboardBranch` | Branch summary for dashboard |
| `DashboardDTO` | Full dashboard data |
| `AnalyticsMonthPoint` | Monthly revenue/expense/profit data point |
| `AnalyticsWeeklyPoint` | Weekly sales data point |
| `AnalyticsBranchPerformance` | Branch performance metric |
| `AnalyticsDailyPoint` | Daily sales data point |
| `AnalyticsProductPoint` | Product ranking data point |
| `AnalyticsDTO` | Full analytics data |
| `AiAnalyticsDTO` | AI-generated insights |
| `BranchReadiness` | Branch operational readiness |
| `HomeInsightsDTO` | Home page insight data |

---

### Branch Operations

| Function | Description |
|----------|-------------|
| `listBranches()` | Fetch all branches |
| `createBranch(input)` | Create a new branch |
| `updateBranch(id, input)` | Update branch details |
| `deleteBranch(id)` | Delete a branch |

### Sales Target Operations

| Function | Description |
|----------|-------------|
| `listBranchSalesTargets()` | Fetch all monthly targets |
| `createBranchSalesTarget(input)` | Create a new target |
| `updateBranchSalesTarget(id, input)` | Update a target |
| `deleteBranchSalesTarget(id)` | Delete a target |

### Product Operations

| Function | Description |
|----------|-------------|
| `listActiveProducts()` | Fetch all active products |
| `listAllProducts()` | Fetch all products (including inactive) |
| `createProduct(input)` | Create a new product |
| `updateProduct(id, input)` | Update product details |
| `deleteProduct(id)` | Delete a product |

### Catalog Price Operations

| Function | Description |
|----------|-------------|
| `listCatalogPrices()` | Fetch all branch-product prices |
| `updateCatalogPrice(branchId, productId, price)` | Update a price |

### Inventory Operations

| Function | Description |
|----------|-------------|
| `listInventory()` | Fetch all stock records with branch and product names |
| `upsertInventory(input)` | Create or update a stock record |
| `deleteInventory(id)` | Delete a stock record |

### Transaction Operations

| Function | Description |
|----------|-------------|
| `listTransactions()` | Fetch all transactions with line items |

### Dashboard Operations

| Function | Description |
|----------|-------------|
| `getHomeInsights()` | Fetch home page insight data |
| `getDashboard()` | Fetch full dashboard data (revenue, targets, branch overview) |

### Analytics Operations

| Function | Description |
|----------|-------------|
| `getAnalytics(branchId?, year?, month?)` | Fetch analytics data with optional filters |
| `getAiInsights(analytics)` | Fetch AI-generated insights from Gemini API |

### Staff Operations

| Function | Description |
|----------|-------------|
| `listStaff()` | Fetch all staff members |
| `createStaff(input)` | Create a new staff member |
| `updateStaff(id, input)` | Update a staff member |
| `deleteStaff(id)` | Delete a staff member |

### Notification Operations

| Function | Description |
|----------|-------------|
| `listNotifications()` | Fetch all notifications |
| `markNotificationsRead(ids)` | Mark notifications as read |
| `deleteNotifications(ids)` | Delete notifications |

---

### `appService` Namespace Object

All functions are also grouped into a convenience object:

```typescript
appService.branches.list()
appService.salesTargets.list()
appService.products.listActive()
appService.catalog.list()
appService.inventory.list()
appService.transactions.list()
appService.dashboard.get()
appService.analytics.get()
appService.staff.list()
appService.notifications.list()
```

---

### Internal Helpers

| Helper | Description |
|--------|-------------|
| `text(value)` | Safely converts to string |
| `num(value)` | Safely converts to number |
| `fail(message)` | Creates and throws a service error |
| `rows(value)` | Safely extracts array from Supabase result |
| `role(value)` | Safely extracts role string |
| `monthlyPeriod(date)` | Gets start/end dates for the month |
| `mapTarget(row)` | Maps a raw target row to `BranchSalesTargetDTO` |
