

# Hostiq — Plateforme d'hébergement sans infrastructure

Service complet basé uniquement sur des APIs : **PlanetHoster** (domaines), **Vercel** (hébergement/projets), et **multi-providers email** (Google Workspace / Microsoft 365 / Zoho — UI agnostique).

## Identité visuelle

- **Nom** : Hostiq
- **Palette** : émeraude (#10B981 primaire) sur slate sombre + blanc, accents teal. Pro et confiance.
- **Typo** : Inter (UI) + JetBrains Mono (code/domaines/DNS)
- **Style** : SaaS moderne, dense mais lisible (inspiration Vercel/Linear), thème clair + sombre
- **Logo** : monogramme "H" géométrique avec bouclier discret

## Architecture des routes (TanStack Router, fichiers séparés, SEO + SSR)

### 🌐 Site public (marketing)
- `/` — Landing : hero, propositions de valeur, logos, comparatif
- `/domains` — Recherche & achat de domaines (preview live)
- `/hosting` — Présentation hébergement (Vercel-powered)
- `/email` — Boîtes mail pro
- `/pricing` — Plans hybrides + add-ons
- `/features` — Fonctionnalités détaillées
- `/about`, `/contact`, `/blog`, `/blog/$slug`
- `/legal/terms`, `/legal/privacy`, `/legal/cookies`, `/legal/sla`
- `/status` — Statut des services

### 🔐 Authentification
- `/login`, `/signup`, `/forgot-password`, `/reset-password`, `/verify-email`, `/2fa`

### 👤 Espace membre `/_authenticated/app/*`
- `/app` — Dashboard (vue d'ensemble : domaines, sites, mails, factures, alertes)
- `/app/domains` — Liste des domaines
- `/app/domains/search` — Recherche & achat (multi-TLD, suggestions)
- `/app/domains/$domain` — Détail (overview, DNS, nameservers, contacts WHOIS, transfert, renouvellement, auto-renew, sécurité/lock, redirections)
- `/app/domains/$domain/dns` — Éditeur DNS (A, AAAA, CNAME, MX, TXT, SRV, CAA), import/export zone
- `/app/sites` — Liste des projets Vercel
- `/app/sites/new` — Création (Git import, template, blank, upload zip)
- `/app/sites/$projectId` — Vue projet (deployments, prod URL, screenshot)
- `/app/sites/$projectId/deployments` + `/deployments/$deploymentId` (logs, build output, redeploy, rollback)
- `/app/sites/$projectId/domains` — Domaines liés + vérification SSL
- `/app/sites/$projectId/env` — Variables d'environnement (par env)
- `/app/sites/$projectId/settings` — Build, framework, regions, danger zone
- `/app/sites/$projectId/analytics` — Trafic, perf, web vitals
- `/app/sites/$projectId/logs` — Runtime logs
- `/app/email` — Boîtes mail (toutes provider confondus)
- `/app/email/new` — Création (sélection provider, domaine, plan)
- `/app/email/$mailboxId` — Détail (alias, transferts, mot de passe, quotas)
- `/app/email/providers` — Connexion comptes Google/MS/Zoho (UI prête multi-provider)
- `/app/billing` — Vue d'ensemble (solde, prochaine facture, usage)
- `/app/billing/plan` — Choix/changement de plan + add-ons
- `/app/billing/invoices` + `/invoices/$id` (PDF view)
- `/app/billing/payment-methods` — Cartes, SEPA
- `/app/billing/usage` — Consommation détaillée
- `/app/support` — Liste tickets
- `/app/support/new`, `/app/support/$ticketId`
- `/app/notifications` — Centre de notifications
- `/app/team` — Membres & rôles (multi-utilisateurs par compte)
- `/app/team/invite`
- `/app/api-keys` — Clés API personnelles + webhooks
- `/app/settings/profile`, `/settings/security` (2FA, sessions, password), `/settings/preferences`, `/settings/integrations`, `/settings/danger`

### 🛠️ Espace administration `/_authenticated/_admin/admin/*`
- `/admin` — Dashboard global (KPIs : MRR, utilisateurs, domaines, sites, tickets, incidents, marges)
- `/admin/users` + `/users/$userId` (profil, ressources, factures, impersonate, suspend)
- `/admin/users/roles` — Gestion rôles & permissions
- `/admin/domains` — Tous les domaines vendus (filtres TLD, expiration, statut)
- `/admin/sites` — Tous les projets hébergés
- `/admin/email` — Toutes les boîtes mail
- `/admin/billing` — Revenus, factures, refunds, échecs de paiement
- `/admin/plans` — CRUD plans + add-ons + promo codes
- `/admin/support` — File de tickets, assignations, SLA
- `/admin/support/macros` — Réponses prédéfinies
- `/admin/providers` — État des intégrations (PlanetHoster, Vercel, email providers) + clés API
- `/admin/api-logs` — Logs d'appels API (filtre par provider, statut, latence)
- `/admin/audit` — Audit trail complet
- `/admin/announcements` — Bannières & emails broadcast
- `/admin/blog` — CMS articles
- `/admin/status` — Gestion incidents & maintenance
- `/admin/settings` — Config plateforme (taxes, devises, branding)

## Principes UI prévus pour les APIs

Chaque écran est conçu en miroir des payloads attendus :

- **PlanetHoster API** : recherche TLD, vérification dispo, prix par TLD/an, contacts WHOIS (registrant/admin/tech/billing), nameservers, EPP code, lock domain, renouvellement, transfert in/out
- **Vercel API** : projects, deployments (status: ready/building/error), domains/aliases, env vars (target: production/preview/development), build logs, runtime logs, analytics, frameworks détectés, git integration
- **Email (multi)** : abstraction commune `mailbox { domain, address, quota, aliases[], forwards[] }` avec adapter par provider, écran de connexion OAuth générique

Tous les formulaires incluent : validation Zod, états loading/empty/error/success, skeletons, toasts, confirmations destructives, mock data réaliste.

## Composants transverses

- Layouts : MarketingLayout, AuthLayout, AppLayout (sidebar collapsible + header avec switcher de compte), AdminLayout (sidebar distincte rouge/admin)
- Command palette (⌘K), notifications dropdown, theme toggle, breadcrumbs
- DataTables réutilisables (tri, filtres, pagination, bulk actions, export CSV)
- Empty states illustrés, error boundaries par route, 404 custom
- Composants spécialisés : DomainSearchBox, DNSRecordEditor, EnvVarEditor, DeploymentTimeline, PriceCard, UsageMeter, TicketThread, InvoicePDFViewer

## Données

Mock data centralisé (`src/lib/mocks/`) imitant fidèlement les réponses APIs réelles → branchement futur = remplacer un fetcher, zéro refonte UI.

## Hors-scope (à brancher après validation)

- Backend, paiements réels, vrais appels API, envoi d'emails transactionnels
- Auth réelle (mockée via context auth en attendant)

## Livraison par phases (pour ne pas tout générer en un seul coup)

1. **Phase 1** : Branding + design system + site public complet + auth
2. **Phase 2** : Espace membre — Dashboard, Domaines (search/detail/DNS), Sites (CRUD/deployments)
3. **Phase 3** : Espace membre — Email, Billing, Support, Team, Settings, API keys
4. **Phase 4** : Espace administration complet
5. **Phase 5** : Pages légales, status, blog, polish & responsive

Je commencerai par la **Phase 1** dès validation, puis enchaînerai les phases.

