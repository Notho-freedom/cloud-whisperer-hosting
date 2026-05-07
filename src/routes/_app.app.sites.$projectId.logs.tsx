import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listSiteDeployments, getDeploymentRuntimeLogs } from "@/api/sites-api";

export const Route = createFileRoute("/_app/app/sites/$projectId/logs")({ component: Logs });

function Logs() {
  const { projectId } = Route.useParams();
  const [filter, setFilter] = React.useState("");
  const [live, setLive] = React.useState(true);

  const { data: deps } = useQuery({
    queryKey: ["deployments", projectId],
    queryFn: () => listSiteDeployments({ data: { siteId: projectId } }),
  });
  const lastDep = deps?.db?.[0];

  const logsQ = useQuery({
    queryKey: ["runtime-logs", lastDep?.id],
    queryFn: () => getDeploymentRuntimeLogs({ data: { deploymentId: lastDep!.id } }),
    enabled: !!lastDep,
    refetchInterval: live ? 3000 : false,
  });

  const lines = (logsQ.data ?? []).filter((l) => !filter || (l.message ?? "").toLowerCase().includes(filter.toLowerCase()));

  return (
    <PageContent>
      <Card className="p-3">
        <div className="flex gap-2">
          <Input placeholder="Filtrer les logs…" className="font-mono" value={filter} onChange={(e) => setFilter(e.target.value)} />
          <Button variant={live ? "default" : "outline"} size="sm" onClick={() => setLive((x) => !x)}>
            {live ? "Live" : "Figé"}
          </Button>
        </div>
      </Card>
      <Card className="mt-4 overflow-hidden">
        <pre className="max-h-[600px] overflow-auto p-4 font-mono text-xs leading-relaxed">
          {!lastDep && <span className="text-muted-foreground">Aucun déploiement.</span>}
          {logsQ.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
          {lines.length === 0 && lastDep && !logsQ.isLoading && <span className="text-muted-foreground">Aucun log d'exécution pour le dernier déploiement.</span>}
          {lines.map((l, i) => (
            <div key={l.id ?? i} className="flex gap-3">
              <span className="text-muted-foreground">{l.timestampInMs ? new Date(l.timestampInMs).toLocaleTimeString("fr-FR") : ""}</span>
              <Badge variant={l.level === "error" ? "destructive" : l.level === "warning" ? "warning" : "secondary"} className="h-4 px-1.5 text-[9px]">{(l.level ?? "info").toUpperCase()}</Badge>
              <span className="text-foreground/80 whitespace-pre-wrap break-all">{l.message}</span>
            </div>
          ))}
        </pre>
      </Card>
    </PageContent>
  );
}
