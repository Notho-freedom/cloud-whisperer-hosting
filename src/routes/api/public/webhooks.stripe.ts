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
            const session = event.data.object as {
              id: string;
              payment_status?: string;
              metadata?: {
                org_id?: string;
                plan_id?: string;
                domain_order_id?: string;
              };
              customer?: string;
              subscription?: string;
            };

            if (session.metadata?.domain_order_id) {
              const [
                { getDomainOrder, updateDomainOrder, persistRegisteredDomain },
                { registerDomainWithProvider, getDomainProviderInfo },
              ] = await Promise.all([
                import("@/api/domain-orders"),
                import("@/api/domains"),
              ]);

              const order = await getDomainOrder(session.metadata.domain_order_id);
              if (!order) throw new Error(`Commande domaine introuvable: ${session.metadata.domain_order_id}`);
              if (order.status === "completed") return new Response("ok");

              if (new Date(order.quote_expires_at).getTime() < Date.now()) {
                await updateDomainOrder(order.id, {
                  status: "failed",
                  stripe_payment_status: session.payment_status ?? "paid",
                  error_message: "Le devis a expiré avant la confirmation du paiement.",
                });
                throw new Error("Le devis du domaine a expiré avant la finalisation.");
              }

              try {
                await updateDomainOrder(order.id, {
                  status: "payment_confirmed",
                  stripe_checkout_session_id: session.id,
                  stripe_payment_status: session.payment_status ?? "paid",
                  error_message: null,
                });

                const providerResponse = await registerDomainWithProvider({
                  domainName: order.domain_name,
                  termYears: order.term_years,
                  registrant: order.registrant,
                });
                const providerInfo = await getDomainProviderInfo(order.domain_name).catch(() => null);

                await persistRegisteredDomain({
                  order,
                  providerOrderId: providerInfo?.order_id ?? providerResponse.order_id ?? null,
                  providerStatus: providerInfo?.registration_status ?? providerInfo?.purchase_status ?? "pending",
                  registrationDate: providerInfo?.registration_date ?? new Date().toISOString(),
                  expiryDate: providerInfo?.expiry_date ?? null,
                  idProtection: providerInfo?.id_protection ?? true,
                  nameservers: providerInfo?.nameservers
                    ? [
                        providerInfo.nameservers.ns1,
                        providerInfo.nameservers.ns2,
                        providerInfo.nameservers.ns3,
                        providerInfo.nameservers.ns4,
                        providerInfo.nameservers.ns5,
                      ]
                    : ["nsa.n0c.com", "nsb.n0c.com", "nsc.n0c.com"],
                });

                await updateDomainOrder(order.id, {
                  status: "completed",
                  stripe_payment_status: session.payment_status ?? "paid",
                  registrar_order_id: String(providerInfo?.order_id ?? providerResponse.order_id ?? ""),
                  registrar_purchase_status: providerInfo?.purchase_status ?? providerInfo?.registration_status ?? "submitted",
                  completed_at: new Date().toISOString(),
                  error_message: null,
                });
              } catch (error) {
                await updateDomainOrder(order.id, {
                  status: "failed",
                  stripe_payment_status: session.payment_status ?? "paid",
                  error_message: error instanceof Error ? error.message : "Erreur lors de l'enregistrement du domaine.",
                });
                throw error;
              }
            } else if (session.metadata?.org_id && session.metadata?.plan_id) {
              await supabaseAdmin.from("subscriptions").upsert({
                org_id: session.metadata.org_id,
                plan_id: session.metadata.plan_id,
                status: "active",
                stripe_customer_id: typeof session.customer === "string" ? session.customer : null,
                stripe_subscription_id: typeof session.subscription === "string" ? session.subscription : null,
              }, { onConflict: "org_id" });
            }
          } else if (event.type === "invoice.paid" || event.type === "invoice.finalized") {
            const inv = event.data.object as {
              id: string;
              number?: string;
              amount_paid?: number;
              amount_due?: number;
              status?: string;
              hosted_invoice_url?: string;
              customer?: string;
            };
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
                amount: (inv.amount_paid ?? inv.amount_due ?? 0) / 100,
                status: inv.status ?? "open",
                pdf_url: inv.hosted_invoice_url ?? null,
              });
            }
          }
        } catch (e) {
          console.error("Stripe webhook handler error:", e);
          return new Response("Webhook processing failed", { status: 500 });
        }

        return new Response("ok");
      },
    },
  },
});
