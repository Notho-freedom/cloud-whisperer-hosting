import { logApiCall } from "./_helpers.server";

const BASE = "https://api.github.com";

export async function gh<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  const start = Date.now();
  let status = 0;
  try {
    const res = await fetch(`${BASE}${path}`, {
      ...init,
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "User-Agent": "Hostiq",
        ...(init.headers || {}),
      },
    });
    status = res.status;
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(json?.message || `GitHub ${res.status}`);
    return json as T;
  } finally {
    void logApiCall({ provider: "github", endpoint: path, method: init.method ?? "GET", status, latency_ms: Date.now() - start });
  }
}

export type GhRepo = {
  id: number;
  name: string;
  full_name: string;
  private: boolean;
  default_branch: string;
  html_url: string;
  description: string | null;
  updated_at: string;
};

export async function exchangeCodeForToken(code: string): Promise<{ access_token: string; scope: string }> {
  const id = process.env.GITHUB_CLIENT_ID;
  const secret = process.env.GITHUB_CLIENT_SECRET;
  if (!id || !secret) throw new Error("GitHub OAuth credentials missing");
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ client_id: id, client_secret: secret, code }),
  });
  const json = await res.json();
  if (!json.access_token) throw new Error(json?.error_description || "OAuth exchange failed");
  return json;
}
