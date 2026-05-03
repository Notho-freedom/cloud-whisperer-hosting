import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserOrgId } from "./_helpers.server";

export const listMailboxes = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("mailboxes")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const createMailbox = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      address: z.string().email(),
      provider: z.enum(["google", "microsoft", "zoho"]),
      plan: z.string().min(1).max(40),
      quotaGb: z.number().int().min(1).max(1000).default(30),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const orgId = await getUserOrgId(context.userId);
    const domain = data.address.split("@")[1];
    const { data: row, error } = await supabaseAdmin
      .from("mailboxes")
      .insert({
        org_id: orgId,
        address: data.address,
        domain,
        provider: data.provider,
        plan: data.plan,
        quota_gb: data.quotaGb,
      })
      .select()
      .single();
    if (error) throw error;
    return row;
  });
