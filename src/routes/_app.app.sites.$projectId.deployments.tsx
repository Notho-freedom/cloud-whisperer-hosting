import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { DEPLOYMENTS } from "@/lib/mocks";
import { GitBranch, Clock, RotateCcw, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/app/sites/$projectId/deployments")({
  component: Deployments,
});

function Deployments() {
  const { projectId } = Route.useParams();
  const dpls = DEPLOYMENTS.filter((d) => d.siteId === projectId);
  return (
    <PageContent>
      <Card>
        <div className="divide-y divide-border">
          {dpls.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">Aucun déploiement.</div>}
          {dpls.map((d) => (
            <div key={d.id} className="flex items-center gap-4 p-4 hover:bg-muted/30">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Link to="/app/sites/$projectId/deployments/$deploymentId" params={{ projectId, deploymentId: d.id }} className="font-medium text-sm hover:text-primary truncate">
                    {d.commitMsg}
                  </Link>
                  <Badge variant={d.target === "production" ? "default" : "outline"} className="text-[10px]">{d.target}</Badge>
                </div>
                <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" />{d.branch}</span>
                  <span className="font-mono">{d.commitSha}</span>
                  <span>·</span>
                  <span>{d.author}</span>
                  <Clock className="h-3 w-3" />
                  <span>{new Date(d.createdAt).toLocaleString("fr-FR")}</span>
                </div>
              </div>
              <StatusBadge status={d.status} />
              <Button variant="ghost" size="icon" asChild><a href={d.url} target="_blank" rel="noreferrer"><ExternalLink className="h-3.5 w-3.5" /></a></Button>
              <Button variant="ghost" size="icon"><RotateCcw className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
