/**
 * Server-only Render API client. Routes ALL traffic through the Hostiq proxy
 * (`hostiq.genesis-company.net/api/render/*`). Never call api.render.com
 * directly — the Render API key only lives in the proxy.
 *
 * Importing this module is restricted to server execution paths (server fns
 * or server route handlers). It uses `process.env` and never runs in the
 * browser bundle thanks to the `.server` filename guard.
 */

const PROXY_BASE = (process.env.PLANETHOSTER_PROXY_URL || "").replace(/\/+$/, "");
const PROXY_SECRET =
  process.env.PLANETHOSTER_PROXY_SECRET || process.env.PROXY_SHARED_SECRET || "";

export type RenderRequest = {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  path: string; // e.g. "/services" → /api/render/services
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
};

export type RenderError = {
  error: string;
  code?: string;
  status?: number;
  raw?: unknown;
};

function buildUrl({ path, query }: Pick<RenderRequest, "path" | "query">) {
  if (!PROXY_BASE) throw new Error("PLANETHOSTER_PROXY_URL is not configured");
  const url = new URL(`${PROXY_BASE}/api/render${path.startsWith("/") ? path : `/${path}`}`);
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v === undefined || v === null || v === "") continue;
      url.searchParams.set(k, String(v));
    }
  }
  return url.toString();
}

export async function renderFetch<T = unknown>(req: RenderRequest): Promise<T> {
  if (!PROXY_SECRET) throw new Error("PLANETHOSTER_PROXY_SECRET is not configured");
  const url = buildUrl(req);
  const res = await fetch(url, {
    method: req.method ?? "GET",
    headers: {
      "X-Proxy-Secret": PROXY_SECRET,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: req.body !== undefined ? JSON.stringify(req.body) : undefined,
  });

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const err = data as RenderError | null;
    const msg = (err && (err.error || (err as { message?: string }).message)) || `Render ${res.status}`;
    const e = new Error(msg);
    (e as unknown as { status: number }).status = res.status;
    (e as unknown as { raw: unknown }).raw = data;
    throw e;
  }
  return data as T;
}

export async function renderHealth() {
  try {
    return await renderFetch<{ ok: boolean; status: number; ts: number }>({ path: "/health" });
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Render list endpoints return either `{ <items> }` or an array of envelopes
 * `[{ <singular>: {...}, cursor }]`. Normalize to flat array + nextCursor.
 */
export function unwrapList<T>(raw: unknown): { items: T[]; cursor?: string } {
  if (Array.isArray(raw)) {
    const items: T[] = [];
    let cursor: string | undefined;
    for (const entry of raw) {
      if (entry && typeof entry === "object") {
        const e = entry as Record<string, unknown>;
        if (typeof e.cursor === "string") cursor = e.cursor;
        const valueKey = Object.keys(e).find((k) => k !== "cursor");
        if (valueKey) items.push(e[valueKey] as T);
        else items.push(entry as T);
      } else {
        items.push(entry as T);
      }
    }
    return { items, cursor };
  }
  if (raw && typeof raw === "object" && Array.isArray((raw as { data?: unknown[] }).data)) {
    return { items: (raw as { data: T[] }).data };
  }
  return { items: [] };
}
