# Bascule Hostiq vers un vrai backend

Aujourd'hui, l'app est 100% UI + mocks (`src/lib/mocks.ts`) et l'auth est en `localStorage`. On passe à une architecture serveur réelle, sans casser l'UI existante.

## Stack cible

- **Lovable Cloud** (Supabase managé) → base de données, auth, RLS, storage
- **TanStack Start `createServerFn**` → toute la logique serveur (jamais d'appels API tiers depuis le client)
- **APIs externes branchées via server functions** :
  - PlanetHoster API → recherche / achat / DNS / WHOIS de domaines
  - Vercel API → projets, déploiements, domaines, env vars, logs, analytics
  - Stripe → plans, abonnements, factures, moyens de paiement
  - Resend → emails transactionnels
  - Google Workspace / Microsoft 365 / Zoho → mailboxes (Phase 6)
- **Secrets** : stockés via Lovable Secrets, lus uniquement dans `.handler()` côté serveur

## Architecture serveur

```text
src/
├── server/
│   ├── auth.server.ts            # helpers session Supabase
│   ├── auth.functions.ts         # signup/login/logout/2fa
│   ├── domains.server.ts         # client PlanetHoster
│   ├── domains.functions.ts      # search, register, dns, whois, transfer
│   ├── sites.server.ts           # client Vercel
│   ├── sites.functions.ts        # projects, deployments, env, domains
│   ├── email.server.ts           # adapters multi-providers
│   ├── email.functions.ts        # mailboxes, aliases, forwards
│   ├── billing.server.ts         # client Stripe
│   ├── billing.functions.ts      # plan, invoices, payment methods, usage
│   ├── support.functions.ts      # tickets (DB)
│   ├── team.functions.ts         # membres + invites (Resend)
│   ├── apikeys.functions.ts      # gen/revoke clés API Hostiq
│   ├── notifications.functions.ts
│   └── admin.functions.ts        # KPIs, users, audit, providers status
└── routes/api/public/
    ├── webhooks.stripe.ts        # signature vérifiée
    ├── webhooks.vercel.ts        # deploy events
    └── webhooks.planethoster.ts  # domain events
```

Toutes les routes UI restent — on remplace juste l'import des mocks par un appel `useQuery(serverFn)` via TanStack Query (déjà installé).

## Schéma base de données (Lovable Cloud)

Tables principales (toutes avec RLS `user_id = auth.uid()` sauf admin) :

- `profiles` (id ↔ auth.users, name, avatar_url, locale, created_at)
- `app_role` enum (`user`, `admin`, `support`) + `user_roles` table + fonction `has_role()` security definer (jamais sur profiles)
- `organizations` + `organization_members` (rôles owner/admin/member/billing/viewer)
- `domains` (org_id, name, planethoster_id, status, expires_at, autorenew, locked, privacy)
- `dns_records` (domain_id, type, name, value, ttl, priority) — miroir cache
- `sites` (org_id, vercel_project_id, name, framework, prod_url, git_repo, region)
- `deployments` (site_id, vercel_deployment_id, status, sha, msg, target, url) — cache
- `mailboxes` (org_id, address, domain, provider, plan, quota_gb, used_gb, provider_account_id)
- `email_aliases`, `email_forwards`
- `subscriptions` (org_id, stripe_customer_id, stripe_sub_id, plan_id, status, current_period_end)
- `invoices` (org_id, stripe_invoice_id, number, amount, status, pdf_url)
- `payment_methods` (org_id, stripe_pm_id, brand, last4, default)
- `usage_metrics` (org_id, period, bandwidth_gb, build_minutes, …)
- `tickets` + `ticket_messages` (org_id, status, priority, category)
- `team_invites` (org_id, email, role, token, expires_at)
- `api_keys` (org_id, name, hashed_key, prefix, scopes[], last_used_at)
- `notifications` (user_id, type, title, body, read)
- `audit_log` (actor_id, action, target, ip, ua, ts) — admin only
- `api_call_logs` (provider, endpoint, status, latency_ms, user_id) — admin
- `announcements`, `blog_posts`, `promo_codes`, `incidents`

Chaque table avec policies RLS strictes + triggers `updated_at`.

## Phases d'implémentation

### Phase 1 — Cloud + Auth réelle

- Activer Lovable Cloud
- Schéma : profiles, user_roles, has_role(), organizations, trigger handle_new_user
- Remplacer `src/lib/auth.tsx` par un client Supabase réel (`onAuthStateChange` + `getSession`)
- Pages `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/2fa` câblées sur Supabase Auth (email+password + Google)
- Guard route `_app` et `_admin` (redirect si non connecté / pas admin via `has_role`)

### Phase 2 — Domaines (PlanetHoster)

- Demander la clé API PlanetHoster (secret)
- `domains.server.ts` : client typé (search, register, renew, transfer, getDns, setDns, whois, lock/unlock, privacy)
- Server functions + cache DB
- Brancher `/app/domains/*` (index, search, $domain, dns)

### Phase 3 — Sites (Vercel)

- Token Vercel + Team ID (secrets)
- `sites.server.ts` : projects, deployments (poll/webhook), domains, env vars, logs, analytics
- Webhook `/api/public/webhooks/vercel` (signature)
- Brancher toutes les pages `/app/sites/*`

### Phase 4 — Billing (Stripe)

- Activer l'intégration Stripe Lovable (recommandée) → produits/prix par plan
- Customer portal pour cartes/factures
- Webhook `/api/public/webhooks/stripe` → maj `subscriptions`, `invoices`
- Brancher `/app/billing/*` + gating limites par plan
- Add-ons (mailboxes, bande passante) via metered billing

### Phase 5 — Support, Team, API Keys, Notifications

- Tickets : tables + realtime Supabase (channel par ticket)
- Team : invites par email (Resend), accept-invite route
- API keys Hostiq : génération `hq_live_xxx`, hash en DB, middleware vérif sur futurs endpoints publics
- Notifications : insert serveur + subscribe realtime côté client

### Phase 6 — Email multi-providers + Admin

- Adapter pattern `EmailProvider` : Google Workspace Admin SDK / Microsoft Graph / Zoho Mail API
- OAuth par-utilisateur stocké en DB chiffré (chaque org connecte SON compte provider)
- UI multi-fournisseurs déjà prête → branchement via `email.server.ts`
- Admin : KPIs réels (vues SQL), user management, audit log, api_call_logs, providers status (ping périodique cron via `/api/public/cron/health`), CMS blog/annonces sur tables existantes

## Sécurité (non négociable)

- Rôles dans `user_roles` séparé, jamais sur profiles
- `has_role()` SECURITY DEFINER pour éviter récursion RLS
- Tous les secrets API serveur uniquement (`process.env` dans `.handler()`)
- Webhooks : vérification signature HMAC obligatoire avant tout traitement
- Validation Zod systématique sur `inputValidator`
- Rate-limit sur endpoints publics (api keys + webhooks)
- Audit log automatique sur actions sensibles (suspend user, delete site, transfer domain…)

## Ce qui change pour l'UI

- `src/lib/mocks.ts` reste comme **fallback dev** mais n'est plus importé en prod
- Chaque page `useQuery({ queryKey, queryFn: () => serverFn() })`
- Mutations via `useMutation` + `invalidateQueries`
- Skeletons pendant le loading (déjà dans shadcn)

## Secrets à demander au fil des phases


| Phase | Secret                                                                                                                                                                                 |
| ----- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2     | `PLANETHOSTER_API_KEY` (+ account ID) ***API User :*** 03752290defc9dcaddc3d8d49d12cd02***API Key :*** 9cc717f8bfd553c46425755dab02456a300a6cc34c60436f9a9391c72bf6c575               |
| 3     | `VERCEL_TOKEN : vcp_6l4HjQ0Pkv0L6N6uN4FP0cEkIxXgLwuexYwgFVpLvvs5DMkMTJ09I3VI`, `VERCEL_TEAM_ID : team_JGG2UHn4dAimYHRpEkYljnKv`, `VERCEL_WEBHOOK_SECRET :` hostiq_vercel_secret_2026 |
| 4     | Stripe via intégration Lovable (pas de clé manuelle)                                                                                                                                   |
| 5     | `RESEND_API_KEY : re_aCxNUbE6_BbqWbX5eN5YK18cCwDFm8SgP`                                                                                                                                |
| 6     | OAuth client IDs Google/Microsoft/Zoho (par-utilisateur, pas un secret unique)                                                                                                         |


## Ordre d'exécution proposé après approbation

1. Phase 1 complète (Cloud + auth) — base de tout le reste
2. Phase 2 (domaines) — demande clé PlanetHoster
3. Phase 3 (sites) — demande token Vercel
4. Phase 4 (billing Stripe)
5. Phase 5 (support/team/keys/notifs)
6. Phase 6 (email + admin polish)

Je peux enchaîner les phases sans m'arrêter, en demandant les secrets juste avant la phase qui en a besoin.

**Validez-vous ce plan global, ou voulez-vous ajuster l'ordre / le périmètre d'une phase ?**