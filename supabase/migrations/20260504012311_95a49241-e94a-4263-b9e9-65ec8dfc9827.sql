
-- GitHub connections
create table if not exists public.github_connections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique,
  github_user_id text not null,
  username text not null,
  avatar_url text,
  access_token text not null,
  scopes text[] default array[]::text[],
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);
alter table public.github_connections enable row level security;
create policy "gh self read" on public.github_connections for select using (auth.uid() = user_id);
create policy "gh self delete" on public.github_connections for delete using (auth.uid() = user_id);
-- writes only via service role (no insert/update policy)

-- Plans (catalog)
create table if not exists public.plans (
  id text primary key,
  name text not null,
  price_cents integer not null default 0,
  currency text not null default 'EUR',
  description text,
  features jsonb not null default '[]'::jsonb,
  popular boolean default false,
  stripe_price_id text,
  sort_order integer default 0,
  created_at timestamp with time zone not null default now()
);
alter table public.plans enable row level security;
create policy "plans public read" on public.plans for select using (true);
create policy "plans admin write" on public.plans for all using (has_role(auth.uid(), 'admin'));

insert into public.plans (id, name, price_cents, description, features, popular, sort_order) values
  ('starter', 'Starter', 0, 'Pour démarrer un projet personnel.', '["1 site","1 boîte email","100 GB bande passante","Support communautaire"]'::jsonb, false, 1),
  ('pro', 'Pro', 1900, 'Pour freelances et petites équipes.', '["10 sites","1 domaine .com inclus","5 boîtes email pro","1 TB bande passante","Support prioritaire"]'::jsonb, true, 2),
  ('business', 'Business', 7900, 'Pour scale-ups et agences.', '["Sites illimités","5 domaines inclus","25 boîtes email","5 TB bande passante","Support 24/7","Audit logs & SSO"]'::jsonb, false, 3)
on conflict (id) do nothing;

-- Idempotent org creation function (used as fallback in server fns)
create or replace function public.ensure_user_org(_user uuid)
returns uuid language plpgsql security definer set search_path = public as $$
declare _org uuid;
declare _email text;
begin
  select id into _org from public.organizations where owner_id = _user order by created_at asc limit 1;
  if _org is not null then return _org; end if;
  select email into _email from public.profiles where id = _user;
  insert into public.organizations (name, slug, owner_id)
  values (coalesce(_email, 'workspace') || '''s workspace',
          'org_' || substr(replace(_user::text,'-',''),1,12), _user)
  returning id into _org;
  insert into public.organization_members (org_id, user_id, role) values (_org, _user, 'owner')
  on conflict do nothing;
  return _org;
end; $$;
