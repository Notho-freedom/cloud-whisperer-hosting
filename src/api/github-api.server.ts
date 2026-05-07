import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { randomBytes } from "crypto";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/admin";
import { gh, type GhRepo } from "./github";

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

async function userToken(userId: string): Promise<string | null> {
  const { data } = await supabaseAdmin
    .from("github_connections").select("access_token").eq("user_id", userId).maybeSingle();
  return data?.access_token ?? null;
}

export const inspectGithubRepo = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ fullName: z.string().regex(/^[\w.-]+\/[\w.-]+$/), branch: z.string().optional() }).parse)
  .handler(async ({ data, context }) => {
    const token = await userToken(context.userId);
    if (!token) throw new Error("GitHub non connecté.");
    const repo = await gh<{ default_branch: string }>(`/repos/${data.fullName}`, token);
    const branch = data.branch || repo.default_branch || "main";

    let framework: string | null = null;
    let buildCommand: string | null = null;
    let outputDir: string | null = null;
    try {
      const file = await gh<{ content?: string; encoding?: string }>(
        `/repos/${data.fullName}/contents/package.json?ref=${encodeURIComponent(branch)}`,
        token,
      );
      if (file?.content) {
        const pkg = JSON.parse(Buffer.from(file.content, (file.encoding as BufferEncoding) || "base64").toString("utf8"));
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        if (deps.next) { framework = "nextjs"; buildCommand = "next build"; outputDir = ".next"; }
        else if (deps["@remix-run/react"]) { framework = "remix"; buildCommand = "remix build"; outputDir = "build"; }
        else if (deps.astro) { framework = "astro"; buildCommand = "astro build"; outputDir = "dist"; }
        else if (deps.vite) { framework = "vite"; buildCommand = "vite build"; outputDir = "dist"; }
        else if (deps["@tanstack/react-start"]) { framework = "vite"; buildCommand = "vite build"; outputDir = "dist"; }
        else if (deps["create-react-app"] || deps["react-scripts"]) { framework = "create-react-app"; buildCommand = "react-scripts build"; outputDir = "build"; }
      }
    } catch {/* no package.json → static */}
    if (!framework) {
      try {
        await gh<unknown>(`/repos/${data.fullName}/contents/index.html?ref=${encodeURIComponent(branch)}`, token);
        framework = null; // pure static
        outputDir = ".";
      } catch {/* ignore */}
    }
    return { branch, framework, buildCommand, outputDir };
  });

export const listGithubBranches = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ fullName: z.string().regex(/^[\w.-]+\/[\w.-]+$/) }).parse)
  .handler(async ({ data, context }) => {
    const token = await userToken(context.userId);
    if (!token) return [];
    const branches = await gh<Array<{ name: string }>>(
      `/repos/${data.fullName}/branches?per_page=100`, token);
    return branches.map((b) => b.name);
  });

export const getGithubTree = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ fullName: z.string(), branch: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const token = await userToken(context.userId);
    if (!token) throw new Error("GitHub non connecté.");
    const tree = await gh<{ tree: Array<{ path: string; type: string; size?: number; sha: string }> }>(
      `/repos/${data.fullName}/git/trees/${encodeURIComponent(data.branch)}?recursive=1`,
      token,
    );
    return tree.tree;
  });

export const getGithubFile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ fullName: z.string(), branch: z.string(), path: z.string().max(500) }).parse)
  .handler(async ({ data, context }) => {
    const token = await userToken(context.userId);
    if (!token) throw new Error("GitHub non connecté.");
    const file = await gh<{ content?: string; encoding?: string; size?: number }>(
      `/repos/${data.fullName}/contents/${data.path}?ref=${encodeURIComponent(data.branch)}`,
      token,
    );
    if (!file.content) return { text: "", size: file.size ?? 0 };
    const text = Buffer.from(file.content, (file.encoding as BufferEncoding) || "base64").toString("utf8");
    return { text, size: file.size ?? text.length };
  });
