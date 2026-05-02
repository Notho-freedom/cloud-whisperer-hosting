
-- ============ ROLES ============
create type public.app_role as enum ('user', 'admin', 'support');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  avatar_url text,
  locale text default 'fr',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.user_roles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role app_role not null,
  created_at timestamptz not null default now(),
  unique (user_id, role)
);

alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;

create or replace function public.has_role(_user_id uuid, _role app_role)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role = _role)
$$;

-- profiles policies
create policy "profiles self read" on public.profiles for select using (auth.uid() = id);
create policy "profiles self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles admin read" on public.profiles for select using (public.has_role(auth.uid(), 'admin'));

-- user_roles policies
create policy "roles self read" on public.user_roles for select using (auth.uid() = user_id);
create policy "roles admin read" on public.user_roles for select using (public.has_role(auth.uid(), 'admin'));
create policy "roles admin manage" on public.user_roles for all using (public.has_role(auth.uid(), 'admin'));

-- handle_new_user trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)));
  insert into public.user_roles (user_id, role) values (new.id, 'user');
  -- create personal organization
  insert into public.organizations (name, slug, owner_id)
  values (coalesce(new.raw_user_meta_data->>'name', split_part(new.email,'@',1)) || '''s workspace',
          'org_' || substr(replace(new.id::text,'-',''),1,12),
          new.id);
  return new;
end; $$;

-- ============ ORGS ============
create table public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  owner_id uuid not null references auth.users(id) on delete cascade,
  plan_id text not null default 'starter',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create type public.org_role as enum ('owner','admin','member','billing','viewer');

create table public.organization_members (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role org_role not null default 'member',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;

create or replace function public.is_org_member(_org uuid, _user uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.organizations o where o.id=_org and o.owner_id=_user
    union
    select 1 from public.organization_members m where m.org_id=_org and m.user_id=_user
  )
$$;

create policy "orgs read members" on public.organizations for select using (public.is_org_member(id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "orgs owner update" on public.organizations for update using (owner_id = auth.uid());
create policy "orgs owner insert" on public.organizations for insert with check (owner_id = auth.uid());
create policy "members read" on public.organization_members for select using (public.is_org_member(org_id, auth.uid()));
create policy "members manage by owner" on public.organization_members for all using (
  exists (select 1 from public.organizations o where o.id=org_id and o.owner_id=auth.uid())
);

-- now trigger for new user (orgs table exists)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- helper: insert org_member when org created
create or replace function public.handle_new_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.organization_members(org_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end; $$;
create trigger on_org_created after insert on public.organizations
  for each row execute function public.handle_new_org();

-- ============ DOMAINS ============
create table public.domains (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null unique,
  tld text not null,
  status text not null default 'pending',
  registered_at timestamptz,
  expires_at timestamptz,
  auto_renew boolean default true,
  locked boolean default true,
  privacy boolean default true,
  nameservers text[] default array['ns1.hostiq.io','ns2.hostiq.io'],
  registrar text default 'PlanetHoster',
  planethoster_id text,
  price_per_year numeric(10,2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.dns_records (
  id uuid primary key default gen_random_uuid(),
  domain_id uuid not null references public.domains(id) on delete cascade,
  type text not null,
  name text not null,
  value text not null,
  ttl integer not null default 3600,
  priority integer,
  created_at timestamptz not null default now()
);

alter table public.domains enable row level security;
alter table public.dns_records enable row level security;

create policy "domains org read" on public.domains for select using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "domains org write" on public.domains for all using (public.is_org_member(org_id, auth.uid()));
create policy "dns org read" on public.dns_records for select using (
  exists (select 1 from public.domains d where d.id=domain_id and (public.is_org_member(d.org_id, auth.uid()) or public.has_role(auth.uid(),'admin')))
);
create policy "dns org write" on public.dns_records for all using (
  exists (select 1 from public.domains d where d.id=domain_id and public.is_org_member(d.org_id, auth.uid()))
);

-- ============ SITES ============
create table public.sites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  name text not null,
  framework text default 'nextjs',
  prod_url text,
  domains text[] default array[]::text[],
  vercel_project_id text,
  git_repo text,
  git_branch text default 'main',
  region text default 'cdg1',
  created_at timestamptz not null default now(),
  last_deploy_at timestamptz
);

create table public.deployments (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  vercel_deployment_id text,
  status text not null default 'queued',
  branch text,
  commit_sha text,
  commit_msg text,
  author text,
  duration integer,
  target text default 'production',
  url text,
  created_at timestamptz not null default now()
);

create table public.env_vars (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references public.sites(id) on delete cascade,
  key text not null,
  value text not null,
  target text[] not null default array['production'],
  type text not null default 'plain',
  updated_at timestamptz not null default now()
);

alter table public.sites enable row level security;
alter table public.deployments enable row level security;
alter table public.env_vars enable row level security;

create policy "sites org read" on public.sites for select using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "sites org write" on public.sites for all using (public.is_org_member(org_id, auth.uid()));
create policy "deploys read" on public.deployments for select using (
  exists (select 1 from public.sites s where s.id=site_id and (public.is_org_member(s.org_id, auth.uid()) or public.has_role(auth.uid(),'admin')))
);
create policy "deploys write" on public.deployments for all using (
  exists (select 1 from public.sites s where s.id=site_id and public.is_org_member(s.org_id, auth.uid()))
);
create policy "env read" on public.env_vars for select using (
  exists (select 1 from public.sites s where s.id=site_id and public.is_org_member(s.org_id, auth.uid()))
);
create policy "env write" on public.env_vars for all using (
  exists (select 1 from public.sites s where s.id=site_id and public.is_org_member(s.org_id, auth.uid()))
);

-- ============ EMAIL ============
create table public.mailboxes (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  address text not null unique,
  domain text not null,
  provider text not null,
  plan text,
  quota_gb numeric(10,2) default 30,
  used_gb numeric(10,2) default 0,
  provider_account_id text,
  created_at timestamptz not null default now()
);

create table public.email_aliases (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid not null references public.mailboxes(id) on delete cascade,
  alias text not null,
  created_at timestamptz not null default now()
);

create table public.email_forwards (
  id uuid primary key default gen_random_uuid(),
  mailbox_id uuid not null references public.mailboxes(id) on delete cascade,
  forward_to text not null,
  created_at timestamptz not null default now()
);

alter table public.mailboxes enable row level security;
alter table public.email_aliases enable row level security;
alter table public.email_forwards enable row level security;

create policy "mb org read" on public.mailboxes for select using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "mb org write" on public.mailboxes for all using (public.is_org_member(org_id, auth.uid()));
create policy "alias read" on public.email_aliases for select using (
  exists (select 1 from public.mailboxes m where m.id=mailbox_id and public.is_org_member(m.org_id, auth.uid()))
);
create policy "alias write" on public.email_aliases for all using (
  exists (select 1 from public.mailboxes m where m.id=mailbox_id and public.is_org_member(m.org_id, auth.uid()))
);
create policy "fwd read" on public.email_forwards for select using (
  exists (select 1 from public.mailboxes m where m.id=mailbox_id and public.is_org_member(m.org_id, auth.uid()))
);
create policy "fwd write" on public.email_forwards for all using (
  exists (select 1 from public.mailboxes m where m.id=mailbox_id and public.is_org_member(m.org_id, auth.uid()))
);

-- ============ BILLING ============
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade unique,
  stripe_customer_id text,
  stripe_subscription_id text,
  plan_id text not null default 'starter',
  status text not null default 'active',
  current_period_end timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.invoices (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  stripe_invoice_id text unique,
  number text,
  amount numeric(10,2) not null,
  currency text default 'EUR',
  status text not null default 'open',
  pdf_url text,
  date timestamptz not null default now(),
  due_date timestamptz,
  items jsonb default '[]'::jsonb
);

create table public.payment_methods (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  stripe_pm_id text unique,
  type text not null default 'card',
  brand text,
  last4 text,
  exp_month integer,
  exp_year integer,
  is_default boolean default false,
  created_at timestamptz not null default now()
);

create table public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  period text not null,
  bandwidth_gb numeric(10,2) default 0,
  build_minutes integer default 0,
  recorded_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;
alter table public.invoices enable row level security;
alter table public.payment_methods enable row level security;
alter table public.usage_metrics enable row level security;

create policy "sub read" on public.subscriptions for select using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "inv read" on public.invoices for select using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'admin'));
create policy "pm read" on public.payment_methods for select using (public.is_org_member(org_id, auth.uid()));
create policy "pm write" on public.payment_methods for all using (public.is_org_member(org_id, auth.uid()));
create policy "usage read" on public.usage_metrics for select using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'admin'));

-- ============ SUPPORT ============
create table public.tickets (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  subject text not null,
  status text not null default 'open',
  priority text not null default 'normal',
  category text not null default 'other',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.ticket_messages (
  id uuid primary key default gen_random_uuid(),
  ticket_id uuid not null references public.tickets(id) on delete cascade,
  author_id uuid references auth.users(id),
  author_name text,
  is_staff boolean default false,
  body text not null,
  sent_at timestamptz not null default now()
);

alter table public.tickets enable row level security;
alter table public.ticket_messages enable row level security;

create policy "tickets read" on public.tickets for select using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'support'));
create policy "tickets write" on public.tickets for all using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(),'support'));
create policy "tmsg read" on public.ticket_messages for select using (
  exists (select 1 from public.tickets t where t.id=ticket_id and (public.is_org_member(t.org_id, auth.uid()) or public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'support')))
);
create policy "tmsg write" on public.ticket_messages for all using (
  exists (select 1 from public.tickets t where t.id=ticket_id and (public.is_org_member(t.org_id, auth.uid()) or public.has_role(auth.uid(),'support')))
);

-- ============ TEAM INVITES ============
create table public.team_invites (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role org_role not null default 'member',
  token text not null unique default encode(gen_random_bytes(24),'hex'),
  expires_at timestamptz not null default now() + interval '7 days',
  accepted_at timestamptz,
  invited_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
alter table public.team_invites enable row level security;
create policy "invites org read" on public.team_invites for select using (public.is_org_member(org_id, auth.uid()));
create policy "invites org write" on public.team_invites for all using (public.is_org_member(org_id, auth.uid()));

-- ============ API KEYS ============
create table public.api_keys (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  prefix text not null,
  hashed_key text not null,
  scopes text[] not null default array[]::text[],
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);
alter table public.api_keys enable row level security;
create policy "keys org read" on public.api_keys for select using (public.is_org_member(org_id, auth.uid()));
create policy "keys org write" on public.api_keys for all using (public.is_org_member(org_id, auth.uid()));

-- ============ NOTIFICATIONS ============
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null,
  title text not null,
  body text,
  read boolean default false,
  created_at timestamptz not null default now()
);
alter table public.notifications enable row level security;
create policy "notif self read" on public.notifications for select using (user_id = auth.uid());
create policy "notif self update" on public.notifications for update using (user_id = auth.uid());

-- ============ ADMIN LOGS ============
create table public.audit_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references auth.users(id),
  actor_email text,
  action text not null,
  target text,
  ip text,
  user_agent text,
  metadata jsonb,
  created_at timestamptz not null default now()
);
alter table public.audit_log enable row level security;
create policy "audit admin read" on public.audit_log for select using (public.has_role(auth.uid(),'admin'));

create table public.api_call_logs (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  endpoint text not null,
  method text default 'GET',
  status integer,
  latency_ms integer,
  user_id uuid references auth.users(id),
  error text,
  created_at timestamptz not null default now()
);
alter table public.api_call_logs enable row level security;
create policy "apilogs admin read" on public.api_call_logs for select using (public.has_role(auth.uid(),'admin'));

-- ============ CMS ============
create table public.blog_posts (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  title text not null,
  excerpt text,
  body text,
  author text,
  tag text,
  read_time integer default 5,
  published boolean default false,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.blog_posts enable row level security;
create policy "blog public read" on public.blog_posts for select using (published = true);
create policy "blog admin all" on public.blog_posts for all using (public.has_role(auth.uid(),'admin'));

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text,
  audience text default 'all',
  scheduled_at timestamptz,
  status text default 'scheduled',
  created_at timestamptz not null default now()
);
alter table public.announcements enable row level security;
create policy "announce read" on public.announcements for select using (auth.uid() is not null);
create policy "announce admin write" on public.announcements for all using (public.has_role(auth.uid(),'admin'));

create table public.incidents (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  severity text default 'minor',
  status text default 'investigating',
  started_at timestamptz not null default now(),
  resolved_at timestamptz,
  updates jsonb default '[]'::jsonb
);
alter table public.incidents enable row level security;
create policy "incidents public read" on public.incidents for select using (true);
create policy "incidents admin write" on public.incidents for all using (public.has_role(auth.uid(),'admin'));

-- ============ updated_at triggers ============
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end; $$;

create trigger t_profiles before update on public.profiles for each row execute function public.touch_updated_at();
create trigger t_orgs before update on public.organizations for each row execute function public.touch_updated_at();
create trigger t_domains before update on public.domains for each row execute function public.touch_updated_at();
create trigger t_subs before update on public.subscriptions for each row execute function public.touch_updated_at();
create trigger t_tickets before update on public.tickets for each row execute function public.touch_updated_at();
create trigger t_blog before update on public.blog_posts for each row execute function public.touch_updated_at();
