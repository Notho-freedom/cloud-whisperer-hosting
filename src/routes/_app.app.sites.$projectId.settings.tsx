import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSite, updateSite, deleteSite } from "@/api/sites-api";

export const Route = createFileRoute("/_app/app/sites/$projectId/settings")({ component: SiteSettings });

function SiteSettings() {
  const { projectId } = Route.useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: site } = useQuery({ queryKey: ["site", projectId], queryFn: () => getSite({ data: { id: projectId } }) });
  const [framework, setFramework] = React.useState("");
  const [region, setRegion] = React.useState("");
  React.useEffect(() => { if (site) { setFramework(site.framework ?? ""); setRegion(site.region ?? ""); } }, [site]);
  const save = useMutation({
    mutationFn: () => updateSite({ data: { id: projectId, framework, region } }),
    onSuccess: () => { toast.success("Enregistré"); qc.invalidateQueries({ queryKey: ["site", projectId] }); },
  });
  const del = useMutation({
    mutationFn: () => deleteSite({ data: { id: projectId } }),
    onSuccess: () => { toast.success("Site supprimé"); navigate({ to: "/app/sites" }); },
  });
  return (
    <PageContent className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Build & framework</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Nom du projet</Label><Input className="mt-1.5" value={site?.name ?? ""} disabled /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Framework</Label><Input className="mt-1.5 font-mono" value={framework} onChange={(e) => setFramework(e.target.value)} /></div>
            <div><Label>Région</Label><Input className="mt-1.5 font-mono" value={region} onChange={(e) => setRegion(e.target.value)} /></div>
          </div>
          <Button onClick={() => save.mutate()} disabled={save.isPending}>Enregistrer</Button>
        </CardContent>
      </Card>
      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-medium">Supprimer le projet</p><p className="text-xs text-muted-foreground">Cette action est irréversible.</p></div>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Supprimer définitivement ?")) del.mutate(); }}>Supprimer</Button>
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
