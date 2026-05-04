import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserOrgId } from "./_helpers.server";
import { stripe } from "./billing.server";

export const listPlans = createServerFn({ method: "GET" }).handler(async () => {
  const { data } = await supabaseAdmin
    .from("plans").select("*").order("sort_order", { ascending: true });
  return data ?? [];
});

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

export const listInvoices = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("invoices").select("*").order("date", { ascending: false }).limit(100);
    if (error) throw error;
    return data ?? [];
  });

export const getInvoice = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { data: row } = await context.supabase.from("invoices").select("*").eq("id", data.id).maybeSingle();
    return row;
  });

export const listPaymentMethods = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data } = await context.supabase.from("payment_methods").select("*").order("created_at", { ascending: false });
    return data ?? [];
  });

export const setDefaultPaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const orgId = await getUserOrgId(context.userId);
    await supabaseAdmin.from("payment_methods").update({ is_default: false }).eq("org_id", orgId);
    const { error } = await supabaseAdmin.from("payment_methods").update({ is_default: true }).eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const removePaymentMethod = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("payment_methods").delete().eq("id", data.id);
    if (error) throw error;
    return { ok: true };
  });

export const createCheckoutSession = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ planId: z.string().min(1).max(40) }).parse)
  .handler(async ({ data, context }) => {
    const orgId = await getUserOrgId(context.userId);
    const { data: plan } = await supabaseAdmin.from("plans").select("*").eq("id", data.planId).maybeSingle();
    if (!plan) throw new Error("Plan introuvable");
    if (plan.price_cents === 0) {
      await supabaseAdmin
        .from("subscriptions")
        .upsert({ org_id: orgId, plan_id: data.planId, status: "active" }, { onConflict: "org_id" });
      return { url: "/app/billing", free: true };
    }
    try {
      const session = await stripe().checkout.sessions.create({
        mode: "subscription",
        line_items: [{
          price_data: {
            currency: (plan.currency || "eur").toLowerCase(),
            recurring: { interval: "month" },
            product_data: { name: `Hostiq ${plan.name}` },
            unit_amount: plan.price_cents,
          },
          quantity: 1,
        }],
        success_url: `https://hostinq.lovable.app/app/billing?ok=1`,
        cancel_url: `https://hostinq.lovable.app/app/billing?cancel=1`,
        metadata: { org_id: orgId, plan_id: data.planId },
      });
      return { url: session.url, free: false };
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "Erreur Stripe");
    }
  });
