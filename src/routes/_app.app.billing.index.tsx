import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { INVOICES } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/billing/")({
  component: BillingOverview,
});

function BillingOverview() {
  return (
    <PageContent className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Plan actuel</p>
          <div className="mt-2 flex items-center gap-2"><span className="text-xl font-semibold">Pro</span><Badge variant="success">Actif</Badge></div>
          <p className="mt-1 text-xs text-muted-foreground">19 €/mois · facturation mensuelle</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Prochaine facture</p>
          <p className="mt-2 text-2xl font-semibold">{INVOICES[0].amount.toFixed(2)} €</p>
          <p className="mt-1 text-xs text-muted-foreground">Le 1er mai 2025</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Solde</p>
          <p className="mt-2 text-2xl font-semibold">0,00 €</p>
          <p className="mt-1 text-xs text-success">À jour</p>
        </CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Consommation du cycle</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[{ k: "Sites", used: 4, max: 10 }, { k: "Boîtes mail", used: 3, max: 5 }, { k: "Bande passante", used: 240, max: 1000, suffix: "GB" }].map((u) => (
            <div key={u.k}>
              <div className="flex items-center justify-between text-sm"><span>{u.k}</span><span className="font-mono text-muted-foreground">{u.used}{u.suffix ?? ""} / {u.max}{u.suffix ?? ""}</span></div>
              <Progress value={(u.used / u.max) * 100} className="mt-1.5 h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContent>
  );
}
