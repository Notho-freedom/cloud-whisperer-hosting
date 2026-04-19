import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const MACROS = [
  { name: "Bienvenue", body: "Bonjour, merci d'avoir contacté Hostiq…" },
  { name: "DNS propagation", body: "La propagation DNS peut prendre jusqu'à 24h…" },
  { name: "Renouvellement domaine", body: "Pour renouveler votre domaine, rendez-vous…" },
];

export const Route = createFileRoute("/_admin/admin/support/macros")({
  component: Macros,
});

function Macros() {
  return (
    <>
      <AdminPageHeader title="Macros / réponses prédéfinies" actions={<Button><Plus className="h-4 w-4" />Nouvelle macro</Button>} />
      <AdminPageContent className="grid gap-3 md:grid-cols-2">
        {MACROS.map((m) => (
          <Card key={m.name}><CardContent className="p-5">
            <p className="font-semibold">{m.name}</p>
            <p className="mt-2 text-sm text-muted-foreground line-clamp-3">{m.body}</p>
            <Button variant="outline" size="sm" className="mt-3">Modifier</Button>
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
