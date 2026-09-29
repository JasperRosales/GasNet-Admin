# Data Page

Distribution management at `src/app/pages/DataPage.tsx`.

---

## Overview

The Data page is the operational hub for managing inventory, viewing transactions, and maintaining the product catalog. It features three tabs and auto-refreshes data every 60 seconds when visible.

---

## Tabs

| Tab | Component | Description |
|-----|-----------|-------------|
| Inventory Data | `InventorySection` | Stock levels with status tabs |
| Product Catalog | `ProductCatalog` | Product list with inline price editing |
| Transaction History | `TransactionsTable` | Paginated transaction records |

---

## Auto-Refresh

The page automatically refreshes data every 60 seconds when the browser tab is visible. This ensures inventory and transaction data stays current without manual intervention.

---

## Inventory Management

### `InventorySection`

Displays inventory in a table with:
- **Status tabs:** Stock / Delivered / Returned
- **Product columns:** One column per product
- **Totals row:** Sum of all quantities
- **Status badges:** Low / Moderate / Plenty
- **Edit buttons:** Per-row edit actions

### `InventoryModal`

Modal form for adding/editing inventory:
- Branch selector
- Product selector
- Quantity input
- Reorder level input
- Side panel showing current stock for selected branch
- Edit/delete actions for existing records

### `InventoryDeleteModal`

Confirmation modal for inventory deletion.

---

## Product Catalog

### `ProductCatalog`

Table displaying all products with:
- Product name and weight
- Inline price editing per branch
- Edit product button (name/weight/price)
- Add product button

### `ProductModal`

Modal form for creating a new product (name + weight).

---

## Transactions

### `TransactionsTable`

Paginated table showing:
- Transaction ID
- Tracking number
- Customer name
- Branch
- Total amount
- Date
- Transaction type

---

## Report Export

### `ExportReportModal`

Modal for configuring and previewing report exports.

**Report Types:**
- Weekly
- Monthly
- Annual

**Features:**
- Year/month/week selectors
- Text preview of report content
- Download as `.txt` file

---

## Custom Hooks

### `useDataLoader(refreshTick)`

Loads and manages all data for the Data page:
- Inventory items
- Branch options
- Product options
- Catalog prices
- Catalog products
- Transactions

### `useInventoryControls(items, branches, products, reload)`

Manages all inventory-related UI state and operations:
- Status tab selection
- Branch filter
- Modal open/close
- Form state
- Add/edit/delete inventory
- Create product
- Computed inventory rows

### `useReportExport(transactions)`

Computes report preview text and provides a download function.

---

## Data Utilities

### `dataUtils.ts`

Pure utility functions:

| Function | Description |
|----------|-------------|
| `getFlowQuantities()` | Simulates outgoing/returned quantities per branch |
| `getInventoryStatusMeta()` | Returns status metadata (Low/Moderate/Plenty) |
| `getStatusBadgeClass()` | Returns CSS class for status badge |
| `formatAmount()` | Formats currency |
| `toLocalDate()` | Converts to local date string |
| `getMonthLabel()` | Formats month for display |
| `formatDisplayDate()` | Formats date for display |
| `buildInventoryRows()` | Transforms raw inventory data into display rows |
| `filterTransactions()` | Filters transactions by search/type |

---

## Types

Defined in `src/app/pages/Data/types.ts`:

| Type | Description |
|------|-------------|
| `InventoryItem` | Raw inventory record |
| `ProductColumn` | Product column metadata |
| `TransactionRecord` | Formatted transaction row |
| `InventoryRow` | Computed inventory display row |
| `InventoryForm` | Inventory form state |
| `BranchOption` | Branch dropdown option |
| `ProductOption` | Product dropdown option |
| `ProductForm` | Product form state |
| `InventoryDeleteTarget` | Item pending deletion |
| `InventoryStatusTab` | Active status tab |
| `ReportType` | Report type enum |
| `StatusTone` | Status color tone |
