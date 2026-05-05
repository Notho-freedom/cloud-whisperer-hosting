import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2 } from "lucide-react";
import { listEnvVars, upsertEnvVar, deleteEnvVar } from "@/api/sites-api";

export const Route = createFileRoute("/_app/app/sites/$projectId/env")({ component: EnvVars });

function EnvVars() {
  const { projectId } = Route.useParams();
  const qc = useQueryClient();
  const { data: vars = [] } = useQuery({ queryKey: ["env", projectId], queryFn: () => listEnvVars({ data: { siteId: projectId } }) });
  const [k, setK] = React.useState(""); const [v, setV] = React.useState("");
  const add = useMutation({
    mutationFn: () => upsertEnvVar({ data: { siteId: projectId, key: k, value: v } }),
    onSuccess: () => { toast.success("Variable ajoutée"); setK(""); setV(""); qc.invalidateQueries({ queryKey: ["env", projectId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({ mutationFn: (id: string) => deleteEnvVar({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["env", projectId] }) });
  return (
    <PageContent className="space-y-6">
      <Card className="p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <Input placeholder="KEY" className="font-mono" value={k} onChange={(e) => setK(e.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_"))} />
          <Input placeholder="value" className="font-mono" value={v} onChange={(e) => setV(e.target.value)} />
          <Button disabled={!k || !v || add.isPending} onClick={() => add.mutate()}><Plus className="h-4 w-4" />Ajouter</Button>
        </div>
      </Card>
      <Card>
        <div className="divide-y divide-border">
          {vars.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucune variable.</p>}
          {vars.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{e.key}</span>
                  {e.type === "secret" && <Badge variant="outline" className="text-[10px]">SECRET</Badge>}
                </div>
                <p className="font-mono text-xs text-muted-foreground truncate">{e.type === "secret" ? "••••••••" : e.value}</p>
                <div className="mt-1 flex gap-1">
                  {(e.target ?? []).map((t: string) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              </div>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => del.mutate(e.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
