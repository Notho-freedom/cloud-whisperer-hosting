import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Eye, EyeOff, Save } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { listEnvVars, upsertEnvVar, deleteEnvVar } from "@/api/render/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/$serviceId/environment")({
  head: () => ({ meta: [{ title: "Environment | Hostiq" }] }),
  component: EnvironmentPage,
});

function EnvironmentPage() {
  const { serviceId } = Route.useParams();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["svc", serviceId, "env"],
    queryFn: () => listEnvVars({ data: { id: serviceId } }) as Promise<any[]>,
  });

  const refresh = () => qc.invalidateQueries({ queryKey: ["svc", serviceId, "env"] });

  const save = useMutation({
    mutationFn: (v: { key: string; value: string }) => upsertEnvVar({ data: { id: serviceId, ...v } }),
    onSuccess: () => { toast.success("Variable saved"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (key: string) => deleteEnvVar({ data: { id: serviceId, key } }),
    onSuccess: () => { toast.success("Variable removed"); refresh(); },
  });

  const vars = (data as any[]).map((e) => ({ key: e.key ?? e.envVarKey, value: e.value ?? e.envVarValue ?? "" }));

  return (
    <>
      <PageHeader title="Environment" description="Environment variables. Changes trigger a redeploy." />
      <PageContent>
        <Card className="p-4">
          <NewVarRow onSave={(v) => save.mutate(v)} pending={save.isPending} />
          {isLoading ? (
            <div className="flex justify-center p-8"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : vars.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">No environment variables.</p>
          ) : (
            <div className="mt-4 divide-y divide-border">
              {vars.map((v) => (
                <EnvRow key={v.key} initialKey={v.key} initialValue={v.value}
                  onSave={(nv) => save.mutate(nv)} onDelete={() => del.mutate(v.key)}
                  busy={save.isPending || del.isPending} />
              ))}
            </div>
          )}
        </Card>
      </PageContent>
    </>
  );
}

function NewVarRow({ onSave, pending }: { onSave: (v: { key: string; value: string }) => void; pending: boolean }) {
  const [k, setK] = React.useState("");
  const [v, setV] = React.useState("");
  return (
    <div className="flex gap-2 border-b border-border pb-3">
      <Input placeholder="KEY" className="h-9 font-mono text-xs" value={k} onChange={(e) => setK(e.target.value.toUpperCase())} />
      <Input placeholder="value" className="h-9 flex-1 font-mono text-xs" value={v} onChange={(e) => setV(e.target.value)} />
      <Button size="sm" disabled={!k || !v || pending} onClick={() => { onSave({ key: k, value: v }); setK(""); setV(""); }}>
        <Plus className="h-3.5 w-3.5" /> Add
      </Button>
    </div>
  );
}

function EnvRow({ initialKey, initialValue, onSave, onDelete, busy }: {
  initialKey: string; initialValue: string; onSave: (v: { key: string; value: string }) => void; onDelete: () => void; busy: boolean;
}) {
  const [v, setV] = React.useState(initialValue);
  const [show, setShow] = React.useState(false);
  const dirty = v !== initialValue;
  return (
    <div className="flex items-center gap-2 py-2">
      <span className="w-48 truncate font-mono text-xs">{initialKey}</span>
      <Input value={v} type={show ? "text" : "password"} onChange={(e) => setV(e.target.value)}
        className="h-8 flex-1 font-mono text-xs" />
      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setShow((s) => !s)}>
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </Button>
      {dirty && (
        <Button size="sm" variant="outline" onClick={() => onSave({ key: initialKey, value: v })} disabled={busy}>
          <Save className="h-3.5 w-3.5" /> Save
        </Button>
      )}
      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={onDelete} disabled={busy}>
        <Trash2 className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
