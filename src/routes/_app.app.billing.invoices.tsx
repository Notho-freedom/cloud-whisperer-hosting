import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Download, ExternalLink } from "lucide-react";
import { listInvoices } from "@/api/billing-api.server";

export const Route = createFileRoute("/_app/app/billing/invoices")({ component: InvoicesList });

function InvoicesList() {
  const { data: invoices = [] } = useQuery({ queryKey: ["invoices"], queryFn: () => listInvoices() });
  return (
    <PageContent>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Numéro</TableHead><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {invoices.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">Aucune facture.</TableCell></TableRow>}
            {invoices.map((i) => (
              <TableRow key={i.id}>
                <TableCell><Link to="/app/billing/invoices/$id" params={{ id: i.id }} className="font-mono text-sm hover:text-primary">{i.number ?? i.id.slice(0,8)}</Link></TableCell>
                <TableCell className="text-sm">{new Date(i.date).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="font-mono text-sm">{Number(i.amount).toFixed(2)} €</TableCell>
                <TableCell><StatusBadge status={i.status} /></TableCell>
                <TableCell className="text-right">
                  {i.pdf_url && <Button variant="ghost" size="icon" asChild><a href={i.pdf_url} target="_blank" rel="noreferrer"><Download className="h-3.5 w-3.5" /></a></Button>}
                  <Button variant="ghost" size="icon" asChild><Link to="/app/billing/invoices/$id" params={{ id: i.id }}><ExternalLink className="h-3.5 w-3.5" /></Link></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </PageContent>
  );
}
