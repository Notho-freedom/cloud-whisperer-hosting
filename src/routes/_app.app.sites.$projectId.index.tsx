import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { getSite, listSiteDeployments } from "@/server/sites.server";
import { Rocket } from "lucide-react";

export const Route = createFileRoute("/_app/app/sites/$projectId/")({ component: SiteOverview });

function SiteOverview() {
  const { projectId } = Route.useParams();
  const { data: site } = useQuery({ queryKey: ["site", projectId], queryFn: () => getSite({ data: { id: projectId } }) });
  const { data: deps } = useQuery({ queryKey: ["deployments", projectId], queryFn: () => listSiteDeployments({ data: { siteId: projectId } }) });
  const dbDeps = deps?.db ?? [];
  return (
    <PageContent className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Dernier déploiement</p>
          <p className="mt-2 text-lg font-semibold">{site?.last_deploy_at ? new Date(site.last_deploy_at).toLocaleString("fr-FR") : "—"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Région</p>
          <p className="mt-2 font-mono text-lg font-semibold">{site?.region ?? "cdg1"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Domaines</p>
          <p className="mt-2 text-lg font-semibold">{(site?.domains ?? []).length}</p>
        </CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Activité récente</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          {dbDeps.length === 0 && <p className="text-sm text-muted-foreground">Aucun déploiement.</p>}
          {dbDeps.slice(0, 5).map((d) => (
            <div key={d.id} className="flex items-center gap-3 rounded-md border border-border p-3">
              <Rocket className="h-4 w-4 text-muted-foreground" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{d.commit_msg ?? "Déploiement"}</p>
                <p className="text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString("fr-FR")}</p>
              </div>
              <StatusBadge status={d.status} />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContent>
  );
}
