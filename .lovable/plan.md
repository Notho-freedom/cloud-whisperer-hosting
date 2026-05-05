## Objectif

Terminer le câblage UI ↔ backend: 14 pages admin restantes utilisent encore `@/lib/mocks`. Une fois branchées, supprimer `src/lib/mocks.ts` (le build TS sert de garde-fou). Corriger l'erreur "Supabase unknown key / role key" rapportée à l'exécution. Tester les flux principaux.

## Diagnostic erreur Supabase

Les deux blocs `.env` montrent que le projet Lovable Cloud actif est `gbqacbycvlafdahwkygv` (premier bloc, non commenté). Le second bloc est commenté (#) → il n'est pas chargé. Les secrets serveur sont déjà tous présents: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, plus PlanetHoster, Vercel, GitHub, Stripe, Resend.

Cause probable de l'erreur: une server fn lit un nom de variable inexistant (par ex. `SUPABASE_ANON_KEY` au lieu de `SUPABASE_PUBLISHABLE_KEY`, ou `SUPABASE_ROLE_KEY` au lieu de `SUPABASE_SERVICE_ROLE_KEY`). Action: grep tout le code serveur pour ces noms incorrects et corriger.

## Étapes

1. **Diagnostic clés Supabase**
   - `rg "SUPABASE_ANON_KEY|SUPABASE_ROLE_KEY|SUPABASE_KEY"` dans `src/` et `supabase/`.
   - Renommer toute occurrence vers `SUPABASE_PUBLISHABLE_KEY` / `SUPABASE_SERVICE_ROLE_KEY`.
   - Vérifier que `client.server.ts` et `auth-middleware.ts` utilisent les bons noms (déjà OK selon revue).
   - Tester `searchDomains` et `registerDomain` via `stack_modern--invoke-server-function` puis lire `stack_modern--server-function-logs`.

2. **Server fns admin manquantes** (compléter `src/api/admin-api.server.ts`)
   - `adminListPlans`, `adminListPromoCodes` (table `plans` + nouvelle table `promo_codes` si demandé — sinon on omet promo).
   - `adminListProvidersHealth` (existe déjà sous nom `adminProviderHealth`, vérifier signature).
   - `adminListIncidents` existe.
   - Déjà tout le reste OK.

3. **Câblage des 14 pages admin** — remplacer les imports `@/lib/mocks` par `useQuery` sur les server fns:
   - `_admin.admin.users.index.tsx` → `adminListUsers`
   - `_admin.admin.users.$userId.tsx` → `adminGetUser`
   - `_admin.admin.sites.tsx` → `adminListSites`
   - `_admin.admin.domains.tsx` → `adminListDomains`
   - `_admin.admin.billing.tsx` → `adminListInvoices`
   - `_admin.admin.support.index.tsx` → `adminListTickets`
   - `_admin.admin.audit.tsx` → `adminListAuditLog`
   - `_admin.admin.api-logs.tsx` → `adminListApiLogs`
   - `_admin.admin.status.tsx` → `adminListIncidents`
   - `_admin.admin.providers.tsx` → `adminProviderHealth`
   - `_admin.admin.plans.tsx` → `adminListPlans` + `adminUpsertPlan` (UI minimal sans promo codes)
   - `_admin.admin.email.tsx` → `adminListMailboxes`
   - `_admin.admin.blog.tsx` → `adminListBlogPosts` + `adminUpsertBlogPost`
   - `_admin.admin.announcements.tsx` → `adminListAnnouncements` + `adminCreateAnnouncement`

4. **Suppression `src/lib/mocks.ts`** une fois 0 import restant.

5. **Tests automatisés** (via `stack_modern--invoke-server-function`):
   - `getTldPricing`
   - `searchDomains` (sans auth → attendu 401, avec session → résultats)
   - `listDomains`, `listSites`, `listMailboxes`, `listInvoices`
   - `adminKpis` (avec compte admin)
   - `startGithubOAuth` (renvoie URL)
   - Lire les logs si erreur, corriger, re-tester.

6. **Vérification migrations & secrets**
   - Confirmer via `supabase--read_query` que les tables clés existent (déjà confirmé via schéma fourni).
   - Confirmer `secrets--fetch_secrets` (déjà OK: tous présents).

## Hors-scope (à clarifier ensuite si besoin)

- Tests E2E navigateur du flux complet (achat domaine réel via PlanetHoster sandbox / déploiement Vercel réel) — l'utilisateur devra exécuter manuellement, je documenterai les étapes.
- Promo codes admin: pas de table, j'affiche une UI vide + note "à venir" plutôt qu'inventer du schéma.

## Livraison

- 0 import de `@/lib/mocks`, fichier supprimé.
- Toutes les pages admin lisent depuis Supabase.
- Erreur de clé corrigée et flux `searchDomain` → `registerDomain` testé end-to-end.
- Récap final avec résultats des tests + URL preview à essayer.
