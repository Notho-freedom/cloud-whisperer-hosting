import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/app/settings/danger")({
  component: Danger,
});

function Danger() {
  return (
    <PageContent>
      <Card className="border-destructive/30 max-w-2xl">
        <CardHeader><CardTitle className="text-base text-destructive">Danger zone</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-4">
            <div><p className="text-sm font-medium">Exporter mes données</p><p className="text-xs text-muted-foreground">Téléchargez l'ensemble de vos données (RGPD).</p></div>
            <Button variant="outline">Exporter</Button>
          </div>
          <div className="flex items-center justify-between gap-3">
            <div><p className="text-sm font-medium">Supprimer mon compte</p><p className="text-xs text-muted-foreground">Toutes vos ressources seront supprimées définitivement.</p></div>
            <Button variant="outline" className="border-destructive/40 text-destructive hover:bg-destructive/10">Supprimer</Button>
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
