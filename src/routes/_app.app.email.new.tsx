import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Check } from "lucide-react";

export const Route = createFileRoute("/_app/app/email/new")({
  head: () => ({ meta: [{ title: "Nouvelle boîte mail | Hostiq" }] }),
  component: NewMailbox,
});

const PROVIDERS = [
  { id: "google", name: "Google Workspace", price: "6 €/mois", features: ["30 GB", "Calendar", "Drive 30 GB"] },
  { id: "microsoft", name: "Microsoft 365", price: "5,60 €/mois", features: ["50 GB", "Teams", "OneDrive 1 TB"] },
  { id: "zoho", name: "Zoho Mail", price: "1 €/mois", features: ["5 GB", "Suite Zoho", "Custom domain"] },
];

function NewMailbox() {
  return (
    <>
      <PageHeader title="Créer une boîte mail" breadcrumbs={[{ label: "Email", to: "/app/email" }, { label: "Nouvelle" }]} />
      <PageContent className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">1. Choisir le provider</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {PROVIDERS.map((p, i) => (
              <Card key={p.id} className={i === 0 ? "border-primary/50 ring-2 ring-primary/20" : ""}>
                <CardContent className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="h-4 w-4" /></div>
                    {i === 0 && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="mt-3 font-semibold">{p.name}</p>
                  <p className="text-xl font-semibold">{p.price}<span className="text-xs font-normal text-muted-foreground"> /boîte</span></p>
                  <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                    {p.features.map((f) => <li key={f}>· {f}</li>)}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">2. Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr_2fr] sm:items-end">
              <div><Label>Adresse</Label><Input className="mt-1.5 font-mono" placeholder="hello" /></div>
              <div className="text-center pb-2.5 font-mono text-muted-foreground">@</div>
              <div><Label>Domaine</Label><Input className="mt-1.5 font-mono" defaultValue="acme.com" /></div>
            </div>
            <div><Label>Mot de passe</Label><Input type="password" className="mt-1.5" placeholder="••••••••" /></div>
            <Button>Créer la boîte</Button>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
