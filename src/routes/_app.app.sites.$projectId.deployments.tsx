import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Clock, ExternalLink } from "lucide-react";
import { listSiteDeployments } from "@/api/sites-api.server";

export const Route = createFileRoute("/_app/app/sites/$projectId/deployments")({ component: Deployments });

function Deployments() {
  const { projectId } = Route.useParams();
  const { data } = useQuery({ queryKey: ["deployments", projectId], queryFn: () => listSiteDeployments({ data: { siteId: projectId } }) });
  const dpls = data?.db ?? [];
  return (
    <PageContent>
      <Card>
        <div className="divide-y divide-border">
          {dpls.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">Aucun déploiement.</div>}
          {dpls.map((d) => (
            <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                <Link to="/app/sites/$projectId/deployments/$deploymentId" params={{ projectId, deploymentId: d.id }} className="font-medium text-sm hover:text-primary truncate">
                  {d.commit_msg ?? "Déploiement"}
                </Link>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <Badge variant={d.target === "production" ? "default" : "outline"} className="text-[10px]">{d.target}</Badge>
                  <Clock className="h-3 w-3" />{new Date(d.created_at).toLocaleString("fr-FR")}
                </div>
              </div>
              <StatusBadge status={d.status} />
              {d.url && <Button variant="ghost" size="icon" asChild><a href={d.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>}
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
