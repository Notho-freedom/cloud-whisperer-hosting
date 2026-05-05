create table if not exists public.domain_orders (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  domain_name text not null,
  sld text not null,
  tld text not null,
  term_years integer not null check (term_years between 1 and 10),
  currency_code text not null,
  quoted_register_price numeric(10,2) not null,
  quoted_renew_price numeric(10,2),
  status text not null default 'quoted',
  quote_expires_at timestamptz not null,
  stripe_checkout_session_id text unique,
  stripe_payment_status text,
  registrar_order_id text,
  registrar_purchase_status text,
  registrant jsonb not null default '{}'::jsonb,
  provider_snapshot jsonb not null default '{}'::jsonb,
  error_message text,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.domain_orders enable row level security;

create policy "domain orders org read"
on public.domain_orders
for select
using (public.is_org_member(org_id, auth.uid()) or public.has_role(auth.uid(), 'admin'));

create policy "domain orders org write"
on public.domain_orders
for all
using (public.is_org_member(org_id, auth.uid()));

create index if not exists idx_domain_orders_org_created_at
on public.domain_orders (org_id, created_at desc);

create index if not exists idx_domain_orders_domain_name
on public.domain_orders (domain_name);

drop trigger if exists t_domain_orders on public.domain_orders;
create trigger t_domain_orders
before update on public.domain_orders
for each row execute function public.touch_updated_at();
