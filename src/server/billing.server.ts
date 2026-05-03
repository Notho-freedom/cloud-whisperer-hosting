import Stripe from "stripe";

let _stripe: Stripe | null = null;
export function stripe(): Stripe {
  if (_stripe) return _stripe;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY missing");
  _stripe = new Stripe(key, { apiVersion: "2024-11-20.acacia" as Stripe.LatestApiVersion });
  return _stripe;
}

export const PLANS = {
  starter: { name: "Starter", price: 0 },
  pro: { name: "Pro", price: 19 },
  business: { name: "Business", price: 49 },
} as const;
export type PlanId = keyof typeof PLANS;
