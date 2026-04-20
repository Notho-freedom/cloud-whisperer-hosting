import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Check, Sparkles, HelpCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_marketing/pricing")({
  head: () => ({
    meta: [
      { title: "Tarifs — Plans hybrides + add-ons | Hostiq" },
      { name: "description", content: "Plans transparents avec add-ons à la carte. Démarrez gratuitement, payez ce que vous utilisez." },
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
      "SLA 99,99 %",
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

const FAQS = [
  { q: "Puis-je changer de plan à tout moment ?", a: "Oui. L'upgrade est instantané, le downgrade prend effet à la prochaine période de facturation." },
  { q: "Comment fonctionne la facturation à l'usage ?", a: "Les add-ons sont mesurés en continu et facturés mensuellement avec votre plan." },
  { q: "Y a-t-il une réduction annuelle ?", a: "Oui, économisez 20 % en payant à l'année." },
  { q: "Acceptez-vous les paiements SEPA ?", a: "Oui, cartes (Stripe) et SEPA disponibles selon le plan." },
];

function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container relative mx-auto max-w-3xl px-4 py-20 text-center">
          <Badge variant="outline" className="mb-4">Tarifs</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Tarifs <span className="gradient-text">transparents</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Plans + add-ons. Vous ne payez que ce dont vous avez besoin.
          </p>
          <div className="mt-8 inline-flex items-center gap-3 rounded-full border border-border bg-card px-4 py-2 shadow-sm">
            <span className={!yearly ? "font-medium text-foreground" : "text-muted-foreground"}>Mensuel</span>
            <Switch checked={yearly} onCheckedChange={setYearly} />
            <span className={yearly ? "font-medium text-foreground" : "text-muted-foreground"}>
              Annuel <Badge variant="secondary" className="ml-1">−20 %</Badge>
            </span>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-6 lg:grid-cols-3">
            {PLANS.map((p) => (
              <Card
                key={p.name}
                className={`relative flex flex-col p-8 transition-all ${
                  p.highlight
                    ? "border-primary/60 shadow-xl shadow-primary/10 lg:scale-[1.02]"
                    : "hover:border-primary/30"
                }`}
              >
                {p.highlight && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 shadow-md">
                    <Sparkles className="mr-1 h-3 w-3" /> Le plus choisi
                  </Badge>
                )}
                <h3 className="text-xl font-semibold">{p.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-5xl font-bold tracking-tight">
                    {yearly ? p.yearly : p.monthly}
                  </span>
                  <span className="text-2xl font-semibold">€</span>
                  <span className="ml-1 text-sm text-muted-foreground">/mois</span>
                </div>
                {yearly && p.yearly > 0 && (
                  <p className="mt-1 text-xs text-muted-foreground">
                    soit {p.yearly * 12} €/an facturé annuellement
                  </p>
                )}
                <Link to="/signup" className="mt-6 block">
                  <Button className="w-full" variant={p.highlight ? "default" : "outline"} size="lg">
                    {p.cta}
                  </Button>
                </Link>
                <ul className="mt-8 flex-1 space-y-3">
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

      <section className="border-b border-border/60 bg-card/30 py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Add-ons</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Add-ons à la carte</h2>
            <p className="mt-3 text-muted-foreground">
              Activez à la demande. Facturé à l'usage réel.
            </p>
          </div>
          <Card className="mt-10 overflow-hidden">
            <table className="w-full">
              <tbody>
                {ADDONS.map((a, i) => (
                  <tr key={a.name} className={i > 0 ? "border-t border-border/60" : ""}>
                    <td className="p-5 text-sm font-medium">{a.name}</td>
                    <td className="p-5 text-right font-mono text-sm">
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

      <section className="py-20">
        <div className="container mx-auto max-w-3xl px-4">
          <div className="text-center">
            <HelpCircle className="mx-auto mb-3 h-6 w-6 text-primary" />
            <h2 className="text-3xl font-bold tracking-tight">Questions fréquentes</h2>
          </div>
          <div className="mt-10 space-y-3">
            {FAQS.map((f) => (
              <details key={f.q} className="group rounded-lg border border-border bg-card p-5 [&[open]]:border-primary/40">
                <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                  {f.q}
                  <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
