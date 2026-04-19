import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { DEPLOYMENTS } from "@/lib/mocks";
import { ArrowLeft, Download, RotateCcw, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/_app/app/sites/$projectId/deployments/$deploymentId")({
  component: DeploymentDetail,
});

function DeploymentDetail() {
  const { projectId, deploymentId } = Route.useParams();
  const d = DEPLOYMENTS.find((x) => x.id === deploymentId) ?? DEPLOYMENTS[0];
  const buildLog = [
    "[00:00] Cloning repository…",
    "[00:02] Installing dependencies…",
    "[00:18] Running build command: pnpm build",
    "[00:32] Generated 142 routes",
    "[00:41] Optimizing images…",
    "[00:47] Build completed successfully ✓",
  ];
  return (
    <PageContent className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/sites/$projectId/deployments" params={{ projectId }}><ArrowLeft className="h-4 w-4" />Retour</Link>
        </Button>
        <StatusBadge status={d.status} />
        <Badge variant="outline" className="font-mono text-[10px]">{d.commitSha}</Badge>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Build logs</CardTitle>
            <Button variant="outline" size="sm"><Download className="h-3.5 w-3.5" />Télécharger</Button>
          </CardHeader>
          <CardContent>
            <pre className="rounded-md bg-foreground/5 p-4 font-mono text-xs leading-relaxed text-foreground/80 overflow-auto">
              {buildLog.join("\n")}
            </pre>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card><CardContent className="p-5 space-y-3 text-sm">
            <div><p className="text-xs text-muted-foreground">Commit</p><p className="font-medium">{d.commitMsg}</p></div>
            <div><p className="text-xs text-muted-foreground">Auteur</p><p>{d.author}</p></div>
            <div><p className="text-xs text-muted-foreground">Durée</p><p>{d.duration ? `${d.duration}s` : "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">URL</p><a href={d.url} className="text-primary hover:underline break-all inline-flex items-center gap-1">{d.url}<ExternalLink className="h-3 w-3" /></a></div>
          </CardContent></Card>
          <Card><CardContent className="p-5 space-y-2">
            <Button variant="outline" className="w-full"><RotateCcw className="h-4 w-4" />Redéployer ce commit</Button>
            <Button variant="outline" className="w-full">Promouvoir en production</Button>
          </CardContent></Card>
        </div>
      </div>
    </PageContent>
  );
}
