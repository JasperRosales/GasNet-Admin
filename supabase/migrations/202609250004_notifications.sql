create table if not exists public.notifications (
  notification_id bigint generated always as identity primary key,
  branch_id integer not null references public.branches(branch_id) on delete cascade,
  title text not null,
  message text not null,
  notification_type text not null default 'general',
  created_at timestamptz not null default now(),
  is_read boolean not null default false
);
create index if not exists notifications_branch_created_at_idx on public.notifications(branch_id, created_at desc);
alter table public.notifications enable row level security;
grant select, update, delete on public.notifications to authenticated;
drop policy if exists notifications_authenticated_all on public.notifications;
create policy notifications_authenticated_all on public.notifications for all to authenticated using (true) with check (true);
