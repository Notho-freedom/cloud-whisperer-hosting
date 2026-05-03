import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function getUserOrgId(userId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from("organizations")
    .select("id")
    .eq("owner_id", userId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("No organization for user");
  return data.id;
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
    /* ignore log failures */
  }
}
