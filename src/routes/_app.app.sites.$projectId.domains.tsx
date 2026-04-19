import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { SITES } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/sites/$projectId/domains")({
  component: SiteDomains,
});

function SiteDomains() {
  const { projectId } = Route.useParams();
  const site = SITES.find((s) => s.id === projectId) ?? SITES[0];
  return (
    <PageContent className="space-y-6">
      <Card className="p-4">
        <div className="flex flex-col gap-2 sm:flex-row">
          <Input placeholder="ajouter-un-domaine.com" className="font-mono" />
          <Button><Plus className="h-4 w-4" />Ajouter</Button>
        </div>
      </Card>
      <Card>
        <div className="divide-y divide-border">
          {site.domains.map((d) => (
            <div key={d} className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-4 w-4 text-success" />
              <div className="flex-1">
                <p className="font-mono font-medium">{d}</p>
                <p className="text-xs text-muted-foreground">SSL actif · Vérifié</p>
              </div>
              <Badge variant="success">Production</Badge>
              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
