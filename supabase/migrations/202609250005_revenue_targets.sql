create table if not exists public.revenue_targets (
  target_id bigint generated always as identity primary key,
  branch_id integer not null references public.branches(branch_id) on delete cascade,
  period_start date not null,
  period_end date not null,
  target_revenue integer not null check (target_revenue > 0),
  created_at timestamptz not null default now(),
  constraint revenue_targets_valid_period check (
    period_start = date_trunc('month', period_start)::date
    and period_end = (date_trunc('month', period_start) + interval '1 month - 1 day')::date
    and period_end >= period_start
  ),
  constraint revenue_targets_branch_period_unique unique (branch_id, period_start, period_end)
);

create index if not exists revenue_targets_period_idx
  on public.revenue_targets (period_start desc, branch_id);

alter table public.revenue_targets enable row level security;
grant select, insert, update, delete on public.revenue_targets to authenticated;
grant usage, select on sequence public.revenue_targets_target_id_seq to authenticated;

drop policy if exists revenue_targets_authenticated_all on public.revenue_targets;
create policy revenue_targets_authenticated_all
  on public.revenue_targets
  for all
  to authenticated
  using (true)
  with check (true);
