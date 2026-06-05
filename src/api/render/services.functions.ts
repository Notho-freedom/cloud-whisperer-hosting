/**
 * Render services — CRUD + lifecycle + deploys + events + jobs + cron runs
 * + env vars + scaling + headers + routes.
 *
 * All Render HTTP calls go through src/api/render.server.ts. Each function
 * mirrors the response into our Supabase tables so RLS, audit, and offline
 * UX work even when Render is degraded.
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

// ─── Helpers (server-only, loaded inside handlers) ─────────────────────────
async function deps() {
  const [{ supabaseAdmin }, helpers, render] = await Promise.all([
    import("@/integrations/supabase/admin"),
    import("../_helpers"),
    import("../render.server"),
  ]);
  return { supabaseAdmin, ...helpers, ...render };
}

async function getServiceForUser(serviceId: string, userId: string) {
  const { supabaseAdmin } = await import("@/integrations/supabase/admin");
  const { data, error } = await supabaseAdmin
    .from("services" as any).select("*").eq("id", serviceId).maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Service not found");
  // Ownership check
  const { data: org } = await supabaseAdmin
    .from("organization_members" as any).select("user_id")
    .eq("org_id", data.org_id).eq("user_id", userId).maybeSingle();
  if (!org) {
    const { data: o2 } = await supabaseAdmin
      .from("organizations" as any).select("owner_id").eq("id", data.org_id).maybeSingle();
    if (!o2 || o2.owner_id !== userId) throw new Error("Forbidden");
  }
  return data;
}

// ─── List + get ────────────────────────────────────────────────────────────
export const listServices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("services" as any).select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return data ?? [];
  });

export const getService = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: svc, error } = await context.supabase
      .from("services" as any).select("*").eq("id", data.id).maybeSingle();
    if (error) throw error;
    return svc;
  });

// ─── Sync ALL Render services into our DB for the current user's org ───────
export const syncRenderServices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin, getUserOrgId, renderFetch, unwrapList, logApiCall } = await deps();
    const orgId = await getUserOrgId(context.userId);
    const t0 = Date.now();
    try {
      const raw = await renderFetch({ path: "/services", query: { limit: 100 } });
      const { items } = unwrapList<Record<string, unknown>>(raw);
      const rows = items.map((svc) => {
        const s = svc as Record<string, unknown>;
        const sd = (s.serviceDetails as Record<string, unknown> | undefined) ?? {};
        return {
          org_id: orgId,
          render_service_id: s.id as string,
          name: s.name as string,
          type: mapRenderType(s.type as string),
          runtime: (s.env as string) || (sd.env as string) || null,
          region: (s.region as string) || (sd.region as string) || "oregon",
          plan: (sd.plan as string) || null,
          repo: (s.repo as string) || null,
          branch: (s.branch as string) || null,
          root_dir: (s.rootDir as string) || null,
          image_url: (s.imagePath as string) || null,
          suspended: s.suspended === "suspended",
          auto_deploy: s.autoDeploy === "yes",
          prod_url: (s.serviceUrl as string) || (sd.url as string) || null,
          status: (s.suspended as string) || "active",
          metadata: s as unknown as Record<string, unknown>,
        };
      });
      for (const row of rows) {
        await supabaseAdmin.from("services" as any).upsert(row, { onConflict: "render_service_id" });
      }
      await logApiCall({
        provider: "render", endpoint: "/services", method: "GET",
        status: 200, latency_ms: Date.now() - t0, user_id: context.userId,
      });
      return { synced: rows.length };
    } catch (e) {
      await logApiCall({
        provider: "render", endpoint: "/services", method: "GET",
        status: 500, latency_ms: Date.now() - t0, user_id: context.userId,
        error: (e as Error).message,
      });
      throw e;
    }
  });

function mapRenderType(t: string): string {
  // Render uses: web_service, private_service, background_worker, cron_job, static_site
  const allowed = ["web_service", "private_service", "background_worker", "cron_job", "static_site", "workflow"];
  return allowed.includes(t) ? t : "web_service";
}

// ─── Create service ────────────────────────────────────────────────────────
export const createService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      name: z.string().min(1).max(60).regex(/^[a-z0-9-]+$/),
      type: z.enum(["web_service", "private_service", "background_worker", "cron_job", "static_site"]),
      runtime: z.enum(["node", "python", "ruby", "go", "rust", "elixir", "docker", "image", "static"]),
      region: z.string().default("oregon"),
      plan: z.string().default("starter"),
      repo: z.string().url().optional(),
      branch: z.string().default("main"),
      rootDir: z.string().optional(),
      buildCommand: z.string().optional(),
      startCommand: z.string().optional(),
      imageUrl: z.string().optional(),
      scheduleCron: z.string().optional(),
      healthCheckPath: z.string().optional(),
      ownerId: z.string(), // Render owner (workspace) id
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const { supabaseAdmin, getUserOrgId, renderFetch, logApiCall } = await deps();
    const orgId = await getUserOrgId(context.userId);
    const t0 = Date.now();
    try {
      // Build Render payload
      const payload: Record<string, unknown> = {
        type: data.type,
        name: data.name,
        ownerId: data.ownerId,
        serviceDetails: {
          plan: data.plan,
          region: data.region,
          env: data.runtime,
          ...(data.healthCheckPath ? { healthCheckPath: data.healthCheckPath } : {}),
          ...(data.scheduleCron ? { schedule: data.scheduleCron } : {}),
        },
      };
      if (data.repo) {
        payload.repo = data.repo;
        payload.branch = data.branch;
        payload.autoDeploy = "yes";
        if (data.rootDir) payload.rootDir = data.rootDir;
        if (data.buildCommand) (payload.serviceDetails as Record<string, unknown>).buildCommand = data.buildCommand;
        if (data.startCommand) (payload.serviceDetails as Record<string, unknown>).startCommand = data.startCommand;
      }
      if (data.imageUrl) {
        payload.image = { ownerId: data.ownerId, imagePath: data.imageUrl };
      }

      const created = await renderFetch<Record<string, unknown>>({
        method: "POST", path: "/services", body: payload,
      });
      const svc = (created.service as Record<string, unknown>) || created;

      const { data: row, error } = await supabaseAdmin
        .from("services" as any).insert({
          org_id: orgId,
          render_service_id: svc.id as string,
          name: data.name,
          type: data.type,
          runtime: data.runtime,
          region: data.region,
          plan: data.plan,
          repo: data.repo,
          branch: data.branch,
          root_dir: data.rootDir,
          build_command: data.buildCommand,
          start_command: data.startCommand,
          image_url: data.imageUrl,
          health_check_path: data.healthCheckPath,
          schedule_cron: data.scheduleCron,
          prod_url: (svc.serviceUrl as string) || null,
          metadata: svc as unknown as Record<string, unknown>,
        }).select().single();
      if (error) throw error;

      await logApiCall({
        provider: "render", endpoint: "/services", method: "POST",
        status: 201, latency_ms: Date.now() - t0, user_id: context.userId,
      });
      return row;
    } catch (e) {
      await logApiCall({
        provider: "render", endpoint: "/services", method: "POST",
        status: 500, latency_ms: Date.now() - t0, user_id: context.userId,
        error: (e as Error).message,
      });
      throw e;
    }
  });

// ─── Lifecycle ─────────────────────────────────────────────────────────────
const idInput = z.object({ id: z.string().uuid() }).parse;

export const suspendService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch, supabaseAdmin } = await deps();
    await renderFetch({ method: "POST", path: `/services/${svc.render_service_id}/suspend` });
    await supabaseAdmin.from("services" as any).update({ suspended: true }).eq("id", data.id);
    return { ok: true };
  });

export const resumeService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch, supabaseAdmin } = await deps();
    await renderFetch({ method: "POST", path: `/services/${svc.render_service_id}/resume` });
    await supabaseAdmin.from("services" as any).update({ suspended: false }).eq("id", data.id);
    return { ok: true };
  });

export const restartService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({ method: "POST", path: `/services/${svc.render_service_id}/restart` });
    return { ok: true };
  });

export const deleteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch, supabaseAdmin } = await deps();
    await renderFetch({ method: "DELETE", path: `/services/${svc.render_service_id}` });
    await supabaseAdmin.from("services" as any).delete().eq("id", data.id);
    return { ok: true };
  });

export const purgeServiceCache = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({ method: "POST", path: `/services/${svc.render_service_id}/purge-cache` });
    return { ok: true };
  });

export const setFavoriteService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), favorite: z.boolean() }).parse)
  .handler(async ({ data, context }) => {
    await getServiceForUser(data.id, context.userId);
    const { supabaseAdmin } = await import("@/integrations/supabase/admin");
    await supabaseAdmin.from("services" as any).update({ is_favorite: data.favorite }).eq("id", data.id);
    return { ok: true };
  });

// ─── Scaling ───────────────────────────────────────────────────────────────
export const scaleService = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), numInstances: z.number().int().min(1).max(100) }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "POST", path: `/services/${svc.render_service_id}/scale`,
      body: { numInstances: data.numInstances },
    });
    return { ok: true };
  });

export const updateAutoscaling = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    enabled: z.boolean(),
    min: z.number().int().min(1).max(100).optional(),
    max: z.number().int().min(1).max(100).optional(),
    cpuPercentage: z.number().int().min(0).max(100).optional(),
    memoryPercentage: z.number().int().min(0).max(100).optional(),
  }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    if (!data.enabled) {
      await renderFetch({ method: "DELETE", path: `/services/${svc.render_service_id}/autoscaling` });
      return { ok: true };
    }
    await renderFetch({
      method: "PUT", path: `/services/${svc.render_service_id}/autoscaling`,
      body: {
        enabled: true,
        min: data.min,
        max: data.max,
        criteria: {
          cpu: data.cpuPercentage ? { enabled: true, percentage: data.cpuPercentage } : { enabled: false },
          memory: data.memoryPercentage ? { enabled: true, percentage: data.memoryPercentage } : { enabled: false },
        },
      },
    });
    return { ok: true };
  });

// ─── Deploys ───────────────────────────────────────────────────────────────
export const listDeploys = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ serviceId: z.string().uuid(), limit: z.number().int().max(100).default(20) }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.serviceId, context.userId);
    const { renderFetch, unwrapList, supabaseAdmin } = await deps();
    try {
      const raw = await renderFetch({
        path: `/services/${svc.render_service_id}/deploys`, query: { limit: data.limit },
      });
      const { items } = unwrapList<Record<string, unknown>>(raw);
      // Mirror to DB
      for (const d of items) {
        await supabaseAdmin.from("service_deploys" as any).upsert({
          service_id: data.serviceId,
          render_deploy_id: d.id as string,
          status: (d.status as string) ?? "unknown",
          commit_sha: (d.commit as Record<string, unknown> | undefined)?.id as string,
          commit_msg: (d.commit as Record<string, unknown> | undefined)?.message as string,
          trigger: (d.trigger as string) ?? null,
          finished_at: (d.finishedAt as string) ?? null,
          created_at: (d.createdAt as string) ?? new Date().toISOString(),
        }, { onConflict: "render_deploy_id" });
      }
      return items;
    } catch (e) {
      // Fallback to cached DB
      const { data: cached } = await supabaseAdmin
        .from("service_deploys" as any).select("*").eq("service_id", data.serviceId)
        .order("created_at", { ascending: false }).limit(data.limit);
      return cached ?? [];
    }
  });

export const triggerDeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), clearCache: z.boolean().default(false) }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    const r = await renderFetch<Record<string, unknown>>({
      method: "POST", path: `/services/${svc.render_service_id}/deploys`,
      body: { clearCache: data.clearCache ? "clear" : "do_not_clear" },
    });
    return r;
  });

export const cancelDeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), deployId: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "POST", path: `/services/${svc.render_service_id}/deploys/${data.deployId}/cancel`,
    });
    return { ok: true };
  });

export const rollbackDeploy = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), deployId: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "POST", path: `/services/${svc.render_service_id}/rollback`,
      body: { deployId: data.deployId },
    });
    return { ok: true };
  });

// ─── Events ────────────────────────────────────────────────────────────────
export const listEvents = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ serviceId: z.string().uuid(), limit: z.number().int().max(100).default(50) }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.serviceId, context.userId);
    const { renderFetch, unwrapList, supabaseAdmin } = await deps();
    try {
      const raw = await renderFetch({
        path: `/services/${svc.render_service_id}/events`, query: { limit: data.limit },
      });
      const { items } = unwrapList<Record<string, unknown>>(raw);
      for (const ev of items) {
        await supabaseAdmin.from("service_events" as any).upsert({
          service_id: data.serviceId,
          render_event_id: ev.id as string,
          type: (ev.type as string) ?? "unknown",
          details: (ev.details as Record<string, unknown>) ?? {},
          occurred_at: (ev.timestamp as string) ?? new Date().toISOString(),
        }, { onConflict: "render_event_id" });
      }
      return items;
    } catch {
      const { data: cached } = await supabaseAdmin
        .from("service_events" as any).select("*").eq("service_id", data.serviceId)
        .order("occurred_at", { ascending: false }).limit(data.limit);
      return cached ?? [];
    }
  });

// ─── Env vars ──────────────────────────────────────────────────────────────
export const listEnvVars = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch, unwrapList } = await deps();
    const raw = await renderFetch({ path: `/services/${svc.render_service_id}/env-vars` });
    const { items } = unwrapList<Record<string, unknown>>(raw);
    return items;
  });

export const upsertEnvVar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    key: z.string().min(1).max(255).regex(/^[A-Za-z_][A-Za-z0-9_]*$/),
    value: z.string().max(24576),
  }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "PUT",
      path: `/services/${svc.render_service_id}/env-vars/${encodeURIComponent(data.key)}`,
      body: { value: data.value },
    });
    return { ok: true };
  });

export const deleteEnvVar = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), key: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "DELETE",
      path: `/services/${svc.render_service_id}/env-vars/${encodeURIComponent(data.key)}`,
    });
    return { ok: true };
  });

export const replaceAllEnvVars = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    vars: z.array(z.object({ key: z.string(), value: z.string() })).max(500),
  }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "PUT", path: `/services/${svc.render_service_id}/env-vars`,
      body: data.vars,
    });
    return { ok: true };
  });

// ─── Jobs ──────────────────────────────────────────────────────────────────
export const listJobs = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch, unwrapList } = await deps();
    const raw = await renderFetch({ path: `/services/${svc.render_service_id}/jobs` });
    return unwrapList<Record<string, unknown>>(raw).items;
  });

export const createJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({
    id: z.string().uuid(),
    startCommand: z.string().min(1).max(2000),
    planId: z.string().optional(),
  }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    return renderFetch({
      method: "POST", path: `/services/${svc.render_service_id}/jobs`,
      body: { startCommand: data.startCommand, ...(data.planId ? { planId: data.planId } : {}) },
    });
  });

export const cancelJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), jobId: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "POST", path: `/services/${svc.render_service_id}/jobs/${data.jobId}/cancel`,
    });
    return { ok: true };
  });

// ─── Cron runs ─────────────────────────────────────────────────────────────
export const triggerCronJob = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    return renderFetch({
      method: "POST", path: `/cron-jobs/${svc.render_service_id}/runs`,
    });
  });

// ─── Custom domains ────────────────────────────────────────────────────────
export const listCustomDomains = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth]).inputValidator(idInput)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch, unwrapList } = await deps();
    const raw = await renderFetch({ path: `/services/${svc.render_service_id}/custom-domains` });
    return unwrapList<Record<string, unknown>>(raw).items;
  });

export const addCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), name: z.string().min(3).max(255) }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    return renderFetch({
      method: "POST", path: `/services/${svc.render_service_id}/custom-domains`,
      body: { name: data.name },
    });
  });

export const verifyCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), domainId: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    return renderFetch({
      method: "POST",
      path: `/services/${svc.render_service_id}/custom-domains/${data.domainId}/verify`,
    });
  });

export const deleteCustomDomain = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid(), domainId: z.string() }).parse)
  .handler(async ({ data, context }) => {
    const svc = await getServiceForUser(data.id, context.userId);
    const { renderFetch } = await deps();
    await renderFetch({
      method: "DELETE",
      path: `/services/${svc.render_service_id}/custom-domains/${data.domainId}`,
    });
    return { ok: true };
  });
