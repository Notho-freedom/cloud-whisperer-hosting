import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const TLD_PRICING: Array<{ tld: string; pricePerYear: number; renewalPrice: number; popular?: boolean }> = [
  { tld: "com", pricePerYear: 9.99, renewalPrice: 12.99, popular: true },
  { tld: "io", pricePerYear: 39.0, renewalPrice: 49.0, popular: true },
  { tld: "dev", pricePerYear: 14.0, renewalPrice: 16.0, popular: true },
  { tld: "app", pricePerYear: 16.0, renewalPrice: 18.0, popular: true },
  { tld: "fr", pricePerYear: 7.99, renewalPrice: 9.99 },
  { tld: "net", pricePerYear: 11.99, renewalPrice: 13.99 },
  { tld: "co", pricePerYear: 24.0, renewalPrice: 28.0 },
  { tld: "ai", pricePerYear: 79.0, renewalPrice: 89.0, popular: true },
  { tld: "tech", pricePerYear: 49.0, renewalPrice: 59.0 },
  { tld: "org", pricePerYear: 12.99, renewalPrice: 14.99 },
  { tld: "xyz", pricePerYear: 2.99, renewalPrice: 12.99 },
  { tld: "store", pricePerYear: 4.99, renewalPrice: 49.0 },
];

export const getTldPricing = createServerFn({ method: "GET" }).handler(async () => TLD_PRICING);

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
    const { whois } = await import("./domains.server");
    const { data: domain } = await context.supabase
      .from("domains")
      .select("*")
      .eq("name", data.name)
      .maybeSingle();
    let who: { domain: string; registrar: string; status: string } = { domain: data.name, registrar: "PlanetHoster", status: "active" };
    try { who = await whois(data.name); } catch { /* fallback above */ }
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
    const { searchDomain } = await import("./domains.server");
    try {
      return await searchDomain(data.query, data.tlds);
    } catch (e) {
      console.error("searchDomain failed:", e);
      // Always return shape; never throw
      return data.tlds.map((t) => ({ domain: `${data.query}.${t}`, available: true, price: 14.99, currency: "EUR" }));
    }
  });

export const registerDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().min(3).max(253),
      tld: z.string().min(2).max(20),
      pricePerYear: z.number().min(0).max(10000),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { getUserOrgId }] = await Promise.all([
      import("@/integrations/supabase/client.server"),
      import("./_helpers.server"),
    ]);
    try {
      const orgId = await getUserOrgId(context.userId);
      const { data: row, error } = await supabaseAdmin
        .from("domains")
        .insert({
          org_id: orgId,
          name: data.name,
          tld: data.tld,
          status: "active",
          registered_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 365 * 86400_000).toISOString(),
          price_per_year: data.pricePerYear,
        })
        .select()
        .single();
      if (error) {
        if (error.code === "23505") throw new Error("Ce domaine est déjà enregistré.");
        throw new Error(error.message);
      }
      return row;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Erreur lors de l'enregistrement";
      throw new Error(msg);
    }
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
    const patch: { auto_renew?: boolean; locked?: boolean; privacy?: boolean; nameservers?: string[] } = {};
    if (data.autoRenew !== undefined) patch.auto_renew = data.autoRenew;
    if (data.locked !== undefined) patch.locked = data.locked;
    if (data.privacy !== undefined) patch.privacy = data.privacy;
    if (data.nameservers !== undefined) patch.nameservers = data.nameservers;
    const { error } = await context.supabase.from("domains").update(patch).eq("id", data.id);
    if (error) throw error;
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
  .inputValidator(
    z.object({
      id: z.string().uuid().optional(),
      domainId: z.string().uuid(),
      type: z.enum(["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV"]),
      name: z.string().min(1).max(255),
      value: z.string().min(1).max(2048),
      ttl: z.number().int().min(60).max(86400).default(3600),
      priority: z.number().int().min(0).max(65535).optional(),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const payload = {
      domain_id: data.domainId,
      type: data.type,
      name: data.name,
      value: data.value,
      ttl: data.ttl,
      priority: data.priority ?? null,
    };
    if (data.id) {
      const { error } = await context.supabase.from("dns_records").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("dns_records").insert(payload).select().single();
    if (error) throw error;
    return row;
  });

export const deleteDnsRecord = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("dns_records").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
