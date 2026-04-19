import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/_app/app/settings/profile")({
  component: ProfileSettings,
});

function ProfileSettings() {
  const auth = useAuth();
  return (
    <PageContent>
      <Card><CardContent className="p-6 space-y-4 max-w-xl">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-xl font-bold text-primary-foreground">{(auth.user?.name?.[0] || "U").toUpperCase()}</div>
          <Button variant="outline" size="sm">Changer la photo</Button>
        </div>
        <div><Label>Nom complet</Label><Input className="mt-1.5" defaultValue={auth.user?.name} /></div>
        <div><Label>Email</Label><Input type="email" className="mt-1.5" defaultValue={auth.user?.email} /></div>
        <div><Label>Société</Label><Input className="mt-1.5" defaultValue="Acme SAS" /></div>
        <Button>Enregistrer</Button>
      </CardContent></Card>
    </PageContent>
  );
}
