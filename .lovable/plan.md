## Refonte de la console applicative (`/app/*`)

Le design (couleurs, typo, composants shadcn) est conservé tel quel. On retravaille **uniquement la structure et les workflows** des pages connectées, en copiant les patterns Render (sidebar contextuelle, breadcrumb workspace → projet → service, page service avec Events/Logs/Metrics/Environment) et Vercel (rail global, overview projets avec favoris/usage, page Deployments cross-projets, détail déploiement avec Build Logs + Deployment Summary, wizard "Let's build something new", Account Settings ancré).

La partie marketing/site web n'est **pas touchée**.

---

### 1. Nouvelle structure de navigation

**`AppLayout` refait en deux modes** :

- **Mode workspace** (toutes les routes sauf `/app/sites/$projectId/*`) — rail gauche compact type Vercel :
  - Header rail : sélecteur de workspace (avatar + nom + chevron, dropdown "switch workspace / créer / paramètres")
  - Sections : Projects (Sites), Deployments (global), Logs (global), Analytics, Domains, Email, Storage, Integrations, Team, Billing, API Keys, Settings
  - Footer rail : statut plateforme ("All services up") + bouton Upgrade
- **Mode projet** (inside `/app/sites/$projectId/*`) — la sidebar bascule en **sidebar de service** type Render :
  - Header rail : breadcrumb vertical Workspace › Sites › `<nom du site>` avec retour
  - Sections "MONITOR" (Events, Logs, Metrics, Analytics), "MANAGE" (Environment, Source, Domains, Settings, Deployments, Previews), footer "Danger zone"
  - Les onglets horizontaux actuels du site sont supprimés (remplacés par la sidebar contextuelle)

**Topbar global** unifiée : breadcrumb `Workspace › Projet › Environment › Service`, recherche ⌘K, notifications, theme, avatar — visible dans les deux modes.

### 2. Page `/app/sites` (Projects Overview) façon Vercel

- Header : recherche + filtres + toggle grille/liste + bouton "Add New ▾" (Site, Domain, Empty project)
- Colonne gauche (sticky, ~320px) :
  - Bloc **Usage (30 derniers jours)** : Edge Requests, Data Transfer, CPU, Storage — barres de progression vs quota plan
  - Bloc **Alerts** : anomalies / quota >80 % / déploiements échoués
  - Bloc **Recent Previews** : 5 derniers déploiements preview cross-projets
- Colonne principale :
  - Section **Favoris** (étoiles persistées sur `sites.is_favorite` — nouvelle colonne)
  - Section **All Projects** : cartes avec OG image / placeholder, repo GitHub, statut santé (rond vert/orange/rouge), date de dernière mise à jour, menu `...` (Visit / Open repo / Settings / Delete)

### 3. Page globale `/app/deployments` (nouvelle)

Tableau cross-projets type Vercel "All Projects → Deployments" :

- Filtres horizontaux : Date range, Authors, Environments (production/preview), Repositories, Branches, Status (6/7)
- Colonnes : Commit message · Status (Ready/Building/Error + durée) · Environment badge · Repo · Commit SHA · Branch · Auteur (avatar) · Ago · menu `...`
- Pagination "Load More"
- Lien vers `/app/sites/$projectId/deployments/$deploymentId`

### 4. Détail déploiement `/app/sites/$projectId/deployments/$deploymentId` restructuré

Layout type Vercel "Deployment Details" :

- **Header carte** : preview iframe (200×200) · Created (auteur + ago) · Status (Ready/Building) · Duration · Environment (Production/Preview/Current) · Domains assignés (+verify) · Source (branche + commit + message)
- **Deployment Settings** (accordéon) : Build Settings (machine, vCPU, mémoire), Runtime Settings (Fluid Compute, Function CPU, Node version), Protection
- **Build Logs** : panneau noir avec compteur de lignes, recherche `Ctrl+F`, surlignage warnings, scroll virtualisé, badge de durée totale
- **Deployment Summary** : framework détecté + version, onglet **Static Assets** (liste avec taille + gzip + filtres All/HTML/JS/CSS/Image/Misc — alimenté par `listVercelDeploymentFiles`), **Cron Jobs**, **Deployment Checks**, **Assigning Custom Domains**
- **Runtime Logs / Observability / Speed Insights / Web Analytics** en bas (cartes cliquables vers les sous-pages)
- Nouvel onglet **Open Graph** : preview de la balise `og:image` / `twitter:card`

### 5. Page Source restructurée

Vue type Vercel "Source" : panneau gauche arborescence cliquable + panneau droit viewer code (utilisation de `<pre>` avec coloration légère via `react-syntax-highlighter`), bouton "Open on GitHub" + bouton "Copy path" en haut.

### 6. Wizard `/app/sites/new` façon Vercel "Let's build something new"

- Champ unique en haut : "Décrivez votre projet ou collez une URL Git…" (placeholder, pour cohérence visuelle — fonctionnel uniquement si URL Git valide collée)
- 2 colonnes :
  - **Import Git Repository** : sélecteur compte GitHub + recherche + liste repos avec bouton Import (visible/locked badge)
  - **Building blocks** : cartes Vercel-like (AI Gateway, Sandboxes, Workflows) → renvoient vers les sections existantes, + **Create Empty Project** (bouton à droite)
- Section basse **Clone Template** : 4 cartes de templates pré-câblés (Vite, Next.js, Astro, Static) avec aperçu image

### 7. Settings ancré `/app/settings`

Refonte type Render "Account settings" :

- Sidebar de droite avec ancres : Profile · Appearance · Account Security · CLI Tokens · API Keys · SSH Public Keys · Notifications · Delete Account
- Sections empilées, chacune carte sombre avec champs + bouton "Edit" inline (mode édition par section, pas un seul gros formulaire)
- Section "Delete Account" en bouton destructif tout en bas

### 8. Page Events par site (nouvelle, type Render)

`/app/sites/$projectId/events` : timeline d'événements (déploiements, redéploiements, changements de domaine, ajouts/retraits de variables, invitations équipe), groupée par jour, avec mini-logs inline ("Your service is live ✨"). Alimentée par `audit_logs` filtré sur le site.

---

### Détails techniques

- **AppLayout** : extraire `WorkspaceSidebar` et `ProjectSidebar` ; bascule via `useMatch({ from: "/_app/app/sites/$projectId", shouldThrow: false })`.
- **Breadcrumb header** : nouveau composant `<TopBreadcrumb segments={[]} />` dans `AppHeader`, dérivé du `useMatches()` TanStack.
- **Favoris sites** : ajouter colonne `is_favorite boolean default false` sur `public.sites` via migration (+ GRANT + policy update existante suffit). Endpoint `toggleSiteFavorite` côté `sites-api.ts`.
- **Page Deployments globale** : nouveau serverFn `listAllDeployments({ filters })` qui agrège `deployments` table (déjà existante) avec join sites/users.
- **Static Assets** : utiliser `listVercelDeploymentFiles` (déjà présent dans `sites.ts`) pour alimenter l'onglet.
- **Code Source viewer** : `bun add react-syntax-highlighter @types/react-syntax-highlighter` (compatible Worker, pas de native binding).
- **Routing** : créer `_app.app.deployments.tsx` (liste globale) et `_app.app.sites.$projectId.events.tsx` (timeline). Supprimer les onglets horizontaux dans `_app.app.sites.$projectId.tsx` (remplacés par la sidebar projet).
- **Aucune modification** des API PlanetHoster/Vercel/Supabase existantes — uniquement réorganisation UI + 1 colonne DB (favoris) + 1 serverFn d'agrégation.

### Ce qui reste tel quel

- Marketing (`_marketing.*`), Auth (`_auth.*`), Admin (`_admin.*`)
- Toutes les couleurs / tokens / composants shadcn
- Toute la logique métier serverFn (sites, domains, email, billing)
- Le proxy PlanetHoster externe et les intégrations Vercel/GitHub
