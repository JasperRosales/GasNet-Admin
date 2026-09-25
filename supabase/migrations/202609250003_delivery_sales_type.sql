alter table public.sales_transactions drop constraint if exists sales_transactions_transaction_type_check;
alter table public.sales_transactions add constraint sales_transactions_transaction_type_check check (transaction_type in ('Instore', 'Commercial', 'Delivery'));
