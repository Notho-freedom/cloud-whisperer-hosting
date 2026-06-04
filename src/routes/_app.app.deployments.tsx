import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { GitBranch, Search, Filter, ExternalLink, Loader2 } from "lucide-react";
import { PageContent, PageHeader } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { listSites, listSiteDeployments } from "@/api/sites-api";

export const Route = createFileRoute("/_app/app/deployments")({
  head: () => ({ meta: [{ title: "Deployments | Hostiq" }] }),
  component: DeploymentsAll,
});

function DeploymentsAll() {
  const [query, setQuery] = React.useState("");
  const [envFilter, setEnvFilter] = React.useState<"all" | "production" | "preview">("all");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");

  const sitesQ = useQuery({ queryKey: ["sites"], queryFn: () => listSites() });
  const sites = sitesQ.data ?? [];

  const depQueries = useQuery({
    queryKey: ["all-deployments", sites.map((s) => s.id)],
    queryFn: async () => {
      const all = await Promise.all(sites.map(async (s) => {
        try {
          const r = await listSiteDeployments({ data: { siteId: s.id } });
          return (r.db ?? []).map((d) => ({ ...d, siteName: s.name, siteId: s.id, repo: s.git_repo }));
        } catch { return []; }
      }));
      return all.flat().sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    },
    enabled: sites.length > 0,
  });

  const rows = (depQueries.data ?? []).filter((d) => {
    if (query && !(d.commit_msg ?? "").toLowerCase().includes(query.toLowerCase()) && !d.siteName.toLowerCase().includes(query.toLowerCase())) return false;
    if (envFilter !== "all" && d.target !== envFilter) return false;
    if (statusFilter !== "all" && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <>
      <PageHeader title="Deployments" description="All deployments across your projects." />
      <PageContent className="!max-w-[1400px]">
        <Card className="mb-4 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search by commit or project…" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <Select label="Environment" value={envFilter} onChange={(v) => setEnvFilter(v as typeof envFilter)} options={[
              { v: "all", l: "All environments" }, { v: "production", l: "Production" }, { v: "preview", l: "Preview" },
            ]} />
            <Select label="Status" value={statusFilter} onChange={setStatusFilter} options={[
              { v: "all", l: "All status" }, { v: "ready", l: "Ready" }, { v: "building", l: "Building" }, { v: "error", l: "Error" }, { v: "queued", l: "Queued" },
            ]} />
          </div>
        </Card>

        <Card className="overflow-hidden">
          {depQueries.isLoading || sitesQ.isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">No deployments match your filters.</div>
          ) : (
            <div className="divide-y divide-border">
              {rows.map((d) => (
                <Link key={d.id} to="/app/sites/$projectId/deployments/$deploymentId"
                  params={{ projectId: d.siteId, deploymentId: d.id }}
                  className="flex items-center gap-4 px-4 py-3 hover:bg-muted/30">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.commit_msg ?? "Deployment"}</p>
                    <div className="mt-0.5 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                      <Badge variant="secondary" className="text-[10px]">{d.siteName}</Badge>
                      {d.repo && <span className="truncate max-w-[180px]">{d.repo.replace(/^https?:\/\/github\.com\//, "")}</span>}
                      {d.commit_sha && <span className="font-mono">{d.commit_sha.slice(0, 7)}</span>}
                      <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" />{d.branch ?? "main"}</span>
                      <span>{new Date(d.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                  <StatusBadge status={d.status} />
                  <Badge variant={d.target === "production" ? "default" : "outline"} className="text-[10px]">{d.target}</Badge>
                  {d.url && <a href={d.url} target="_blank" rel="noreferrer" className="text-muted-foreground hover:text-primary" onClick={(e) => e.stopPropagation()}><ExternalLink className="h-3.5 w-3.5" /></a>}
                </Link>
              ))}
            </div>
          )}
        </Card>
      </PageContent>
    </>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: Array<{ v: string; l: string }> }) {
  return (
    <label className="inline-flex items-center gap-1.5 rounded-md border border-border bg-background px-2 py-1.5 text-xs">
      <Filter className="h-3 w-3 text-muted-foreground" />
      <span className="text-muted-foreground">{label}:</span>
      <select className="bg-transparent text-xs font-medium focus:outline-none" value={value} onChange={(e) => onChange(e.target.value)}>
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
