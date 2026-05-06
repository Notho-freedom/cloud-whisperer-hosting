import { logApiCall } from "./_helpers";

const BASE = "https://api.planethoster.net";

type PlanetHosterMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

type TldPricingMap = Record<string, {
  register: number;
  renew: number;
  transfer?: number;
  id_protection_supported?: boolean;
  transfer_requires_epp_code?: boolean;
}>;

export type DomainSearchResult = {
  domain: string;
  available: boolean;
  price: number;
  renewalPrice: number;
  currency: string;
  isPremium: boolean;
};

export type DomainRegistrant = {
  firstName: string;
  lastName: string;
  email: string;
  companyName?: string;
  address1: string;
  address2?: string;
  city: string;
  postalCode: string;
  state: string;
  countryCode: string;
};

type DomainAvailabilityResponse = {
  available?: boolean;
  message?: string;
  is_premium?: boolean;
  premium_register_price?: number;
  premium_renew_price?: number;
};

type DomainInfoResponse = {
  message?: string;
  order_id?: string | number;
  registration_date?: string;
  expiry_date?: string;
  registration_status?: string;
  purchase_status?: string;
  id_protection?: boolean;
  domain_name?: string;
  nameservers?: { ns1?: string; ns2?: string; ns3?: string; ns4?: string; ns5?: string };
};

function credentials() {
  const user = process.env.PLANETHOSTER_API_USER;
  const key = process.env.PLANETHOSTER_API_KEY;
  if (!user || !key) throw new Error("PlanetHoster n'est pas configuré.");
  return { user, key };
}

function normalizeTld(tld: string) {
  return tld.replace(/^\./, "").toLowerCase();
}

function splitDomain(domain: string) {
  const [sld, ...rest] = domain.toLowerCase().split(".");
  if (!sld || rest.length === 0) throw new Error("Nom de domaine invalide.");
  return { sld, tld: rest.join(".") };
}

async function phRequest<T>(path: string, method: PlanetHosterMethod, payload?: Record<string, unknown>): Promise<T> {
  const { user, key } = credentials();
  const start = Date.now();
  let status = 0;

  try {
    const init: RequestInit = {
      method,
      headers: {
        "X-API-USER": user,
        "X-API-KEY": key,
        Accept: "application/json",
      },
    };

    if (payload && method !== "GET") {
      init.headers = {
        ...init.headers,
        "Content-Type": "application/json",
      };
      init.body = JSON.stringify(payload);
    }

    const url = method === "GET" && payload
      ? `${BASE}${path}?${new URLSearchParams(
          Object.entries(payload).reduce<Record<string, string>>((acc, [key, value]) => {
            if (value !== undefined && value !== null) acc[key] = String(value);
            return acc;
          }, {}),
        ).toString()}`
      : `${BASE}${path}`;

    const res = await fetch(url, init);
    status = res.status;
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json?.error || json?.message || `PlanetHoster ${res.status}`);
    return json as T;
  } finally {
    void logApiCall({
      provider: "planethoster",
      endpoint: path,
      method,
      status,
      latency_ms: Date.now() - start,
    });
  }
}

export async function getTldPricing(currencyCode = "EUR") {
  const response = await phRequest<{ currency_code?: string; tlds?: TldPricingMap }>(
    "/v3/tlds/pricing",
    "GET",
    { currency_code: currencyCode },
  );
  if (!response.tlds) throw new Error("PlanetHoster n'a pas retourné les prix TLD.");
  return {
    currencyCode: response.currency_code || currencyCode,
    tlds: response.tlds,
  };
}

export async function getDomainAvailability(sld: string, tld: string) {
  const response = await phRequest<DomainAvailabilityResponse>("/v3/domain/availability", "GET", {
    sld,
    tld: normalizeTld(tld),
  });
  if (typeof response.available !== "boolean") {
    throw new Error(`Réponse de disponibilité invalide pour ${sld}.${normalizeTld(tld)}.`);
  }
  return response;
}

export async function searchDomain(query: string, tlds: string[]): Promise<DomainSearchResult[]> {
  const normalizedQuery = query.replace(/\.[a-z0-9-]+$/i, "").toLowerCase();
  const pricing = await getTldPricing("EUR");

  return Promise.all(
    tlds.map(async (rawTld) => {
      const tld = normalizeTld(rawTld);
      const priceInfo = pricing.tlds[`.${tld}`] || pricing.tlds[tld];
      if (!priceInfo) {
        throw new Error(`Aucun tarif réel n'est disponible pour .${tld}.`);
      }

      const availabilityResp = await getDomainAvailability(normalizedQuery, tld);
      const availability = { ...availabilityResp, available: !!availabilityResp.available };
      const registerPrice = availability.is_premium
        ? Number(availability.premium_register_price ?? priceInfo.register)
        : Number(priceInfo.register);
      const renewalPrice = availability.is_premium
        ? Number(availability.premium_renew_price ?? priceInfo.renew ?? priceInfo.register)
        : Number(priceInfo.renew ?? priceInfo.register);

      return {
        domain: `${normalizedQuery}.${tld}`,
        available: availability.available,
        price: registerPrice,
        renewalPrice,
        currency: pricing.currencyCode,
        isPremium: !!availability.is_premium,
      };
    }),
  );
}

export async function registerDomainWithProvider(input: {
  domainName: string;
  termYears: number;
  registrant: DomainRegistrant;
  nameservers?: string[];
}) {
  const { sld, tld } = splitDomain(input.domainName);
  const nameservers = input.nameservers?.length
    ? input.nameservers
    : ["nsa.n0c.com", "nsb.n0c.com", "nsc.n0c.com"];

  const payload = {
    period: input.termYears,
    ns1: nameservers[0],
    ns2: nameservers[1],
    ns3: nameservers[2],
    ns4: nameservers[3],
    ns5: nameservers[4],
    id_protection: true,
    register_if_premium: true,
    use_planethoster_nameservers: nameservers[0] === "nsa.n0c.com" && nameservers[1] === "nsb.n0c.com",
    addtl_field: {},
    sld,
    tld,
    registrant_first_name: input.registrant.firstName,
    registrant_last_name: input.registrant.lastName,
    registrant_email: input.registrant.email,
    registrant_company_name: input.registrant.companyName || "",
    registrant_address1: input.registrant.address1,
    registrant_address2: input.registrant.address2 || "",
    registrant_city: input.registrant.city,
    registrant_postal_code: input.registrant.postalCode,
    registrant_state: input.registrant.state,
    registrant_country_code: input.registrant.countryCode,
  };

  return phRequest<DomainInfoResponse>("/v3/domain/register", "POST", payload);
}

export async function getDomainProviderInfo(domain: string) {
  const { sld, tld } = splitDomain(domain);
  return phRequest<DomainInfoResponse>("/v3/domain", "GET", { sld, tld });
}

export async function whois(domain: string): Promise<{ domain: string; registrar: string; status: string } | null> {
  const info = await getDomainProviderInfo(domain);
  if (!info.domain_name && !info.registration_status) return null;
  return {
    domain: info.domain_name || domain,
    registrar: "PlanetHoster",
    status: info.registration_status || info.purchase_status || "unknown",
  };
}

export async function setRegistrarLock(domain: string, locked: boolean) {
  const { sld, tld } = splitDomain(domain);
  return phRequest<{ message?: string; is_locked?: boolean; domain_name?: string }>(
    "/v3/domain/lock",
    locked ? "PUT" : "DELETE",
    { sld, tld },
  );
}

// ---- DNS (PlanetHoster real endpoints) ----

export type DnsZoneRecord = {
  id?: string | number;
  type: string;
  name: string;
  value: string;
  ttl?: number;
  priority?: number;
};

export async function getDnsZone(domain: string) {
  const { sld, tld } = splitDomain(domain);
  return phRequest<{ records?: DnsZoneRecord[] }>("/v3/dns/zone", "GET", { sld, tld });
}

export async function saveDnsRecords(domain: string, records: DnsZoneRecord[]) {
  const { sld, tld } = splitDomain(domain);
  return phRequest<{ message?: string }>("/v3/dns/records", "PATCH", { sld, tld, records });
}

export async function resetDnsZone(domain: string) {
  const { sld, tld } = splitDomain(domain);
  return phRequest<{ message?: string }>("/v3/dns/zone/reset", "POST", { sld, tld });
}
