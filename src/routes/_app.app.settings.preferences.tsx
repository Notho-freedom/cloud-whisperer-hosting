import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_app/app/settings/preferences")({
  component: Prefs,
});

function Prefs() {
  return (
    <PageContent className="space-y-6 max-w-2xl">
      <Card><CardHeader><CardTitle className="text-base">Notifications email</CardTitle></CardHeader><CardContent className="space-y-3">
        {["Déploiements", "Domaines (expiration, transfert)", "Facturation", "Alertes sécurité", "Newsletter Hostiq"].map((l, i) => (
          <div key={l} className="flex items-center justify-between"><p className="text-sm">{l}</p><Switch defaultChecked={i < 4} /></div>
        ))}
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Apparence</CardTitle></CardHeader><CardContent className="space-y-3">
        <div className="flex items-center justify-between"><p className="text-sm">Thème système</p><Switch defaultChecked /></div>
        <div className="flex items-center justify-between"><p className="text-sm">Animations réduites</p><Switch /></div>
      </CardContent></Card>
      <Card><CardHeader><CardTitle className="text-base">Langue & devise</CardTitle></CardHeader><CardContent>
        <div className="grid gap-3 sm:grid-cols-2">
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm"><option>Français</option><option>English</option></select>
          <select className="rounded-md border border-input bg-background px-3 py-2 text-sm"><option>EUR (€)</option><option>USD ($)</option></select>
        </div>
      </CardContent></Card>
    </PageContent>
  );
}
