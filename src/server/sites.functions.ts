import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserOrgId } from "./_helpers.server";
import { createVercelProject, listDeployments, triggerDeployment } from "./sites.server";

export const listSites = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("sites")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const getSite = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: site, error } = await context.supabase
      .from("sites")
      .select("*")
      .eq("id", data.id)
      .maybeSingle();
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
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const orgId = await getUserOrgId(context.userId);
    let vercelId: string | null = null;
    let prodUrl: string | null = null;
    try {
      const project = await createVercelProject(data.name, data.framework, data.gitRepo);
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
        git_repo: data.gitRepo ?? null,
        vercel_project_id: vercelId,
        prod_url: prodUrl,
      })
      .select()
      .single();
    if (error) throw error;
    return site;
  });

export const listSiteDeployments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: site } = await context.supabase
      .from("sites")
      .select("vercel_project_id")
      .eq("id", data.siteId)
      .maybeSingle();
    const { data: db } = await context.supabase
      .from("deployments")
      .select("*")
      .eq("site_id", data.siteId)
      .order("created_at", { ascending: false });
    let live: Array<Record<string, unknown>> = [];
    if (site?.vercel_project_id) {
      try {
        live = await listDeployments(site.vercel_project_id);
      } catch (e) {
        console.error("Vercel listDeployments failed", e);
      }
    }
    return { db: db ?? [], live };
  });

export const redeploySite = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ siteId: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: site } = await context.supabase
      .from("sites")
      .select("name, vercel_project_id")
      .eq("id", data.siteId)
      .maybeSingle();
    if (!site?.vercel_project_id) throw new Error("No Vercel project linked");
    return triggerDeployment(site.vercel_project_id, site.name);
  });
