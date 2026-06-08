import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Rocket, GitBranch, RotateCcw, XCircle, Activity } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listDeploys, triggerDeploy, cancelDeploy, rollbackDeploy } from "@/api/render/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/$serviceId/deploys")({
  head: () => ({ meta: [{ title: "Deploys | Hostiq" }] }),
  component: DeploysPage,
});

function statusVariant(s: string): "success" | "outline" | "destructive" {
  if (s === "live") return "success";
  if (s === "build_failed" || s === "canceled" || s === "deactivated") return "destructive";
  return "outline";
}

function DeploysPage() {
  const { serviceId } = Route.useParams();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["svc", serviceId, "deploys"],
    queryFn: () => listDeploys({ data: { serviceId, limit: 50 } }) as Promise<any[]>,
    refetchInterval: 10000,
  });

  const newDeploy = useMutation({
    mutationFn: (clearCache: boolean) => triggerDeploy({ data: { id: serviceId, clearCache } }),
    onSuccess: () => { toast.success("Deploy triggered"); qc.invalidateQueries({ queryKey: ["svc", serviceId, "deploys"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const cancel = useMutation({
    mutationFn: (deployId: string) => cancelDeploy({ data: { id: serviceId, deployId } }),
    onSuccess: () => { toast.success("Deploy canceled"); qc.invalidateQueries({ queryKey: ["svc", serviceId, "deploys"] }); },
  });
  const rollback = useMutation({
    mutationFn: (deployId: string) => rollbackDeploy({ data: { id: serviceId, deployId } }),
    onSuccess: () => { toast.success("Rollback triggered"); qc.invalidateQueries({ queryKey: ["svc", serviceId, "deploys"] }); },
  });

  return (
    <>
      <PageHeader
        title="Deploys"
        description="Deployment history with rollback and cancel."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => newDeploy.mutate(true)} disabled={newDeploy.isPending}>Deploy + clear cache</Button>
            <Button size="sm" onClick={() => newDeploy.mutate(false)} disabled={newDeploy.isPending}>
              {newDeploy.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Rocket className="h-3.5 w-3.5" />} Manual Deploy
            </Button>
          </>
        }
      />
      <PageContent>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : data.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">No deploys yet.</Card>
        ) : (
          <Card className="divide-y divide-border">
            {(data as any[]).map((d) => {
              const id = d.id;
              const status = (d.status ?? "unknown") as string;
              const isLive = status === "live";
              const isRunning = ["created", "build_in_progress", "update_in_progress", "pre_deploy_in_progress"].includes(status);
              const commit = d.commit ?? {};
              const finished = d.finishedAt ?? d.finished_at;
              const created = d.createdAt ?? d.created_at;
              return (
                <div key={id} className="flex items-center gap-3 p-3">
                  <Activity className="h-4 w-4 shrink-0 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{commit.message ?? d.commit_msg ?? "Deploy"}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground inline-flex items-center gap-1.5">
                      <GitBranch className="h-3 w-3" />
                      <span className="font-mono">{(commit.id ?? d.commit_sha ?? "").toString().slice(0, 7) || "—"}</span>
                      <span>·</span>
                      <span>{created ? new Date(created).toLocaleString() : "—"}</span>
                      {d.trigger && <><span>·</span><span>{d.trigger}</span></>}
                    </p>
                  </div>
                  <Badge variant={statusVariant(status)} className="text-[10px]">{status}</Badge>
                  {isRunning && (
                    <Button variant="ghost" size="sm" onClick={() => cancel.mutate(id)}>
                      <XCircle className="h-3.5 w-3.5" /> Cancel
                    </Button>
                  )}
                  {!isLive && !isRunning && status !== "build_failed" && (
                    <Button variant="ghost" size="sm" onClick={() => rollback.mutate(id)}>
                      <RotateCcw className="h-3.5 w-3.5" /> Rollback
                    </Button>
                  )}
                </div>
              );
            })}
          </Card>
        )}
      </PageContent>
    </>
  );
}
