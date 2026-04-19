// Centralized mock data — mirrors PlanetHoster, Vercel, and email provider API shapes.
// Future API integration = replace these fetchers with real calls. Zero UI refactor.

export type DomainStatus = "active" | "expiring" | "expired" | "transferring" | "pending";

export interface Domain {
  name: string;
  tld: string;
  status: DomainStatus;
  registeredAt: string;
  expiresAt: string;
  autoRenew: boolean;
  locked: boolean;
  privacy: boolean;
  nameservers: string[];
  registrar: "PlanetHoster";
  pricePerYear: number;
}

export interface DnsRecord {
  id: string;
  type: "A" | "AAAA" | "CNAME" | "MX" | "TXT" | "SRV" | "CAA" | "NS";
  name: string;
  value: string;
  ttl: number;
  priority?: number;
}

export interface TldOffer {
  tld: string;
  pricePerYear: number;
  renewalPrice: number;
  popular?: boolean;
}

export const TLDS: TldOffer[] = [
  { tld: ".com", pricePerYear: 9.99, renewalPrice: 12.99, popular: true },
  { tld: ".io", pricePerYear: 39.0, renewalPrice: 49.0, popular: true },
  { tld: ".dev", pricePerYear: 14.0, renewalPrice: 16.0, popular: true },
  { tld: ".app", pricePerYear: 16.0, renewalPrice: 18.0, popular: true },
  { tld: ".fr", pricePerYear: 7.99, renewalPrice: 9.99 },
  { tld: ".net", pricePerYear: 11.99, renewalPrice: 13.99 },
  { tld: ".co", pricePerYear: 24.0, renewalPrice: 28.0 },
  { tld: ".ai", pricePerYear: 79.0, renewalPrice: 89.0, popular: true },
  { tld: ".tech", pricePerYear: 49.0, renewalPrice: 59.0 },
  { tld: ".org", pricePerYear: 12.99, renewalPrice: 14.99 },
  { tld: ".xyz", pricePerYear: 2.99, renewalPrice: 12.99 },
  { tld: ".store", pricePerYear: 4.99, renewalPrice: 49.0 },
];

export const DOMAINS: Domain[] = [
  {
    name: "acme.com",
    tld: ".com",
    status: "active",
    registeredAt: "2023-04-12",
    expiresAt: "2026-04-12",
    autoRenew: true,
    locked: true,
    privacy: true,
    nameservers: ["ns1.hostiq.io", "ns2.hostiq.io"],
    registrar: "PlanetHoster",
    pricePerYear: 9.99,
  },
  {
    name: "studio-noir.fr",
    tld: ".fr",
    status: "active",
    registeredAt: "2024-09-01",
    expiresAt: "2025-09-01",
    autoRenew: true,
    locked: true,
    privacy: false,
    nameservers: ["ns1.hostiq.io", "ns2.hostiq.io"],
    registrar: "PlanetHoster",
    pricePerYear: 7.99,
  },
  {
    name: "skybridge.io",
    tld: ".io",
    status: "expiring",
    registeredAt: "2023-12-22",
    expiresAt: "2025-05-12",
    autoRenew: false,
    locked: false,
    privacy: true,
    nameservers: ["ns1.cloudflare.com", "ns2.cloudflare.com"],
    registrar: "PlanetHoster",
    pricePerYear: 39.0,
  },
  {
    name: "labs.dev",
    tld: ".dev",
    status: "active",
    registeredAt: "2024-01-10",
    expiresAt: "2027-01-10",
    autoRenew: true,
    locked: true,
    privacy: true,
    nameservers: ["ns1.hostiq.io", "ns2.hostiq.io"],
    registrar: "PlanetHoster",
    pricePerYear: 14.0,
  },
];

export const DNS_RECORDS: Record<string, DnsRecord[]> = {
  "acme.com": [
    { id: "1", type: "A", name: "@", value: "76.76.21.21", ttl: 3600 },
    { id: "2", type: "A", name: "www", value: "76.76.21.21", ttl: 3600 },
    { id: "3", type: "MX", name: "@", value: "aspmx.l.google.com", ttl: 3600, priority: 10 },
    { id: "4", type: "TXT", name: "@", value: "v=spf1 include:_spf.google.com ~all", ttl: 3600 },
    { id: "5", type: "CNAME", name: "blog", value: "cname.vercel-dns.com", ttl: 3600 },
    { id: "6", type: "TXT", name: "_dmarc", value: "v=DMARC1; p=quarantine; rua=mailto:dmarc@acme.com", ttl: 3600 },
  ],
};

// ─── Vercel Sites ───────────────────────────────────────────────────────────

export type DeploymentStatus = "ready" | "building" | "queued" | "error" | "canceled";
export type Framework = "nextjs" | "vite" | "remix" | "astro" | "sveltekit" | "static" | "nuxt";

export interface Site {
  id: string;
  name: string;
  framework: Framework;
  prodUrl: string;
  domains: string[];
  gitRepo?: string;
  gitBranch?: string;
  createdAt: string;
  lastDeployAt: string;
  region: string;
}

export interface Deployment {
  id: string;
  siteId: string;
  status: DeploymentStatus;
  branch: string;
  commitSha: string;
  commitMsg: string;
  author: string;
  createdAt: string;
  duration?: number; // seconds
  target: "production" | "preview";
  url: string;
}

export interface EnvVar {
  id: string;
  key: string;
  value: string; // masked client-side
  target: Array<"production" | "preview" | "development">;
  type: "plain" | "secret";
  updatedAt: string;
}

export const SITES: Site[] = [
  {
    id: "site_acme_web",
    name: "acme-web",
    framework: "nextjs",
    prodUrl: "https://acme.com",
    domains: ["acme.com", "www.acme.com"],
    gitRepo: "acme/acme-web",
    gitBranch: "main",
    createdAt: "2024-02-12",
    lastDeployAt: "2025-04-18T14:22:00Z",
    region: "cdg1",
  },
  {
    id: "site_studio_noir",
    name: "studio-noir",
    framework: "astro",
    prodUrl: "https://studio-noir.fr",
    domains: ["studio-noir.fr"],
    gitRepo: "studio/noir-site",
    gitBranch: "main",
    createdAt: "2024-09-02",
    lastDeployAt: "2025-04-17T08:11:00Z",
    region: "cdg1",
  },
  {
    id: "site_labs_dev",
    name: "labs-playground",
    framework: "vite",
    prodUrl: "https://labs.dev",
    domains: ["labs.dev"],
    gitRepo: "labs/playground",
    gitBranch: "main",
    createdAt: "2024-04-22",
    lastDeployAt: "2025-04-19T10:02:00Z",
    region: "iad1",
  },
];

export const DEPLOYMENTS: Deployment[] = [
  {
    id: "dpl_a1",
    siteId: "site_acme_web",
    status: "ready",
    branch: "main",
    commitSha: "f4a8c12",
    commitMsg: "feat(landing): add new pricing section",
    author: "marie@acme.com",
    createdAt: "2025-04-18T14:22:00Z",
    duration: 47,
    target: "production",
    url: "https://acme-web-f4a8c12.vercel.app",
  },
  {
    id: "dpl_a2",
    siteId: "site_acme_web",
    status: "ready",
    branch: "feat/blog",
    commitSha: "9c2bb0a",
    commitMsg: "wip: blog migration",
    author: "leo@acme.com",
    createdAt: "2025-04-18T11:05:00Z",
    duration: 52,
    target: "preview",
    url: "https://acme-web-9c2bb0a.vercel.app",
  },
  {
    id: "dpl_a3",
    siteId: "site_acme_web",
    status: "error",
    branch: "feat/checkout",
    commitSha: "33b7d10",
    commitMsg: "stripe: add subscription flow",
    author: "marie@acme.com",
    createdAt: "2025-04-17T22:41:00Z",
    duration: 18,
    target: "preview",
    url: "https://acme-web-33b7d10.vercel.app",
  },
  {
    id: "dpl_a4",
    siteId: "site_acme_web",
    status: "building",
    branch: "main",
    commitSha: "b1c4f02",
    commitMsg: "chore: bump deps",
    author: "ci@acme.com",
    createdAt: "2025-04-19T09:15:00Z",
    target: "production",
    url: "https://acme-web-b1c4f02.vercel.app",
  },
];

export const ENV_VARS: EnvVar[] = [
  {
    id: "env_1",
    key: "DATABASE_URL",
    value: "postgres://••••••••••",
    target: ["production", "preview", "development"],
    type: "secret",
    updatedAt: "2025-03-12",
  },
  {
    id: "env_2",
    key: "STRIPE_SECRET_KEY",
    value: "sk_live_••••••••••",
    target: ["production"],
    type: "secret",
    updatedAt: "2025-02-01",
  },
  {
    id: "env_3",
    key: "NEXT_PUBLIC_APP_URL",
    value: "https://acme.com",
    target: ["production", "preview", "development"],
    type: "plain",
    updatedAt: "2024-12-22",
  },
];

// ─── Email (multi-provider abstraction) ──────────────────────────────────────

export type EmailProvider = "google" | "microsoft" | "zoho";

export interface Mailbox {
  id: string;
  address: string;
  domain: string;
  provider: EmailProvider;
  plan: string;
  quotaGb: number;
  usedGb: number;
  aliases: string[];
  forwards: string[];
  createdAt: string;
}

export const MAILBOXES: Mailbox[] = [
  {
    id: "mb_1",
    address: "hello@acme.com",
    domain: "acme.com",
    provider: "google",
    plan: "Workspace Business Standard",
    quotaGb: 30,
    usedGb: 4.2,
    aliases: ["contact@acme.com", "support@acme.com"],
    forwards: [],
    createdAt: "2024-02-14",
  },
  {
    id: "mb_2",
    address: "marie@acme.com",
    domain: "acme.com",
    provider: "google",
    plan: "Workspace Business Standard",
    quotaGb: 30,
    usedGb: 12.8,
    aliases: [],
    forwards: ["marie.dupont@gmail.com"],
    createdAt: "2024-02-14",
  },
  {
    id: "mb_3",
    address: "team@studio-noir.fr",
    domain: "studio-noir.fr",
    provider: "zoho",
    plan: "Mail Pro 10GB",
    quotaGb: 10,
    usedGb: 1.1,
    aliases: ["bonjour@studio-noir.fr"],
    forwards: [],
    createdAt: "2024-09-15",
  },
];

// ─── Billing ─────────────────────────────────────────────────────────────────

export interface Plan {
  id: string;
  name: string;
  pricePerMonth: number;
  popular?: boolean;
  description: string;
  features: string[];
  limits: {
    sites: number | "unlimited";
    domains: number | "unlimited";
    mailboxes: number | "unlimited";
    bandwidthGb: number | "unlimited";
    teamSeats: number;
  };
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    pricePerMonth: 0,
    description: "Pour démarrer un projet personnel.",
    features: [
      "1 site Vercel",
      "Domaine non inclus",
      "1 boîte email",
      "100 GB bande passante",
      "Support communautaire",
    ],
    limits: { sites: 1, domains: 1, mailboxes: 1, bandwidthGb: 100, teamSeats: 1 },
  },
  {
    id: "pro",
    name: "Pro",
    pricePerMonth: 19,
    popular: true,
    description: "Pour freelances et petites équipes.",
    features: [
      "10 sites",
      "1 domaine .com inclus",
      "5 boîtes email pro",
      "1 TB bande passante",
      "Support email prioritaire",
      "Analytics avancés",
    ],
    limits: { sites: 10, domains: 5, mailboxes: 5, bandwidthGb: 1000, teamSeats: 3 },
  },
  {
    id: "business",
    name: "Business",
    pricePerMonth: 79,
    description: "Pour scale-ups et agences.",
    features: [
      "Sites illimités",
      "5 domaines inclus",
      "25 boîtes email",
      "5 TB bande passante",
      "Support 24/7 + chat",
      "Audit logs & SSO",
    ],
    limits: { sites: "unlimited", domains: 25, mailboxes: 25, bandwidthGb: 5000, teamSeats: 10 },
  },
];

export interface Invoice {
  id: string;
  number: string;
  date: string;
  dueDate: string;
  status: "paid" | "open" | "void" | "failed";
  amount: number;
  currency: "EUR";
  items: Array<{ description: string; qty: number; unitPrice: number }>;
}

export const INVOICES: Invoice[] = [
  {
    id: "inv_001",
    number: "HQ-2025-0042",
    date: "2025-04-01",
    dueDate: "2025-04-15",
    status: "paid",
    amount: 38.0,
    currency: "EUR",
    items: [
      { description: "Plan Pro — avril", qty: 1, unitPrice: 19 },
      { description: "Boîte email supplémentaire ×2", qty: 2, unitPrice: 4.5 },
      { description: "Bande passante additionnelle 100GB", qty: 1, unitPrice: 10 },
    ],
  },
  {
    id: "inv_002",
    number: "HQ-2025-0031",
    date: "2025-03-01",
    dueDate: "2025-03-15",
    status: "paid",
    amount: 19.0,
    currency: "EUR",
    items: [{ description: "Plan Pro — mars", qty: 1, unitPrice: 19 }],
  },
  {
    id: "inv_003",
    number: "HQ-2025-0019",
    date: "2025-02-01",
    dueDate: "2025-02-15",
    status: "paid",
    amount: 19.0,
    currency: "EUR",
    items: [{ description: "Plan Pro — février", qty: 1, unitPrice: 19 }],
  },
];

export interface PaymentMethod {
  id: string;
  type: "card" | "sepa";
  brand?: "visa" | "mastercard" | "amex";
  last4: string;
  expMonth?: number;
  expYear?: number;
  default: boolean;
}

export const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "pm_1", type: "card", brand: "visa", last4: "4242", expMonth: 12, expYear: 2027, default: true },
  { id: "pm_2", type: "sepa", last4: "8821", default: false },
];

// ─── Support ─────────────────────────────────────────────────────────────────

export type TicketStatus = "open" | "pending" | "resolved" | "closed";
export type TicketPriority = "low" | "normal" | "high" | "urgent";

export interface Ticket {
  id: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  category: "billing" | "domains" | "hosting" | "email" | "other";
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    id: string;
    author: string;
    isStaff: boolean;
    body: string;
    sentAt: string;
  }>;
}

export const TICKETS: Ticket[] = [
  {
    id: "tk_001",
    subject: "DNS propagation lente sur acme.com",
    status: "open",
    priority: "normal",
    category: "domains",
    createdAt: "2025-04-18T09:00:00Z",
    updatedAt: "2025-04-19T08:22:00Z",
    messages: [
      {
        id: "m1",
        author: "marie@acme.com",
        isStaff: false,
        body: "Bonjour, j'ai modifié mes records A il y a 2h, je ne vois toujours rien…",
        sentAt: "2025-04-18T09:00:00Z",
      },
      {
        id: "m2",
        author: "Sami (Hostiq Support)",
        isStaff: true,
        body: "Bonjour Marie, la propagation DNS peut prendre jusqu'à 24h. J'ai vérifié, tout est correct côté zone. Pouvez-vous tester avec dig @1.1.1.1 ?",
        sentAt: "2025-04-18T10:15:00Z",
      },
    ],
  },
  {
    id: "tk_002",
    subject: "Comment ajouter un alias email ?",
    status: "resolved",
    priority: "low",
    category: "email",
    createdAt: "2025-04-15T14:00:00Z",
    updatedAt: "2025-04-15T15:30:00Z",
    messages: [
      {
        id: "m1",
        author: "leo@acme.com",
        isStaff: false,
        body: "Salut, comment je crée un alias contact@ ?",
        sentAt: "2025-04-15T14:00:00Z",
      },
      {
        id: "m2",
        author: "Léa (Hostiq Support)",
        isStaff: true,
        body: "Hello ! Direction Email → ta boîte → onglet Alias → bouton Ajouter. C'est instantané.",
        sentAt: "2025-04-15T15:30:00Z",
      },
    ],
  },
];

// ─── Team ────────────────────────────────────────────────────────────────────

export type TeamRole = "owner" | "admin" | "member" | "billing" | "viewer";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: TeamRole;
  joinedAt: string;
  lastActiveAt: string;
  status: "active" | "invited";
}

export const TEAM_MEMBERS: TeamMember[] = [
  {
    id: "tm_1",
    name: "Marie Dupont",
    email: "marie@acme.com",
    role: "owner",
    joinedAt: "2024-02-12",
    lastActiveAt: "2025-04-19",
    status: "active",
  },
  {
    id: "tm_2",
    name: "Léo Martin",
    email: "leo@acme.com",
    role: "admin",
    joinedAt: "2024-03-08",
    lastActiveAt: "2025-04-18",
    status: "active",
  },
  {
    id: "tm_3",
    name: "Yasmine B.",
    email: "yas@acme.com",
    role: "member",
    joinedAt: "2024-06-21",
    lastActiveAt: "2025-04-17",
    status: "active",
  },
  {
    id: "tm_4",
    name: "—",
    email: "newhire@acme.com",
    role: "viewer",
    joinedAt: "2025-04-12",
    lastActiveAt: "—",
    status: "invited",
  },
];

// ─── API Keys ────────────────────────────────────────────────────────────────

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  createdAt: string;
  lastUsedAt?: string;
}

export const API_KEYS: ApiKey[] = [
  {
    id: "k1",
    name: "CI Pipeline",
    prefix: "hq_live_a8f3",
    scopes: ["sites:write", "deployments:write"],
    createdAt: "2024-11-02",
    lastUsedAt: "2025-04-19T08:00:00Z",
  },
  {
    id: "k2",
    name: "Local dev",
    prefix: "hq_test_91b2",
    scopes: ["sites:read", "domains:read"],
    createdAt: "2025-01-12",
    lastUsedAt: "2025-04-15T10:22:00Z",
  },
];

// ─── Notifications ───────────────────────────────────────────────────────────

export type NotificationType = "deploy" | "domain" | "billing" | "security" | "system";

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export const NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    type: "deploy",
    title: "Déploiement prêt",
    body: "acme-web · main · f4a8c12 déployé en 47s.",
    createdAt: "2025-04-18T14:22:00Z",
    read: false,
  },
  {
    id: "n2",
    type: "domain",
    title: "Domaine bientôt expirant",
    body: "skybridge.io expire dans 23 jours. Renouvelez-le.",
    createdAt: "2025-04-17T09:00:00Z",
    read: false,
  },
  {
    id: "n3",
    type: "billing",
    title: "Facture HQ-2025-0042 payée",
    body: "Paiement de 38,00 € confirmé.",
    createdAt: "2025-04-01T08:01:00Z",
    read: true,
  },
];

// ─── Admin / KPIs ────────────────────────────────────────────────────────────

export const ADMIN_KPIS = {
  mrr: 18420,
  mrrDelta: 12.4,
  customers: 1284,
  customersDelta: 4.1,
  domainsManaged: 3142,
  sitesHosted: 2718,
  mailboxes: 894,
  openTickets: 17,
  uptime: 99.992,
  apiCalls24h: 482910,
};

export const ADMIN_USERS = [
  { id: "u_001", name: "Marie Dupont", email: "marie@acme.com", plan: "Pro", mrr: 19, since: "2024-02-12", status: "active", sites: 4, domains: 2 },
  { id: "u_002", name: "Studio Noir", email: "team@studio-noir.fr", plan: "Pro", mrr: 23.5, since: "2024-09-01", status: "active", sites: 1, domains: 1 },
  { id: "u_003", name: "Labs Inc.", email: "ops@labs.dev", plan: "Business", mrr: 79, since: "2024-04-22", status: "active", sites: 12, domains: 6 },
  { id: "u_004", name: "Hugo K.", email: "hugo.k@example.com", plan: "Starter", mrr: 0, since: "2025-04-12", status: "active", sites: 1, domains: 0 },
  { id: "u_005", name: "Pixel Forge", email: "owner@pixelforge.io", plan: "Pro", mrr: 19, since: "2024-12-08", status: "suspended", sites: 0, domains: 1 },
];

export const PROVIDERS_STATUS = [
  { id: "planethoster", name: "PlanetHoster", status: "operational", latencyMs: 142, lastCheck: "1 min ago" },
  { id: "vercel", name: "Vercel", status: "operational", latencyMs: 89, lastCheck: "1 min ago" },
  { id: "google-workspace", name: "Google Workspace", status: "operational", latencyMs: 210, lastCheck: "1 min ago" },
  { id: "ms365", name: "Microsoft 365", status: "degraded", latencyMs: 980, lastCheck: "1 min ago" },
  { id: "zoho", name: "Zoho Mail", status: "operational", latencyMs: 320, lastCheck: "1 min ago" },
  { id: "stripe", name: "Stripe", status: "operational", latencyMs: 76, lastCheck: "1 min ago" },
];

export const API_LOGS = Array.from({ length: 25 }).map((_, i) => ({
  id: `log_${i}`,
  ts: `2025-04-19T0${(9 - (i % 9))}:${String(50 - i).padStart(2, "0")}:00Z`,
  provider: ["PlanetHoster", "Vercel", "Google", "Stripe", "Zoho"][i % 5],
  endpoint: ["GET /domains", "POST /deployments", "GET /mailboxes", "POST /charges", "GET /zone"][i % 5],
  status: i % 7 === 0 ? 500 : i % 5 === 0 ? 404 : 200,
  latencyMs: 50 + (i * 17) % 800,
  user: ["marie@acme.com", "ops@labs.dev", "team@studio-noir.fr", "ci@hostiq.io"][i % 4],
}));

export const AUDIT_LOG = [
  { id: "a1", ts: "2025-04-19T09:32:00Z", actor: "admin@hostiq.io", action: "user.suspend", target: "u_005", ip: "82.66.12.4" },
  { id: "a2", ts: "2025-04-19T08:14:00Z", actor: "marie@acme.com", action: "domain.transfer.start", target: "skybridge.io", ip: "78.193.4.22" },
  { id: "a3", ts: "2025-04-18T22:01:00Z", actor: "ops@labs.dev", action: "site.delete", target: "labs-old", ip: "212.83.44.10" },
  { id: "a4", ts: "2025-04-18T18:30:00Z", actor: "admin@hostiq.io", action: "plan.update", target: "pro", ip: "82.66.12.4" },
];

export const STATUS_INCIDENTS = [
  {
    id: "inc_1",
    title: "Latence accrue API Microsoft 365",
    severity: "minor",
    status: "monitoring",
    startedAt: "2025-04-19T07:42:00Z",
    updates: [
      { at: "2025-04-19T08:30:00Z", body: "Mitigation déployée, latence en baisse." },
      { at: "2025-04-19T07:42:00Z", body: "Latence accrue détectée côté provider Microsoft." },
    ],
  },
];

export const BLOG_POSTS = [
  {
    slug: "lancement-hostiq",
    title: "Lancement de Hostiq : l'hébergement sans infra",
    excerpt: "Pourquoi nous avons construit Hostiq sur des APIs et ce que ça change pour vous.",
    author: "Marie Dupont",
    date: "2025-04-15",
    readTime: 6,
    tag: "Produit",
  },
  {
    slug: "domaines-en-30-secondes",
    title: "Acheter un domaine en 30 secondes (sans paniquer)",
    excerpt: "Le guide pratique pour choisir, acheter et configurer un domaine sans erreur.",
    author: "Léa Sanchez",
    date: "2025-04-08",
    readTime: 8,
    tag: "Guide",
  },
  {
    slug: "vercel-vs-traditionnel",
    title: "Vercel vs hébergement traditionnel : le vrai comparatif",
    excerpt: "Edge, build time, DX, prix : on met les chiffres sur la table.",
    author: "Hugo K.",
    date: "2025-03-30",
    readTime: 10,
    tag: "Tech",
  },
];

export const PROMO_CODES = [
  { id: "p1", code: "WELCOME10", discount: 10, type: "percent", usage: 142, max: 500, expires: "2025-12-31", active: true },
  { id: "p2", code: "BLACKFRI", discount: 30, type: "percent", usage: 0, max: 1000, expires: "2025-11-30", active: false },
  { id: "p3", code: "FREE-DOMAIN", discount: 9.99, type: "fixed", usage: 88, max: 200, expires: "2025-09-01", active: true },
];

export const ANNOUNCEMENTS = [
  { id: "an1", title: "Maintenance planifiée", body: "Maintenance API le 25/04 entre 02h-04h UTC.", audience: "all", scheduledAt: "2025-04-25T02:00:00Z", status: "scheduled" },
  { id: "an2", title: "Nouveau plan Business", body: "Découvrez les nouvelles limites du plan Business.", audience: "pro", scheduledAt: "2025-04-10T10:00:00Z", status: "sent" },
];
