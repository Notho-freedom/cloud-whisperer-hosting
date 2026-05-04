import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { gh, type GhRepo } from "./github.server";

const REDIRECT_URI = "https://hostinq.lovable.app/api/public/github/callback";

export const startGithubOAuth = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) throw new Error("GITHUB_CLIENT_ID not configured");
    const state = `${context.userId}.${randomBytes(16).toString("hex")}`;
    const url = new URL("https://github.com/login/oauth/authorize");
    url.searchParams.set("client_id", clientId);
    url.searchParams.set("redirect_uri", REDIRECT_URI);
    url.searchParams.set("scope", "repo read:user");
    url.searchParams.set("state", state);
    return { url: url.toString() };
  });

export const getGithubConnection = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await supabaseAdmin
      .from("github_connections")
      .select("id, username, avatar_url, scopes, created_at")
      .eq("user_id", context.userId)
      .maybeSingle();
    return data;
  });

export const listGithubRepos = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: conn } = await supabaseAdmin
      .from("github_connections")
      .select("access_token")
      .eq("user_id", context.userId)
      .maybeSingle();
    if (!conn) return [];
    try {
      const repos = await gh<GhRepo[]>("/user/repos?per_page=100&sort=updated", conn.access_token);
      return repos.map((r) => ({
        id: r.id,
        name: r.name,
        fullName: r.full_name,
        private: r.private,
        defaultBranch: r.default_branch,
        url: r.html_url,
        description: r.description,
        updatedAt: r.updated_at,
      }));
    } catch (e) {
      console.error("GitHub list repos failed", e);
      return [];
    }
  });

export const disconnectGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await supabaseAdmin.from("github_connections").delete().eq("user_id", context.userId);
    return { ok: true };
  });
