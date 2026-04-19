import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const INTEGRATIONS = [
  { name: "GitHub", desc: "Importez et déployez vos repos.", connected: true },
  { name: "GitLab", desc: "Connectez vos projets GitLab.", connected: false },
  { name: "Slack", desc: "Notifications de déploiement dans vos canaux.", connected: false },
  { name: "Stripe", desc: "Synchronisez vos clients et abonnements.", connected: true },
  { name: "Sentry", desc: "Tracking d'erreurs en production.", connected: false },
];

export const Route = createFileRoute("/_app/app/settings/integrations")({
  component: Integrations,
});

function Integrations() {
  return (
    <PageContent>
      <div className="grid gap-3 md:grid-cols-2">
        {INTEGRATIONS.map((i) => (
          <Card key={i.name}><CardContent className="flex items-center justify-between p-5">
            <div><p className="font-medium">{i.name}</p><p className="text-xs text-muted-foreground">{i.desc}</p></div>
            {i.connected ? <Badge variant="success">Connecté</Badge> : <Button size="sm" variant="outline">Connecter</Button>}
          </CardContent></Card>
        ))}
      </div>
    </PageContent>
  );
}
