import { createFileRoute } from "@tanstack/react-router";
import { createHmac, timingSafeEqual } from "crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const Route = createFileRoute("/api/public/webhooks/vercel")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.VERCEL_WEBHOOK_SECRET;
        const sig = request.headers.get("x-vercel-signature");
        const body = await request.text();
        if (!secret || !sig) return new Response("Missing signature", { status: 401 });
        const expected = createHmac("sha1", secret).update(body).digest("hex");
        const a = Buffer.from(sig);
        const b = Buffer.from(expected);
        if (a.length !== b.length || !timingSafeEqual(a, b)) {
          return new Response("Invalid signature", { status: 401 });
        }
        try {
          const payload = JSON.parse(body) as {
            type?: string;
            payload?: { deployment?: { id?: string; url?: string; meta?: Record<string, string> }; project?: { id?: string }; target?: string };
          };
          const dep = payload.payload?.deployment;
          const projectId = payload.payload?.project?.id;
          if (dep?.id && projectId) {
            const { data: site } = await supabaseAdmin
              .from("sites")
              .select("id")
              .eq("vercel_project_id", projectId)
              .maybeSingle();
            if (site) {
              const status =
                payload.type === "deployment.succeeded" ? "ready" :
                payload.type === "deployment.error" ? "error" :
                payload.type === "deployment.canceled" ? "canceled" : "building";
              await supabaseAdmin.from("deployments").insert({
                site_id: site.id,
                vercel_deployment_id: dep.id,
                status,
                url: dep.url ?? null,
                target: payload.payload?.target ?? "production",
              });
            }
          }
        } catch (e) {
          console.error("Vercel webhook handler error", e);
        }
        return new Response("ok");
      },
    },
  },
});
