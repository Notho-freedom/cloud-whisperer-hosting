import { logApiCall } from "./_helpers.server";

const BASE = "https://api.vercel.com";

async function vc<T>(path: string, init: RequestInit = {}): Promise<T> {
  const token = process.env.VERCEL_TOKEN;
  const team = process.env.VERCEL_TEAM_ID;
  if (!token) throw new Error("VERCEL_TOKEN missing");
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
    if (!res.ok) throw new Error(json?.error?.message || `Vercel ${res.status}`);
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

export async function listDeployments(projectId: string) {
  const data = await vc<{ deployments: Array<Record<string, unknown>> }>(
    `/v6/deployments?projectId=${projectId}&limit=20`,
  );
  return data.deployments ?? [];
}

export async function triggerDeployment(projectId: string, name: string) {
  return vc("/v13/deployments", {
    method: "POST",
    body: JSON.stringify({ name, project: projectId, target: "production" }),
  });
}
