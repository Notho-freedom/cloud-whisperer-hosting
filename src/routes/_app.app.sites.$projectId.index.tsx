import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { DEPLOYMENTS, SITES } from "@/lib/mocks";
import { GitBranch, Clock, Rocket } from "lucide-react";

export const Route = createFileRoute("/_app/app/sites/$projectId/")({
  component: SiteOverview,
});

function SiteOverview() {
  const { projectId } = Route.useParams();
  const site = SITES.find((s) => s.id === projectId) ?? SITES[0];
  const lastDpl = DEPLOYMENTS.find((d) => d.siteId === site.id && d.status === "ready");
  return (
    <PageContent className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Dernier déploiement</p>
          <p className="mt-2 text-lg font-semibold">{lastDpl ? new Date(lastDpl.createdAt).toLocaleString("fr-FR") : "—"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Région</p>
          <p className="mt-2 font-mono text-lg font-semibold">{site.region}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Domaines</p>
          <p className="mt-2 text-lg font-semibold">{site.domains.length}</p>
        </CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base">Activité récente</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {DEPLOYMENTS.filter((d) => d.siteId === site.id).slice(0, 4).map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-md border border-border p-3">
              <Rocket className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.commitMsg}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <GitBranch className="h-3 w-3" />{d.branch}
                  <Badge variant="outline" className="font-mono text-[10px]">{d.commitSha}</Badge>
                  <Clock className="h-3 w-3" />{d.duration ? `${d.duration}s` : "—"}
                </div>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContent>
  );
}
