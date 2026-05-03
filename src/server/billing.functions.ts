import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserOrgId } from "./_helpers.server";
import { stripe, PLANS, type PlanId } from "./billing.server";

export const getBillingOverview = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabase } = context;
    const [{ data: subs }, { data: invoices }, { data: pms }, { data: usage }] = await Promise.all([
      supabase.from("subscriptions").select("*").maybeSingle(),
      supabase.from("invoices").select("*").order("date", { ascending: false }).limit(20),
      supabase.from("payment_methods").select("*"),
      supabase.from("usage_metrics").select("*").order("recorded_at", { ascending: false }).limit(12),
    ]);
    return { subscription: subs, invoices: invoices ?? [], paymentMethods: pms ?? [], usage: usage ?? [] };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ planId: z.enum(["starter", "pro", "business"]) }).parse)
  .handler(async ({ data, context }) => {
    const orgId = await getUserOrgId(context.userId);
    const plan = PLANS[data.planId as PlanId];
    if (plan.price === 0) {
      await supabaseAdmin
        .from("subscriptions")
        .upsert({ org_id: orgId, plan_id: data.planId, status: "active" }, { onConflict: "org_id" });
      return { url: "/app/billing", free: true };
    }
    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [
        {
          price_data: {
            currency: "eur",
            recurring: { interval: "month" },
            product_data: { name: `Hostiq ${plan.name}` },
            unit_amount: plan.price * 100,
          },
          quantity: 1,
        },
      ],
      success_url: `${process.env.SUPABASE_URL ? "https://" + (process.env.PUBLIC_HOST ?? "hostinq.lovable.app") : "http://localhost:3000"}/app/billing?ok=1`,
      cancel_url: `https://hostinq.lovable.app/app/billing?cancel=1`,
      metadata: { org_id: orgId, plan_id: data.planId },
    });
    return { url: session.url, free: false };
  });
