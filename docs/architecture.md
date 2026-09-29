# Architecture

## Overview

GasNet-Admin is a single-page application (SPA) that serves as the admin dashboard for CJG TRADING. It provides branch management, staff management, inventory tracking, sales analytics, and AI-powered business insights. It communicates exclusively with a Supabase backend.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18+ with TypeScript |
| Build tool | Vite |
| Routing | React Router v7 |
| Backend/Auth | Supabase (PostgreSQL + Auth) |
| Styling | Tailwind CSS v4 |
| UI primitives | Radix UI (shadcn/ui pattern) |
| Charts | Recharts |
| AI | Gemini 2.0 Flash API |
| Icons | Lucide React |
| Package manager | npm |

## Application Shell

```
main.tsx
  └── App.tsx
        ├── AuthProvider (utils/auth.tsx)
        └── RouterProvider (routes.tsx)
              ├── /              → LoginPage (public)
              └── /admin-home    → ProtectedRoute → RootLayout
                    ├── index         → HomePage
                    ├── analytics     → AnalyticsPage
                    ├── data          → DataPage
                    └── settings      → SettingsPage
```

## Data Flow

```
AuthProvider
  │
  ├── supabase.auth (session management)
  ├── getGasUser() (staff profile)
  │
  └── Pages
        │
        ├── HomePage ──→ appService.dashboard.get()
        │            ──→ appService.salesTargets.list/create/update/delete()
        │
        ├── AnalyticsPage ──→ appService.analytics.get()
        │                 ──→ appService.transactions.list()
        │                 ──→ useSalesDecisionInsights (local computation)
        │                 ──→ geminiSalesRecommendations (AI API)
        │
        ├── DataPage ──→ appService.inventory.list/upsert/delete()
        │            ──→ appService.branches.list()
        │            ──→ appService.products.list/create/update/delete()
        │            ──→ appService.catalog.list/update()
        │            ──→ appService.transactions.list()
        │
        └── SettingsPage ──→ appService.branches.list/create/update/delete()
                          ──→ appService.staff.list/create/update/delete()
                          ──→ appService.salesTargets.list/create/update/delete()
```

## Design Patterns

### Service Layer Pattern
All Supabase access is centralized in `src/app/services/appService.ts`. Pages never import `supabase` directly (except `auth.tsx` for auth operations). The service layer maps raw DB rows to typed DTOs.

### Custom Hooks for State Management
Each page delegates complex state to dedicated hooks:
- `useDataLoader` — Data page data fetching
- `useInventoryControls` — Inventory CRUD operations
- `useReportExport` — Report generation
- `useAnalyticsData` — Analytics data transformation
- `useBranchSettings` — Branch CRUD
- `useStaffSettings` — Staff CRUD
- `useTargetSettings` — Sales target CRUD

### DTO Mapping
Raw Supabase rows are mapped to typed DTOs at the service layer boundary, providing a clean contract between data and UI.

### Lazy Loading
All page components are lazy-loaded with `React.lazy` + `Suspense` for code splitting.

### Admin-Only Access
The `AuthProvider` enforces that only users with `role === "Admin"` can access the system. Non-admin users are signed out immediately.

### AI-Powered Insights
The Analytics page uses the Gemini 2.0 Flash API to generate business recommendations based on transaction data. Falls back to standard recommendations if the API is unavailable.

## Database Tables Used

| Table | Purpose |
|-------|---------|
| `staff` | Staff profiles with branch and role |
| `branches` | Branch information |
| `products` | Product catalog |
| `branch_product_prices` | Per-branch pricing |
| `branch_stock` | Per-branch stock levels |
| `sales_transactions` | Transaction headers |
| `sales_transaction_items` | Transaction line items |
| `notifications` | System notifications |
| `revenue_targets` | Monthly sales targets per branch |
| `deliveries` | Delivery tracking |
