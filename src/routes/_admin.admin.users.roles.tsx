import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const ROLES = [
  { name: "Owner", desc: "Tous les droits, y compris suppression du compte.", count: 1 },
  { name: "Admin", desc: "Gestion ressources, équipe, facturation.", count: 12 },
  { name: "Member", desc: "Création/édition de ressources.", count: 84 },
  { name: "Billing", desc: "Accès facturation uniquement.", count: 6 },
  { name: "Viewer", desc: "Lecture seule.", count: 23 },
];

export const Route = createFileRoute("/_admin/admin/users/roles")({
  component: RolesPage,
});

function RolesPage() {
  return (
    <>
      <AdminPageHeader title="Rôles & permissions" />
      <AdminPageContent className="grid gap-3 md:grid-cols-2">
        {ROLES.map((r) => (
          <Card key={r.name}><CardContent className="p-5 flex items-start justify-between gap-3">
            <div><p className="font-semibold">{r.name}</p><p className="text-xs text-muted-foreground mt-1">{r.desc}</p></div>
            <Badge variant="outline">{r.count}</Badge>
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
