import { logApiCall } from "./_helpers";

const BASE = "https://api.vercel.com";

async function vc<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.VERCEL_TOKEN;
  const team = process.env.VERCEL_TEAM_ID;
  if (!token) throw new Error("Vercel n'est pas configuré (VERCEL_TOKEN manquant).");
  const sep = path.includes("?") ? "&" : "?";
  const url = `${BASE}${path}${team ? `${sep}teamId=${team}` : ""}`;
  const start = Date.now();
  let status = 0;
  try {
    const res = await fetch(url, {
      ...init,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...(init.headers || {}),
      },
    });
    status = res.status;
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) {
      const msg = json?.error?.message || json?.message || `Vercel ${res.status}`;
      throw new Error(`Vercel: ${msg}`);
    }
    return json as T;
  } finally {
    void logApiCall({
      provider: "vercel",
      endpoint: path.split("?")[0],
      method: init.method ?? "GET",
      status,
      latency_ms: Date.now() - start,
    });
  }
}

export type VercelDeployment = {
  uid?: string;
  name?: string;
  url?: string;
  state?: string;
  createdAt?: number;
  meta?: Record<string, string>;
};

export async function listVercelProjects() {
  const data = await vc<{ projects: Array<{ id: string; name: string; framework?: string }> }>(
    "/v10/projects?limit=50",
  );
  return data.projects ?? [];
}

export async function createVercelProject(name: string, framework?: string, gitRepo?: string) {
  const body: Record<string, unknown> = { name };
  if (framework) body.framework = framework;
  if (gitRepo) {
    const [, repo] = gitRepo.split("github.com/");
    if (repo) body.gitRepository = { type: "github", repo: repo.replace(/\.git$/, "") };
  }
  return vc<{ id: string; name: string }>("/v11/projects", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function deleteVercelProject(projectId: string) {
  return vc<{ ok?: boolean }>(`/v9/projects/${projectId}`, { method: "DELETE" });
}

export async function listDeployments(projectId: string): Promise<VercelDeployment[]> {
  const data = await vc<{ deployments: VercelDeployment[] }>(
    `/v6/deployments?projectId=${projectId}&limit=20`,
  );
  return data.deployments ?? [];
}

export async function getVercelDeployment(deploymentId: string) {
  return vc<{ id?: string; url?: string; readyState?: string; meta?: Record<string, string>; target?: string; createdAt?: number }>(
    `/v13/deployments/${deploymentId}`,
  );
}

export async function triggerDeployment(
  projectId: string,
  name: string,
  gitSource?: { type: "github"; repo: string; ref?: string },
): Promise<{ id?: string; url?: string }> {
  const body: Record<string, unknown> = { name, project: projectId, target: "production" };
  if (gitSource) {
    body.gitSource = { type: "github", repo: gitSource.repo, ref: gitSource.ref ?? "main" };
  }
  return vc<{ id?: string; url?: string }>("/v13/deployments", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---- Env vars ----

export type VercelEnv = {
  id?: string;
  key: string;
  value?: string;
  type?: "plain" | "encrypted" | "secret" | "system";
  target?: string[];
};

export async function listVercelEnv(projectId: string): Promise<VercelEnv[]> {
  const data = await vc<{ envs: VercelEnv[] }>(`/v9/projects/${projectId}/env`);
  return data.envs ?? [];
}

export async function upsertVercelEnv(
  projectId: string,
  env: { id?: string; key: string; value: string; type: "plain" | "encrypted"; target: string[] },
) {
  if (env.id) {
    return vc<VercelEnv>(`/v9/projects/${projectId}/env/${env.id}`, {
      method: "PATCH",
      body: JSON.stringify({ key: env.key, value: env.value, type: env.type, target: env.target }),
    });
  }
  return vc<VercelEnv>(`/v10/projects/${projectId}/env?upsert=true`, {
    method: "POST",
    body: JSON.stringify({ key: env.key, value: env.value, type: env.type, target: env.target }),
  });
}

export async function deleteVercelEnv(projectId: string, envId: string) {
  return vc<{ ok?: boolean }>(`/v9/projects/${projectId}/env/${envId}`, { method: "DELETE" });
}

// ---- Domains ----

export type VercelDomain = {
  name: string;
  apexName?: string;
  verified?: boolean;
  verification?: Array<{ type: string; domain: string; value: string; reason?: string }>;
};

export async function listVercelProjectDomains(projectId: string): Promise<VercelDomain[]> {
  const data = await vc<{ domains: VercelDomain[] }>(`/v9/projects/${projectId}/domains`);
  return data.domains ?? [];
}

export async function addVercelProjectDomain(projectId: string, name: string) {
  return vc<VercelDomain>(`/v10/projects/${projectId}/domains`, {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export async function removeVercelProjectDomain(projectId: string, name: string) {
  return vc<{ ok?: boolean }>(`/v9/projects/${projectId}/domains/${encodeURIComponent(name)}`, {
    method: "DELETE",
  });
}

export async function verifyVercelProjectDomain(projectId: string, name: string) {
  return vc<VercelDomain>(`/v9/projects/${projectId}/domains/${encodeURIComponent(name)}/verify`, {
    method: "POST",
  });
}

// ---- Deployment events (build logs streaming) ----
export type VercelDeploymentEvent = {
  type?: string;            // stdout, stderr, command, delimiter, ...
  created?: number;
  text?: string;
  payload?: { text?: string; info?: { type?: string; name?: string } };
};

export async function getDeploymentEvents(deploymentId: string, since?: number): Promise<VercelDeploymentEvent[]> {
  const qs = new URLSearchParams({ builds: "1", direction: "forward", limit: "1000" });
  if (since) qs.set("since", String(since));
  const data = await vc<VercelDeploymentEvent[] | { events?: VercelDeploymentEvent[] }>(
    `/v3/deployments/${deploymentId}/events?${qs.toString()}`,
  );
  // Vercel returns either an array (NDJSON parsed) or { events: [] }
  return Array.isArray(data) ? data : data.events ?? [];
}

// ---- File-based deployments (no Git) ----
export type DeployFile = { file: string; data: string; encoding?: "base64" | "utf-8" };

export async function triggerDeploymentFromFiles(
  name: string,
  files: DeployFile[],
  options?: { projectId?: string; target?: "production" | "staging"; framework?: string | null },
) {
  const body: Record<string, unknown> = {
    name,
    target: options?.target ?? "production",
    files: files.map((f) => ({ file: f.file, data: f.data, encoding: f.encoding ?? "base64" })),
  };
  if (options?.projectId) body.project = options.projectId;
  if (options?.framework !== undefined) {
    body.projectSettings = { framework: options.framework ?? null };
  }
  return vc<{ id?: string; url?: string }>("/v13/deployments?forceNew=1", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ---- Project & deployment runtime logs ----
export async function getRuntimeLogs(deploymentId: string, limit = 200) {
  // Vercel runtime logs (lambda/edge invocations). Returns array of log entries.
  const data = await vc<Array<{ id?: string; timestampInMs?: number; message?: string; level?: string; source?: string; type?: string }>>(
    `/v2/deployments/${deploymentId}/events?direction=backward&limit=${limit}&follow=0`,
  );
  return Array.isArray(data) ? data : [];
}

export async function cancelVercelDeployment(deploymentId: string) {
  return vc<{ ok?: boolean }>(`/v12/deployments/${deploymentId}/cancel`, { method: "PATCH" });
}

export async function listVercelDeploymentFiles(deploymentId: string) {
  return vc<Array<{ name: string; type: string; uid?: string; children?: unknown[] }>>(
    `/v6/deployments/${deploymentId}/files`,
  );
}
