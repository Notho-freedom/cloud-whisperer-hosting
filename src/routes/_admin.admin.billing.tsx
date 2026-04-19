import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { INVOICES } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/billing")({
  component: AdminBilling,
});

function AdminBilling() {
  return (
    <>
      <AdminPageHeader title="Revenus & factures" />
      <AdminPageContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {[["Revenus du mois", "18 420 €"], ["Factures payées", "284"], ["Échecs paiement", "3"]].map(([l, v]) => (
            <Card key={l as string}><CardContent className="p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p><p className="mt-1.5 text-2xl font-semibold">{v}</p></CardContent></Card>
          ))}
        </div>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
            <TableBody>
              {INVOICES.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-sm">{i.number}</TableCell>
                  <TableCell className="text-sm">{new Date(i.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="font-mono">{i.amount.toFixed(2)} €</TableCell>
                  <TableCell><StatusBadge status={i.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
