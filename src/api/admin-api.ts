import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const adminKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const [users, orgs, sites, domains, mailboxes, openTickets, invoices, apiCalls] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("organizations").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("sites").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("domains").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("mailboxes").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
      supabaseAdmin.from("invoices").select("amount").eq("status", "paid"),
      supabaseAdmin.from("api_call_logs").select("*", { count: "exact", head: true }).gte("created_at", new Date(Date.now() - 86400_000).toISOString()),
    ]);
    const mrr = (invoices.data ?? []).reduce((s, i) => s + Number(i.amount ?? 0), 0);
    return {
      users: users.count ?? 0,
      orgs: orgs.count ?? 0,
      sites: sites.count ?? 0,
      domains: domains.count ?? 0,
      mailboxes: mailboxes.count ?? 0,
      openTickets: openTickets.count ?? 0,
      apiCalls24h: apiCalls.count ?? 0,
      mrr,
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin
      .from("profiles").select("id, email, name, created_at").order("created_at", { ascending: false }).limit(200);
    return data ?? [];
  });

export const adminGetUser = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const [{ data: profile }, { data: roles }, { data: orgs }, { data: sites }, { data: domains }] = await Promise.all([
      supabaseAdmin.from("profiles").select("*").eq("id", data.id).maybeSingle(),
      supabaseAdmin.from("user_roles").select("role").eq("user_id", data.id),
      supabaseAdmin.from("organizations").select("*").eq("owner_id", data.id),
      supabaseAdmin.from("sites").select("id, name, created_at").in("org_id", []),
      supabaseAdmin.from("domains").select("id, name, status, created_at").in("org_id", []),
    ]);
    return { profile, roles: roles ?? [], orgs: orgs ?? [], sites: sites ?? [], domains: domains ?? [] };
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid(), role: z.enum(["user", "admin", "support"]) }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw error;
    return { ok: true };
  });

const list = (table: string, order = "created_at") =>
  createServerFn({ method: "GET" })
    .middleware([requireSupabaseAuth])
    .handler(async ({ context }) => {
      const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
        import("@/integrations/supabase/admin"),
        import("./_helpers"),
      ]);
      await assertAdmin(context.userId);
      const { data } = await supabaseAdmin.from(table as never).select("*").order(order, { ascending: false }).limit(200);
      return data ?? [];
    });

export const adminListSites = list("sites");
export const adminListDomains = list("domains");
export const adminListInvoices = list("invoices", "date");
export const adminListTickets = list("tickets");
export const adminListAuditLog = list("audit_log");
export const adminListApiLogs = list("api_call_logs");
export const adminListIncidents = list("incidents", "started_at");
export const adminListAnnouncements = list("announcements");
export const adminListBlogPosts = list("blog_posts");
export const adminListMailboxes = list("mailboxes");

export const adminListPlans = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const { data } = await supabaseAdmin.from("plans").select("*").order("sort_order", { ascending: true });
    return data ?? [];
  });

export const adminUpsertBlogPost = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    slug: z.string().min(1).max(120),
    title: z.string().min(1).max(200),
    excerpt: z.string().max(500).optional(),
    body: z.string().max(50000).optional(),
    author: z.string().max(120).optional(),
    tag: z.string().max(40).optional(),
    published: z.boolean().default(false),
  }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const payload = { ...data, published_at: data.published ? new Date().toISOString() : null };
    if (data.id) {
      const { error } = await supabaseAdmin.from("blog_posts").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await supabaseAdmin.from("blog_posts").insert(payload).select().single();
    if (error) throw error;
    return row;
  });

export const adminCreateAnnouncement = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    title: z.string().min(1).max(200),
    body: z.string().max(8000).optional(),
    audience: z.string().max(40).default("all"),
    status: z.enum(["scheduled", "sent", "draft"]).default("draft"),
  }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin.from("announcements").insert(data).select().single();
    if (error) throw error;
    return row;
  });

export const adminCreateIncident = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    title: z.string().min(1).max(200),
    severity: z.enum(["minor", "major", "critical"]).default("minor"),
    status: z.enum(["investigating", "identified", "monitoring", "resolved"]).default("investigating"),
  }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const { data: row, error } = await supabaseAdmin.from("incidents").insert(data).select().single();
    if (error) throw error;
    return row;
  });

// Provider health pings
export const adminProviderHealth = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { assertAdmin } = await import("./_helpers");
    await assertAdmin(context.userId);
    const { listPlatformCapabilities } = await import("@/lib/provider-readiness");
    return listPlatformCapabilities().map((capability) => ({
      id: capability.key,
      name: capability.label,
      configured: capability.ready,
      status: capability.ready ? "operational" : "down",
      reason: capability.reason,
    }));
  });

export const adminUpsertPlan = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().min(1).max(40),
    name: z.string().min(1).max(80),
    price_cents: z.number().int().min(0).max(1_000_000),
    description: z.string().max(500).optional(),
    features: z.array(z.string()).default([]),
    popular: z.boolean().default(false),
  }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { assertAdmin }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    await assertAdmin(context.userId);
    const { error } = await supabaseAdmin.from("plans").upsert(data);
    if (error) throw error;
    return { ok: true };
  });
