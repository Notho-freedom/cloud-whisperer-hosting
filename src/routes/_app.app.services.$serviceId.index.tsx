import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Rocket, ExternalLink, GitBranch, Activity, Pause, Play, RotateCcw } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getService, triggerDeploy, suspendService, resumeService, restartService, listDeploys } from "@/api/render/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/$serviceId/")({
  component: ServiceOverview,
});

function ServiceOverview() {
  const { serviceId } = Route.useParams();
  const qc = useQueryClient();
  const { data: svc, isLoading } = useQuery({ queryKey: ["svc", serviceId], queryFn: () => getService({ data: { id: serviceId } }) as Promise<any> });
  const { data: deploys = [] } = useQuery({ queryKey: ["svc", serviceId, "deploys", 5], queryFn: () => listDeploys({ data: { serviceId, limit: 5 } }) as Promise<any[]> });

  const deploy = useMutation({ mutationFn: () => triggerDeploy({ data: { id: serviceId, clearCache: false } }), onSuccess: () => { toast.success("Deploy triggered"); qc.invalidateQueries(); }, onError: (e: Error) => toast.error(e.message) });
  const restart = useMutation({ mutationFn: () => restartService({ data: { id: serviceId } }), onSuccess: () => toast.success("Service restarted") });
  const toggle = useMutation({
    mutationFn: () => (svc?.suspended ? resumeService({ data: { id: serviceId } }) : suspendService({ data: { id: serviceId } })),
    onSuccess: () => { toast.success(svc?.suspended ? "Resumed" : "Suspended"); qc.invalidateQueries({ queryKey: ["svc", serviceId] }); },
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  if (!svc) return <PageContent><Card className="p-8 text-sm text-muted-foreground">Service not found.</Card></PageContent>;

  return (
    <>
      <PageHeader
        title={<span className="inline-flex items-center gap-2">{svc.name}{svc.suspended && <Badge variant="outline" className="border-warning/40 text-warning">Suspended</Badge>}</span>}
        description={svc.prod_url ? <a href={svc.prod_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline"><ExternalLink className="h-3 w-3" />{svc.prod_url.replace(/^https?:\/\//, "")}</a> : "—"}
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => toggle.mutate()}>
              {svc.suspended ? <><Play className="h-3.5 w-3.5" /> Resume</> : <><Pause className="h-3.5 w-3.5" /> Suspend</>}
            </Button>
            <Button variant="outline" size="sm" onClick={() => restart.mutate()}><RotateCcw className="h-3.5 w-3.5" /> Restart</Button>
            <Button size="sm" onClick={() => deploy.mutate()} disabled={deploy.isPending}>
              {deploy.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />} Manual Deploy
            </Button>
          </>
        }
      />
      <PageContent>
        <div className="grid gap-4 md:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Type</p><p className="mt-1 text-sm font-medium">{svc.type}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Region</p><p className="mt-1 text-sm font-medium">{svc.region} · {svc.plan ?? "—"}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Runtime</p><p className="mt-1 text-sm font-medium">{svc.runtime ?? "—"}</p></CardContent></Card>
        </div>

        <Card className="mt-4">
          <CardContent className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Recent deploys</h2>
              <Button asChild variant="ghost" size="sm"><Link to="/app/services/$serviceId/deploys" params={{ serviceId }}>View all</Link></Button>
            </div>
            {deploys.length === 0 ? (
              <p className="py-6 text-center text-xs text-muted-foreground">No deploys yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {deploys.map((d: any) => (
                  <div key={d.id} className="flex items-center gap-3 py-2.5">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{d.commit?.message ?? d.commit_msg ?? "Deploy"}</p>
                      <p className="text-[11px] text-muted-foreground inline-flex items-center gap-1.5"><GitBranch className="h-3 w-3" />{(d.commit?.id ?? d.commit_sha ?? "").toString().slice(0, 7)} · {new Date(d.createdAt ?? d.created_at).toLocaleString()}</p>
                    </div>
                    <Badge variant={d.status === "live" ? "success" : "outline"} className="text-[10px]">{d.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
