
do $$
declare
  administrator_id uuid := '203129ad-2fbb-4507-aeb5-6d5d42d01b06';
begin
  if not exists (
    select 1
    from auth.users
    where id = administrator_id
  ) then
    raise exception 'User not found in Supabase Auth';
  end if;

  insert into public.assignment_admins (user_id)
  values (administrator_id)
  on conflict (user_id) do nothing;
end;
$$;
