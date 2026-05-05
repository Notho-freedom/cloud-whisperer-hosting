import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2 } from "lucide-react";
import { adminListInvoices } from "@/api/admin-api";

export const Route = createFileRoute("/_admin/admin/billing")({ component: AdminBilling });

function AdminBilling() {
  const { data: invoices = [], isLoading } = useQuery({ queryKey: ["admin", "invoices"], queryFn: () => adminListInvoices() });
  type Inv = { id: string; number: string | null; date: string; amount: number; status: string };
  const list = invoices as Inv[];
  const paid = list.filter((i) => i.status === "paid");
  const totalMonth = paid
    .filter((i) => new Date(i.date).getMonth() === new Date().getMonth())
    .reduce((s, i) => s + Number(i.amount), 0);
  const failures = list.filter((i) => i.status === "failed" || i.status === "uncollectible").length;

  return (
    <>
      <AdminPageHeader title="Revenus & factures" />
      <AdminPageContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          {[["Revenus du mois", `${totalMonth.toFixed(2)} €`], ["Factures payées", String(paid.length)], ["Échecs paiement", String(failures)]].map(([l, v]) => (
            <Card key={l as string}><CardContent className="p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p><p className="mt-1.5 text-2xl font-semibold">{v}</p></CardContent></Card>
          ))}
        </div>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Numéro</TableHead><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead></TableRow></TableHeader>
            <TableBody>
              {list.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="font-mono text-sm">{i.number ?? i.id.slice(0,8)}</TableCell>
                  <TableCell className="text-sm">{new Date(i.date).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="font-mono">{Number(i.amount).toFixed(2)} €</TableCell>
                  <TableCell><StatusBadge status={i.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
