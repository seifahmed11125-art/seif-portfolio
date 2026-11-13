alter table public.projects
  add column if not exists video_path text;

alter table public.projects enable row level security;

create policy "Portfolio projects are publicly readable"
  on public.projects for select to anon, authenticated
  using (true);

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('project-videos', 'project-videos', true, 50000000, array['video/mp4', 'video/webm'])
on conflict (id) do nothing;
