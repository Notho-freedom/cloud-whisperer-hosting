import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_marketing/legal/sla")({
  head: () => ({ meta: [{ title: "SLA | Hostiq" }, { name: "description", content: "Engagement de niveau de service Hostiq." }] }),
  component: SlaPage,
});

function SlaPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold">Service Level Agreement</h1>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>Hostiq s'engage sur un uptime mensuel de 99,99% pour les plans Business et Enterprise.</p>
        <div className="not-prose mt-6 grid gap-4 md:grid-cols-3">
          <Card className="p-4 text-center"><div className="font-mono text-2xl font-bold text-primary">99,9%</div><p className="mt-1 text-xs">Pro</p></Card>
          <Card className="p-4 text-center"><div className="font-mono text-2xl font-bold text-primary">99,99%</div><p className="mt-1 text-xs">Business</p></Card>
          <Card className="p-4 text-center"><div className="font-mono text-2xl font-bold text-primary">99,999%</div><p className="mt-1 text-xs">Enterprise</p></Card>
        </div>
        <h2 className="text-xl font-semibold text-foreground">Compensation</h2>
        <p>En cas de non-respect, des crédits sont automatiquement appliqués sur la facture suivante.</p>
      </div>
    </article>
  );
}
