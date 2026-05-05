import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const listSites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getSite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: site, error } = await context.supabase
      .from("sites").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return site;
  });

export const createSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
      framework: z.string().max(40).default("nextjs"),
      gitRepo: z.string().url().optional(),
      githubRepoFullName: z.string().max(200).optional(),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const [
      { supabaseAdmin },
      { getUserOrgId },
      { createVercelProject, triggerDeployment },
    ] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
      import("./sites"),
    ]);
    try {
      const orgId = await getUserOrgId(context.userId);
      let vercelId: string | null = null;
      let prodUrl: string | null = null;
      const gitRepoUrl = data.gitRepo ?? (data.githubRepoFullName ? `https://github.com/${data.githubRepoFullName}` : undefined);
      try {
        const project = await createVercelProject(data.name, data.framework, gitRepoUrl);
        vercelId = project.id;
        prodUrl = `https://${data.name}.vercel.app`;
      } catch (e) {
        console.error("Vercel project creation failed:", e);
      }
      const { data: site, error } = await supabaseAdmin
        .from("sites")
        .insert({
          org_id: orgId,
          name: data.name,
          framework: data.framework,
          git_repo: gitRepoUrl ?? null,
          vercel_project_id: vercelId,
          prod_url: prodUrl,
        })
        .select()
        .single();
      if (error) throw new Error(error.message);
      if (vercelId) {
        try {
          const dep = await triggerDeployment(vercelId, data.name);
          if (dep?.id) {
            await supabaseAdmin.from("deployments").insert({
              site_id: site.id,
              vercel_deployment_id: dep.id,
              url: dep.url ? `https://${dep.url}` : null,
              status: "queued",
              target: "production",
              author: "system",
            });
          }
        } catch (e) {
          console.error("Initial deploy failed", e);
        }
      }
      return site;
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Erreur de création");
    }
  });

export const updateSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    framework: z.string().max(40).optional(),
    region: z.string().max(20).optional(),
    git_branch: z.string().max(100).optional(),
  }).parse)
  .handler(async ({ data, context }) => {
    const { id, ...patch } = data;
    const { error } = await context.supabase.from("sites").update(patch).eq("id", id);
    if (error) throw error;
    return { ok: true };
  });

export const deleteSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("sites").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const listSiteDeployments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { listDeployments } = await import("./sites");
    const { data: site } = await context.supabase
      .from("sites").select("vercel_project_id").eq("id", data.siteId).maybeSingle();
    const { data: db } = await context.supabase
      .from("deployments").select("*").eq("site_id", data.siteId).order("created_at", { ascending: false });
    let live: Array<Record<string, unknown>> = [];
    if (site?.vercel_project_id) {
      try {
        live = await listDeployments(site.vercel_project_id) as Array<Record<string, unknown>>;
      } catch (e) {
        console.error(e);
      }
    }
    return { db: db ?? [], live };
  });

export const getDeployment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: dep } = await context.supabase.from("deployments").select("*").eq("id", data.id).maybeSingle();
    return dep;
  });

export const redeploySite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { triggerDeployment }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./sites"),
    ]);
    const { data: site } = await context.supabase
      .from("sites").select("name, vercel_project_id").eq("id", data.siteId).maybeSingle();
    if (!site?.vercel_project_id) throw new Error("Aucun projet Vercel lié");
    const dep = await triggerDeployment(site.vercel_project_id, site.name);
    if (dep?.id) {
      await supabaseAdmin.from("deployments").insert({
        site_id: data.siteId,
        vercel_deployment_id: dep.id,
        url: dep.url ? `https://${dep.url}` : null,
        status: "queued",
        target: "production",
        author: "manual",
      });
    }
    return dep;
  });

export const listEnvVars = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: rows, error } = await context.supabase
      .from("env_vars").select("*").eq("site_id", data.siteId).order("key");
    if (error) throw error;
    return rows ?? [];
  });

export const upsertEnvVar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid().optional(),
    siteId: z.string().uuid(),
    key: z.string().min(1).max(120).regex(/^[A-Z0-9_]+$/),
    value: z.string().max(8000),
    target: z.array(z.enum(["production", "preview", "development"])).default(["production"]),
    type: z.enum(["plain", "secret"]).default("plain"),
  }).parse)
  .handler(async ({ data, context }) => {
    const payload = { site_id: data.siteId, key: data.key, value: data.value, target: data.target, type: data.type, updated_at: new Date().toISOString() };
    if (data.id) {
      const { error } = await context.supabase.from("env_vars").update(payload).eq("id", data.id);
      if (error) throw error;
      return { id: data.id };
    }
    const { data: row, error } = await context.supabase.from("env_vars").insert(payload).select().single();
    if (error) throw error;
    return row;
  });

export const deleteEnvVar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("env_vars").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const addSiteDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid(), domain: z.string().min(3).max(253) }).parse)
  .handler(async ({ data, context }) => {
    const { data: site } = await context.supabase.from("sites").select("domains").eq("id", data.siteId).maybeSingle();
    const next = Array.from(new Set([...(site?.domains ?? []), data.domain]));
    const { error } = await context.supabase.from("sites").update({ domains: next }).eq("id", data.siteId);
    if (error) throw error;
    return { domains: next };
  });

export const removeSiteDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid(), domain: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const { data: site } = await context.supabase.from("sites").select("domains").eq("id", data.siteId).maybeSingle();
    const next = (site?.domains ?? []).filter((d: string) => d !== data.domain);
    const { error } = await context.supabase.from("sites").update({ domains: next }).eq("id", data.siteId);
    if (error) throw error;
    return { domains: next };
  });

export const deployFromGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    name: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
    fullName: z.string().min(3).max(200),
    framework: z.string().max(40).default("nextjs"),
  }).parse)
  .handler(async ({ data, context }) => {
    const [{ supabaseAdmin }, { gh }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./github"),
    ]);
    const { data: conn } = await supabaseAdmin
      .from("github_connections").select("access_token, username").eq("user_id", context.userId).maybeSingle();
    if (!conn) throw new Error("Connectez d'abord votre compte GitHub");
    try {
      await gh(`/repos/${data.fullName}`, conn.access_token);
    } catch {
      throw new Error("Repo introuvable ou inaccessible");
    }
    return { ok: true, name: data.name, fullName: data.fullName };
  });
