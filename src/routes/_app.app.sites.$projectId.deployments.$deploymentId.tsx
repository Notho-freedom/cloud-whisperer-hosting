import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getDeployment } from "@/api/sites-api.server";

export const Route = createFileRoute("/_app/app/sites/$projectId/deployments/$deploymentId")({ component: DeploymentDetail });

function DeploymentDetail() {
  const { projectId, deploymentId } = Route.useParams();
  const { data: d } = useQuery({ queryKey: ["deployment", deploymentId], queryFn: () => getDeployment({ data: { id: deploymentId } }) });
  if (!d) return <PageContent><p className="text-sm text-muted-foreground">Chargement…</p></PageContent>;
  return (
    <PageContent className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/sites/$projectId/deployments" params={{ projectId }}><ArrowLeft className="h-4 w-4" />Retour</Link>
        </Button>
        <StatusBadge status={d.status} />
        {d.commit_sha && <Badge variant="outline" className="font-mono text-[10px]">{d.commit_sha}</Badge>}
      </div>
      <Card><CardContent className="p-5 space-y-3 text-sm">
        <div><p className="text-xs text-muted-foreground">Commit</p><p className="font-medium">{d.commit_msg ?? "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Branche</p><p>{d.branch ?? "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Auteur</p><p>{d.author ?? "—"}</p></div>
        <div><p className="text-xs text-muted-foreground">Créé le</p><p>{new Date(d.created_at).toLocaleString("fr-FR")}</p></div>
        {d.url && <div><p className="text-xs text-muted-foreground">URL</p><a href={d.url} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all inline-flex items-center gap-1">{d.url}<ExternalLink className="h-3 w-3" /></a></div>}
      </CardContent></Card>
    </PageContent>
  );
}
