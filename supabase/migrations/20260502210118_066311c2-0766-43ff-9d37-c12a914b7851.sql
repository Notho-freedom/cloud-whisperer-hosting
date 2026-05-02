
-- Fix search_path on touch_updated_at and handle_new_org (already set on others)
create or replace function public.touch_updated_at()
returns trigger language plpgsql set search_path = public as $$
begin new.updated_at = now(); return new; end; $$;

create or replace function public.handle_new_org()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.organization_members(org_id, user_id, role) values (new.id, new.owner_id, 'owner');
  return new;
end; $$;

-- Restrict EXECUTE on internal SECURITY DEFINER functions (only triggers / server use them)
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_new_org() from public, anon, authenticated;
revoke execute on function public.is_org_member(uuid, uuid) from public, anon;
revoke execute on function public.has_role(uuid, public.app_role) from public, anon;
-- has_role / is_org_member still need authenticated (used in RLS)
grant execute on function public.has_role(uuid, public.app_role) to authenticated;
grant execute on function public.is_org_member(uuid, uuid) to authenticated;
