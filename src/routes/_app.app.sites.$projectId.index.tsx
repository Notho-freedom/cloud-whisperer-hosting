import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, GitBranch, Rocket, Loader2, ArrowUpRight, Globe2, ScrollText, BarChart3, Github } from "lucide-react";
import { PageContent, PageHeader } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { getSite, listSiteDeployments, redeploySite } from "@/api/sites-api";

export const Route = createFileRoute("/_app/app/sites/$projectId/")({
  component: SiteOverview,
});

function SiteOverview() {
  const { projectId } = Route.useParams();
  const qc = useQueryClient();
  const { data: site } = useQuery({ queryKey: ["site", projectId], queryFn: () => getSite({ data: { id: projectId } }) });
  const { data: deps } = useQuery({ queryKey: ["deployments", projectId], queryFn: () => listSiteDeployments({ data: { siteId: projectId } }) });

  const redeploy = useMutation({
    mutationFn: () => redeploySite({ data: { siteId: projectId } }),
    onSuccess: () => { toast.success("Deployment triggered"); qc.invalidateQueries({ queryKey: ["deployments", projectId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  const recent = deps?.db?.slice(0, 5) ?? [];
  const last = recent[0];
  const repo = site?.git_repo?.replace(/^https?:\/\/github\.com\//, "");

  return (
    <>
      <PageHeader
        title={site?.name ?? projectId}
        description={
          <span className="inline-flex flex-wrap items-center gap-3 text-sm">
            {site?.prod_url && <a href={site.prod_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{site.prod_url.replace(/^https?:\/\//, "")} <ExternalLink className="h-3 w-3" /></a>}
            {site?.framework && <Badge variant="outline" className="text-[10px] uppercase">{site.framework}</Badge>}
            {repo && <span className="inline-flex items-center gap-1 text-xs"><Github className="h-3 w-3" />{repo}</span>}
          </span>
        }
        actions={
          <>
            {site?.prod_url && <Button variant="outline" asChild><a href={site.prod_url} target="_blank" rel="noreferrer">Visit <ExternalLink className="h-3.5 w-3.5" /></a></Button>}
            <Button onClick={() => redeploy.mutate()} disabled={redeploy.isPending || !site?.vercel_project_id}>
              {redeploy.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Manual Deploy
            </Button>
          </>
        }
      />
      <PageContent className="space-y-6">
        {/* Latest deployment hero */}
        <Card>
          <CardContent className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Production</p>
                <p className="mt-1 font-semibold">{last?.commit_msg ?? "No deployments yet"}</p>
                {last && (
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <StatusBadge status={last.status} />
                    {last.commit_sha && <span className="font-mono">{last.commit_sha.slice(0, 7)}</span>}
                    <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" />{last.branch ?? "main"}</span>
                    <span>{new Date(last.created_at).toLocaleString("fr-FR")}</span>
                  </div>
                )}
              </div>
              {last && (
                <Button asChild variant="outline" size="sm">
                  <Link to="/app/sites/$projectId/deployments/$deploymentId" params={{ projectId, deploymentId: last.id }}>
                    View details <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Domains" value={site?.domains?.length ?? 0} icon={Globe2} to={`/app/sites/${projectId}/domains`} />
          <StatCard label="Deployments" value={deps?.db?.length ?? 0} icon={Rocket} to={`/app/sites/${projectId}/deployments`} />
          <StatCard label="Logs" value="Live" icon={ScrollText} to={`/app/sites/${projectId}/logs`} />
          <StatCard label="Analytics" value="Open" icon={BarChart3} to={`/app/sites/${projectId}/analytics`} />
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <p className="text-sm font-semibold">Recent deployments</p>
              <Button asChild variant="ghost" size="sm">
                <Link to="/app/sites/$projectId/deployments" params={{ projectId }}>View all <ArrowUpRight className="h-3 w-3" /></Link>
              </Button>
            </div>
            <div className="divide-y divide-border">
              {recent.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">No deployments yet.</p>}
              {recent.map((d) => (
                <Link key={d.id} to="/app/sites/$projectId/deployments/$deploymentId" params={{ projectId, deploymentId: d.id }}
                  className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30">
                  <StatusBadge status={d.status} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.commit_msg ?? "Deployment"}</p>
                    <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Badge variant={d.target === "production" ? "default" : "outline"} className="text-[9px]">{d.target}</Badge>
                      <span>{new Date(d.created_at).toLocaleString("fr-FR")}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}

function StatCard({ label, value, icon: Icon, to }: { label: string; value: React.ReactNode; icon: React.ComponentType<{ className?: string }>; to: string }) {
  return (
    <Link to={to as never}>
      <Card className="group transition-all hover:border-primary/40">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
            <Icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
          </div>
          <p className="mt-2 text-2xl font-semibold">{value}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
