import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import { Download, Printer } from "lucide-react";
import { StatusBadge } from "@/components/StatusBadge";
import { getInvoice } from "@/api/billing-api.server";

export const Route = createFileRoute("/_app/app/billing/invoices/$id")({ component: InvoiceDetail });

function InvoiceDetail() {
  const { id } = Route.useParams();
  const { data: inv } = useQuery({ queryKey: ["invoice", id], queryFn: () => getInvoice({ data: { id } }) });
  if (!inv) return <PageContent><p className="text-sm text-muted-foreground">Chargement…</p></PageContent>;
  const items = (inv.items as Array<{ description: string; qty: number; unitPrice: number }>) ?? [];
  return (
    <PageContent className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="font-mono text-lg">{inv.number ?? inv.id.slice(0,8)}</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" />Imprimer</Button>
          {inv.pdf_url && <Button size="sm" asChild><a href={inv.pdf_url} target="_blank" rel="noreferrer"><Download className="h-4 w-4" />PDF</a></Button>}
        </div>
      </div>
      <Card>
        <CardContent className="p-8 md:p-12">
          <div className="flex justify-between"><Logo /><div className="text-right"><p className="font-mono text-2xl font-semibold">{inv.number ?? "—"}</p><StatusBadge status={inv.status} /></div></div>
          <div className="mt-8 grid gap-8 md:grid-cols-2">
            <div><p className="text-xs uppercase tracking-wider text-muted-foreground">Émis le</p><p className="mt-1">{new Date(inv.date).toLocaleDateString("fr-FR")}</p></div>
            <div className="md:text-right"><p className="text-xs uppercase tracking-wider text-muted-foreground">Échéance</p><p>{inv.due_date ? new Date(inv.due_date).toLocaleDateString("fr-FR") : "—"}</p></div>
          </div>
          {items.length > 0 && (
            <table className="mt-10 w-full text-sm">
              <thead className="border-b border-border"><tr className="text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="py-2">Description</th><th className="py-2 text-right">Qté</th><th className="py-2 text-right">PU</th><th className="py-2 text-right">Total</th></tr></thead>
              <tbody>
                {items.map((it, k) => (
                  <tr key={k} className="border-b border-border"><td className="py-3">{it.description}</td><td className="py-3 text-right font-mono">{it.qty}</td><td className="py-3 text-right font-mono">{it.unitPrice.toFixed(2)} €</td><td className="py-3 text-right font-mono">{(it.qty * it.unitPrice).toFixed(2)} €</td></tr>
                ))}
              </tbody>
            </table>
          )}
          <div className="mt-6 flex justify-end">
            <div className="w-64 space-y-1 text-sm">
              <div className="flex justify-between border-t border-border pt-2 text-base font-semibold"><span>Total</span><span className="font-mono">{Number(inv.amount).toFixed(2)} {inv.currency || "EUR"}</span></div>
            </div>
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
