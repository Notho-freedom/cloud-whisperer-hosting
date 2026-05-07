
## Objectif

Trois chantiers, en commençant par les **Sites** (priorité absolue).

---

## 1. Sites — flow complet façon Vercel (priorité)

### 1.1 Création du site (wizard 3 étapes)

Refonte de `src/routes/_app.app.sites.new.tsx` en wizard :

**Étape 1 — Source**
Trois cartes au choix :
- **Importer depuis GitHub** (si compte GitHub connecté côté Settings → Intégrations) — liste les repos via `listGithubRepos` (déjà câblé), recherche, sélection branche.
- **Upload de fichiers** (zip ou dossier glissé-déposé) — pour les débutants HTML/Tailwind.
- **Projet vide** — créer puis pousser plus tard.

**Étape 2 — Configuration**
- Nom du projet (slug auto-généré, validation `[a-z0-9-]`).
- Détection auto du framework :
  - GitHub : lecture du `package.json` du repo via API GitHub → détecte Next.js / Vite / Astro / Remix / static.
  - Upload : détection à partir des fichiers (`index.html` racine = static, `package.json` = lecture des deps).
- Affichage des paramètres détectés (build command, output dir) avec possibilité de surcharger.
- Variables d'environnement : tableau key/value, import via collage `.env`.

**Étape 3 — Déploiement**
- Création du projet Vercel (`createVercelProject`).
- Upload des env vars (`upsertVercelEnv`).
- Déclenchement du déploiement :
  - GitHub : `triggerDeployment` avec `gitSource`.
  - Upload : nouvelle fonction `triggerDeploymentFromFiles` qui POST `/v13/deployments` avec le tableau `files` (chaque fichier = `{file, data, encoding:"base64"}`) — l'API Vercel accepte ce format pour les déploiements sans Git.
- Redirection vers la page du déploiement live.

### 1.2 Page de déploiement temps réel

Refonte de `src/routes/_app.app.sites.$projectId.deployments.$deploymentId.tsx` :

**Header**
- État live (Queued → Building → Ready / Error) avec polling toutes les 2 s via `getVercelDeployment`.
- URL de prévisualisation cliquable (ouvre dans un nouvel onglet).
- Aperçu (screenshot) du site une fois "Ready" : utilisation de `https://api.urlbox.io` ou simplement un `<iframe>` sandboxé (option simple, zéro coût).

**Logs de build en streaming**
- Nouveau server function `getDeploymentEvents(deploymentId)` qui appelle `GET /v3/deployments/{id}/events?builds=1` (Vercel build events).
- Polling 1.5 s tant que statut ∈ {QUEUED, BUILDING, INITIALIZING}, affichage en console avec couleurs par niveau.

**Métadonnées**
- Branche, commit, auteur, durée, taille du bundle, région.
- Bouton "Redéployer", "Promouvoir en production", "Annuler".

### 1.3 Liste des déploiements

`_app.app.sites.$projectId.deployments.tsx` : ajout statut live (couleur), durée, type (production/preview), filtres.

### 1.4 Explorateur de fichiers (lecture seule)

Nouvel onglet **Source** dans `_app.app.sites.$projectId.tsx` (`src/routes/_app.app.sites.$projectId.source.tsx`) :
- Si site lié à GitHub : arbre de fichiers via API GitHub (`/repos/{owner}/{repo}/git/trees/{branch}?recursive=1`), aperçu du contenu via `/contents/{path}`.
- Si site uploadé : on stocke le manifeste de l'upload (liste des chemins + tailles) dans une nouvelle table `site_uploads` et on affiche cet arbre. Téléchargement individuel via Vercel `/v6/deployments/{id}/files`.

### 1.5 Logs runtime

Refonte `_app.app.sites.$projectId.logs.tsx` (actuellement mocké) → vrai endpoint Vercel `GET /v2/projects/{id}/logs` ou polling des derniers déploiements. Filtre par niveau.

### 1.6 Tables et migrations

```sql
create table public.site_uploads (
  id uuid primary key default gen_random_uuid(),
  site_id uuid references public.sites(id) on delete cascade,
  deployment_id uuid references public.deployments(id) on delete set null,
  manifest jsonb not null,         -- [{path, size}]
  total_bytes bigint not null,
  created_at timestamptz default now()
);
```
RLS basée sur `is_org_member` via le site parent.

---

## 2. PlanetHoster — proxy externe sur `https://hostiq.genesis-company.net/`

### 2.1 Création du serveur Node à déployer

Nouveau dossier `external/planethoster-proxy/` (livré dans le repo, à déployer manuellement par l'utilisateur sur son sous-domaine PlanetHoster) :

```
external/planethoster-proxy/
├── package.json        (express, node-fetch, dotenv)
├── server.js           (Express, route catch-all /api/ph/*)
├── .env.example        (PLANETHOSTER_API_USER, PLANETHOSTER_API_KEY, PROXY_SHARED_SECRET)
└── README.md           (instructions de déploiement Node sur PlanetHoster)
```

Le serveur :
- Écoute sur le port fourni par PlanetHoster (`process.env.PORT`).
- Expose `POST /api/ph/*` qui forward vers `https://api.planethoster.net/*` en injectant `api_user` / `api_key`.
- Vérifie l'en-tête `X-Proxy-Secret` contre `PROXY_SHARED_SECRET` pour empêcher l'usage public.
- Logs simples + CORS désactivé (appel server-to-server uniquement).

### 2.2 Refonte de `src/api/domains.ts`

- Variable d'env runtime `PLANETHOSTER_PROXY_URL` (= `https://hostiq.genesis-company.net`) et `PLANETHOSTER_PROXY_SECRET`.
- La fonction `ph()` n'appelle plus `api.planethoster.net` directement mais `${PROXY_URL}/api/ph/{path}` avec l'en-tête `X-Proxy-Secret`.
- Suppression de l'usage local de `PLANETHOSTER_API_USER` / `PLANETHOSTER_API_KEY` (ils restent uniquement sur le serveur Node distant).

### 2.3 Secrets

Demander à l'utilisateur d'ajouter `PLANETHOSTER_PROXY_URL` et `PLANETHOSTER_PROXY_SECRET` via `add_secret` (le secret doit être identique côté serveur Node).

---

## 3. Zoho Mail — provisioning réel des boîtes pro

### 3.1 OAuth Zoho

- Création d'une route `src/routes/api/public/zoho.callback.ts` (échange du `code` Zoho → `refresh_token` stocké chiffré dans `org_integrations` table existante).
- UI de connexion dans `_app.app.email.providers.tsx` : bouton "Connecter Zoho Mail" → redirige vers `https://accounts.zoho.com/oauth/v2/auth?...`.

### 3.2 Provisioning

`src/api/email.ts` : implémentation des appels réels Zoho Mail Admin API
(`/api/organization/{orgId}/accounts`) pour :
- Créer une boîte mail (`createMailbox`).
- Lister, suspendre, supprimer.
- Lire quota / aliases.

Suppression des stubs/données fictives restantes dans `email-api.ts`.

### 3.3 Secrets requis

- `ZOHO_CLIENT_ID`, `ZOHO_CLIENT_SECRET` (à demander via `add_secret` quand l'utilisateur aura créé l'app dans la console Zoho).
- `ZOHO_REGION` (`com`, `eu`, `in`…).

---

## Ordre d'exécution

1. **Sites** (1.1 → 1.6) — wizard, déploiement temps réel, explorateur, logs.
2. **Proxy PlanetHoster** (2) — serveur Node livré + refactor `domains.ts` + ajout secrets.
3. **Zoho Mail** (3) — OAuth + provisioning + ajout secrets.

Après chaque chantier : test bout-en-bout via `invoke-server-function` + logs serveur.

---

## Questions à confirmer avant de commencer

- Pour Zoho : avez-vous **déjà** un compte Zoho Mail avec un domaine vérifié, ou faut-il aussi gérer le flow d'ajout/vérification de domaine (DNS auto via PlanetHoster) ?
- Pour l'upload de fichiers sites : taille max acceptable (Vercel limite à ~100 MB par déploiement sans Git) — ok pour 100 MB max ?
