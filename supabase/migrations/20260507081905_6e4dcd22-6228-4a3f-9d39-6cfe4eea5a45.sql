create table public.site_uploads (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  deployment_id uuid references public.deployments(id) on delete set null,
  manifest jsonb not null default '[]'::jsonb,
  total_bytes bigint not null default 0,
  created_at timestamptz not null default now()
);

create index site_uploads_site_idx on public.site_uploads(site_id);

alter table public.site_uploads enable row level security;

create policy "site_uploads org read" on public.site_uploads
  for select using (
    exists (select 1 from public.sites s
      where s.id = site_uploads.site_id
        and (public.is_org_member(s.org_id, auth.uid()) or public.has_role(auth.uid(), 'admin'::app_role)))
  );

create policy "site_uploads org write" on public.site_uploads
  for all using (
    exists (select 1 from public.sites s
      where s.id = site_uploads.site_id
        and public.is_org_member(s.org_id, auth.uid()))
  );