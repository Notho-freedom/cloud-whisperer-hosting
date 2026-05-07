import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ArrowLeft, ExternalLink, RotateCw, X, Loader2 } from "lucide-react";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { cn } from "@/lib/utils";
import { getDeployment, streamDeploymentBuildEvents, cancelDeployment, redeploySite } from "@/api/sites-api";

export const Route = createFileRoute("/_app/app/sites/$projectId/deployments/$deploymentId")({ component: DeploymentDetail });

const RUNNING = new Set(["queued", "building", "initializing"]);

function DeploymentDetail() {
  const { projectId, deploymentId } = Route.useParams();
  const qc = useQueryClient();

  const { data: d } = useQuery({
    queryKey: ["deployment", deploymentId],
    queryFn: () => getDeployment({ data: { id: deploymentId } }),
    refetchInterval: (q) => (RUNNING.has((q.state.data?.status ?? "").toLowerCase()) ? 2000 : false),
  });

  // Build event stream
  const [events, setEvents] = React.useState<Array<{ ts?: number; text: string; type?: string }>>([]);
  const sinceRef = React.useRef<number>(0);
  const isRunning = RUNNING.has((d?.status ?? "").toLowerCase());

  // Poll build events; keep polling for a bit even after status flips so trailing logs land.
  React.useEffect(() => {
    let active = true;
    const tick = async () => {
      try {
        const r = await streamDeploymentBuildEvents({ data: { deploymentId, since: sinceRef.current || undefined } });
        if (r.events?.length) {
          const next = r.events.map((e) => ({
            ts: e.created,
            text: e.payload?.text ?? e.text ?? "",
            type: e.type ?? e.payload?.info?.type,
          })).filter((e) => e.text);
          if (next.length) {
            setEvents((prev) => [...prev, ...next]);
            sinceRef.current = Math.max(...r.events.map((e) => e.created ?? 0)) + 1;
          }
        }
      } catch {/* */}
    };
    void tick();
    if (!isRunning) return () => { active = false; };
    const id = setInterval(() => { if (active) void tick(); }, 1500);
    return () => { active = false; clearInterval(id); };
  }, [isRunning, deploymentId]);

  const cancel = useMutation({
    mutationFn: () => cancelDeployment({ data: { deploymentId } }),
    onSuccess: () => { toast.success("Déploiement annulé"); qc.invalidateQueries({ queryKey: ["deployment", deploymentId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const redeploy = useMutation({
    mutationFn: () => redeploySite({ data: { siteId: projectId } }),
    onSuccess: () => toast.success("Nouveau déploiement lancé"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (!d) return <PageContent><p className="text-sm text-muted-foreground">Chargement…</p></PageContent>;

  const url = (d as { live_url?: string }).live_url ?? d.url;
  const ready = (d.status ?? "").toLowerCase() === "ready";

  return (
    <PageContent className="space-y-6">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/app/sites/$projectId/deployments" params={{ projectId }}><ArrowLeft className="h-4 w-4" />Retour</Link>
        </Button>
        <StatusBadge status={d.status} />
        {isRunning && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
        {d.commit_sha && <Badge variant="outline" className="font-mono text-[10px]">{d.commit_sha.slice(0, 7)}</Badge>}
        <div className="ml-auto flex gap-2">
          {isRunning && <Button variant="outline" size="sm" onClick={() => cancel.mutate()} disabled={cancel.isPending}><X className="h-4 w-4" />Annuler</Button>}
          {!isRunning && <Button variant="outline" size="sm" onClick={() => redeploy.mutate()} disabled={redeploy.isPending}><RotateCw className="h-4 w-4" />Redéployer</Button>}
          {url && <Button size="sm" asChild><a href={url} target="_blank" rel="noreferrer">Ouvrir <ExternalLink className="h-3 w-3" /></a></Button>}
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardContent className="p-0">
            <div className="border-b border-border px-4 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Journal de build</div>
            <pre className="max-h-[480px] overflow-auto p-4 font-mono text-[11px] leading-relaxed">
              {events.length === 0 && <span className="text-muted-foreground">{isRunning ? "En attente des logs Vercel…" : "Aucun journal disponible."}</span>}
              {events.map((e, i) => (
                <div key={i} className={cn(
                  e.type === "stderr" && "text-destructive",
                  e.type === "command" && "text-primary",
                )}>
                  {e.ts ? <span className="text-muted-foreground">{new Date(e.ts).toLocaleTimeString("fr-FR")} </span> : null}
                  {e.text}
                </div>
              ))}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="space-y-3 p-5 text-sm">
            <div><p className="text-xs text-muted-foreground">Branche</p><p className="font-mono">{d.branch ?? "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Cible</p><p>{d.target ?? "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Auteur</p><p>{d.author ?? "—"}</p></div>
            <div><p className="text-xs text-muted-foreground">Créé le</p><p>{new Date(d.created_at).toLocaleString("fr-FR")}</p></div>
            {d.commit_msg && <div><p className="text-xs text-muted-foreground">Commit</p><p className="font-medium">{d.commit_msg}</p></div>}
            {url && <div><p className="text-xs text-muted-foreground">URL</p><a href={url} target="_blank" rel="noreferrer" className="text-primary hover:underline break-all">{url}</a></div>}
          </CardContent>
        </Card>
      </div>

      {ready && url && (
        <Card>
          <CardContent className="p-0">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Aperçu</p>
              <a href={url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline inline-flex items-center gap-1">Ouvrir <ExternalLink className="h-3 w-3" /></a>
            </div>
            <iframe src={url} title="Aperçu du déploiement" className="h-[480px] w-full bg-background" sandbox="allow-scripts allow-forms allow-same-origin allow-popups" />
          </CardContent>
        </Card>
      )}
    </PageContent>
  );
}
