
# Plan final — Câblage complet UI ↔ Backend

Objectif: éliminer **toutes** les références à `src/lib/mocks.ts`, brancher chaque interface au backend réel (Supabase + PlanetHoster + Vercel + Stripe + Resend), ajouter le flux **GitHub** (OAuth + déploiement de repo), corriger le bug d'achat de domaine, puis tester chaque endpoint et garantir un build vert.

## 1. Server functions manquantes

Créer / compléter dans `src/server/`:

- **`domains.functions.ts`** — ajouter: `updateDomainSettings` (autoRenew, locked, privacy, nameservers), `transferDomain`, `getTldPricing` (table TLDS persistée en DB ou statique côté serveur).
- **`sites.functions.ts`** — ajouter: `getSiteEnvVars` / `upsertEnvVar` / `deleteEnvVar` (table `env_vars`), `getDeployment` (détail), `addSiteDomain` / `removeSiteDomain` (lien domaine ↔ site Vercel), `updateSiteSettings`, `deleteSite`.
- **`email.functions.ts`** — implémenter CRUD complet: `listMailboxes`, `createMailbox`, `getMailbox`, `deleteMailbox`, `listAliases`, `createAlias`, `listForwards`, `createForward`, `listEmailProviders` (Google Workspace / IONOS / interne).
- **`billing.functions.ts`** — ajouter: `listInvoices`, `getInvoice`, `listPaymentMethods`, `setDefaultPaymentMethod`, `removePaymentMethod`, `getCurrentPlan`, `changePlan` (Stripe Checkout), `getUsage` (table `usage_metrics`).
- **`notifications.functions.ts`** — `listNotifications`, `markRead`, `markAllRead`.
- **`support.functions.ts`** — ajouter: `getTicket` + messages, `replyToTicket`, `closeTicket`.
- **`admin.functions.ts`** — étendre: `listAllUsers`, `getUser` (avec orgs/sites/domaines), `setUserRole`, `listAllSites`, `listAllDomains`, `listAllInvoices`, `listAuditLog`, `listApiLogs`, `listIncidents`, `createIncident`, `listAnnouncements`, `createAnnouncement`, `listBlogPosts`, `upsertBlogPost`, `listProviders` (santé API: PlanetHoster, Vercel, Stripe, Resend via ping), `listPlans` / `upsertPlan` (nouvelle table `plans`).

## 2. Intégration GitHub

- Ajouter une **table `github_connections`** (`user_id`, `github_user_id`, `access_token` (chiffré via service_role uniquement), `username`, `avatar_url`).
- Server route OAuth: `src/routes/api/public/github.callback.ts` — échange code → token, stocke en DB.
- Server fns: `startGithubOAuth` (génère URL `https://github.com/login/oauth/authorize` avec state), `getGithubConnection`, `listGithubRepos` (proxy `GET /user/repos`), `disconnectGithub`.
- Demander à l'utilisateur les secrets **`GITHUB_CLIENT_ID`** et **`GITHUB_CLIENT_SECRET`** (callback URL: `https://hostinq.lovable.app/api/public/github/callback`).
- UI:
  - `_app.app.settings.integrations.tsx` — bouton "Connecter GitHub" réel (au lieu du badge statique).
  - `_app.app.sites.new.tsx` — onglet "Importer depuis GitHub" avec liste de repos sélectionnable; createSite passe `gitRepo` à Vercel.

## 3. Correction bug achat de domaine

Le bug actuel vient probablement de:
- `searchDomain` qui throw au lieu de fallback propre quand PH renvoie 401/404,
- `registerDomain` qui ne gère pas le cas "no organization for user" si trigger handle_new_user n'a pas tourné pour comptes existants.

Corrections:
- Wrapper `searchDomain` en mode strict-fallback (jamais throw côté handler).
- `getUserOrgId`: si aucune org, en créer une à la volée (idempotent).
- Ajouter `try/catch` global dans `registerDomain` retournant message FR clair via `toast`.
- Validation TLD côté serveur (`z.enum`) pour éviter inputs invalides.

## 4. Câblage UI complet (suppression de `mocks.ts`)

Pour chaque fichier listé, remplacer `import … from "@/lib/mocks"` par `useQuery`/`useMutation` sur les server fns ci-dessus. Pages concernées:

**App utilisateur**
- `_app.app.index.tsx` — dashboard: KPIs réels (counts domaines/sites/mailboxes + dernier déploiement).
- `_app.app.notifications.tsx` — liste + mark read.
- `_app.app.domains.$domain.tsx` + `.dns.tsx` — détail domaine, paramètres, DNS CRUD.
- `_app.app.sites.$projectId.tsx` (+ `.index/.deployments/.deployments.$id/.env/.domains/.settings/.analytics/.logs`) — détail site, env vars CRUD, déploiements live, domaines liés, redéploiement, suppression, analytics (Vercel `/v1/analytics`), logs (`/v2/deployments/{id}/events`).
- `_app.app.email.index.tsx` + `.$mailboxId.tsx` + `.new.tsx` + `.providers.tsx` — gestion mailbox réelle (table `mailboxes` + alias/forwards).
- `_app.app.billing.index/.invoices/.invoices.$id/.payment-methods/.plan/.usage.tsx` — toutes données depuis Stripe + DB.
- `_app.app.support.$ticketId.tsx` — thread messages réel.

**Admin**
- `_admin.admin.users.index.tsx` + `.$userId.tsx` + `.roles.tsx` — gestion utilisateurs.
- `_admin.admin.sites/.domains/.billing/.support.index/.audit/.api-logs/.status/.providers/.plans/.blog/.email/.announcements.tsx` — chaque page lit depuis ses tables réelles.

## 5. Suppression de `src/lib/mocks.ts`

Une fois zéro import restant, supprimer le fichier. La build TS échouera tant qu'un import subsiste — c'est notre garde-fou.

## 6. Tests

Après implémentation, pour chaque server fn critique:
1. `stack_modern--invoke-server-function` POST sur `/_serverFn/<id>` ou via UI réelle.
2. `supabase--read_query` pour vérifier persistence (domains, sites, mailboxes, invoices).
3. `stack_modern--server-function-logs` pour confirmer absence d'erreur.
4. Test manuel dans le preview du flux: signup → recherche domaine → achat → ajout DNS → création site → déploiement → mailbox → ticket → facture.

## 7. Détails techniques

- **Quotas / pagination**: ajouter `.limit(100)` + tri sur toutes les listes.
- **RLS**: déjà OK; pour `github_connections` créer policies `self read/write`.
- **Webhooks**: vérifier que `webhooks.vercel.ts` met bien à jour `deployments.status` et `sites.last_deploy_at`; idem `webhooks.stripe.ts` pour `subscriptions` + `invoices` insert.
- **Migrations à créer**:
  1. table `github_connections`
  2. table `plans` (id text, name, price_cents, features jsonb, stripe_price_id)
  3. seed initial des plans (starter / pro / business)

## 8. Livraison

À la fin du tour:
- 0 import de `@/lib/mocks` (fichier supprimé).
- Build TanStack vert.
- GitHub OAuth fonctionnel (en attente du secret user).
- Tous les flux promis cliquables et persistés.
- Récap des tests effectués + URLs/IDs créés.

---

**Action requise utilisateur**: après approbation du plan, fournir `GITHUB_CLIENT_ID` + `GITHUB_CLIENT_SECRET` (créer une OAuth App sur https://github.com/settings/developers, callback `https://hostinq.lovable.app/api/public/github/callback`). Le reste s'enchaîne sans interruption.
