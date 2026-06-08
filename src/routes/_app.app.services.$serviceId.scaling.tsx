import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, GaugeCircle, Save } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { getService, scaleService, updateAutoscaling } from "@/api/render/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/$serviceId/scaling")({
  head: () => ({ meta: [{ title: "Scaling | Hostiq" }] }),
  component: ScalingPage,
});

function ScalingPage() {
  const { serviceId } = Route.useParams();
  const qc = useQueryClient();
  const { data: svc, isLoading } = useQuery({
    queryKey: ["svc", serviceId],
    queryFn: () => getService({ data: { id: serviceId } }) as Promise<any>,
  });

  const [instances, setInstances] = React.useState(1);
  const [autoEnabled, setAutoEnabled] = React.useState(false);
  const [min, setMin] = React.useState(1);
  const [max, setMax] = React.useState(3);
  const [cpu, setCpu] = React.useState(70);
  const [mem, setMem] = React.useState(70);

  React.useEffect(() => {
    if (!svc) return;
    setInstances(svc.num_instances ?? 1);
    const a = svc.metadata?.autoscaling ?? svc.autoscaling;
    if (a) { setAutoEnabled(!!a.enabled); setMin(a.min ?? 1); setMax(a.max ?? 3);
      setCpu(a.criteria?.cpu?.percentage ?? 70); setMem(a.criteria?.memory?.percentage ?? 70);
    }
  }, [svc]);

  const scale = useMutation({
    mutationFn: () => scaleService({ data: { id: serviceId, numInstances: instances } }),
    onSuccess: () => { toast.success(`Scaled to ${instances} instances`); qc.invalidateQueries({ queryKey: ["svc", serviceId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const saveAuto = useMutation({
    mutationFn: () => updateAutoscaling({ data: { id: serviceId, enabled: autoEnabled, min, max, cpuPercentage: cpu, memoryPercentage: mem } }),
    onSuccess: () => toast.success("Autoscaling updated"),
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;

  return (
    <>
      <PageHeader title="Scaling" description="Manual instance count and autoscaling rules." />
      <PageContent>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardContent className="p-5">
              <h2 className="mb-1 text-sm font-semibold inline-flex items-center gap-2"><GaugeCircle className="h-4 w-4" /> Manual scaling</h2>
              <p className="mb-4 text-xs text-muted-foreground">Set a fixed number of instances. Disabled when autoscaling is on.</p>
              <Label className="text-xs">Instances</Label>
              <Input type="number" min={1} max={100} value={instances}
                onChange={(e) => setInstances(Math.max(1, Number(e.target.value) || 1))}
                disabled={autoEnabled} className="mt-1 h-9 max-w-[140px]" />
              <Button size="sm" className="mt-4" onClick={() => scale.mutate()} disabled={scale.isPending || autoEnabled}>
                {scale.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Apply
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-sm font-semibold">Autoscaling</h2>
                <div className="flex items-center gap-2">
                  <Switch checked={autoEnabled} onCheckedChange={setAutoEnabled} id="auto" />
                  <Label htmlFor="auto" className="text-xs">{autoEnabled ? "Enabled" : "Disabled"}</Label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label className="text-xs">Min instances</Label><Input type="number" min={1} max={max} value={min} onChange={(e) => setMin(Number(e.target.value) || 1)} disabled={!autoEnabled} className="mt-1 h-9" /></div>
                <div><Label className="text-xs">Max instances</Label><Input type="number" min={min} max={100} value={max} onChange={(e) => setMax(Number(e.target.value) || 1)} disabled={!autoEnabled} className="mt-1 h-9" /></div>
                <div><Label className="text-xs">Target CPU %</Label><Input type="number" min={0} max={100} value={cpu} onChange={(e) => setCpu(Number(e.target.value) || 0)} disabled={!autoEnabled} className="mt-1 h-9" /></div>
                <div><Label className="text-xs">Target Memory %</Label><Input type="number" min={0} max={100} value={mem} onChange={(e) => setMem(Number(e.target.value) || 0)} disabled={!autoEnabled} className="mt-1 h-9" /></div>
              </div>
              <Button size="sm" className="mt-4" onClick={() => saveAuto.mutate()} disabled={saveAuto.isPending}>
                {saveAuto.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save
              </Button>
            </CardContent>
          </Card>

          <Card className="md:col-span-2">
            <CardContent className="grid grid-cols-3 gap-4 p-5">
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Plan</p><p className="mt-1 text-sm font-medium">{svc?.plan ?? "—"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Region</p><p className="mt-1 text-sm font-medium">{svc?.region ?? "—"}</p></div>
              <div><p className="text-[10px] uppercase tracking-wider text-muted-foreground">Runtime</p><p className="mt-1 text-sm font-medium">{svc?.runtime ?? "—"}</p></div>
            </CardContent>
          </Card>
        </div>
      </PageContent>
    </>
  );
}
