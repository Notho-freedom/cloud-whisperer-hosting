import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Check, Globe2, Rocket, Mail, Shield, Zap, Code2,
  Search, Server, Star, Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ConsoleMockup } from "@/components/marketing/ConsoleMockup";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "Hostiq — Hébergement, domaines & email pro sans infra" },
      { name: "description", content: "Achetez un domaine, déployez un site et créez vos emails pro depuis une console unifiée. Hostiq orchestre les meilleures APIs." },
      { property: "og:title", content: "Hostiq — Hébergement nouvelle génération" },
      { property: "og:description", content: "Domaines, sites edge et emails pro en une console. Sans infra à gérer." },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <Hero />
      <LogosStrip />
      <Stats />
      <Features />
      <HowItWorks />
      <Testimonials />
      <Comparison />
      <FAQ />
      <CTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-mesh opacity-80" />
      <div className="absolute inset-0 bg-grid opacity-40" />
      <div className="container relative mx-auto max-w-7xl px-4 py-20 md:py-28">
        <div className="mx-auto max-w-3xl text-center">
          <Link to="/blog" className="inline-flex">
            <Badge variant="secondary" className="mb-6 gap-1.5 rounded-full border border-border/60 px-3 py-1 backdrop-blur">
              <Sparkles className="h-3 w-3 text-primary" />
              Nouveau · Édition DNS instantanée
              <ArrowRight className="h-3 w-3" />
            </Badge>
          </Link>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            L'hébergement
            <br />
            <span className="gradient-text">sans infrastructure</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-balance text-lg text-muted-foreground md:text-xl">
            Domaine, hébergement edge et email pro — déployez votre stack complète en quelques clics.
            Hostiq orchestre les meilleures APIs pour vous.
          </p>

          <form
            className="mx-auto mt-10 flex max-w-xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Trouvez votre nom de domaine…"
                className="h-12 pl-10 font-mono text-base shadow-sm"
              />
            </div>
            <Link to="/domains" className="sm:w-auto">
              <Button size="lg" className="h-12 w-full sm:w-auto">
                Rechercher
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            .com dès 9,99 € · .io · .dev · .app · 500+ extensions
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            {["SSL gratuit", "CDN global", "99,99 % uptime", "Support 24/7"].map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="h-4 w-4 text-primary" /> {t}
              </span>
            ))}
          </div>
        </div>

        {/* Console mockup */}
        <div className="relative mx-auto mt-16 max-w-5xl">
          <div className="absolute -inset-x-10 -top-10 -bottom-10 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl" />
          <ConsoleMockup className="relative" />
        </div>
      </div>
    </section>
  );
}

function LogosStrip() {
  const logos = ["PlanetHoster", "▲ Vercel", "Google Workspace", "Microsoft 365", "Zoho Mail", "Stripe"];
  return (
    <section className="border-b border-border/60 bg-card/30 py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <p className="mb-6 text-center text-xs uppercase tracking-wider text-muted-foreground">
          Construit sur les meilleures APIs du marché
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-base font-semibold text-muted-foreground/70 md:text-lg">
          {logos.map((l) => <span key={l}>{l}</span>)}
        </div>
      </div>
    </section>
  );
}

function Stats() {
  const stats = [
    { value: "12k+", label: "Sites hébergés" },
    { value: "180+", label: "TLD disponibles" },
    { value: "100+", label: "Régions edge" },
    { value: "99,99 %", label: "Uptime annuel" },
  ];
  return (
    <section className="border-b border-border/60 py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-mono text-4xl font-bold tracking-tight md:text-5xl gradient-text">
                {s.value}
              </div>
              <div className="mt-2 text-sm text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  { icon: Globe2, title: "Domaines en 1 clic", desc: "500+ extensions, recherche instantanée, gestion DNS complète, transferts simplifiés." },
  { icon: Rocket, title: "Déploiements éclair", desc: "Push to deploy, preview deployments, rollback instantané. Frameworks détectés automatiquement." },
  { icon: Mail, title: "Email pro multi-provider", desc: "Connectez Google Workspace, Microsoft 365 ou Zoho. Une UI, tous les providers." },
  { icon: Shield, title: "SSL & sécurité incluses", desc: "Certificats Let's Encrypt auto-renouvelés. DNSSEC, lock domaine, 2FA." },
  { icon: Zap, title: "Edge & CDN global", desc: "Vos sites servis depuis 100+ régions. Web Vitals au top, latence minimale." },
  { icon: Code2, title: "API-first", desc: "Tout ce que vous faites en console est aussi disponible en API + webhooks." },
];

function Features() {
  return (
    <section className="border-b border-border/60 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Plateforme</Badge>
          <h2 className="text-balance text-3xl font-bold tracking-tight md:text-4xl">
            Une console, toute votre stack web
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fini les onglets multipliés. Hostiq centralise domaines, hébergement et emails pro.
          </p>
        </div>
        <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group relative overflow-hidden p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/5 opacity-0 transition-opacity group-hover:opacity-100" />
              <div className="relative flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary group-hover:text-primary-foreground group-hover:ring-primary">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="relative mt-5 text-base font-semibold">{f.title}</h3>
              <p className="relative mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { icon: Search, title: "Trouvez un domaine", desc: "Cherchez parmi 500+ extensions et achetez en 30 secondes." },
    { icon: Server, title: "Déployez votre site", desc: "Importez depuis Git ou un template. SSL et CDN configurés automatiquement." },
    { icon: Mail, title: "Activez vos emails", desc: "Choisissez votre provider et créez vos boîtes hello@votre-domaine.com." },
  ];
  return (
    <section className="border-b border-border/60 bg-card/30 py-24">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Comment ça marche</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">En 3 étapes</h2>
          <p className="mt-4 text-muted-foreground">De zéro à en ligne en moins de 10 minutes.</p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <Card key={s.title} className="relative overflow-hidden p-8">
              <div className="absolute right-4 top-4 font-mono text-7xl font-bold text-muted/20">
                0{i + 1}
              </div>
              <div className="relative">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
                  <s.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-lg font-semibold">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Testimonials() {
  const items = [
    {
      quote: "On a migré nos 30 sites client en une après-midi. Le DNS, les emails, tout dans la même console. Game changer.",
      name: "Léa Martin",
      role: "CTO @ Acme Studio",
      initials: "LM",
    },
    {
      quote: "Le support est réactif, les déploiements sont instantanés et les factures sont enfin lisibles. C'est rare.",
      name: "Karim Benali",
      role: "Founder @ Pixly",
      initials: "KB",
    },
    {
      quote: "L'API est propre, les webhooks fiables. On a automatisé toute notre stack en deux jours.",
      name: "Sophie Roux",
      role: "Lead Dev @ Northwave",
      initials: "SR",
    },
  ];
  return (
    <section className="border-b border-border/60 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Témoignages</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Aimé par les équipes produit
          </h2>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {items.map((t) => (
            <Card key={t.name} className="flex flex-col p-6">
              <div className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>
              <blockquote className="mt-4 flex-1 text-sm text-balance">« {t.quote} »</blockquote>
              <div className="mt-6 flex items-center gap-3 border-t border-border/60 pt-4">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 font-mono text-xs font-bold text-primary">
                  {t.initials}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows: Array<[string, boolean, boolean, boolean]> = [
    ["Domaine .com inclus 1 an", true, false, false],
    ["Déploiements illimités", true, true, false],
    ["SSL automatique", true, true, true],
    ["Email pro intégré", true, false, false],
    ["Console unifiée", true, false, false],
    ["Edge global 100+ régions", true, false, true],
    ["Support 24/7", true, false, true],
  ];
  return (
    <section className="border-b border-border/60 bg-card/30 py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="mb-4">Comparaison</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Pourquoi choisir Hostiq ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Comparatif honnête face aux solutions traditionnelles.
          </p>
        </div>
        <Card className="mt-12 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 text-left font-medium">Fonctionnalité</th>
                <th className="p-4 text-center font-semibold text-primary">Hostiq</th>
                <th className="p-4 text-center text-muted-foreground">Hébergeur classique</th>
                <th className="p-4 text-center text-muted-foreground">Cloud DIY</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t border-border/60">
                  <td className="p-4">{row[0]}</td>
                  {(row.slice(1) as boolean[]).map((cell, j) => (
                    <td key={j} className="p-4 text-center">
                      {cell ? (
                        <Check className="mx-auto h-4 w-4 text-primary" />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </section>
  );
}

function FAQ() {
  const items = [
    { q: "Puis-je transférer un domaine que j'ai déjà ?", a: "Oui, le transfert entrant est gratuit pour la majorité des extensions et inclut un an supplémentaire." },
    { q: "Quels frameworks sont supportés ?", a: "Next.js, Vite, Astro, Remix, SvelteKit, Nuxt, Gatsby, Hugo et bien d'autres — la détection est automatique." },
    { q: "Puis-je utiliser mon propre fournisseur d'email ?", a: "Oui, vous pouvez connecter Google Workspace, Microsoft 365 ou Zoho selon vos préférences." },
    { q: "Les paiements sont-ils sécurisés ?", a: "Oui, tous les paiements sont traités par Stripe, conforme PCI DSS niveau 1." },
    { q: "Y a-t-il un engagement ?", a: "Aucun. Vous pouvez annuler à tout moment depuis la console — vos données restent exportables." },
  ];
  return (
    <section className="border-b border-border/60 py-24">
      <div className="container mx-auto max-w-3xl px-4">
        <div className="text-center">
          <Badge variant="outline" className="mb-4">FAQ</Badge>
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Questions fréquentes</h2>
        </div>
        <div className="mt-10 space-y-3">
          {items.map((it) => (
            <details
              key={it.q}
              className="group rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40 [&[open]]:border-primary/40"
            >
              <summary className="flex cursor-pointer items-center justify-between gap-4 font-medium">
                {it.q}
                <span className="text-muted-foreground transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm text-muted-foreground">{it.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <Card className="relative overflow-hidden border-primary/30 p-12 text-center md:p-16">
          <div className="absolute inset-0 bg-mesh opacity-80" />
          <div className="absolute inset-0 bg-radial-emerald" />
          <div className="relative">
            <Sparkles className="mx-auto mb-4 h-7 w-7 text-primary" />
            <h2 className="text-balance text-3xl font-bold tracking-tight md:text-5xl">
              Prêt à lancer votre projet ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Créez un compte gratuit. Pas de carte requise. Annulable à tout moment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg" className="shadow-lg shadow-primary/30">
                  Créer un compte gratuit
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/pricing">
                <Button size="lg" variant="outline">
                  Voir les tarifs
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </section>
  );
}
