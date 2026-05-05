import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertCapabilityReady } from "@/lib/provider-readiness";

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
    assertCapabilityReady("siteProvisioning");
    const [
      { supabaseAdmin },
      { getUserOrgId },
      { createVercelProject, triggerDeployment },
    ] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
      import("./sites"),
    ]);

    const orgId = await getUserOrgId(context.userId);
    const gitRepoUrl = data.gitRepo ?? (data.githubRepoFullName ? `https://github.com/${data.githubRepoFullName}` : undefined);
    const project = await createVercelProject(data.name, data.framework, gitRepoUrl);
    const prodUrl = `https://${data.name}.vercel.app`;

    const { data: site, error } = await supabaseAdmin
      .from("sites")
      .insert({
        org_id: orgId,
        name: data.name,
        framework: data.framework,
        git_repo: gitRepoUrl ?? null,
        vercel_project_id: project.id,
        prod_url: prodUrl,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const dep = await triggerDeployment(project.id, data.name);
    if (!dep?.id) {
      throw new Error("Vercel n'a pas retourné d'identifiant de déploiement.");
    }

    await supabaseAdmin.from("deployments").insert({
      site_id: site.id,
      vercel_deployment_id: dep.id,
      url: dep.url ? `https://${dep.url}` : null,
      status: "queued",
      target: "production",
      author: "system",
    });

    return site;
  });

export const updateSite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    framework: z.string().max(40).optional(),
    region: z.string().max(20).optional(),
    git_branch: z.string().max(100).optional(),
  }).parse)
  .handler(async () => {
    assertCapabilityReady("siteConfig");
    throw new Error("La synchronisation réelle des réglages de site n'est pas encore intégrée.");
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
    const { data: site, error } = await context.supabase
      .from("sites").select("vercel_project_id").eq("id", data.siteId).maybeSingle();
    if (error) throw error;
    const { data: db, error: dbError } = await context.supabase
      .from("deployments").select("*").eq("site_id", data.siteId).order("created_at", { ascending: false });
    if (dbError) throw dbError;
    const live = site?.vercel_project_id
      ? await listDeployments(site.vercel_project_id) as Array<Record<string, unknown>>
      : [];
    return { db: db ?? [], live };
  });

export const getDeployment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: dep, error } = await context.supabase.from("deployments").select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return dep;
  });

export const redeploySite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    assertCapabilityReady("siteProvisioning");
    const [{ supabaseAdmin }, { triggerDeployment }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./sites"),
    ]);
    const { data: site, error } = await context.supabase
      .from("sites").select("name, vercel_project_id").eq("id", data.siteId).maybeSingle();
    if (error) throw error;
    if (!site?.vercel_project_id) throw new Error("Aucun projet Vercel lié");

    const dep = await triggerDeployment(site.vercel_project_id, site.name);
    if (!dep?.id) {
      throw new Error("Vercel n'a pas retourné d'identifiant de déploiement.");
    }

    await supabaseAdmin.from("deployments").insert({
      site_id: data.siteId,
      vercel_deployment_id: dep.id,
      url: dep.url ? `https://${dep.url}` : null,
      status: "queued",
      target: "production",
      author: "manual",
    });
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
  .handler(async () => {
    assertCapabilityReady("siteConfig");
    throw new Error("La gestion réelle des variables d'environnement Vercel n'est pas encore intégrée.");
  });

export const deleteEnvVar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async () => {
    assertCapabilityReady("siteConfig");
    throw new Error("La gestion réelle des variables d'environnement Vercel n'est pas encore intégrée.");
  });

export const addSiteDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid(), domain: z.string().min(3).max(253) }).parse)
  .handler(async () => {
    assertCapabilityReady("siteConfig");
    throw new Error("La liaison réelle des domaines sur le site n'est pas encore intégrée.");
  });

export const removeSiteDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid(), domain: z.string() }).parse)
  .handler(async () => {
    assertCapabilityReady("siteConfig");
    throw new Error("La liaison réelle des domaines sur le site n'est pas encore intégrée.");
  });

export const deployFromGithub = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    name: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
    fullName: z.string().min(3).max(200),
    framework: z.string().max(40).default("nextjs"),
  }).parse)
  .handler(async () => {
    assertCapabilityReady("siteProvisioning");
    throw new Error("Le flux direct deployFromGithub n'est plus disponible. Utilisez la création réelle de site.");
  });
