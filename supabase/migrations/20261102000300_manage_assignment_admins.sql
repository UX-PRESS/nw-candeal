do $$
begin
  if to_regclass('public.assignment_admins') is null then
    raise exception
      'Required table public.assignment_admins is missing; apply the base assignments migration first';
  end if;

  if to_regprocedure('public.is_assignment_admin()') is null then
    raise exception
      'Required function public.is_assignment_admin() is missing; apply the base assignments migration first';
  end if;
end;
$$;

create or replace function public.list_assignment_admins()
returns table (user_id uuid, email text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not coalesce(public.is_assignment_admin(), false) then
    raise exception 'Administrator access required'
      using errcode = '42501';
  end if;

  return query
  select admins.user_id, coalesce(users.email, '')
  from public.assignment_admins as admins
  join auth.users as users
    on users.id = admins.user_id
  order by lower(users.email), admins.user_id;
end;
$$;

create or replace function public.add_assignment_admin_by_email(target_email text)
returns table (user_id uuid, email text, added boolean)
language plpgsql
security definer
set search_path = ''
as $$
declare
  normalized_email text := lower(btrim(target_email));
  target_user_id uuid;
  target_user_email text;
  was_added boolean := false;
begin
  lock table public.assignment_admins in exclusive mode;

  if not coalesce(public.is_assignment_admin(), false) then
    raise exception 'Administrator access required'
      using errcode = '42501';
  end if;

  if normalized_email is null
    or normalized_email = ''
    or char_length(normalized_email) > 254
    or position('@' in normalized_email) < 2
  then
    raise exception 'A valid account email is required'
      using errcode = '22023';
  end if;

  select users.id, users.email
  into target_user_id, target_user_email
  from auth.users as users
  where lower(users.email) = normalized_email;

  if target_user_id is null then
    raise exception 'No Supabase Auth account matches this email'
      using errcode = 'P0002';
  end if;

  insert into public.assignment_admins (user_id)
  values (target_user_id)
  on conflict (user_id) do nothing
  returning true into was_added;

  return query
  select target_user_id, coalesce(target_user_email, ''), coalesce(was_added, false);
end;
$$;

create or replace function public.remove_assignment_admin(target_user_id uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  administrator_count bigint;
begin
  lock table public.assignment_admins in exclusive mode;

  if not coalesce(public.is_assignment_admin(), false) then
    raise exception 'Administrator access required'
      using errcode = '42501';
  end if;

  if not exists (
    select 1
    from public.assignment_admins as admins
    where admins.user_id = target_user_id
  ) then
    raise exception 'The selected account is not an administrator'
      using errcode = 'P0002';
  end if;

  select count(*)
  into administrator_count
  from public.assignment_admins;

  if administrator_count <= 1 then
    raise exception 'The last administrator cannot be removed'
      using errcode = 'P0001';
  end if;

  delete from public.assignment_admins as admins
  where admins.user_id = target_user_id;

  return true;
end;
$$;

revoke all on function public.list_assignment_admins()
  from public, anon, authenticated;
revoke all on function public.add_assignment_admin_by_email(text)
  from public, anon, authenticated;
revoke all on function public.remove_assignment_admin(uuid)
  from public, anon, authenticated;

grant execute on function public.list_assignment_admins()
  to authenticated;
grant execute on function public.add_assignment_admin_by_email(text)
  to authenticated;
grant execute on function public.remove_assignment_admin(uuid)
  to authenticated;
