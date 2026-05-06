import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertCapabilityReady, getAppBaseUrl } from "@/lib/provider-readiness";

const DomainRegistrantSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName: z.string().min(1).max(80),
  email: z.string().email(),
  companyName: z.string().max(120).optional(),
  address1: z.string().min(1).max(200),
  address2: z.string().max(200).optional(),
  city: z.string().min(1).max(120),
  postalCode: z.string().min(1).max(40),
  state: z.string().min(1).max(120),
  countryCode: z.string().length(2).transform((value) => value.toUpperCase()),
});

function splitDomain(name: string) {
  const [sld, ...rest] = name.toLowerCase().split(".");
  if (!sld || rest.length === 0) throw new Error("Nom de domaine invalide.");
  return { sld, tld: rest.join(".") };
}

export const getTldPricing = createServerFn({ method: "GET" }).handler(async () => {
  assertCapabilityReady("domainSearch");
  const { getTldPricing: fetchTldPricing } = await import("./domains");
  const pricing = await fetchTldPricing("EUR");
  return Object.entries(pricing.tlds).map(([tld, value]) => ({
    tld: tld.replace(/^\./, ""),
    pricePerYear: Number(value.register),
    renewalPrice: Number(value.renew ?? value.register),
  }));
});

export const listDomains = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("domains")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getDomain = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().min(3).max(253) }).parse)
  .handler(async ({ data, context }) => {
    const { whois } = await import("./domains");
    const { data: domain, error } = await context.supabase
      .from("domains")
      .select("*")
      .eq("name", data.name)
      .maybeSingle();
    if (error) throw error;

    let who: Awaited<ReturnType<typeof whois>> = null;
    try {
      who = await whois(data.name);
    } catch {
      who = null;
    }
    return { domain, whois: who };
  });

export const searchDomains = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      query: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/i),
      tlds: z.array(z.string().min(2).max(20)).max(20).default(["com", "fr", "io", "dev", "app", "net"]),
    }).parse,
  )
  .handler(async ({ data }) => {
    assertCapabilityReady("domainSearch");
    const { searchDomain } = await import("./domains");
    return searchDomain(data.query, data.tlds);
  });

export const createDomainCheckout = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      domainName: z.string().min(3).max(253),
      termYears: z.number().int().min(1).max(10),
      registrant: DomainRegistrantSchema,
    }).parse,
  )
  .handler(async ({ data, context }) => {
    assertCapabilityReady("domainPurchase");

    const [{ supabaseAdmin }, { getUserOrgId }, { createDomainOrder, updateDomainOrder }, { searchDomain }, { stripe }] =
      await Promise.all([
        import("@/integrations/supabase/admin"),
        import("./_helpers"),
        import("./domain-orders"),
        import("./domains"),
        import("./billing"),
      ]);

    const { sld, tld } = splitDomain(data.domainName);
    const searchResult = await searchDomain(sld, [tld]);
    const match = searchResult[0];
    if (!match) throw new Error("Impossible de créer un devis pour ce domaine.");
    if (!match.available) throw new Error("Ce domaine n'est plus disponible.");

    const orgId = await getUserOrgId(context.userId);
    const { data: existing } = await supabaseAdmin.from("domains").select("id").eq("name", data.domainName).maybeSingle();
    if (existing) throw new Error("Ce domaine est déjà présent dans votre compte.");

    const quoteExpiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const order = await createDomainOrder({
      orgId,
      userId: context.userId,
      domainName: data.domainName,
      sld,
      tld,
      termYears: data.termYears,
      currencyCode: match.currency,
      quotedRegisterPrice: match.price,
      quotedRenewPrice: match.renewalPrice,
      quoteExpiresAt,
      registrant: data.registrant,
      providerSnapshot: {
        price: match.price,
        renewalPrice: match.renewalPrice,
        currency: match.currency,
        isPremium: match.isPremium,
      },
    });

    const unitAmount = Math.round(match.price * data.termYears * 100);
    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      success_url: `${getAppBaseUrl()}/app/domains?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${getAppBaseUrl()}/app/domains/search?checkout=cancelled`,
      customer_email: data.registrant.email,
      metadata: {
        checkout_kind: "domain_registration",
        domain_order_id: order.id,
      },
      line_items: [
        {
          price_data: {
            currency: match.currency.toLowerCase(),
            product_data: {
              name: `Enregistrement ${data.domainName}`,
              description: `${data.termYears} an(s)`,
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
    });

    await updateDomainOrder(order.id, {
      status: "checkout_created",
      stripe_checkout_session_id: session.id,
      stripe_payment_status: session.payment_status ?? null,
    });

    if (!session.url) {
      throw new Error("Stripe n'a pas retourné d'URL de checkout.");
    }

    return { orderId: order.id, checkoutUrl: session.url };
  });

export const registerDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    throw new Error("L'enregistrement direct est désactivé. Utilisez le checkout réel du domaine.");
  });

export const updateDomainSettings = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      id: z.string().uuid(),
      autoRenew: z.boolean().optional(),
      locked: z.boolean().optional(),
      privacy: z.boolean().optional(),
      nameservers: z.array(z.string().min(3).max(253)).max(8).optional(),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    assertCapabilityReady("domainSearch");
    if (data.autoRenew !== undefined) {
      throw new Error("La gestion réelle du renouvellement automatique n'est pas encore intégrée.");
    }
    if (data.privacy !== undefined) {
      throw new Error("La gestion réelle de la privacy WHOIS n'est pas encore intégrée.");
    }
    if (data.nameservers !== undefined) {
      throw new Error("La mise à jour réelle des nameservers n'est pas encore intégrée.");
    }
    if (data.locked === undefined) {
      throw new Error("Aucune modification réelle demandée.");
    }

    const [{ setRegistrarLock }, { data: domain, error }] = await Promise.all([
      import("./domains"),
      context.supabase.from("domains").select("id, name").eq("id", data.id).maybeSingle(),
    ]);
    if (error) throw error;
    if (!domain) throw new Error("Domaine introuvable.");

    await setRegistrarLock(domain.name, data.locked);
    const { error: updateError } = await context.supabase.from("domains").update({ locked: data.locked }).eq("id", data.id);
    if (updateError) throw updateError;
    return { ok: true };
  });

export const listDnsRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ domainId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("dns_records")
      .select("*")
      .eq("domain_id", data.domainId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return rows ?? [];
  });

export const upsertDnsRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    domainId: z.string().uuid(),
    id: z.string().uuid().optional(),
    type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV"]),
    name: z.string().min(1).max(253),
    value: z.string().min(1).max(2048),
    ttl: z.number().int().min(60).max(86400).default(3600),
    priority: z.number().int().min(0).max(65535).optional(),
  }).parse)
  .handler(async ({ data, context }) => {
    const { saveDnsRecords, getDnsZone } = await import("./domains");
    const { data: dom, error } = await context.supabase
      .from("domains").select("id, name").eq("id", data.domainId).maybeSingle();
    if (error) throw error;
    if (!dom) throw new Error("Domaine introuvable.");
    const zone = await getDnsZone(dom.name);
    const existing = zone.records ?? [];
    const next = [...existing, { type: data.type, name: data.name, value: data.value, ttl: data.ttl, priority: data.priority }];
    await saveDnsRecords(dom.name, next);
    const { data: row, error: insErr } = await context.supabase
      .from("dns_records")
      .insert({ domain_id: data.domainId, type: data.type, name: data.name, value: data.value, ttl: data.ttl, priority: data.priority ?? null })
      .select().single();
    if (insErr) throw insErr;
    return row;
  });

export const deleteDnsRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { saveDnsRecords, getDnsZone } = await import("./domains");
    const { data: rec } = await context.supabase
      .from("dns_records").select("*, domains(name)").eq("id", data.id).maybeSingle();
    const domainName = (rec as { domains?: { name?: string } } | null)?.domains?.name;
    if (domainName) {
      try {
        const zone = await getDnsZone(domainName);
        const filtered = (zone.records ?? []).filter((r) =>
          !(r.type === rec!.type && r.name === rec!.name && r.value === rec!.value),
        );
        await saveDnsRecords(domainName, filtered);
      } catch (e) { console.error("PlanetHoster DNS delete:", e); }
    }
    const { error } = await context.supabase.from("dns_records").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
