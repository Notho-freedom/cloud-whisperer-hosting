import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { KeyRound, Plus, Trash2, Webhook } from "lucide-react";
import { API_KEYS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  return (
    <>
      <PageHeader title="Clés API & Webhooks" description="Pilotez Hostiq en API depuis vos scripts et CI."
        actions={<Button><Plus className="h-4 w-4" />Nouvelle clé</Button>} />
      <PageContent className="space-y-6">
        <Card>
          <div className="border-b border-border p-4 flex items-center justify-between"><div><p className="font-semibold">Clés API</p><p className="text-xs text-muted-foreground">Authentifient vos requêtes vers api.hostiq.io</p></div></div>
          <div className="divide-y divide-border">
            {API_KEYS.map((k) => (
              <div key={k.id} className="flex items-center gap-4 p-4">
                <KeyRound className="h-4 w-4 text-muted-foreground" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm">{k.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{k.prefix}••••••••••••</p>
                  <div className="mt-1 flex flex-wrap gap-1">{k.scopes.map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                </div>
                <div className="text-xs text-muted-foreground">Dernière utilisation: {k.lastUsedAt ? new Date(k.lastUsedAt).toLocaleString("fr-FR") : "—"}</div>
                <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2"><Webhook className="h-4 w-4" /><p className="font-semibold">Webhooks</p></div>
            <p className="text-sm text-muted-foreground">Recevez les événements de déploiement, domaines et facturation sur votre endpoint.</p>
            <div className="flex gap-2"><Input placeholder="https://api.exemple.com/hooks/hostiq" className="font-mono" /><Button>Ajouter</Button></div>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
