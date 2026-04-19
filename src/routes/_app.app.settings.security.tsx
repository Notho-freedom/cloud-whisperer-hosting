import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/app/settings/security")({
  component: SecuritySettings,
});

const SESSIONS = [
  { device: "MacBook Pro · Chrome 124", ip: "78.193.4.22", location: "Paris, FR", current: true, last: "Il y a 2 min" },
  { device: "iPhone 15 · Safari", ip: "82.66.12.4", location: "Paris, FR", current: false, last: "Hier 22:14" },
];

function SecuritySettings() {
  return (
    <PageContent className="space-y-6">
      <Card>
        <CardHeader><CardTitle className="text-base">Mot de passe</CardTitle></CardHeader>
        <CardContent className="space-y-3 max-w-md">
          <Input type="password" placeholder="Mot de passe actuel" />
          <Input type="password" placeholder="Nouveau mot de passe" />
          <Input type="password" placeholder="Confirmer" />
          <Button>Mettre à jour</Button>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Authentification à deux facteurs</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center justify-between"><div><p className="text-sm font-medium">2FA via app TOTP</p><p className="text-xs text-muted-foreground">Renforcez la sécurité de votre compte.</p></div><Button variant="outline">Activer</Button></div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle className="text-base">Sessions actives</CardTitle></CardHeader>
        <CardContent className="divide-y divide-border">
          {SESSIONS.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-3">
              <div><p className="text-sm font-medium">{s.device}{s.current && <Badge variant="success" className="ml-2 text-[10px]">Cette session</Badge>}</p><p className="text-xs text-muted-foreground">{s.ip} · {s.location} · {s.last}</p></div>
              {!s.current && <Button variant="outline" size="sm">Révoquer</Button>}
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContent>
  );
}
