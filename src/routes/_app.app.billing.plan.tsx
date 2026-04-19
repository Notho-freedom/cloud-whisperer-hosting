import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles } from "lucide-react";
import { PLANS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/billing/plan")({
  component: PlanPicker,
});

const ADDONS = [
  { name: "Boîte email +1", price: "4,50 €/mois" },
  { name: "Bande passante +100 GB", price: "10 €/mois" },
  { name: "Domaine .com supplémentaire", price: "9,99 €/an" },
  { name: "Support prioritaire 24/7", price: "29 €/mois" },
];

function PlanPicker() {
  return (
    <PageContent className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {PLANS.map((p) => (
          <Card key={p.id} className={p.popular ? "border-primary/50 ring-2 ring-primary/20 relative" : "relative"}>
            {p.popular && <Badge variant="success" className="absolute -top-2 left-6"><Sparkles className="h-3 w-3 mr-1" />Populaire</Badge>}
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-4 text-3xl font-semibold">{p.pricePerMonth} €<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
              <Button className="mt-4 w-full" variant={p.popular ? "default" : "outline"}>{p.id === "pro" ? "Plan actuel" : "Choisir"}</Button>
              <ul className="mt-6 space-y-2 text-sm">
                {p.features.map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />{f}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <div>
        <h3 className="text-base font-semibold">Add-ons</h3>
        <p className="text-sm text-muted-foreground">Ajustez votre forfait à la volée.</p>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {ADDONS.map((a) => (
            <Card key={a.name}><CardContent className="flex items-center justify-between p-4">
              <div><p className="font-medium">{a.name}</p><p className="text-xs text-muted-foreground">{a.price}</p></div>
              <Button variant="outline" size="sm">Ajouter</Button>
            </CardContent></Card>
          ))}
        </div>
      </div>
    </PageContent>
  );
}
