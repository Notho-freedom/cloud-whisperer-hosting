import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Play, XCircle, Briefcase } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listJobs, createJob, cancelJob } from "@/api/render/services.functions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/$serviceId/jobs")({
  head: () => ({ meta: [{ title: "Jobs | Hostiq" }] }),
  component: JobsPage,
});

function JobsPage() {
  const { serviceId } = Route.useParams();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["svc", serviceId, "jobs"],
    queryFn: () => listJobs({ data: { id: serviceId } }) as Promise<any[]>,
    refetchInterval: 10000,
  });
  const cancel = useMutation({
    mutationFn: (jobId: string) => cancelJob({ data: { id: serviceId, jobId } }),
    onSuccess: () => { toast.success("Job canceled"); qc.invalidateQueries({ queryKey: ["svc", serviceId, "jobs"] }); },
  });

  return (
    <>
      <PageHeader title="Jobs" description="One-off jobs and runs (migrations, seeds, ad-hoc tasks)."
        actions={<NewJobDialog serviceId={serviceId} onCreated={() => qc.invalidateQueries({ queryKey: ["svc", serviceId, "jobs"] })} />} />
      <PageContent>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : data.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            <Briefcase className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            No jobs yet. Trigger one with the button above.
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {(data as any[]).map((j) => {
              const status = j.status ?? "unknown";
              const running = ["pending", "running"].includes(status);
              return (
                <div key={j.id} className="flex items-center gap-3 p-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-mono text-xs">{j.startCommand ?? j.start_command}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{j.createdAt ? new Date(j.createdAt).toLocaleString() : "—"}</p>
                  </div>
                  <Badge variant={status === "succeeded" ? "success" : status === "failed" ? "destructive" : "outline"} className="text-[10px]">{status}</Badge>
                  {running && (
                    <Button variant="ghost" size="sm" onClick={() => cancel.mutate(j.id)}>
                      <XCircle className="h-3.5 w-3.5" /> Cancel
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

function NewJobDialog({ serviceId, onCreated }: { serviceId: string; onCreated: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [cmd, setCmd] = React.useState("");
  const run = useMutation({
    mutationFn: () => createJob({ data: { id: serviceId, startCommand: cmd } }),
    onSuccess: () => { toast.success("Job started"); setOpen(false); setCmd(""); onCreated(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Play className="h-3.5 w-3.5" /> Run Job</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Run one-off job</DialogTitle></DialogHeader>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Runs once on a fresh instance with the same image as the live deploy.</p>
          <Input placeholder="npm run migrate" value={cmd} onChange={(e) => setCmd(e.target.value)} className="font-mono text-xs" />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => run.mutate()} disabled={!cmd || run.isPending}>
            {run.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5" />} Run
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
