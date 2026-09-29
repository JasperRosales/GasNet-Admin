# Home Page

Dashboard overview at `src/app/pages/HomePage.tsx`.

---

## Overview

The main dashboard page displays key performance indicators, branch status overview, and monthly sales target management.

---

## KPI Cards

Four stat cards at the top of the page:

| Card | Data Source | Description |
|------|-------------|-------------|
| Total Revenue | `dashboard.totalRevenue` | Sum of all transaction totals |
| LPG Cylinders | `dashboard.totalCylinders` | Total quantity sold |
| Top Performing Branch | `dashboard.topBranch` | Branch with highest revenue |
| Total Target Reached | `dashboard.targetReachedPercent` | Percentage of target achieved |

---

## Branch Status Overview

A grid of branch cards showing:
- Branch name and location
- Current month revenue vs. target
- Progress bar showing target completion percentage
- "Edit Target" button to modify the monthly target

---

## Monthly Target Management

### `MonthlyTargetModal`

Modal form for setting or editing a monthly sales target for a specific branch.

**Features:**
- Month picker (YYYY-MM format)
- Amount input
- Delete button (when editing existing target)
- Create or update based on whether a target already exists

**Flow:**
1. Admin clicks "Edit Target" on a branch card
2. Modal opens pre-filled with existing target data (if any)
3. Admin modifies the month and/or amount
4. On save: `appService.salesTargets.create()` or `update()` is called
5. Dashboard data is refreshed

---

## Data Loading

```
HomePage
  │
  ├── appService.dashboard.get()
  │     ├── Fetches total revenue, cylinder count, top branch
  │     ├── Fetches branch list with current-month targets
  │     └── Computes target reached percentage
  │
  └── appService.salesTargets.list()
        └── Fetches all monthly targets for the current month
```

---

## Local Helpers

| Helper | Description |
|--------|-------------|
| `currentMonth()` | Returns current month as `YYYY-MM` |
| `monthPeriod(month)` | Returns `{ start, end }` dates for a `YYYY-MM` string |
| `formatCurrency(amount)` | Formats number as Philippine Peso |
| `formatActivityTime(date)` | Formats date as relative time |
