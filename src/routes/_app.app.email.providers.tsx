import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, Plug } from "lucide-react";

export const Route = createFileRoute("/_app/app/email/providers")({
  head: () => ({ meta: [{ title: "Providers email | Hostiq" }] }),
  component: ProvidersPage,
});

const PROVIDERS = [
  { id: "google", name: "Google Workspace", connected: true, mailboxes: 2, scopes: ["mail.create", "mail.delete", "users.read"] },
  { id: "microsoft", name: "Microsoft 365", connected: false, mailboxes: 0, scopes: [] },
  { id: "zoho", name: "Zoho Mail", connected: true, mailboxes: 1, scopes: ["mail.admin"] },
];

function ProvidersPage() {
  return (
    <>
      <PageHeader title="Providers email" description="Connectez vos comptes pour piloter les boîtes via Hostiq." breadcrumbs={[{ label: "Email", to: "/app/email" }, { label: "Providers" }]} />
      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {PROVIDERS.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="h-4 w-4" /></div>
                  {p.connected ? <Badge variant="success" className="gap-1"><CheckCircle2 className="h-3 w-3" />Connecté</Badge> : <Badge variant="outline">Non connecté</Badge>}
                </div>
                <p className="mt-3 font-semibold">{p.name}</p>
                <p className="text-xs text-muted-foreground">{p.connected ? `${p.mailboxes} boîte(s) gérée(s)` : "Cliquez pour authentifier."}</p>
                {p.connected ? (
                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">Reconfigurer</Button>
                    <Button variant="outline" size="sm" className="text-destructive">Déconnecter</Button>
                  </div>
                ) : (
                  <Button size="sm" className="mt-4 w-full"><Plug className="h-3.5 w-3.5" />Connecter</Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </PageContent>
    </>
  );
}
