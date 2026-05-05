import { createFileRoute } from "@tanstack/react-router";
import { stripe } from "@/api/billing";
import { supabaseAdmin } from "@/integrations/supabase/admin";

export const Route = createFileRoute("/api/public/webhooks/stripe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const sig = request.headers.get("stripe-signature");
        const secret = process.env.STRIPE_WEBHOOK_SECRET;
        const body = await request.text();
        if (!sig || !secret) return new Response("Missing signature", { status: 400 });
        let event;
        try {
          event = stripe().webhooks.constructEvent(body, sig, secret);
        } catch (err) {
          return new Response(`Bad signature: ${(err as Error).message}`, { status: 400 });
        }
        try {
          if (event.type === "checkout.session.completed") {
            const s = event.data.object as { metadata?: { org_id?: string; plan_id?: string }; customer?: string; subscription?: string };
            if (s.metadata?.org_id && s.metadata?.plan_id) {
              await supabaseAdmin.from("subscriptions").upsert({
                org_id: s.metadata.org_id,
                plan_id: s.metadata.plan_id,
                status: "active",
                stripe_customer_id: typeof s.customer === "string" ? s.customer : null,
                stripe_subscription_id: typeof s.subscription === "string" ? s.subscription : null,
              }, { onConflict: "org_id" });
            }
          } else if (event.type === "invoice.paid" || event.type === "invoice.finalized") {
            const inv = event.data.object as { id: string; number?: string; amount_paid?: number; amount_due?: number; status?: string; hosted_invoice_url?: string; customer?: string };
            const { data: sub } = await supabaseAdmin
              .from("subscriptions")
              .select("org_id")
              .eq("stripe_customer_id", inv.customer ?? "")
              .maybeSingle();
            if (sub?.org_id) {
              await supabaseAdmin.from("invoices").insert({
                org_id: sub.org_id,
                stripe_invoice_id: inv.id,
                number: inv.number ?? null,
                amount: ((inv.amount_paid ?? inv.amount_due ?? 0) / 100),
                status: inv.status ?? "open",
                pdf_url: inv.hosted_invoice_url ?? null,
              });
            }
          }
        } catch (e) {
          console.error("Stripe webhook handler error:", e);
        }
        return new Response("ok");
      },
    },
  },
});
