create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  meeting_date date not null,
  meeting_type text not null
    check (meeting_type in ('midweek', 'weekend')),
  section text not null check (char_length(section) between 1 and 100),
  title text not null check (char_length(title) between 1 and 120),
  participant_name text not null
    check (char_length(participant_name) between 1 and 100),
  assistant_name text
    check (assistant_name is null or char_length(assistant_name) <= 100),
  notes text
    check (notes is null or char_length(notes) <= 500),
  start_time time without time zone,
  duration_minutes integer
    check (duration_minutes is null or duration_minutes between 1 and 240),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists assignments_meeting_date_idx
  on public.assignments (meeting_date);

create index if not exists assignments_meeting_type_idx
  on public.assignments (meeting_type);

create table if not exists public.assignment_admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.assignments enable row level security;
alter table public.assignment_admins enable row level security;

revoke all on table public.assignments from public, anon, authenticated;
grant select, delete on table public.assignments to authenticated;
grant insert (
  meeting_date,
  meeting_type,
  section,
  title,
  participant_name,
  assistant_name,
  notes,
  start_time,
  duration_minutes
) on public.assignments to authenticated;
grant update (
  meeting_date,
  meeting_type,
  section,
  title,
  participant_name,
  assistant_name,
  notes,
  start_time,
  duration_minutes
) on public.assignments to authenticated;

revoke all on table public.assignment_admins from public, anon, authenticated;

create or replace function public.is_assignment_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.assignment_admins
    where user_id = (select auth.uid())
  );
$$;

revoke all on function public.is_assignment_admin()
  from public, anon, authenticated;
grant execute on function public.is_assignment_admin() to authenticated;

create or replace function public.set_assignment_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists assignments_set_updated_at on public.assignments;
create trigger assignments_set_updated_at
before update on public.assignments
for each row
execute function public.set_assignment_updated_at();

revoke all on function public.set_assignment_updated_at()
  from public, anon, authenticated;

drop policy if exists "Authenticated users can view assignments"
  on public.assignments;
create policy "Authenticated users can view assignments"
  on public.assignments
  for select
  to authenticated
  using (true);

drop policy if exists "Administrators can create assignments"
  on public.assignments;
create policy "Administrators can create assignments"
  on public.assignments
  for insert
  to authenticated
  with check ((select public.is_assignment_admin()));

drop policy if exists "Administrators can update assignments"
  on public.assignments;
create policy "Administrators can update assignments"
  on public.assignments
  for update
  to authenticated
  using ((select public.is_assignment_admin()))
  with check ((select public.is_assignment_admin()));

drop policy if exists "Administrators can delete assignments"
  on public.assignments;
create policy "Administrators can delete assignments"
  on public.assignments
  for delete
  to authenticated
  using ((select public.is_assignment_admin()));
