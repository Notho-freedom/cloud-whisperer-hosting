import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/app/team/invite")({
  component: InviteMember,
});

function InviteMember() {
  return (
    <>
      <PageHeader title="Inviter un membre" breadcrumbs={[{ label: "Équipe", to: "/app/team" }, { label: "Inviter" }]} />
      <PageContent>
        <Card><CardContent className="p-6 space-y-4 max-w-xl">
          <div><Label>Email</Label><Input type="email" className="mt-1.5" placeholder="collegue@acme.com" /></div>
          <div><Label>Rôle</Label>
            <select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="admin">Admin — accès complet</option>
              <option value="member">Member — gestion ressources</option>
              <option value="billing">Billing — factures uniquement</option>
              <option value="viewer">Viewer — lecture seule</option>
            </select>
          </div>
          <div><Label>Message (optionnel)</Label><Input className="mt-1.5" placeholder="Bienvenue dans l'équipe !" /></div>
          <Button>Envoyer l'invitation</Button>
        </CardContent></Card>
      </PageContent>
    </>
  );
}
