# Analytics Page

Analytics dashboard at `src/app/pages/AnalyticsPage.tsx`.

---

## Overview

The analytics page provides comprehensive sales visualization, performance metrics, and AI-powered business insights. It composes multiple sub-components and hooks to deliver a complete analytics experience.

---

## Page Structure

```
AnalyticsPage
  ├── AnalyticsHeader
  ├── AnalyticsControls (filters)
  ├── SalesDecisionInsights (AI insights)
  ├── RevenueSection
  │     ├── RevenueChart (dual-axis bar)
  │     └── MetricsGrid
  └── PerformanceSection
        ├── WeeklySalesChart (grouped bar)
        ├── DailySalesChart (cumulative + average)
        ├── ProductRankingChart (horizontal bar)
        └── BranchChart (pie)
```

---

## Filters

### `AnalyticsControls`

Filter bar with dropdown selectors:

| Filter | Type | Description |
|--------|------|-------------|
| Branch | Dropdown | Filter by specific branch or all branches |
| Year | Dropdown | Filter by year |
| Month | Dropdown | Filter by month |
| Refresh | Button | Reload data with current filters |

---

## Data Transformation

### `analyticsData.ts`

Maps raw `AnalyticsDTO` from the service into chart-ready arrays.

**Exports:**
- `createInitialMetrics()` — returns default/empty metrics object
- `mapAnalyticsData(analytics, now)` — transforms raw data into computed metrics

**Computed Metrics:**
- Growth rate (month-over-month)
- Projected revenue
- Peak demand day
- Weekly/daily breakdowns
- Product rankings
- Branch performance distribution

---

## Custom Hooks

### `useAnalyticsData(fetches)`

Main data hook for the analytics page.

**Returns:**
- Transformed analytics data
- Loading/error states
- Available filter options (branches, years, months)
- Sales decision insights

**Dependencies:** `appService`, `analyticsData`, `useSalesDecisionInsights`

### `useSalesDecisionInsights`

Pure computation module that analyzes the last 28 days of transactions.

**Returns:** `SalesDecisionInsight[]` — four actionable insights:

| Insight | Description |
|---------|-------------|
| `trend` | Daily sales momentum |
| `products` | Top performing product |
| `channels` | Best sales channel |
| `delivery` | Delivery performance |

---

## AI Insights

### `geminiSalesRecommendations.ts`

Calls the Gemini 2.0 Flash API to enhance sales decision recommendations.

**Configuration:**
- Requires `VITE_GEMINI_API_KEY` environment variable
- Uses Gemini 2.0 Flash model

**Flow:**
1. `SalesDecisionInsightsView` mounts
2. Dynamically imports `geminiSalesRecommendations`
3. Calls `generateRecommendations(insights)` with current insights
4. On success: replaces standard recommendations with AI-generated ones
5. On failure: falls back to standard recommendations

**Status Badge:**
The UI shows a badge indicating whether Gemini or standard recommendations are active.

---

## Chart Components

All charts are in `src/app/pages/Analytics/components.tsx`.

| Chart | Type | Data |
|-------|------|------|
| `RevenueChart` | Dual-axis bar | Monthly revenue vs. target |
| `WeeklySalesChart` | Grouped bar | Weekly In-Store/Commercial sales |
| `DailySalesChart` | Cumulative + average bar | Daily sales with running average |
| `ProductRankingChart` | Horizontal bar | Product sales ranking |
| `BranchChart` | Pie | Branch performance distribution |

---

## Types

Defined in `src/app/pages/Analytics/types.ts`:

| Type | Description |
|------|-------------|
| `MonthlyPerformancePoint` | Monthly revenue/expense/profit |
| `DailySalesPoint` | Daily sales amount |
| `ProductRankingPoint` | Product name and sales quantity |
| `WeeklyDeliveryPoint` | Weekly sales by channel |
| `BranchPerformancePoint` | Branch name and revenue |
| `AnalyticsMetric` | Generic metric with label, value, and trend |
