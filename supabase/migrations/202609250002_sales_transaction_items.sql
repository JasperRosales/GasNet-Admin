create table if not exists public.sales_transaction_items (
  line_id bigint generated always as identity primary key,
  sales_id integer not null references public.sales_transactions(sales_id) on delete cascade,
  product_id integer not null references public.products(product_id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_at_sale integer not null check (unit_price_at_sale >= 0),
  created_at timestamptz not null default now()
);

create index if not exists sales_transaction_items_sales_id_idx on public.sales_transaction_items(sales_id);
create index if not exists sales_transaction_items_product_id_idx on public.sales_transaction_items(product_id);
alter table public.sales_transaction_items enable row level security;
grant select, insert, update, delete on public.sales_transaction_items to authenticated;

drop policy if exists sales_transaction_items_authenticated_all on public.sales_transaction_items;
create policy sales_transaction_items_authenticated_all on public.sales_transaction_items
  for all to authenticated using (true) with check (true);
