import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit3, Plus, Trash2 } from "lucide-react";
import { PLANS, PROMO_CODES } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/plans")({
  component: AdminPlans,
});

function AdminPlans() {
  return (
    <>
      <AdminPageHeader title="Plans & promos" actions={<Button><Plus className="h-4 w-4" />Nouveau plan</Button>} />
      <AdminPageContent className="space-y-6">
        <div className="grid gap-3 md:grid-cols-3">
          {PLANS.map((p) => (
            <Card key={p.id}><CardContent className="p-5">
              <div className="flex items-start justify-between"><div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.id}</p></div><Button variant="ghost" size="icon"><Edit3 className="h-3.5 w-3.5" /></Button></div>
              <p className="mt-3 text-2xl font-semibold">{p.pricePerMonth} €<span className="text-xs font-normal text-muted-foreground">/mois</span></p>
              <p className="mt-2 text-xs text-muted-foreground">{p.features.length} features</p>
            </CardContent></Card>
          ))}
        </div>
        <div>
          <div className="mb-3 flex items-center justify-between"><h2 className="text-lg font-semibold">Codes promo</h2><Button variant="outline" size="sm"><Plus className="h-4 w-4" />Créer</Button></div>
          <Card><Table>
            <TableHeader><TableRow><TableHead>Code</TableHead><TableHead>Réduction</TableHead><TableHead>Usage</TableHead><TableHead>Expire</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {PROMO_CODES.map((p) => (
                <TableRow key={p.id}>
                  <TableCell><Badge variant="outline" className="font-mono">{p.code}</Badge></TableCell>
                  <TableCell className="font-mono">{p.discount}{p.type === "percent" ? "%" : "€"}</TableCell>
                  <TableCell className="font-mono text-sm">{p.usage}/{p.max}</TableCell>
                  <TableCell className="text-sm">{p.expires}</TableCell>
                  <TableCell><Badge variant={p.active ? "success" : "secondary"}>{p.active ? "Actif" : "Désactivé"}</Badge></TableCell>
                  <TableCell><Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table></Card>
        </div>
      </AdminPageContent>
    </>
  );
}
