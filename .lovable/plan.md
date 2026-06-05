## Vision

Hostiq devient une console multi-provider : **Vercel** continue de gérer les sites statiques/Next.js existants, **Render** prend en charge tout ce qui est *long-running* (Web Services, Background Workers, Cron Jobs, Private Services, Static Sites Render, Workflows) et les datastores managés (Postgres, Key Value, Disks). Les deux mondes coexistent dans la même UI, le même billing, le même org.

Ajout d'une nouvelle entité **`services`** distincte de `sites`, avec sa propre sidebar projet façon Render (MONITOR / MANAGE / DATASTORES), pilotée par un proxy serveur qui parle à l'API Render avec la clé globale Hostiq.

---

## 1. Architecture & proxy

Le proxy `external/planethoster-proxy/server.js` est renommé/étendu en **`hostiq-proxy`** (toujours déployé sur `hostiq.genesis-company.net`). Il porte deux familles de routes :

```text
/ph/*       → PlanetHoster (existant, registrar + email)
/render/*   → Render REST API v1 (nouveau)
/render/logs/subscribe   → WebSocket bridge vers Render logs WS
/render/workflows/tasks/:id/events → SSE relay
```

Auth : header `x-hostiq-secret: $PROXY_SHARED_SECRET` (déjà en place) + injection serveur de `Authorization: Bearer $RENDER_API_KEY`. Côté Hostiq, un seul nouveau secret : `RENDER_API_KEY`. Les serverFns appellent toujours le proxy, jamais Render directement — on garde l'IP allow-list et l'isolation du token.

Le proxy gère aussi : retry exponentiel sur 429, normalisation des erreurs Render (`{message, code}`), pagination cursor → page, et un endpoint `/render/health` qui valide la clé.

---

## 2. Schéma de données

Une seule migration ajoute toutes les tables. Chaque `CREATE TABLE` est suivi de ses `GRANT` (authenticated + service_role) puis RLS + policies basées sur `is_org_member(org_id, auth.uid())`.

```text
services                  ← entité racine (équivalent de sites pour Render)
  id, org_id, render_service_id, name, type ('web_service'|'private_service'
  |'background_worker'|'cron_job'|'static_site'|'workflow'), region, plan,
  runtime ('node'|'python'|'docker'|'image'|'static'), repo, branch,
  root_dir, build_command, start_command, image_url, image_registry_cred_id,
  health_check_path, suspended, auto_deploy, schedule_cron, last_deploy_at,
  prod_url, project_id (FK render projects), environment_id, created_at

service_deploys           ← historique deploys Render (séparé de la table
                            deployments Vercel existante)
service_events            ← timeline events Render (build_started, live,
                            crashed, scaled, deploy_canceled…)
service_env_vars          ← env vars + secret files par service
env_groups                ← groupes d'env partagés
env_group_vars
env_group_links           ← service ↔ env_group
service_jobs              ← one-off jobs (migrations, seeds)
service_cron_runs         ← exécutions de cron jobs
service_disks             ← disques persistants + monté sur path
disk_snapshots            ← snapshots listés (cache + expirés à 24h)

datastores                ← parent commun (type='postgres'|'key_value')
postgres_instances        ← + ha_enabled, version, ipAllowList, pitr_enabled
postgres_users
postgres_exports
postgres_recoveries       ← PITR triggers
key_value_instances       ← + maxmemory_policy, persistence
disk_snapshot_keys        ← URL signées 24h

render_projects           ← projets Render (groupe d'environnements)
render_environments       ← prod/staging/preview par projet

registry_credentials      ← Docker registry creds (chiffrées via vault)
blueprints                ← render.yaml stockés + syncs
blueprint_syncs

dedicated_ips             ← IP sets par workspace/env
header_rules              ← header rules par service
route_rules               ← redirect/rewrite rules

webhooks_render           ← webhooks Render entrants (signature secret)
log_streams               ← config log stream (Datadog/Loki/…)
metrics_streams
notification_overrides    ← overrides notif par service

render_audit_log          ← cache des audit logs Render workspace
```

Aucune table existante (`sites`, `deployments`, `domains`, etc.) n'est modifiée. Vercel reste isolé.

---

## 3. Couche API serveur

Nouveau fichier `src/api/render.server.ts` (importé uniquement via `await import` dans les handlers) + façades par domaine :

```text
src/api/render/
  services.functions.ts      services CRUD, suspend/resume/restart, scale,
                             autoscale, redeploy, rollback, purge cache,
                             create preview (image-backed)
  deploys.functions.ts       trigger, cancel, list, retrieve, rollback
  events.functions.ts        list events service, retrieve event
  envvars.functions.ts       env vars + secret files (+ env groups)
  jobs.functions.ts          one-off jobs CRUD + cancel
  cron.functions.ts          trigger + cancel cron runs
  datastores.functions.ts    postgres + key_value : CRUD, connection info
                             (révélée à la demande, jamais cachée), HA failover,
                             PITR, exports, users, suspend/resume
  disks.functions.ts         add/update/delete + snapshots + restore
  projects.functions.ts      projects + environments + move resources
  blueprints.functions.ts    validate (multipart), list, syncs, disconnect
  registry.functions.ts      registry credentials (Docker private)
  network.functions.ts       custom domains + verify DNS, dedicated IPs,
                             header rules, redirect/rewrite rules
  logs.functions.ts          list logs paginés + label/path/status filters
  metrics.functions.ts       CPU/mem/instances/bandwidth/HTTP latency/
                             requests/disk/replica lag/task runs queues
  streams.functions.ts       log_streams + metrics_streams config
  notifications.functions.ts settings owner + overrides service
  webhooks.functions.ts      CRUD webhooks Render
  audit.functions.ts         workspace + org audit logs
  workflows.functions.ts     workflows + versions + tasks + taskRuns
```

Chaque serverFn : `requireSupabaseAuth`, vérifie `is_org_member`, appelle proxy, miroir DB pour cache + RLS, log via `api_call_logs` (provider='render').

**Streaming** (logs live & workflow task SSE) : route serveur `src/routes/api/render/logs.stream.ts` qui ouvre une WS vers le proxy et la repush en SSE vers le navigateur (les WS Render ne sont pas joignables directement depuis le bundle Worker).

**Webhooks Render entrants** : `src/routes/api/public/webhooks.render.ts` — vérifie signature HMAC, met à jour `service_deploys`/`service_events`/`services.suspended`, push notif in-app.

---

## 4. UI — nouvelle console Services

### Sidebar : extension du mode actuel

`AppLayout.tsx` reçoit un 3ᵉ mode **service** (en plus de workspace et site). Le rail global gagne une entrée **« Services »** (à côté de Projects) et **« Datastores »**.

### Routes ajoutées

```text
src/routes/_app.app.services.index.tsx          Liste services (grille/liste,
                                                 filtres type/région/statut,
                                                 favoris, usage agrégé)
src/routes/_app.app.services.new.tsx            Wizard : Git import vs Docker
                                                 image vs Blueprint vs From
                                                 template. Choix type service,
                                                 région, plan, env group, disk.
src/routes/_app.app.services.$serviceId.tsx     Shell (sidebar projet Render)
  .index.tsx          Overview (statut live, derniers deploys, métriques mini)
  .events.tsx         Timeline events (cf. Render Events)
  .logs.tsx           Live logs (WS via SSE bridge) + filtres labels + search
  .metrics.tsx        Graphes (Recharts) : CPU, mémoire, HTTP req/lat, instances,
                       bandwidth par source (HTTP/WS/NAT/PrivateLink)
  .deploys.index.tsx  Liste deploys + statut + durée + rollback inline
  .deploys.$id.tsx    Détail deploy (logs build, status, cancel, redeploy,
                       rollback ici)
  .environment.tsx    Env vars + secret files + env groups liés (drag entre
                       groupes), eye-toggle valeurs
  .source.tsx         Git settings (repo, branch, auto-deploy, root dir,
                       build/start cmd) OU Image settings + registry cred
  .domains.tsx        Custom domains + verify DNS (réutilise PH DNS check)
  .scaling.tsx        Manual scale + autoscaling config (min/max/CPU/mem target)
  .jobs.index.tsx     One-off jobs : new, list, status, logs
  .jobs.$id.tsx       Détail job + logs streamés
  .crons.tsx          Pour cron_job : schedule, trigger now, runs history
  .disks.tsx          Disques attachés + snapshots + restore
  .headers.tsx        Header rules CRUD (priorité drag)
  .redirects.tsx      Redirect/rewrite rules (priorité drag)
  .preview.tsx        Image-backed preview instances
  .notifications.tsx  Overrides notifications de ce service
  .webhooks.tsx       Webhooks par service
  .settings.tsx       Plan, région (read-only), suspend/resume, delete

src/routes/_app.app.datastores.index.tsx        Liste Postgres + KV
src/routes/_app.app.datastores.new.tsx          Wizard : type, plan, région, HA
src/routes/_app.app.datastores.postgres.$id.tsx
  .index, .users, .backups (exports + PITR), .replicas, .ha, .metrics, .settings
src/routes/_app.app.datastores.kv.$id.tsx
  .index, .connection, .metrics, .settings

src/routes/_app.app.env-groups.index.tsx        Env groups list
src/routes/_app.app.env-groups.$id.tsx          Vars + secret files + linked
                                                 services

src/routes/_app.app.projects.index.tsx          Render projects/environments
src/routes/_app.app.projects.$id.tsx            Environnements + ressources
                                                 (move between envs)

src/routes/_app.app.blueprints.index.tsx        Blueprints list + sync history
src/routes/_app.app.blueprints.new.tsx          Upload render.yaml + validate
                                                 (preview du plan avant create)
src/routes/_app.app.blueprints.$id.tsx          Détail + resync + disconnect

src/routes/_app.app.registry-credentials.tsx    Docker registry creds CRUD
src/routes/_app.app.dedicated-ips.tsx           IP sets workspace/env
src/routes/_app.app.audit.tsx                   Workspace audit logs (filtres
                                                 action/user/resource/date)
src/routes/_app.app.log-streams.tsx             Config log stream + overrides
src/routes/_app.app.metrics-streams.tsx         Config metrics stream
```

### Sidebar mode service (façon Render)

```text
Workspace › Projet › <service>     ← breadcrumb

OVERVIEW
  ● Status (live/build/crashed dot)
  Events
  Logs            (live indicator si WS connectée)
  Metrics

MANAGE
  Deploys
  Environment
  Source / Image
  Domains
  Scaling
  Jobs
  Crons              (si type=cron)
  Disks
  Redirects / Rewrites
  Headers
  Preview            (si image-backed)
  Notifications
  Webhooks
  Settings           (+ Danger zone)
```

### Composants réutilisables nouveaux

- `<LiveLogPanel resourceIds source />` — WS reconnect, virtualization (~10k lignes), filtres labels, recherche, surlignage niveaux, copy/download, pause/resume.
- `<MetricsChart metric serviceId timerange />` — Recharts, multi-resource overlay, presets 1h/6h/24h/7j/30j.
- `<EventTimeline events />` — groupé par jour, icônes par type, mini-logs inline.
- `<DeployCard deploy />` — image carte type Vercel mais adaptée Render (build dur, instance count, commit).
- `<ConnectionInfoReveal />` — bouton « Show connection string » qui appelle la serverFn à la demande (jamais préchargé).
- `<SecretFileEditor />` — éditeur Monaco-light pour secret files multiligne.
- `<BlueprintPlanPreview plan />` — affichage arborescent des ressources qui seraient créées par un `render.yaml` validé.

---

## 5. Intégration billing & quotas

`/app/billing/usage` gagne une section **Render usage** alimentée par les endpoints `get-bandwidth` (avec breakdown par source), `get-cpu/memory/instance-count`, `get-disk-usage` agrégés sur tous les services de l'org. Affichage côté Vercel inchangé.

---

## 6. Migration et compatibilité

- Aucune rupture sur Vercel : `sites`, `deployments`, `domains` intacts.
- L'onglet "All Projects" du rail principal devient un sélecteur Sites Vercel ↔ Services Render (chip switch en haut), ou les deux fusionnés avec badge provider — à trancher à l'implémentation après revue visuelle.
- Settings global : nouvelle section « Render API » (statut clé via `/render/health`, dernière sync, bouton « Test connection »).

---

## 7. Détails techniques

- **Pas de `client.server` importé hors `.handler()`** : tout fetch Render encapsulé.
- **Realtime** : WS Render → SSE bridge via route TanStack `/api/render/logs.stream` ; Supabase Realtime sur tables `service_deploys`/`service_events` pour propager les webhooks aux clients ouverts.
- **Cache** : TanStack Query, staleTime adapté (services 30s, deploys 10s, metrics 60s, logs jamais cachés).
- **Pagination Render** : tous les `list*` utilisent cursor `?cursor=`, exposé en `loadMore` côté UI.
- **Erreurs externes** : retour DTO `{ data: [], error: "..." }`, jamais throw brut, errorComponent route affiche message + retry.
- **Sécurité** : connection strings Postgres/KV jamais persistées en DB, fetch à la demande, log d'accès dans `api_call_logs`.
- **Webhook Render** : secret stocké dans `webhooks_render.signing_secret`, vérif HMAC SHA-256 timing-safe.
- **Workflows / Tasks SSE** : route SSE dédiée, EventSource côté client avec reconnect.

---

## 8. Secrets à ajouter (1 seul)

- `RENDER_API_KEY` — clé API Render globale Hostiq (rs_…). Demandée après approbation du plan.

`PROXY_SHARED_SECRET` et `PLANETHOSTER_PROXY_URL` déjà présents.

---

## 9. Découpage de livraison interne (pour suivi)

```text
A. Proxy + secret + render.server.ts + serviceFn squelette + health check
B. Migration DB complète + types regénérés
C. CRUD services (Web/Worker/Cron/Private) + wizard new + sidebar mode service
D. Deploys + events + logs (WS→SSE) + metrics Recharts
E. Environment (vars + secret files + env groups)
F. Datastores Postgres complet (HA, PITR, users, exports) + KV + disks/snapshots
G. Jobs + cron runs + scaling + autoscale + domains + headers + redirects + preview
H. Projects/environments + blueprints (validate + plan preview) + registry creds
I. Dedicated IPs + log/metrics streams + notif overrides + webhooks Render + audit
J. Billing usage Render + polish + tests E2E des workflows clés
```

Tout est livré en un seul plan, mais le découpage interne permet de progresser par tranches vérifiables sans casser l'app entre deux.