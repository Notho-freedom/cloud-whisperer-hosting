
-- ============================================================
-- RENDER INTEGRATION SCHEMA
-- ============================================================

-- ---------- Render projects & environments ----------
CREATE TABLE public.render_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_project_id text UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.render_projects TO authenticated;
GRANT ALL ON public.render_projects TO service_role;
ALTER TABLE public.render_projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "render_projects org read" ON public.render_projects FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "render_projects org write" ON public.render_projects FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

CREATE TABLE public.render_environments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.render_projects(id) ON DELETE CASCADE,
  render_environment_id text UNIQUE,
  name text NOT NULL,
  protected boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.render_environments TO authenticated;
GRANT ALL ON public.render_environments TO service_role;
ALTER TABLE public.render_environments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "render_envs read" ON public.render_environments FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.render_projects p
    WHERE p.id = render_environments.project_id
      AND (public.is_org_member(p.org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "render_envs write" ON public.render_environments FOR ALL
  USING (EXISTS (SELECT 1 FROM public.render_projects p
    WHERE p.id = render_environments.project_id AND public.is_org_member(p.org_id, auth.uid())));

-- ---------- Registry credentials ----------
CREATE TABLE public.registry_credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_credential_id text UNIQUE,
  name text NOT NULL,
  registry text NOT NULL,
  username text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.registry_credentials TO authenticated;
GRANT ALL ON public.registry_credentials TO service_role;
ALTER TABLE public.registry_credentials ENABLE ROW LEVEL SECURITY;
CREATE POLICY "regcred org read" ON public.registry_credentials FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "regcred org write" ON public.registry_credentials FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

-- ---------- Services (root entity) ----------
CREATE TABLE public.services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_service_id text UNIQUE,
  project_id uuid REFERENCES public.render_projects(id) ON DELETE SET NULL,
  environment_id uuid REFERENCES public.render_environments(id) ON DELETE SET NULL,
  name text NOT NULL,
  type text NOT NULL CHECK (type IN ('web_service','private_service','background_worker','cron_job','static_site','workflow')),
  runtime text CHECK (runtime IN ('node','python','ruby','go','rust','elixir','docker','image','static')),
  region text DEFAULT 'oregon',
  plan text DEFAULT 'starter',
  repo text,
  branch text DEFAULT 'main',
  root_dir text,
  build_command text,
  start_command text,
  image_url text,
  registry_credential_id uuid REFERENCES public.registry_credentials(id) ON DELETE SET NULL,
  health_check_path text,
  suspended boolean NOT NULL DEFAULT false,
  auto_deploy boolean NOT NULL DEFAULT true,
  schedule_cron text,
  prod_url text,
  status text DEFAULT 'created',
  last_deploy_at timestamptz,
  is_favorite boolean NOT NULL DEFAULT false,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.services TO authenticated;
GRANT ALL ON public.services TO service_role;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "services org read" ON public.services FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "services org write" ON public.services FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));
CREATE INDEX services_org_idx ON public.services(org_id);
CREATE INDEX services_project_idx ON public.services(project_id);
CREATE TRIGGER services_touch BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------- Service deploys ----------
CREATE TABLE public.service_deploys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  render_deploy_id text UNIQUE,
  status text NOT NULL DEFAULT 'queued',
  commit_sha text,
  commit_msg text,
  trigger text,
  image_sha text,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_deploys TO authenticated;
GRANT ALL ON public.service_deploys TO service_role;
ALTER TABLE public.service_deploys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sd read" ON public.service_deploys FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_deploys.service_id
    AND (public.is_org_member(s.org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "sd write" ON public.service_deploys FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_deploys.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE INDEX service_deploys_service_created_idx ON public.service_deploys(service_id, created_at DESC);

-- ---------- Service events ----------
CREATE TABLE public.service_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  render_event_id text UNIQUE,
  type text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_events TO authenticated;
GRANT ALL ON public.service_events TO service_role;
ALTER TABLE public.service_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "se read" ON public.service_events FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_events.service_id
    AND (public.is_org_member(s.org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'))));
CREATE POLICY "se write" ON public.service_events FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_events.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE INDEX service_events_service_occurred_idx ON public.service_events(service_id, occurred_at DESC);

-- ---------- Service env vars (direct) + secret files ----------
CREATE TABLE public.service_env_vars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  is_secret_file boolean NOT NULL DEFAULT false,
  generate_value boolean NOT NULL DEFAULT false,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(service_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_env_vars TO authenticated;
GRANT ALL ON public.service_env_vars TO service_role;
ALTER TABLE public.service_env_vars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sev read" ON public.service_env_vars FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_env_vars.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "sev write" ON public.service_env_vars FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_env_vars.service_id
    AND public.is_org_member(s.org_id, auth.uid())));

-- ---------- Env groups + vars + links ----------
CREATE TABLE public.env_groups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_env_group_id text UNIQUE,
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.env_groups TO authenticated;
GRANT ALL ON public.env_groups TO service_role;
ALTER TABLE public.env_groups ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eg read" ON public.env_groups FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "eg write" ON public.env_groups FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

CREATE TABLE public.env_group_vars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  env_group_id uuid NOT NULL REFERENCES public.env_groups(id) ON DELETE CASCADE,
  key text NOT NULL,
  value text NOT NULL,
  is_secret_file boolean NOT NULL DEFAULT false,
  UNIQUE(env_group_id, key)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.env_group_vars TO authenticated;
GRANT ALL ON public.env_group_vars TO service_role;
ALTER TABLE public.env_group_vars ENABLE ROW LEVEL SECURITY;
CREATE POLICY "egv read" ON public.env_group_vars FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.env_groups g WHERE g.id = env_group_vars.env_group_id
    AND public.is_org_member(g.org_id, auth.uid())));
CREATE POLICY "egv write" ON public.env_group_vars FOR ALL
  USING (EXISTS (SELECT 1 FROM public.env_groups g WHERE g.id = env_group_vars.env_group_id
    AND public.is_org_member(g.org_id, auth.uid())));

CREATE TABLE public.env_group_links (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  env_group_id uuid NOT NULL REFERENCES public.env_groups(id) ON DELETE CASCADE,
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  UNIQUE(env_group_id, service_id)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.env_group_links TO authenticated;
GRANT ALL ON public.env_group_links TO service_role;
ALTER TABLE public.env_group_links ENABLE ROW LEVEL SECURITY;
CREATE POLICY "egl read" ON public.env_group_links FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = env_group_links.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "egl write" ON public.env_group_links FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = env_group_links.service_id
    AND public.is_org_member(s.org_id, auth.uid())));

-- ---------- Service one-off jobs ----------
CREATE TABLE public.service_jobs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  render_job_id text UNIQUE,
  start_command text NOT NULL,
  plan_id text,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz,
  finished_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_jobs TO authenticated;
GRANT ALL ON public.service_jobs TO service_role;
ALTER TABLE public.service_jobs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sj read" ON public.service_jobs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_jobs.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "sj write" ON public.service_jobs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_jobs.service_id
    AND public.is_org_member(s.org_id, auth.uid())));

-- ---------- Cron runs ----------
CREATE TABLE public.service_cron_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_cron_runs TO authenticated;
GRANT ALL ON public.service_cron_runs TO service_role;
ALTER TABLE public.service_cron_runs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "scr read" ON public.service_cron_runs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_cron_runs.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "scr write" ON public.service_cron_runs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_cron_runs.service_id
    AND public.is_org_member(s.org_id, auth.uid())));

-- ---------- Disks + snapshots ----------
CREATE TABLE public.service_disks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  render_disk_id text UNIQUE,
  name text NOT NULL,
  mount_path text NOT NULL,
  size_gb integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.service_disks TO authenticated;
GRANT ALL ON public.service_disks TO service_role;
ALTER TABLE public.service_disks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sd2 read" ON public.service_disks FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_disks.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "sd2 write" ON public.service_disks FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = service_disks.service_id
    AND public.is_org_member(s.org_id, auth.uid())));

CREATE TABLE public.disk_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  disk_id uuid NOT NULL REFERENCES public.service_disks(id) ON DELETE CASCADE,
  render_snapshot_key text,
  taken_at timestamptz NOT NULL DEFAULT now(),
  key_expires_at timestamptz
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.disk_snapshots TO authenticated;
GRANT ALL ON public.disk_snapshots TO service_role;
ALTER TABLE public.disk_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ds read" ON public.disk_snapshots FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.service_disks d JOIN public.services s ON s.id=d.service_id
    WHERE d.id = disk_snapshots.disk_id AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "ds write" ON public.disk_snapshots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.service_disks d JOIN public.services s ON s.id=d.service_id
    WHERE d.id = disk_snapshots.disk_id AND public.is_org_member(s.org_id, auth.uid())));

-- ---------- Datastores: Postgres + Key Value ----------
CREATE TABLE public.postgres_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_postgres_id text UNIQUE,
  project_id uuid REFERENCES public.render_projects(id) ON DELETE SET NULL,
  environment_id uuid REFERENCES public.render_environments(id) ON DELETE SET NULL,
  name text NOT NULL,
  database_name text,
  region text DEFAULT 'oregon',
  plan text DEFAULT 'starter',
  version text DEFAULT '16',
  ha_enabled boolean NOT NULL DEFAULT false,
  pitr_enabled boolean NOT NULL DEFAULT false,
  suspended boolean NOT NULL DEFAULT false,
  ip_allow_list jsonb NOT NULL DEFAULT '[]'::jsonb,
  status text DEFAULT 'creating',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postgres_instances TO authenticated;
GRANT ALL ON public.postgres_instances TO service_role;
ALTER TABLE public.postgres_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pg read" ON public.postgres_instances FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "pg write" ON public.postgres_instances FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));
CREATE TRIGGER pg_touch BEFORE UPDATE ON public.postgres_instances
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

CREATE TABLE public.postgres_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.postgres_instances(id) ON DELETE CASCADE,
  username text NOT NULL,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(instance_id, username)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postgres_users TO authenticated;
GRANT ALL ON public.postgres_users TO service_role;
ALTER TABLE public.postgres_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pgu read" ON public.postgres_users FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.postgres_instances i WHERE i.id = postgres_users.instance_id
    AND public.is_org_member(i.org_id, auth.uid())));
CREATE POLICY "pgu write" ON public.postgres_users FOR ALL
  USING (EXISTS (SELECT 1 FROM public.postgres_instances i WHERE i.id = postgres_users.instance_id
    AND public.is_org_member(i.org_id, auth.uid())));

CREATE TABLE public.postgres_exports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.postgres_instances(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  download_url text,
  expires_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postgres_exports TO authenticated;
GRANT ALL ON public.postgres_exports TO service_role;
ALTER TABLE public.postgres_exports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pge read" ON public.postgres_exports FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.postgres_instances i WHERE i.id = postgres_exports.instance_id
    AND public.is_org_member(i.org_id, auth.uid())));
CREATE POLICY "pge write" ON public.postgres_exports FOR ALL
  USING (EXISTS (SELECT 1 FROM public.postgres_instances i WHERE i.id = postgres_exports.instance_id
    AND public.is_org_member(i.org_id, auth.uid())));

CREATE TABLE public.postgres_recoveries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  instance_id uuid NOT NULL REFERENCES public.postgres_instances(id) ON DELETE CASCADE,
  target_time timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.postgres_recoveries TO authenticated;
GRANT ALL ON public.postgres_recoveries TO service_role;
ALTER TABLE public.postgres_recoveries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pgr read" ON public.postgres_recoveries FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.postgres_instances i WHERE i.id = postgres_recoveries.instance_id
    AND public.is_org_member(i.org_id, auth.uid())));
CREATE POLICY "pgr write" ON public.postgres_recoveries FOR ALL
  USING (EXISTS (SELECT 1 FROM public.postgres_instances i WHERE i.id = postgres_recoveries.instance_id
    AND public.is_org_member(i.org_id, auth.uid())));

CREATE TABLE public.key_value_instances (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_kv_id text UNIQUE,
  project_id uuid REFERENCES public.render_projects(id) ON DELETE SET NULL,
  environment_id uuid REFERENCES public.render_environments(id) ON DELETE SET NULL,
  name text NOT NULL,
  region text DEFAULT 'oregon',
  plan text DEFAULT 'starter',
  maxmemory_policy text DEFAULT 'allkeys-lru',
  persistence text DEFAULT 'none',
  suspended boolean NOT NULL DEFAULT false,
  status text DEFAULT 'creating',
  ip_allow_list jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.key_value_instances TO authenticated;
GRANT ALL ON public.key_value_instances TO service_role;
ALTER TABLE public.key_value_instances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "kv read" ON public.key_value_instances FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "kv write" ON public.key_value_instances FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));
CREATE TRIGGER kv_touch BEFORE UPDATE ON public.key_value_instances
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- ---------- Blueprints ----------
CREATE TABLE public.blueprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_blueprint_id text UNIQUE,
  name text NOT NULL,
  yaml text NOT NULL,
  last_sync_at timestamptz,
  last_sync_status text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blueprints TO authenticated;
GRANT ALL ON public.blueprints TO service_role;
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bp read" ON public.blueprints FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "bp write" ON public.blueprints FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

CREATE TABLE public.blueprint_syncs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blueprint_id uuid NOT NULL REFERENCES public.blueprints(id) ON DELETE CASCADE,
  status text NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.blueprint_syncs TO authenticated;
GRANT ALL ON public.blueprint_syncs TO service_role;
ALTER TABLE public.blueprint_syncs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bps read" ON public.blueprint_syncs FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.blueprints b WHERE b.id = blueprint_syncs.blueprint_id
    AND public.is_org_member(b.org_id, auth.uid())));
CREATE POLICY "bps write" ON public.blueprint_syncs FOR ALL
  USING (EXISTS (SELECT 1 FROM public.blueprints b WHERE b.id = blueprint_syncs.blueprint_id
    AND public.is_org_member(b.org_id, auth.uid())));

-- ---------- Dedicated IPs ----------
CREATE TABLE public.dedicated_ips (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_ip_set_id text UNIQUE,
  name text NOT NULL,
  region text NOT NULL,
  status text NOT NULL DEFAULT 'creating',
  ips jsonb NOT NULL DEFAULT '[]'::jsonb,
  environment_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dedicated_ips TO authenticated;
GRANT ALL ON public.dedicated_ips TO service_role;
ALTER TABLE public.dedicated_ips ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dip read" ON public.dedicated_ips FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "dip write" ON public.dedicated_ips FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

-- ---------- Header rules + redirect/rewrite ----------
CREATE TABLE public.header_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  render_rule_id text,
  path text NOT NULL DEFAULT '/*',
  name text NOT NULL,
  value text NOT NULL,
  priority integer NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.header_rules TO authenticated;
GRANT ALL ON public.header_rules TO service_role;
ALTER TABLE public.header_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hr read" ON public.header_rules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = header_rules.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "hr write" ON public.header_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = header_rules.service_id
    AND public.is_org_member(s.org_id, auth.uid())));

CREATE TABLE public.route_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  render_rule_id text,
  type text NOT NULL CHECK (type IN ('redirect','rewrite')),
  source text NOT NULL,
  destination text NOT NULL,
  priority integer NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.route_rules TO authenticated;
GRANT ALL ON public.route_rules TO service_role;
ALTER TABLE public.route_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rr read" ON public.route_rules FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = route_rules.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "rr write" ON public.route_rules FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = route_rules.service_id
    AND public.is_org_member(s.org_id, auth.uid())));

-- ---------- Log / metrics streams ----------
CREATE TABLE public.log_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  endpoint text NOT NULL,
  token text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.log_streams TO authenticated;
GRANT ALL ON public.log_streams TO service_role;
ALTER TABLE public.log_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ls read" ON public.log_streams FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ls write" ON public.log_streams FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

CREATE TABLE public.metrics_streams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  endpoint text NOT NULL,
  token text,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.metrics_streams TO authenticated;
GRANT ALL ON public.metrics_streams TO service_role;
ALTER TABLE public.metrics_streams ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ms read" ON public.metrics_streams FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "ms write" ON public.metrics_streams FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

-- ---------- Webhooks Render ----------
CREATE TABLE public.webhooks_render (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_webhook_id text UNIQUE,
  endpoint text NOT NULL,
  signing_secret text,
  events jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.webhooks_render TO authenticated;
GRANT ALL ON public.webhooks_render TO service_role;
ALTER TABLE public.webhooks_render ENABLE ROW LEVEL SECURITY;
CREATE POLICY "wr read" ON public.webhooks_render FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "wr write" ON public.webhooks_render FOR ALL
  USING (public.is_org_member(org_id, auth.uid()));

-- ---------- Audit log Render (cached) ----------
CREATE TABLE public.render_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id uuid NOT NULL,
  render_event_id text UNIQUE,
  actor text,
  action text,
  resource text,
  details jsonb NOT NULL DEFAULT '{}'::jsonb,
  occurred_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.render_audit_log TO authenticated;
GRANT ALL ON public.render_audit_log TO service_role;
ALTER TABLE public.render_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ral read" ON public.render_audit_log FOR SELECT
  USING (public.is_org_member(org_id, auth.uid()) OR public.has_role(auth.uid(),'admin'));

-- ---------- Notification overrides ----------
CREATE TABLE public.notification_overrides (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  event_type text NOT NULL,
  notify_via jsonb NOT NULL DEFAULT '[]'::jsonb,
  UNIQUE(service_id, event_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notification_overrides TO authenticated;
GRANT ALL ON public.notification_overrides TO service_role;
ALTER TABLE public.notification_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no read" ON public.notification_overrides FOR SELECT
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = notification_overrides.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
CREATE POLICY "no write" ON public.notification_overrides FOR ALL
  USING (EXISTS (SELECT 1 FROM public.services s WHERE s.id = notification_overrides.service_id
    AND public.is_org_member(s.org_id, auth.uid())));
