import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_marketing/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — Plans hybrides + add-ons | Hostiq" },
      {
        name: "description",
        content: "Plans transparents avec add-ons à la carte. Démarrez gratuitement, payez ce que vous utilisez.",
      },
      { property: "og:title", content: "Tarifs Hostiq — Plans + add-ons" },
      { property: "og:description", content: "Plans hybrides transparents pour tous les projets." },
    ],
  }),
  component: PricingPage,
});

const PLANS = [
  {
    name: "Starter",
    desc: "Pour démarrer un projet personnel.",
    monthly: 0,
    yearly: 0,
    features: [
      "1 site hébergé",
      "100 GB de bande passante",
      "Domaine non inclus",
      "SSL automatique",
      "Support communautaire",
    ],
    cta: "Commencer gratuitement",
    highlight: false,
  },
  {
    name: "Pro",
    desc: "Pour freelances et petites équipes.",
    monthly: 19,
    yearly: 15,
    features: [
      "10 sites hébergés",
      "1 TB de bande passante",
      "1 domaine .com inclus",
      "5 boîtes email pro",
      "Preview deployments",
      "Support prioritaire",
    ],
    cta: "Choisir Pro",
    highlight: true,
  },
  {
    name: "Business",
    desc: "Pour scaling et équipes.",
    monthly: 49,
    yearly: 39,
    features: [
      "Sites illimités",
      "5 TB de bande passante",
      "3 domaines inclus",
      "20 boîtes email pro",
      "Multi-utilisateurs & rôles",
      "SLA 99,99%",
      "Support 24/7",
    ],
    cta: "Choisir Business",
    highlight: false,
  },
];

const ADDONS = [
  { name: "Bande passante", price: "0,05 €", unit: "/GB" },
  { name: "Boîte email supplémentaire", price: "1,90 €", unit: "/mois" },
  { name: "Domaine supplémentaire", price: "9,99 €", unit: "/an" },
  { name: "Stockage objets", price: "0,02 €", unit: "/GB/mois" },
  { name: "Build minutes", price: "0,008 €", unit: "/min" },
  { name: "Région edge dédiée", price: "29 €", unit: "/mois" },
];

function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <>
      <section className="border-b border-border/60 py-16 text-center">
        <div className="container mx-auto max-w-3xl px-4">
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Tarifs <span className="gradient-text">transparents</span>
          </h1>
          <p className="mt-4 text-muted-foreground">
            Plans + add-ons. Vous ne payez que ce dont vous avez besoin.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2">
            <span className={!yearly ? "text-foreground" : "text-muted-foreground"}>Mensuel</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={yearly ? "text-foreground" : "text-muted-foreground"}>
              Annuel <Badge variant="secondary" className="ml-1">−20%</Badge>
            </span>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <Card
                key={p.name}
                className={`relative p-8 ${p.highlight ? "border-primary shadow-lg shadow-primary/10" : ""}`}
              >
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Le plus choisi</Badge>
                )}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-4xl font-bold">
                    {yearly ? p.yearly : p.monthly} €
                  </span>
                  <span className="text-sm text-muted-foreground">/mois</span>
                </div>
                <Link to="/signup" className="mt-6 block">
                  <Button className="w-full" variant={p.highlight ? "default" : "outline"}>
                    {p.cta}
                  </Button>
                </Link>
                <ul className="mt-8 space-y-3">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center">
            <h2 className="text-3xl font-bold">Add-ons à la carte</h2>
            <p className="mt-3 text-muted-foreground">
              Activez à la demande. Facturé à l'usage réel.
            </p>
          </div>
          <Card className="mt-10 overflow-hidden">
            <table className="w-full">
              <tbody>
                {ADDONS.map((a, i) => (
                  <tr key={a.name} className={i > 0 ? "border-t border-border/60" : ""}>
                    <td className="p-4 text-sm">{a.name}</td>
                    <td className="p-4 text-right font-mono text-sm">
                      <span className="font-semibold">{a.price}</span>
                      <span className="text-muted-foreground">{a.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      </section>
    </>
  );
}
