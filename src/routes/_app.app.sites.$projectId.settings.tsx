import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { SITES } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/sites/$projectId/settings")({
  component: SiteSettings,
});

function SiteSettings() {
  const { projectId } = Route.useParams();
  const site = SITES.find((s) => s.id === projectId) ?? SITES[0];
  return (
    <PageContent className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Build & framework</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div><Label>Nom du projet</Label><Input className="mt-1.5" defaultValue={site.name} /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Framework</Label><Input className="mt-1.5 font-mono" defaultValue={site.framework} /></div>
            <div><Label>Région</Label><Input className="mt-1.5 font-mono" defaultValue={site.region} /></div>
          </div>
          <div><Label>Build command</Label><Input className="mt-1.5 font-mono" defaultValue="pnpm build" /></div>
          <div><Label>Output directory</Label><Input className="mt-1.5 font-mono" defaultValue=".next" /></div>
          <Button>Enregistrer</Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Préférences</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Auto-deploy sur push</p><p className="text-xs text-muted-foreground">Déclenche un déploiement à chaque commit.</p></div><Switch defaultChecked /></div>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">Preview deployments</p><p className="text-xs text-muted-foreground">Crée une URL de preview pour chaque PR.</p></div><Switch defaultChecked /></div>
        </CardContent>
      </Card>

      <Card className="border-destructive/30">
        <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-medium">Transférer la propriété</p><p className="text-xs text-muted-foreground">Transfère ce site à un autre membre.</p></div>
            <Button variant="outline">Transférer</Button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-medium">Supprimer le projet</p><p className="text-xs text-muted-foreground">Cette action est irréversible.</p></div>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">Supprimer</Button>
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
