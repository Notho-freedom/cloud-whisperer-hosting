import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export const Route = createFileRoute("/_app/app/support/new")({
  component: NewTicket,
});

function NewTicket() {
  return (
    <>
      <PageHeader title="Nouveau ticket" breadcrumbs={[{ label: "Support", to: "/app/support" }, { label: "Nouveau" }]} />
      <PageContent>
        <Card><CardContent className="p-6 space-y-4">
          <div><Label>Sujet</Label><Input className="mt-1.5" placeholder="Décrivez en quelques mots…" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><Label>Catégorie</Label><select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>Domaines</option><option>Hébergement</option><option>Email</option><option>Facturation</option><option>Autre</option></select></div>
            <div><Label>Priorité</Label><select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>Basse</option><option>Normale</option><option>Haute</option><option>Urgente</option></select></div>
          </div>
          <div><Label>Message</Label><Textarea rows={8} className="mt-1.5" placeholder="Expliquez votre demande en détail…" /></div>
          <Button>Envoyer le ticket</Button>
        </CardContent></Card>
      </PageContent>
    </>
  );
}
