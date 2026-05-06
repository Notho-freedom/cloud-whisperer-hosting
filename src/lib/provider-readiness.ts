export type PlatformCapabilityKey =
  | "domainSearch"
  | "domainPurchase"
  | "siteProvisioning"
  | "teamInvites"
  | "mailboxProvisioning"
  | "dnsManagement"
  | "siteConfig"
  | "paymentMethodManagement"
  | "githubOauth";

export type PlatformCapability = {
  key: PlatformCapabilityKey;
  ready: boolean;
  label: string;
  reason: string | null;
};

function hasEnv(name: string) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

function capability(
  key: PlatformCapabilityKey,
  label: string,
  ready: boolean,
  reason: string | null,
): PlatformCapability {
  return { key, label, ready, reason };
}

export function getPlatformCapabilities(): Record<PlatformCapabilityKey, PlatformCapability> {
  const hasPlanetHoster = hasEnv("PLANETHOSTER_API_USER") && hasEnv("PLANETHOSTER_API_KEY");
  const hasStripeCheckout = hasEnv("STRIPE_SECRET_KEY");
  const hasStripeWebhook = hasEnv("STRIPE_WEBHOOK_SECRET");
  const hasVercel = hasEnv("VERCEL_TOKEN");
  const hasResend = hasEnv("RESEND_API_KEY");
  const hasGithubOauth = hasEnv("GITHUB_CLIENT_ID") && hasEnv("GITHUB_CLIENT_SECRET");

  return {
    domainSearch: capability(
      "domainSearch",
      "Recherche de domaines",
      hasPlanetHoster,
      hasPlanetHoster ? null : "PlanetHoster n'est pas configuré pour la recherche réelle de domaines.",
    ),
    domainPurchase: capability(
      "domainPurchase",
      "Achat de domaines",
      hasPlanetHoster && hasStripeCheckout && hasStripeWebhook,
      hasPlanetHoster && hasStripeCheckout && hasStripeWebhook
        ? null
        : "L'achat réel de domaines nécessite PlanetHoster ainsi que Stripe checkout et webhook.",
    ),
    siteProvisioning: capability(
      "siteProvisioning",
      "Provisioning de sites",
      hasVercel,
      hasVercel ? null : "Vercel n'est pas configuré pour créer et déployer des sites réels.",
    ),
    teamInvites: capability(
      "teamInvites",
      "Invitations d'équipe",
      hasResend,
      hasResend ? null : "Resend n'est pas configuré pour envoyer les invitations d'équipe.",
    ),
    mailboxProvisioning: capability(
      "mailboxProvisioning",
      "Provisioning email",
      false,
      "Le provisioning réel des boîtes mail n'est pas encore intégré à un provider opérationnel.",
    ),
    dnsManagement: capability(
      "dnsManagement",
      "Gestion DNS",
      hasPlanetHoster,
      hasPlanetHoster ? null : "La gestion DNS réelle nécessite PlanetHoster (PLANETHOSTER_API_USER/KEY).",
    ),
    siteConfig: capability(
      "siteConfig",
      "Configuration de sites",
      hasVercel,
      hasVercel ? null : "La configuration réelle des sites nécessite Vercel (VERCEL_TOKEN).",
    ),
    paymentMethodManagement: capability(
      "paymentMethodManagement",
      "Gestion des moyens de paiement",
      false,
      "La gestion réelle des moyens de paiement Stripe n'est pas encore intégrée.",
    ),
    githubOauth: capability(
      "githubOauth",
      "Connexion GitHub",
      hasGithubOauth,
      hasGithubOauth ? null : "GitHub OAuth n'est pas configuré.",
    ),
  };
}

export function listPlatformCapabilities(): PlatformCapability[] {
  return Object.values(getPlatformCapabilities());
}

export function assertCapabilityReady(key: PlatformCapabilityKey) {
  const capability = getPlatformCapabilities()[key];
  if (!capability.ready) {
    throw new Error(capability.reason ?? `${capability.label} n'est pas disponible.`);
  }
}

export function getAppBaseUrl() {
  return process.env.APP_URL || "https://hostinq.lovable.app";
}
