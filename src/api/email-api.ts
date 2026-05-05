import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const EMAIL_PROVIDERS = [
  { id: "google", name: "Google Workspace", description: "Gmail Pro avec Drive, Meet, Calendar.", pricePerMailbox: 6 },
  { id: "microsoft", name: "Microsoft 365", description: "Outlook + Teams + OneDrive.", pricePerMailbox: 5.6 },
  { id: "zoho", name: "Zoho Mail", description: "Économique, fonctionnalités pro.", pricePerMailbox: 1 },
];

export const listEmailProviders = createServerFn({ method: "GET" }).handler(async () => EMAIL_PROVIDERS);

export const listMailboxes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mailboxes").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getMailbox = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const [{ data: mb }, { data: aliases }, { data: forwards }] = await Promise.all([
      context.supabase.from("mailboxes").select("*").eq("id", data.id).maybeSingle(),
      context.supabase.from("email_aliases").select("*").eq("mailbox_id", data.id),
      context.supabase.from("email_forwards").select("*").eq("mailbox_id", data.id),
    ]);
    return { mailbox: mb, aliases: aliases ?? [], forwards: forwards ?? [] };
  });

export const createMailbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      address: z.string().email(),
      provider: z.enum(["google", "microsoft", "zoho"]),
      plan: z.string().min(1).max(40).default("Standard"),
      quotaGb: z.number().int().min(1).max(1000).default(30),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { getUserOrgId }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    try {
      const orgId = await getUserOrgId(context.userId);
      const domain = data.address.split("@")[1];
      const { data: row, error } = await supabaseAdmin
        .from("mailboxes")
        .insert({
          org_id: orgId, address: data.address, domain,
          provider: data.provider, plan: data.plan, quota_gb: data.quotaGb,
        })
        .select().single();
      if (error) throw new Error(error.message);
      return row;
    } catch (e) { throw new Error(e instanceof Error ? e.message : "Erreur"); }
  });

export const deleteMailbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("mailboxes").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const createAlias = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ mailboxId: z.string().uuid(), alias: z.string().email() }).parse)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("email_aliases").insert({ mailbox_id: data.mailboxId, alias: data.alias }).select().single();
    if (error) throw error;
    return row;
  });

export const deleteAlias = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("email_aliases").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const createForward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ mailboxId: z.string().uuid(), forwardTo: z.string().email() }).parse)
  .handler(async ({ data, context }) => {
    const { data: row, error } = await context.supabase
      .from("email_forwards").insert({ mailbox_id: data.mailboxId, forward_to: data.forwardTo }).select().single();
    if (error) throw error;
    return row;
  });

export const deleteForward = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("email_forwards").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
