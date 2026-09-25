# GasNet Database Schema

This document describes the authoritative root `schema.sql` exported from PostgreSQL. The dump contains the six unique public tables below; although the dump repeats `sales_transactions`, it defines one logical table, not two.

Live row-level security policies may exist separately and are not part of the base schema.

## `branches`

| Column | Type | Constraints |
| --- | --- | --- |
| `branch_id` | `serial` | Primary key |
| `branch_name` | `varchar(120)` | Not null, unique |
| `location` | `varchar(255)` | Not null |
| `contact_no` | `varchar(40)` | Not null |

There is no branch `active`, creation, or update column.

## `staff`

| Column | Type | Constraints |
| --- | --- | --- |
| `staff_id` | `uuid` | Primary key |
| `branch_id` | `integer` | Not null; references `branches` on delete restrict |
| `username` | `varchar(80)` | Not null, unique |
| `password` | `varchar(255)` | Nullable |
| `role` | `varchar(20)` | Not null; `Admin`, `Staff`, or `Manager` |

There are no staff `email` or `active` columns. `staff_id` should correspond to a Supabase Auth user UUID. Auth users must be created through a trusted Supabase Admin API integration; PostgreSQL SQL cannot call `auth.admin` to create them.

## `products`

| Column | Type | Constraints |
| --- | --- | --- |
| `product_id` | `serial` | Primary key |
| `product_name` | `varchar(120)` | Not null; not unique in the base schema |
| `weight_kg` | `real` | Not null; greater than zero |
| `active` | `boolean` | Not null; defaults to `true` |

## `branch_product_prices`

| Column | Type | Constraints |
| --- | --- | --- |
| `branch_id` | `integer` | Composite primary key; references `branches` on delete restrict |
| `product_id` | `integer` | Composite primary key; references `products` on delete restrict |
| `price` | `integer` | Not null; greater than or equal to zero |
| `updated_at` | `timestamptz` | Not null; defaults to `now()` |

## `branch_stock`

| Column | Type | Constraints |
| --- | --- | --- |
| `stock_id` | `serial` | Primary key |
| `branch_id` | `integer` | Not null; references `branches` on delete restrict; unique with `product_id` |
| `product_id` | `integer` | Not null; references `products` on delete restrict |
| `quantity` | `integer` | Not null; greater than or equal to zero |
| `reorder_level` | `integer` | Not null; greater than or equal to zero |

## `sales_transactions`

| Column | Type | Constraints |
| --- | --- | --- |
| `sales_id` | `serial` | Primary key |
| `idempotency_key` | `varchar(80)` | Not null; unique with `branch_id` |
| `tracking_no` | `varchar(80)` | Nullable, unique |
| `guest_name` | `varchar(120)` | Not null |
| `guest_phone` | `varchar(40)` | Nullable |
| `delivery_address` | `varchar(255)` | Nullable |
| `transaction_date` | `date` | Not null; defaults to `CURRENT_DATE` |
| `branch_id` | `integer` | Not null; references `branches` on delete restrict |
| `staff_id` | `uuid` | Not null (the base dump does not declare a foreign key) |
| `transaction_type` | `varchar(20)` | Not null; `Instore` or `Commercial` |
| `subtotal` | `integer` | Not null; greater than or equal to zero |
| `total` | `integer` | Not null; greater than or equal to zero |

The base schema has no `transaction_items` table. The duplicate `sales_transactions` DDL and index statements in the root export represent the same single table.

## `deliveries`

| Column | Type | Constraints |
| --- | --- | --- |
| `delivery_id` | `serial` | Primary key |
| `sales_id` | `integer` | Not null; references `sales_transactions` on delete cascade |
| `status` | `varchar(30)` | Not null; `Pending`, `Out for Delivery`, `Delivered`, or `Cancelled` |
| `updated_at` | `timestamptz` | Not null; defaults to `now()` |

## `revenue_targets`

Monthly branch sales targets use a date range so the stored period remains explicit.

| Column | Type | Constraints |
| --- | --- | --- |
| `target_id` | `bigint identity` | Primary key |
| `branch_id` | `integer` | Not null; references `branches` on delete cascade; unique with the period columns |
| `period_start` | `date` | Not null; first day of a calendar month |
| `period_end` | `date` | Not null; last day of the same calendar month and not before `period_start` |
| `target_revenue` | `integer` | Not null; greater than zero |
| `created_at` | `timestamptz` | Not null; defaults to `now()` |

The table has a unique constraint on `(branch_id, period_start, period_end)`, RLS is enabled, and authenticated users may select, insert, update, and delete targets. Dashboard target percentages compare current-month `sales_transactions.total` with the branch target for that month.

## Functions and RPCs

The authoritative base schema defines no stored functions or RPCs. Any live RLS policies or separately deployed integrations are outside this base-schema dump.
