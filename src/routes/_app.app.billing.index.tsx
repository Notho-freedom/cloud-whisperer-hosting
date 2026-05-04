import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getBillingOverview } from "@/server/billing.functions";
import { listSites } from "@/server/sites.server";
import { listMailboxes } from "@/server/email.functions";

export const Route = createFileRoute("/_app/app/billing/")({ component: BillingOverview });

function BillingOverview() {
  const { data: billing } = useQuery({ queryKey: ["billing"], queryFn: () => getBillingOverview() });
  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: () => listSites() });
  const { data: mailboxes = [] } = useQuery({ queryKey: ["mailboxes"], queryFn: () => listMailboxes() });
  const sub = billing?.subscription;
  const next = billing?.invoices?.[0];
  return (
    <PageContent className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Plan actuel</p>
          <div className="mt-2 flex items-center gap-2">
            <span className="text-xl font-semibold capitalize">{sub?.plan_id ?? "starter"}</span>
            <Badge variant="success">{sub?.status ?? "Actif"}</Badge>
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Dernière facture</p>
          <p className="mt-2 text-2xl font-semibold">{next ? `${Number(next.amount).toFixed(2)} €` : "—"}</p>
          <p className="mt-1 text-xs text-muted-foreground">{next ? new Date(next.date).toLocaleDateString("fr-FR") : "Aucune facture"}</p>
        </CardContent></Card>
        <Card><CardContent className="p-5">
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Factures payées</p>
          <p className="mt-2 text-2xl font-semibold">{(billing?.invoices ?? []).filter((i) => i.status === "paid").length}</p>
        </CardContent></Card>
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Consommation</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          {[{ k: "Sites", used: sites.length, max: 10 }, { k: "Boîtes mail", used: mailboxes.length, max: 5 }].map((u) => (
            <div key={u.k}>
              <div className="flex items-center justify-between text-sm"><span>{u.k}</span><span className="font-mono text-muted-foreground">{u.used} / {u.max}</span></div>
              <Progress value={(u.used / u.max) * 100} className="mt-1.5 h-1.5" />
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContent>
  );
}
