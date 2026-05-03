import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

async function assertAdmin(userId: string) {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  if (!data) throw new Error("Forbidden");
}

export const adminKpis = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const [users, orgs, sites, domains, mailboxes, openTickets] = await Promise.all([
      supabaseAdmin.from("profiles").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("organizations").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("sites").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("domains").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("mailboxes").select("*", { count: "exact", head: true }),
      supabaseAdmin.from("tickets").select("*", { count: "exact", head: true }).eq("status", "open"),
    ]);
    return {
      users: users.count ?? 0,
      orgs: orgs.count ?? 0,
      sites: sites.count ?? 0,
      domains: domains.count ?? 0,
      mailboxes: mailboxes.count ?? 0,
      openTickets: openTickets.count ?? 0,
    };
  });

export const adminListUsers = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await assertAdmin(context.userId);
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email, name, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) throw error;
    return data;
  });

export const adminSetRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ userId: z.string().uuid(), role: z.enum(["user", "admin", "support"]) }).parse)
  .handler(async ({ data, context }) => {
    await assertAdmin(context.userId);
    await supabaseAdmin.from("user_roles").delete().eq("user_id", data.userId);
    const { error } = await supabaseAdmin.from("user_roles").insert({ user_id: data.userId, role: data.role });
    if (error) throw error;
    return { ok: true };
  });
