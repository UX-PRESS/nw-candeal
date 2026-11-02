-- Read-only checks for the existing Agenda Congregação access setup.
-- Replace the email below with the administrator's Supabase Auth email.

-- Check which expected database objects exist in this project.
select
  objects.object_name,
  to_regclass(objects.object_name) as relation
from (
  values
    ('public.assignments'),
    ('public.assignment_admins'),
    ('public.participants')
) as objects(object_name)
order by objects.object_name;

select
  procedures.oid::regprocedure as function_signature,
  procedures.prosecdef as is_security_definer,
  has_function_privilege(
    'authenticated',
    procedures.oid,
    'execute'
  ) as authenticated_can_execute
from pg_proc as procedures
join pg_namespace as namespaces
  on namespaces.oid = procedures.pronamespace
where namespaces.nspname = 'public'
  and procedures.proname = 'is_assignment_admin';

-- Review all current policies without changing them.
select
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in ('assignments', 'participants', 'assignment_admins')
order by tablename, policyname;

-- Review RLS status for tables that exist.
select
  classes.relname as table_name,
  classes.relrowsecurity as row_level_security_enabled,
  classes.relforcerowsecurity as row_level_security_forced
from pg_class as classes
join pg_namespace as namespaces
  on namespaces.oid = classes.relnamespace
where namespaces.nspname = 'public'
  and classes.relname in ('assignments', 'participants', 'assignment_admins')
order by classes.relname;

-- Review every administrator membership and whether the target account is listed.
-- Run only if public.assignment_admins exists.
select
  exists (
    select 1
    from auth.users as users
    join public.assignment_admins as admins
      on admins.user_id = users.id
    where lower(users.email) = lower('replace-with-admin-email@example.com')
  ) as target_account_is_admin,
  (select count(*) from public.assignment_admins) as administrator_membership_count;

-- Simulate the administrator's authenticated subject within this transaction
-- and check the same helper the application uses. The rollback restores claims.
-- Run only if public.is_assignment_admin() exists.
begin;

select set_config(
  'request.jwt.claim.sub',
  (
    select id::text
    from auth.users
    where lower(email) = lower('replace-with-admin-email@example.com')
  ),
  true
);

select
  auth.uid() is not null as account_was_resolved,
  public.is_assignment_admin() as helper_recognizes_administrator;

rollback;
