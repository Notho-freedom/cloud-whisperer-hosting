import { createFileRoute, Link } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Download, ExternalLink } from "lucide-react";
import { INVOICES } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/billing/invoices")({
  component: InvoicesList,
});

function InvoicesList() {
  return (
    <PageContent>
      <Card>
        <Table>
          <TableHeader><TableRow>
            <TableHead>Numéro</TableHead><TableHead>Date</TableHead><TableHead>Montant</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {INVOICES.map((i) => (
              <TableRow key={i.id}>
                <TableCell><Link to="/app/billing/invoices/$id" params={{ id: i.id }} className="font-mono text-sm hover:text-primary">{i.number}</Link></TableCell>
                <TableCell className="text-sm">{new Date(i.date).toLocaleDateString("fr-FR")}</TableCell>
                <TableCell className="font-mono text-sm">{i.amount.toFixed(2)} €</TableCell>
                <TableCell><StatusBadge status={i.status} /></TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon"><Download className="h-3.5 w-3.5" /></Button>
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
