import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserOrgId } from "./_helpers.server";
import { searchDomain, whois } from "./domains.server";

export const listDomains = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const { data, error } = await supabase
      .from("domains")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const getDomain = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ name: z.string().min(3).max(253) }).parse)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: domain } = await supabase
      .from("domains")
      .select("*")
      .eq("name", data.name)
      .maybeSingle();
    return { domain, whois: await whois(data.name) };
  });

export const searchDomains = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      query: z.string().min(1).max(63).regex(/^[a-z0-9-]+$/i),
      tlds: z.array(z.string()).max(20).default(["com", "fr", "io", "dev", "app", "net"]),
    }).parse,
  )
  .handler(async ({ data }) => {
    return searchDomain(data.query, data.tlds);
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
    if (error) throw error;
    return row;
  });

export const listDnsRecords = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ domainId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { supabase } = context;
    const { data: rows, error } = await supabase
      .from("dns_records")
      .select("*")
      .eq("domain_id", data.domainId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    return rows;
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
    const { supabase } = context;
    const payload = {
      domain_id: data.domainId,
      type: data.type,
      name: data.name,
      value: data.value,
      ttl: data.ttl,
      priority: data.priority ?? null,
    };
    if (data.id) {
      const { error } = await supabase.from("dns_records").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await supabase.from("dns_records").insert(payload).select().single();
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
