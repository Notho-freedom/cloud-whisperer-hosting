import { supabaseAdmin } from "@/integrations/supabase/admin";
import type { DomainRegistrant } from "./domains";

export type DomainOrderRecord = {
  id: string;
  org_id: string;
  user_id: string;
  domain_name: string;
  sld: string;
  tld: string;
  term_years: number;
  currency_code: string;
  quoted_register_price: number;
  quoted_renew_price: number | null;
  status: string;
  quote_expires_at: string;
  stripe_checkout_session_id: string | null;
  stripe_payment_status: string | null;
  registrar_order_id: string | null;
  registrar_purchase_status: string | null;
  registrant: DomainRegistrant;
  provider_snapshot: Record<string, unknown>;
  error_message: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

function domainOrders() {
  return (supabaseAdmin as any).from("domain_orders");
}

export async function createDomainOrder(input: {
  orgId: string;
  userId: string;
  domainName: string;
  sld: string;
  tld: string;
  termYears: number;
  currencyCode: string;
  quotedRegisterPrice: number;
  quotedRenewPrice: number;
  quoteExpiresAt: string;
  registrant: DomainRegistrant;
  providerSnapshot: Record<string, unknown>;
}) {
  const { data, error } = await domainOrders()
    .insert({
      org_id: input.orgId,
      user_id: input.userId,
      domain_name: input.domainName,
      sld: input.sld,
      tld: input.tld,
      term_years: input.termYears,
      currency_code: input.currencyCode,
      quoted_register_price: input.quotedRegisterPrice,
      quoted_renew_price: input.quotedRenewPrice,
      quote_expires_at: input.quoteExpiresAt,
      registrant: input.registrant,
      provider_snapshot: input.providerSnapshot,
      status: "quoted",
    })
    .select()
    .single();
  if (error) throw error;
  return data as DomainOrderRecord;
}

export async function updateDomainOrder(id: string, patch: Record<string, unknown>) {
  const { data, error } = await domainOrders()
    .update(patch)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as DomainOrderRecord;
}

export async function getDomainOrder(id: string) {
  const { data, error } = await domainOrders().select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return (data ?? null) as DomainOrderRecord | null;
}

export async function getDomainOrderByCheckoutSession(sessionId: string) {
  const { data, error } = await domainOrders().select("*").eq("stripe_checkout_session_id", sessionId).maybeSingle();
  if (error) throw error;
  return (data ?? null) as DomainOrderRecord | null;
}

export async function persistRegisteredDomain(input: {
  order: DomainOrderRecord;
  providerOrderId?: string | number | null;
  providerStatus?: string | null;
  registrationDate?: string | null;
  expiryDate?: string | null;
  idProtection?: boolean | null;
  nameservers?: Array<string | undefined>;
}) {
  const payload = {
    org_id: input.order.org_id,
    name: input.order.domain_name,
    tld: input.order.tld,
    status: (input.providerStatus || "pending").toLowerCase(),
    registered_at: input.registrationDate || new Date().toISOString(),
    expires_at:
      input.expiryDate ||
      new Date(Date.now() + input.order.term_years * 365 * 24 * 60 * 60 * 1000).toISOString(),
    auto_renew: true,
    locked: true,
    privacy: input.idProtection ?? true,
    nameservers: (input.nameservers ?? []).filter(Boolean),
    registrar: "PlanetHoster",
    planethoster_id: input.providerOrderId ? String(input.providerOrderId) : null,
    price_per_year: input.order.quoted_renew_price ?? input.order.quoted_register_price,
  };

  const { data, error } = await (supabaseAdmin as any)
    .from("domains")
    .upsert(payload, { onConflict: "name" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
