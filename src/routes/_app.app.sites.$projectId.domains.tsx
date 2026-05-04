import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { getSite, addSiteDomain, removeSiteDomain } from "@/server/sites.server";

export const Route = createFileRoute("/_app/app/sites/$projectId/domains")({ component: SiteDomains });

function SiteDomains() {
  const { projectId } = Route.useParams();
  const qc = useQueryClient();
  const { data: site } = useQuery({ queryKey: ["site", projectId], queryFn: () => getSite({ data: { id: projectId } }) });
  const [d, setD] = React.useState("");
  const add = useMutation({
    mutationFn: () => addSiteDomain({ data: { siteId: projectId, domain: d } }),
    onSuccess: () => { toast.success("Domaine ajouté"); setD(""); qc.invalidateQueries({ queryKey: ["site", projectId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const remove = useMutation({
    mutationFn: (domain: string) => removeSiteDomain({ data: { siteId: projectId, domain } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["site", projectId] }),
  });
  return (
    <PageContent className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="ajouter-un-domaine.com" className="font-mono" value={d} onChange={(e) => setD(e.target.value)} />
          <Button disabled={!d || add.isPending} onClick={() => add.mutate()}><Plus className="h-4 w-4" />Ajouter</Button>
        </div>
      </Card>
      <Card>
        <div className="divide-y divide-border">
          {(site?.domains ?? []).length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun domaine attaché.</p>}
          {(site?.domains ?? []).map((dom: string) => (
            <div key={dom} className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <div className="flex-1"><p className="font-mono font-medium">{dom}</p></div>
              <Badge variant="success">Production</Badge>
              <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove.mutate(dom)}><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
