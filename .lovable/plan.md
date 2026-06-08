## Objectif

Terminer toutes les pages encore en "coming soon" autour de Render, brancher les serverFns déjà écrites dans `src/api/render/services.functions.ts`, et valider l'ensemble par des tests pratiques (proxy health, sync, listes, mutations, navigation).

Le périmètre reste **frontend + glue serverFn** — aucune nouvelle table, aucun changement de schéma, aucune modification de Vercel.

---

## 1. Compléter les onglets Service `/_app/app/services/$serviceId/*`

Remplacer chaque stub par une vraie page :

- **events.tsx** — liste paginée depuis `listServiceEvents`, timeline groupée par jour, icône par type (`build_started`, `live`, `crashed`, `scaled`, `deploy_canceled`…).
- **logs.tsx** — `<LiveLogPanel>` minimal : polling 3s via `listLogs` (pas de WS pour cette tranche, on prépare juste la place du bridge SSE), filtres niveau + recherche, pause/resume, copy.
- **metrics.tsx** — Recharts (déjà installé) : CPU, mémoire, instances, HTTP req. Presets 1h/6h/24h. Source = `getMetrics`.
- **deploys.tsx** — table : commit, branche, statut badge, durée, déclencheur. Actions : redeploy, rollback, cancel (live). Lien vers detail si existant.
- **environment.tsx** — env vars + secret files. CRUD inline (add row, edit, delete, eye-toggle), section "Env groups liés" en lecture seule.
- **scaling.tsx** — sliders min/max instances, target CPU/mem, plan switcher (read-only listing des plans). Save → `scaleService`.
- **jobs.tsx** — liste one-off jobs + bouton "Run job" (modal commande), statut + logs courts.
- **domains.tsx** — table custom domains, add domain (modal), badge vérif DNS, bouton "Verify".
- **settings.tsx** — infos read-only (region, plan, runtime), suspend/resume, restart, **Danger zone** delete (confirmation typée).

Chaque page suit le pattern `getService` + `useQuery` déjà en place dans `index.tsx`, `<PageHeader>` + `<PageContent>`.

## 2. Compléter les pages workspace

- **`services.index.tsx`** — déjà fait, vérifier filtres + skeleton loading.
- **`datastores.tsx`** — liste Postgres + Key-Value (tabs), badge HA/PITR, bouton "New datastore" (stub wizard renvoyant vers `datastores.new` à créer comme page simple : type + plan + région).
- **`env-groups.tsx`** — liste env groups + create (nom seul), drill-down vers variables.
- **`blueprints.tsx`** — liste + bouton "Sync now" + historique syncs (read-only).
- **`deployments.tsx`** — agrégation cross-services des derniers deploys.

Pages secondaires (datastore detail, env-group detail, blueprint detail) restent en "coming soon" propre — non bloquantes pour la démo.

## 3. Glue serverFn manquante

Ajouter dans `services.functions.ts` (ou nouveau fichier) les helpers minimaux utilisés ci-dessus s'ils manquent : `listServiceEvents`, `listLogs`, `getMetrics`, `cancelDeploy`, `rollbackDeploy`, `addCustomDomain`, `verifyCustomDomain`, `runJob`. Toutes via le proxy `renderFetch`, miroir DB best-effort.

## 4. Tests à exécuter

Une fois le code en place, vérifications dans cet ordre :

1. **Proxy** — `GET /api/render/health` via le proxy renvoie `{ok:true}` (clé Render valide).
2. **Sync initial** — bouton "Sync Render" sur `/app/services` ramène les services existants en DB.
3. **Navigation** — chaque onglet de `/app/services/$id/*` se charge sans erreur, mode sidebar "service" actif.
4. **Mutations sûres** — Restart, Suspend/Resume, Manual Deploy → toasts OK, refetch propre.
5. **Mutations destructives** — non testées automatiquement (delete service, drop datastore) ; vérification visuelle de la confirmation seulement.
6. **Logs serveur** — `stack_modern--server-function-logs` pour confirmer absence d'erreurs Unauthorized/500 sur les serverFns Render.
7. **Build** — typecheck/build automatique passe.

Si un appel Render échoue (compte sans services p.ex.), les pages doivent afficher un empty-state propre, pas une erreur rouge.

## 5. Hors périmètre (gardé pour plus tard)

- Bridge WS→SSE temps réel pour logs (polling suffit pour valider l'UI).
- Webhooks Render entrants (`/api/public/webhooks.render`).
- Pages détaillées datastores/env-groups/blueprints.
- Workflows, dedicated IPs, log/metrics streams, audit log UI.
- Section billing usage Render.

Ces éléments restent listés dans le plan principal (tranches H–J) et seront livrés ensuite.
