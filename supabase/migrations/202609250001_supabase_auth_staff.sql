-- Auth/staff alignment with the authoritative public schema.
--
-- Supabase Auth users must be provisioned with the Supabase Admin API (for
-- example, from a trusted server-side administrative tool). They cannot be
-- created with auth.admin calls from SQL/PostgreSQL functions. Public staff
-- rows are keyed by that Auth user UUID.
--
-- Remove obsolete RPCs if an earlier deployment installed them. They depended
-- on non-schema staff columns and attempted to invoke auth.admin as SQL.
drop function if exists public.admin_create_staff(text, text, text, text, integer);
drop function if exists public.admin_update_staff_password(uuid, text);
drop function if exists public.admin_delete_staff(uuid);
drop function if exists public.current_staff_role();

-- This index is schema-safe and supports Auth UUID profile lookups. Existing
-- RLS policies are intentionally not changed here.
create index if not exists idx_staff_staff_id on public.staff (staff_id);
