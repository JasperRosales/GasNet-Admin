# GasNet Admin Database Schema

This document describes the authoritative root [`schema.sql`](../../schema.sql)
exported from PostgreSQL. The GasNet-Admin dashboard reads most of these tables
and manages inventory, catalog prices, targets, and settings through the service
layer in `src/app/services/`. Live RLS policies may exist separately and are not
part of the base schema dump.

## Configuration

Provide only the project's public Supabase client configuration through local
environment variables or the deployment's environment settings:

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=<publishable-key>
```

Never commit service-role keys, database passwords, Auth credentials, or other
secrets. `password` on `staff` is nullable legacy data; the client authenticates
with Supabase Auth and does not read it.

## Tables

All tables are in `public`.

| Table | Columns | Keys and constraints |
| --- | --- | --- |
| `branches` | `branch_id`, `branch_name`, `location`, `contact_no` | PK `branch_id`; unique `branch_name` |
| `staff` | `staff_id`, `branch_id`, `username`, nullable `password`, `role` | PK `staff_id`; unique `username`; FK `branch_id -> branches`; role is `Admin`, `Staff`, or `Manager` |
| `products` | `product_id`, `product_name`, `weight_kg`, `active` | PK `product_id`; `weight_kg > 0` |
| `branch_stock` | `stock_id`, `branch_id`, `product_id`, `quantity`, `reorder_level` | PK `stock_id`; unique `(branch_id, product_id)`; branch/product FKs; nonnegative quantities and reorder levels |
| `branch_product_prices` | `branch_id`, `product_id`, `price`, `updated_at` | PK `(branch_id, product_id)`; branch/product FKs; `price >= 0` |
| `sales_transactions` | `sales_id`, `idempotency_key`, nullable `tracking_no`, `guest_name`, nullable `guest_phone`, nullable `delivery_address`, `transaction_date`, `branch_id`, `staff_id`, `transaction_type`, `subtotal`, `total` | PK `sales_id`; unique `(branch_id, idempotency_key)`; unique `tracking_no`; FK `branch_id -> branches`; type is `Instore`, `Commercial`, or `Delivery`; totals are nonnegative. The DDL appears twice in the export but defines one logical table |
| `sales_transaction_items` | `line_id`, `sales_id`, `product_id`, `quantity`, `unit_price_at_sale`, `tracking_no`, `created_at` | PK `line_id`; FK `sales_id -> sales_transactions`; FK `product_id -> products`; `quantity > 0`; `unit_price_at_sale >= 0`; per-item tracking number |
| `delivery` | `delivery_id`, `sales_id`, `branch_id`, `product_id`, `quantity`, `unit_price_at_sale`, `created_at` | PK `delivery_id`; FK `sales_id`, `branch_id`, `product_id`; per-item delivery record for `Delivery` sales |
| `deliveries` | `delivery_id`, `sales_id`, `status`, `updated_at` | PK `delivery_id`; FK `sales_id -> sales_transactions` with cascade delete; status is `Pending`, `Out for Delivery`, `Delivered`, or `Cancelled` |
| `purchased` | `purchased_id`, `sales_id`, `branch_id`, `product_id`, `quantity`, `unit_price_at_sale`, `purchased_at` | PK `purchased_id`; FK `sales_id`, `branch_id`, `product_id`; record of in-store purchases |
| `returned` | `returned_id`, `sales_id`, `branch_id`, `product_id`, `quantity`, `tracking_no`, `reason`, `created_at` | PK `returned_id`; FK `sales_id`, `branch_id`, `product_id`; returned items keyed by the product's tracking number |
| `notifications` | `notification_id`, `branch_id`, `title`, `message`, `notification_type`, `created_at`, `is_read` | PK `notification_id`; FK `branch_id -> branches`; defaults `notification_type 'general'`, `is_read false` |
| `revenue_targets` | `target_id`, `branch_id`, `period_start`, `period_end`, `target_revenue`, `created_at` | PK `target_id`; FK `branch_id -> branches`; unique `(branch_id, period_start, period_end)`; `target_revenue > 0`; `period_end >= period_start` |
| `v_purchased_by_branch_product` | view | Aggregates in-store purchases per branch/product: `purchased_quantity`, `purchased_value` |

## Row-Level Security

RLS is enabled on `purchased`, `delivery`, `returned`, and
`sales_transaction_items` with permissive policies for the `authenticated`
role (`using (true) with check (true)`). Any additional live policies on the
other tables are deployment configuration and are not part of the base dump.

## Functions and RPCs

The authoritative base schema defines no stored functions or RPCs. Dashboard
KPIs, analytics aggregations, and target-percentage calculations are computed
client-side by the service layer.

## Notes

- The root export repeats the `sales_transactions` DDL and its index
  statements; they describe one logical table, not two.
- `staff.staff_id` should correspond to a Supabase Auth user UUID. PostgreSQL
  SQL cannot call `auth.admin`, so auth users must be created through a trusted
  Supabase Admin API integration.
