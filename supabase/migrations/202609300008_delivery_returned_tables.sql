create table if not exists public.delivery (
  delivery_id bigint generated always as identity primary key,
  sales_id integer not null references public.sales_transactions(sales_id) on delete cascade,
  branch_id integer not null references public.branches(branch_id) on delete restrict,
  product_id integer not null references public.products(product_id) on delete restrict,
  quantity integer not null check (quantity > 0),
  unit_price_at_sale integer not null check (unit_price_at_sale >= 0),
  created_at timestamp with time zone not null default now()
);

create table if not exists public.returned (
  returned_id bigint generated always as identity primary key,
  sales_id integer not null references public.sales_transactions(sales_id) on delete cascade,
  branch_id integer not null references public.branches(branch_id) on delete restrict,
  product_id integer not null references public.products(product_id) on delete restrict,
  quantity integer not null check (quantity > 0),
  tracking_no character varying(80) null,
  reason text null,
  created_at timestamp with time zone not null default now()
);

create index if not exists delivery_sales_id_idx on public.delivery(sales_id);
create index if not exists delivery_branch_id_idx on public.delivery(branch_id);
create index if not exists delivery_product_id_idx on public.delivery(product_id);
create index if not exists returned_sales_id_idx on public.returned(sales_id);
create index if not exists returned_branch_id_idx on public.returned(branch_id);
create index if not exists returned_product_id_idx on public.returned(product_id);
create index if not exists returned_tracking_no_idx on public.returned(tracking_no);

alter table public.delivery enable row level security;
alter table public.returned enable row level security;

grant select, insert, update, delete on public.delivery to authenticated;
grant select, insert, update, delete on public.returned to authenticated;
grant usage, select on sequence public.delivery_delivery_id_seq to authenticated;
grant usage, select on sequence public.returned_returned_id_seq to authenticated;

drop policy if exists delivery_authenticated_all on public.delivery;
create policy delivery_authenticated_all
  on public.delivery for all to authenticated using (true) with check (true);

drop policy if exists returned_authenticated_all on public.returned;
create policy returned_authenticated_all
  on public.returned for all to authenticated using (true) with check (true);
