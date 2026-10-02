alter table public.sales_transaction_items
  add column if not exists tracking_no character varying(80) null;

create index if not exists sales_transaction_items_tracking_no_idx
  on public.sales_transaction_items (tracking_no);
