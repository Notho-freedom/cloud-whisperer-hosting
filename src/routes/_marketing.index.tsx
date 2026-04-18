import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Check,
  Globe2,
  Rocket,
  Mail,
  Shield,
  Zap,
  Code2,
  Search,
  Server,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/")({
  head: () => ({
    meta: [
      { title: "Hostiq — Hébergement, domaines & email pro sans infra" },
      {
        name: "description",
        content:
          "Achetez un domaine, déployez un site et créez vos emails pro depuis une console unifiée. Hostiq, l'hébergeur full-API.",
      },
      { property: "og:title", content: "Hostiq — Hébergement nouvelle génération" },
      {
        property: "og:description",
        content: "Domaines, sites Vercel et emails pro en une console. Sans infra à gérer.",
      },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <>
      <Hero />
      <LogosStrip />
      <Features />
      <HowItWorks />
      <Comparison />
      <CTA />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute inset-0 bg-grid opacity-50" />
      <div className="absolute inset-0 bg-radial-emerald" />
      <div className="container relative mx-auto max-w-7xl px-4 py-24 md:py-32">
        <div className="mx-auto max-w-3xl text-center">
          <Badge variant="secondary" className="mb-6 gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
            Nouveau · Édition DNS instantanée
          </Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl">
            L'hébergement <span className="gradient-text">sans infrastructure</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground md:text-xl">
            Domaine, hosting et email pro — déployez votre stack complète en quelques clics.
            Hostiq orchestre les meilleures APIs pour vous.
          </p>

          <form
            className="mx-auto mt-10 flex max-w-xl flex-col gap-2 sm:flex-row"
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Trouvez votre nom de domaine parfait…"
                className="h-12 pl-10 font-mono text-base"
              />
            </div>
            <Link to="/domains">
              <Button size="lg" className="h-12 w-full sm:w-auto">
                Rechercher
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </form>
          <p className="mt-3 text-xs text-muted-foreground">
            .com dès 9,99 € · .io · .dev · .app · 500+ extensions
          </p>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" /> SSL gratuit
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" /> CDN global
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" /> 99,99% uptime
            </span>
            <span className="inline-flex items-center gap-1.5">
              <Check className="h-4 w-4 text-primary" /> Support 24/7
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

function LogosStrip() {
  return (
    <section className="border-b border-border/60 bg-card/30 py-10">
      <div className="container mx-auto max-w-7xl px-4">
        <p className="mb-6 text-center text-xs uppercase tracking-wider text-muted-foreground">
          Construit sur les meilleures APIs du marché
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-lg font-semibold text-muted-foreground/70">
          <span>PlanetHoster</span>
          <span>▲ Vercel</span>
          <span>Google Workspace</span>
          <span>Microsoft 365</span>
          <span>Zoho Mail</span>
          <span>Stripe</span>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Globe2,
    title: "Domaines en 1 clic",
    desc: "500+ extensions, recherche instantanée, gestion DNS complète, transferts simplifiés.",
  },
  {
    icon: Rocket,
    title: "Déploiements éclair",
    desc: "Push to deploy, preview deployments, rollback instantané. Frameworks détectés automatiquement.",
  },
  {
    icon: Mail,
    title: "Email pro multi-provider",
    desc: "Connectez Google Workspace, Microsoft 365 ou Zoho. Une UI, tous les providers.",
  },
  {
    icon: Shield,
    title: "SSL & sécurité incluses",
    desc: "Certificats Let's Encrypt auto-renouvelés. DNSSEC, lock domaine, 2FA.",
  },
  {
    icon: Zap,
    title: "Edge & CDN global",
    desc: "Vos sites servis depuis 100+ régions. Web Vitals au top, latence minimale.",
  },
  {
    icon: Code2,
    title: "API-first",
    desc: "Tout ce que vous faites en console est aussi disponible en API + webhooks.",
  },
];

function Features() {
  return (
    <section className="border-b border-border/60 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Une console, toute votre stack web
          </h2>
          <p className="mt-4 text-muted-foreground">
            Fini les onglets multipliés. Hostiq centralise domaines, hébergement et emails pro.
          </p>
        </div>
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((f) => (
            <Card key={f.title} className="group p-6 transition-colors hover:border-primary/40">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <f.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Search,
      title: "Trouvez un domaine",
      desc: "Cherchez parmi 500+ extensions et achetez en 30 secondes.",
    },
    {
      icon: Server,
      title: "Déployez votre site",
      desc: "Importez depuis Git ou un template. SSL et CDN configurés automatiquement.",
    },
    {
      icon: Mail,
      title: "Activez vos emails",
      desc: "Choisissez votre provider et créez vos boîtes hello@votre-domaine.com.",
    },
  ];

  return (
    <section className="border-b border-border/60 bg-card/30 py-24">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">En 3 étapes</h2>
          <p className="mt-4 text-muted-foreground">De zéro à en ligne en moins de 10 minutes.</p>
        </div>
        <div className="mt-16 grid gap-8 md:grid-cols-3">
          {steps.map((s, i) => (
            <div key={s.title} className="relative">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-mono font-bold">
                  0{i + 1}
                </div>
                <s.icon className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Comparison() {
  const rows = [
    ["Domaine .com inclus 1 an", true, false, false],
    ["Déploiements illimités", true, true, false],
    ["SSL automatique", true, true, true],
    ["Email pro intégré", true, false, false],
    ["Console unifiée", true, false, false],
    ["Support 24/7", true, false, true],
  ];
  return (
    <section className="border-b border-border/60 py-24">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="mx-auto max-w-2xl text-center">
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
                  <td className="p-4">{row[0] as string}</td>
                  {row.slice(1).map((cell, j) => (
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

function CTA() {
  return (
    <section className="py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <Card className="relative overflow-hidden border-primary/20 bg-card p-12 text-center">
          <div className="absolute inset-0 bg-radial-emerald opacity-60" />
          <div className="relative">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Prêt à lancer votre projet ?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Créez un compte gratuit. Pas de carte requise. Annulable à tout moment.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link to="/signup">
                <Button size="lg">
                  Créer un compte
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
