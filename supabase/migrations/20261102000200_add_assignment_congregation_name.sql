alter table public.assignments
  add column if not exists congregation_name text;

grant insert (congregation_name)
  on public.assignments to authenticated;

grant update (congregation_name)
  on public.assignments to authenticated;
