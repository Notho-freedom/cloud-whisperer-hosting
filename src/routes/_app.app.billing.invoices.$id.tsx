import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Download, Printer } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { INVOICES } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/billing/invoices/$id")({
  component: InvoiceDetail,
});

function InvoiceDetail() {
  const { id } = Route.useParams();
  const inv = INVOICES.find((i) => i.id === id) ?? INVOICES[0];
  return (
    <PageContent className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg">{inv.number}</h2>
        <div className="flex gap-2"><Button variant="outline" size="sm"><Printer className="h-4 w-4" />Imprimer</Button><Button size="sm"><Download className="h-4 w-4" />PDF</Button></div>
      </div>
      <Card>
        <CardContent className="p-8 md:p-12">
          <div className="flex justify-between"><Logo /><div className="text-right"><p className="font-mono text-2xl font-semibold">{inv.number}</p><StatusBadge status={inv.status} /></div></div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Facturé à</p><p className="mt-1 font-medium">Acme SAS</p><p className="text-sm text-muted-foreground">12 rue des Lilas<br />75001 Paris<br />FR12345678901</p></div>
            <div className="md:text-right"><p className="text-xs uppercase tracking-wider text-muted-foreground">Émis le</p><p className="mt-1">{new Date(inv.date).toLocaleDateString("fr-FR")}</p><p className="mt-2 text-xs uppercase tracking-wider text-muted-foreground">Échéance</p><p>{new Date(inv.dueDate).toLocaleDateString("fr-FR")}</p></div>
          </div>
          <table className="mt-10 w-full text-sm">
            <thead className="border-b border-border"><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Description</th><th className="py-2 text-right">Qté</th><th className="py-2 text-right">PU HT</th><th className="py-2 text-right">Total HT</th></tr></thead>
            <tbody>
              {inv.items.map((it, k) => (
                <tr key={k} className="border-b border-border"><td className="py-3">{it.description}</td><td className="py-3 text-right font-mono">{it.qty}</td><td className="py-3 text-right font-mono">{it.unitPrice.toFixed(2)} €</td><td className="py-3 text-right font-mono">{(it.qty * it.unitPrice).toFixed(2)} €</td></tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 flex justify-end"><div className="w-64 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Sous-total</span><span className="font-mono">{inv.amount.toFixed(2)} €</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">TVA 20%</span><span className="font-mono">{(inv.amount * 0.2).toFixed(2)} €</span></div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total TTC</span><span className="font-mono">{(inv.amount * 1.2).toFixed(2)} €</span></div>
          </div></div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
