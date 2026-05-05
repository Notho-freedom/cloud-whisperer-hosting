import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createHash, randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listApiKeys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("api_keys")
      .select("id, name, prefix, scopes, last_used_at, created_at")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const createApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().min(1).max(60),
      scopes: z.array(z.string().max(40)).max(20).default(["read"]),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { getUserOrgId }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
    ]);
    const orgId = await getUserOrgId(context.userId);
    const raw = `hq_live_${randomBytes(24).toString("hex")}`;
    const prefix = raw.slice(0, 11);
    const hashed = createHash("sha256").update(raw).digest("hex");
    const { data: row, error } = await supabaseAdmin
      .from("api_keys")
      .insert({
        org_id: orgId,
        user_id: context.userId,
        name: data.name,
        prefix,
        hashed_key: hashed,
        scopes: data.scopes,
      })
      .select("id, name, prefix")
      .single();
    if (error) throw error;
    return { ...row, key: raw };
  });

export const revokeApiKey = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("api_keys").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });
