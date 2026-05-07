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
      branch: z.string().max(100).default("main"),
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
    const gitRepoUrl =
      data.gitRepo ?? (data.githubRepoFullName ? `https://github.com/${data.githubRepoFullName}` : undefined);

    // Create the Vercel project FIRST. If this fails, no site row is written.
    const project = await createVercelProject(data.name, data.framework, gitRepoUrl);
    const prodUrl = `https://${data.name}.vercel.app`;

    const { data: site, error } = await supabaseAdmin
      .from("sites")
      .insert({
        org_id: orgId,
        name: data.name,
        framework: data.framework,
        git_repo: gitRepoUrl ?? null,
        git_branch: data.branch,
        vercel_project_id: project.id,
        prod_url: prodUrl,
      })
      .select()
      .single();
    if (error) throw new Error(error.message);

    // Trigger first deployment if a git source is connected.
    if (data.githubRepoFullName) {
      try {
        const dep = await triggerDeployment(project.id, data.name, {
          type: "github",
          repo: data.githubRepoFullName,
          ref: data.branch,
        });
        if (dep?.id) {
          await supabaseAdmin.from("deployments").insert({
            site_id: site.id,
            vercel_deployment_id: dep.id,
            url: dep.url ? `https://${dep.url}` : null,
            status: "queued",
            target: "production",
            branch: data.branch,
            author: "system",
          });
        }
      } catch (e) {
        console.error("Initial deployment failed:", e);
      }
    }

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
    const { data: site } = await context.supabase
      .from("sites").select("vercel_project_id").eq("id", data.id).maybeSingle();
    if (site?.vercel_project_id) {
      try {
        const { deleteVercelProject } = await import("./sites");
        await deleteVercelProject(site.vercel_project_id);
      } catch (e) {
        console.error("Vercel project delete failed:", e);
      }
    }
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
    let live: Array<{ id?: string; url?: string; state?: string; createdAt?: number }> = [];
    if (site?.vercel_project_id) {
      try {
        const fetched = await listDeployments(site.vercel_project_id);
        live = fetched.map((d) => ({ id: d.uid, url: d.url, state: d.state, createdAt: d.createdAt }));
      } catch (e) {
        console.error("Vercel listDeployments failed:", e);
      }
    }
    return { db: db ?? [], live };
  });

export const getDeployment = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: dep } = await context.supabase.from("deployments").select("*").eq("id", data.id).maybeSingle();
    if (!dep) return null;
    // Fetch live status from Vercel if we have an id
    if (dep.vercel_deployment_id) {
      try {
        const { getVercelDeployment } = await import("./sites");
        const live = await getVercelDeployment(dep.vercel_deployment_id);
        const stateMap: Record<string, string> = { READY: "ready", ERROR: "error", CANCELED: "canceled", BUILDING: "building", QUEUED: "queued", INITIALIZING: "building" };
        const newStatus = stateMap[live.readyState ?? ""] ?? dep.status;
        return { ...dep, status: newStatus, live_url: live.url ? `https://${live.url}` : dep.url };
      } catch {/* ignore */}
    }
    return dep;
  });

export const streamDeploymentBuildEvents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ deploymentId: z.string().uuid(), since: z.number().optional() }).parse)
  .handler(async ({ data, context }) => {
    const { data: dep } = await context.supabase
      .from("deployments").select("vercel_deployment_id, status").eq("id", data.deploymentId).maybeSingle();
    if (!dep?.vercel_deployment_id) return { events: [], status: dep?.status ?? "unknown" };
    const { getDeploymentEvents, getVercelDeployment } = await import("./sites");
    const [events, live] = await Promise.all([
      getDeploymentEvents(dep.vercel_deployment_id, data.since).catch(() => []),
      getVercelDeployment(dep.vercel_deployment_id).catch(() => ({ readyState: dep.status })),
    ]);
    return { events, status: (live.readyState ?? dep.status ?? "unknown").toLowerCase() };
  });

export const getDeploymentRuntimeLogs = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ deploymentId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: dep } = await context.supabase
      .from("deployments").select("vercel_deployment_id").eq("id", data.deploymentId).maybeSingle();
    if (!dep?.vercel_deployment_id) return [];
    const { getRuntimeLogs } = await import("./sites");
    return getRuntimeLogs(dep.vercel_deployment_id).catch(() => []);
  });

export const cancelDeployment = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ deploymentId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: dep } = await context.supabase
      .from("deployments").select("vercel_deployment_id").eq("id", data.deploymentId).maybeSingle();
    if (dep?.vercel_deployment_id) {
      const { cancelVercelDeployment } = await import("./sites");
      await cancelVercelDeployment(dep.vercel_deployment_id);
    }
    await context.supabase.from("deployments").update({ status: "canceled" }).eq("id", data.deploymentId);
    return { ok: true };
  });

// ---- Upload-based deployments ----
const FileUploadSchema = z.object({
  siteId: z.string().uuid().optional(),
  name: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
  framework: z.string().nullable().optional(),
  files: z.array(z.object({
    path: z.string().min(1).max(500),
    data: z.string(),     // base64
    size: z.number().min(0).max(50_000_000),
  })).min(1).max(2000),
});

export const deployFromUpload = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(FileUploadSchema.parse)
  .handler(async ({ data, context }) => {
    assertCapabilityReady("siteProvisioning");
    const [{ supabaseAdmin }, { getUserOrgId }, { createVercelProject, triggerDeploymentFromFiles }] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
      import("./sites"),
    ]);

    let siteId = data.siteId;
    let vercelProjectId: string | null = null;
    if (siteId) {
      const { data: existing } = await context.supabase
        .from("sites").select("vercel_project_id").eq("id", siteId).maybeSingle();
      vercelProjectId = existing?.vercel_project_id ?? null;
    }
    if (!vercelProjectId) {
      const orgId = await getUserOrgId(context.userId);
      const project = await createVercelProject(data.name, data.framework ?? undefined);
      vercelProjectId = project.id;
      const { data: site } = await supabaseAdmin.from("sites").insert({
        org_id: orgId,
        name: data.name,
        framework: data.framework ?? "static",
        vercel_project_id: project.id,
        prod_url: `https://${data.name}.vercel.app`,
      }).select().single();
      siteId = site!.id;
    }

    const dep = await triggerDeploymentFromFiles(data.name, data.files.map((f) => ({
      file: f.path,
      data: f.data,
      encoding: "base64",
    })), { projectId: vercelProjectId, framework: data.framework ?? null });
    if (!dep?.id) throw new Error("Vercel n'a pas retourné d'identifiant de déploiement.");

    const { data: depRow } = await supabaseAdmin.from("deployments").insert({
      site_id: siteId!,
      vercel_deployment_id: dep.id,
      url: dep.url ? `https://${dep.url}` : null,
      status: "queued",
      target: "production",
      branch: null,
      author: "upload",
    }).select().single();

    const totalBytes = data.files.reduce((a, f) => a + f.size, 0);
    await supabaseAdmin.from("site_uploads").insert({
      site_id: siteId!,
      deployment_id: depRow!.id,
      manifest: data.files.map((f) => ({ path: f.path, size: f.size })),
      total_bytes: totalBytes,
    });
    return { siteId, deploymentId: depRow!.id };
  });

export const getSiteUploadManifest = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase
      .from("site_uploads").select("manifest, total_bytes, created_at, deployment_id")
      .eq("site_id", data.siteId).order("created_at", { ascending: false }).limit(1).maybeSingle();
    return row;
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
    const { data: site } = await context.supabase
      .from("sites").select("name, vercel_project_id, git_repo, git_branch").eq("id", data.siteId).maybeSingle();
    if (!site?.vercel_project_id) throw new Error("Aucun projet Vercel lié à ce site.");

    const repoFullName = site.git_repo?.includes("github.com/")
      ? site.git_repo.split("github.com/")[1]?.replace(/\.git$/, "")
      : undefined;
    const dep = await triggerDeployment(
      site.vercel_project_id,
      site.name,
      repoFullName ? { type: "github", repo: repoFullName, ref: site.git_branch ?? "main" } : undefined,
    );
    if (!dep?.id) throw new Error("Vercel n'a pas retourné d'identifiant de déploiement.");

    await supabaseAdmin.from("deployments").insert({
      site_id: data.siteId,
      vercel_deployment_id: dep.id,
      url: dep.url ? `https://${dep.url}` : null,
      status: "queued",
      target: "production",
      branch: site.git_branch ?? "main",
      author: "manual",
    });
    return dep;
  });

// ---- ENV VARS (real Vercel + mirror in DB for UI) ----

export const listEnvVars = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: rows } = await context.supabase
      .from("env_vars").select("*").eq("site_id", data.siteId).order("key");
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
    assertCapabilityReady("siteProvisioning");
    const { upsertVercelEnv } = await import("./sites");
    const { data: site } = await context.supabase
      .from("sites").select("vercel_project_id").eq("id", data.siteId).maybeSingle();
    if (!site?.vercel_project_id) throw new Error("Site sans projet Vercel lié.");

    await upsertVercelEnv(site.vercel_project_id, {
      key: data.key,
      value: data.value,
      type: data.type === "secret" ? "encrypted" : "plain",
      target: data.target,
    });

    const payload = {
      site_id: data.siteId,
      key: data.key,
      value: data.type === "secret" ? "" : data.value,
      target: data.target,
      type: data.type,
      updated_at: new Date().toISOString(),
    };
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
    assertCapabilityReady("siteProvisioning");
    const { deleteVercelEnv, listVercelEnv } = await import("./sites");
    const { data: row } = await context.supabase
      .from("env_vars").select("site_id, key").eq("id", data.id).maybeSingle();
    if (row) {
      const { data: site } = await context.supabase
        .from("sites").select("vercel_project_id").eq("id", row.site_id).maybeSingle();
      if (site?.vercel_project_id) {
        try {
          const envs = await listVercelEnv(site.vercel_project_id);
          const match = envs.find((e) => e.key === row.key);
          if (match?.id) await deleteVercelEnv(site.vercel_project_id, match.id);
        } catch (e) {
          console.error("Vercel env delete failed:", e);
        }
      }
    }
    const { error } = await context.supabase.from("env_vars").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

// ---- SITE DOMAINS (real Vercel) ----

export const addSiteDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid(), domain: z.string().min(3).max(253) }).parse)
  .handler(async ({ data, context }) => {
    assertCapabilityReady("siteProvisioning");
    const { addVercelProjectDomain } = await import("./sites");
    const { data: site } = await context.supabase
      .from("sites").select("domains, vercel_project_id").eq("id", data.siteId).maybeSingle();
    if (!site?.vercel_project_id) throw new Error("Site sans projet Vercel lié.");

    const result = await addVercelProjectDomain(site.vercel_project_id, data.domain);
    const next = Array.from(new Set([...(site.domains ?? []), data.domain]));
    const { error } = await context.supabase.from("sites").update({ domains: next }).eq("id", data.siteId);
    if (error) throw error;
    return { domains: next, verification: result.verification ?? [], verified: result.verified ?? false };
  });

export const removeSiteDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid(), domain: z.string() }).parse)
  .handler(async ({ data, context }) => {
    assertCapabilityReady("siteProvisioning");
    const { removeVercelProjectDomain } = await import("./sites");
    const { data: site } = await context.supabase
      .from("sites").select("domains, vercel_project_id").eq("id", data.siteId).maybeSingle();
    if (site?.vercel_project_id) {
      try { await removeVercelProjectDomain(site.vercel_project_id, data.domain); } catch (e) { console.error("Vercel removeDomain:", e); }
    }
    const next = (site?.domains ?? []).filter((d: string) => d !== data.domain);
    const { error } = await context.supabase.from("sites").update({ domains: next }).eq("id", data.siteId);
    if (error) throw error;
    return { domains: next };
  });

export const verifySiteDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid(), domain: z.string() }).parse)
  .handler(async ({ data, context }) => {
    assertCapabilityReady("siteProvisioning");
    const { verifyVercelProjectDomain } = await import("./sites");
    const { data: site } = await context.supabase
      .from("sites").select("vercel_project_id").eq("id", data.siteId).maybeSingle();
    if (!site?.vercel_project_id) throw new Error("Site sans projet Vercel lié.");
    return verifyVercelProjectDomain(site.vercel_project_id, data.domain);
  });
