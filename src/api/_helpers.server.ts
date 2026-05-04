import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function getUserOrgId(userId: string): Promise<string> {
  // Try existing
  const { data } = await supabaseAdmin
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (data) return data.id;
  // Fallback: idempotent RPC
  const { data: rpc, error: rpcErr } = await supabaseAdmin.rpc("ensure_user_org", { _user: userId });
  if (rpcErr) throw rpcErr;
  return rpc as unknown as string;
}

export async function logApiCall(opts: {
  provider: string;
  endpoint: string;
  method?: string;
  status?: number;
  latency_ms?: number;
  user_id?: string | null;
  error?: string | null;
}) {
  try {
    await supabaseAdmin.from("api_call_logs").insert({
      provider: opts.provider,
      endpoint: opts.endpoint,
      method: opts.method ?? "GET",
      status: opts.status ?? null,
      latency_ms: opts.latency_ms ?? null,
      user_id: opts.user_id ?? null,
      error: opts.error ?? null,
    });
  } catch {
    /* ignore */
  }
}

export async function isAdmin(userId: string): Promise<boolean> {
  const { data } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "admin")
    .maybeSingle();
  return !!data;
}

export async function assertAdmin(userId: string) {
  if (!(await isAdmin(userId))) throw new Error("Forbidden");
}
