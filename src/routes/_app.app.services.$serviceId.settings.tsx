import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Pause, Play, RotateCcw, Trash2, Trash, RefreshCw } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { getService, suspendService, resumeService, restartService, deleteService, purgeServiceCache } from "@/api/render/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/$serviceId/settings")({
  head: () => ({ meta: [{ title: "Settings | Hostiq" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const { serviceId } = Route.useParams();
  const qc = useQueryClient();
  const navigate = useNavigate();
  const { data: svc, isLoading } = useQuery({
    queryKey: ["svc", serviceId],
    queryFn: () => getService({ data: { id: serviceId } }) as Promise<any>,
  });

  const restart = useMutation({ mutationFn: () => restartService({ data: { id: serviceId } }), onSuccess: () => toast.success("Restart triggered") });
  const purge = useMutation({ mutationFn: () => purgeServiceCache({ data: { id: serviceId } }), onSuccess: () => toast.success("Cache purged") });
  const toggle = useMutation({
    mutationFn: () => (svc?.suspended ? resumeService({ data: { id: serviceId } }) : suspendService({ data: { id: serviceId } })),
    onSuccess: () => { toast.success(svc?.suspended ? "Resumed" : "Suspended"); qc.invalidateQueries({ queryKey: ["svc", serviceId] }); },
  });
  const del = useMutation({
    mutationFn: () => deleteService({ data: { id: serviceId } }),
    onSuccess: () => { toast.success("Service deleted"); navigate({ to: "/app/services" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading || !svc) return <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <>
      <PageHeader title="Settings" description="Service info, lifecycle and danger zone." />
      <PageContent>
        <div className="space-y-4">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-sm font-semibold">Info</h2>
              <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                <Field label="Name" v={svc.name} />
                <Field label="Type" v={svc.type} />
                <Field label="Runtime" v={svc.runtime} />
                <Field label="Region" v={svc.region} />
                <Field label="Plan" v={svc.plan} />
                <Field label="Branch" v={svc.branch} />
                <Field label="Repo" v={svc.repo} />
                <Field label="Render ID" v={svc.render_service_id} mono />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <h2 className="mb-4 text-sm font-semibold">Lifecycle</h2>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" size="sm" onClick={() => toggle.mutate()}>
                  {svc.suspended ? <><Play className="h-3.5 w-3.5" /> Resume</> : <><Pause className="h-3.5 w-3.5" /> Suspend</>}
                </Button>
                <Button variant="outline" size="sm" onClick={() => restart.mutate()} disabled={restart.isPending}>
                  {restart.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />} Restart
                </Button>
                <Button variant="outline" size="sm" onClick={() => purge.mutate()} disabled={purge.isPending}>
                  {purge.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />} Purge build cache
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-destructive/40">
            <CardContent className="p-5">
              <h2 className="mb-1 text-sm font-semibold text-destructive">Danger zone</h2>
              <p className="mb-4 text-xs text-muted-foreground">Deleting a service is permanent. Disks and Postgres are not deleted.</p>
              <DeleteDialog name={svc.name} onConfirm={() => del.mutate()} pending={del.isPending} />
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </>
  );
}

function Field({ label, v, mono }: { label: string; v?: any; mono?: boolean }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className={`mt-0.5 truncate text-sm ${mono ? "font-mono text-xs" : ""}`}>{v || "—"}</p>
    </div>
  );
}

function DeleteDialog({ name, onConfirm, pending }: { name: string; onConfirm: () => void; pending: boolean }) {
  const [v, setV] = React.useState("");
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm"><Trash2 className="h-3.5 w-3.5" /> Delete service</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Type the service name to confirm. This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <Input placeholder={name} value={v} onChange={(e) => setV(e.target.value)} className="font-mono" />
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction disabled={v !== name || pending} onClick={onConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash className="h-3.5 w-3.5" />} Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
