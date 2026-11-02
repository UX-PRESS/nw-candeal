-- Replace this address with an existing user's email in Supabase Auth.
-- Run this script from the Supabase SQL Editor as the project owner.
do $$
declare
  administrator_id uuid;
begin
  select id
  into administrator_id
  from auth.users
  where email = 'admin@example.com';

  if administrator_id is null then
    raise exception 'No Supabase Auth user found for admin@example.com';
  end if;

  insert into public.assignment_admins (user_id)
  values (administrator_id)
  on conflict (user_id) do nothing;
end;
$$;
