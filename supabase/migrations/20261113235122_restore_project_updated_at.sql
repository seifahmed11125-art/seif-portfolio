-- The existing projects_updated_at trigger writes this column on updates.
alter table public.projects add column if not exists updated_at timestamp with time zone;
