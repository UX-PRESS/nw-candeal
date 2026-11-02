-- Optional, illustrative schedule data. Run only after the migration.
-- These records are examples and do not represent real congregation information.
insert into public.assignments (
  id,
  meeting_date,
  meeting_type,
  section,
  title,
  participant_name,
  assistant_name,
  notes,
  start_time,
  duration_minutes
)
values
  (
    'e1000000-0000-4000-8000-000000000001',
    date_trunc('week', current_date::timestamp)::date + 2,
    'midweek',
    'Tesouros da Palavra de Deus',
    'Joias espirituais',
    'Participante de demonstração',
    null,
    'Registro fictício para verificar a integração.',
    '19:30',
    10
  ),
  (
    'e1000000-0000-4000-8000-000000000002',
    date_trunc('week', current_date::timestamp)::date + 5,
    'weekend',
    'Discurso público',
    'Tema de demonstração',
    'Orador de demonstração',
    null,
    'Registro fictício para verificar a integração.',
    '18:00',
    30
  )
on conflict (id) do update set
  meeting_date = excluded.meeting_date,
  meeting_type = excluded.meeting_type,
  section = excluded.section,
  title = excluded.title,
  participant_name = excluded.participant_name,
  assistant_name = excluded.assistant_name,
  notes = excluded.notes,
  start_time = excluded.start_time,
  duration_minutes = excluded.duration_minutes;
