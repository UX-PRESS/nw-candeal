
do $$
declare
  administrator_email text := 'anciao@adm.com';
  administrator_id uuid;
begin
  select id
  into administrator_id
  from auth.users
  where lower(email) = lower(administrator_email);

  if administrator_id is null then
    raise exception 'User not found in Supabase Auth';
  end if;

  insert into public.assignment_admins (user_id)
  values (administrator_id)
  on conflict (user_id) do nothing;
end;
$$;
