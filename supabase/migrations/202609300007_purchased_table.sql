create table if not exists public.purchased (
  purchased_id bigint generated always as identity primary key,
  sales_id integer not null references public.sales_transactions(sales_id) on delete cascade,
  branch_id integer not null references public.branches(branch_id) on delete restrict,
  product_id integer not null references public.products(product_id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_at_sale integer not null check (unit_price_at_sale >= 0),
  purchased_at timestamp with time zone not null default now()
);

create index if not exists purchased_sales_id_idx on public.purchased(sales_id);
create index if not exists purchased_branch_id_idx on public.purchased(branch_id);
create index if not exists purchased_product_id_idx on public.purchased(product_id);

alter table public.purchased enable row level security;
grant select, insert, update, delete on public.purchased to authenticated;
grant usage, select on sequence public.purchased_purchased_id_seq to authenticated;

drop policy if exists purchased_authenticated_all on public.purchased;
create policy purchased_authenticated_all
  on public.purchased
  for all
  to authenticated
  using (true)
  with check (true);
