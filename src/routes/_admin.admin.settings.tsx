import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_admin/admin/settings")({
  component: AdminSettings,
});

function AdminSettings() {
  return (
    <>
      <AdminPageHeader title="Paramètres plateforme" />
      <AdminPageContent className="space-y-6 max-w-2xl">
        <Card><CardHeader><CardTitle className="text-base">Branding</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div><Label>Nom de la plateforme</Label><Input className="mt-1.5" defaultValue="Hostiq" /></div>
            <div><Label>Email de support</Label><Input className="mt-1.5 font-mono" defaultValue="support@hostiq.io" /></div>
          </CardContent>
        </Card>
        <Card><CardHeader><CardTitle className="text-base">Devise & taxes</CardTitle></CardHeader>
          <CardContent className="grid gap-3 sm:grid-cols-2">
            <div><Label>Devise</Label><select className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"><option>EUR</option><option>USD</option></select></div>
            <div><Label>TVA par défaut (%)</Label><Input className="mt-1.5 font-mono" defaultValue="20" /></div>
          </CardContent>
        </Card>
        <Button>Enregistrer</Button>
      </AdminPageContent>
    </>
  );
}
