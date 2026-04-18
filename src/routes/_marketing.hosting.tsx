import { createFileRoute, Link } from "@tanstack/react-router";
import { Rocket, GitBranch, Zap, Globe2, Shield, Activity, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/hosting")({
  head: () => ({
    meta: [
      { title: "Hébergement — Edge déploiements illimités | Hostiq" },
      {
        name: "description",
        content: "Hébergez vos sites sur un edge mondial. Push to deploy, preview deployments, SSL et CDN inclus.",
      },
      { property: "og:title", content: "Hébergement Hostiq — Powered by edge" },
      { property: "og:description", content: "Déploiements instantanés, edge mondial, zéro infra." },
    ],
  }),
  component: HostingPage,
});

const FEATURES = [
  { icon: GitBranch, title: "Git push to deploy", desc: "Connectez GitHub, GitLab ou Bitbucket. Chaque commit déclenche un build." },
  { icon: Zap, title: "Preview deployments", desc: "Une URL unique par PR. Partagez et reviewez avant le merge." },
  { icon: Globe2, title: "Edge global", desc: "Sites servis depuis 100+ régions. Latence < 50ms partout." },
  { icon: Shield, title: "SSL & DDoS inclus", desc: "Let's Encrypt auto-renouvelé. Protection DDoS au niveau edge." },
  { icon: Activity, title: "Analytics & Web Vitals", desc: "Mesurez la performance réelle de vos visiteurs." },
  { icon: Rocket, title: "Frameworks détectés", desc: "Next.js, Vite, Astro, Remix… build config automatique." },
];

const FRAMEWORKS = ["Next.js", "Vite", "Astro", "Remix", "SvelteKit", "Nuxt", "Gatsby", "Hugo"];

function HostingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-emerald" />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-6">Powered by Vercel API</Badge>
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Hébergement <span className="gradient-text">edge-first</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Déployez en 1 commit. Servi mondialement. Sans gérer un seul serveur.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup"><Button size="lg">Déployer un site</Button></Link>
            <Link to="/pricing"><Button size="lg" variant="outline">Voir les plans</Button></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <h2 className="text-3xl font-bold">Tous vos frameworks supportés</h2>
          <p className="mt-3 text-muted-foreground">Détection automatique. Zéro config.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {FRAMEWORKS.map((f) => (
              <Badge key={f} variant="outline" className="px-4 py-2 font-mono text-sm">
                <Check className="mr-1.5 h-3 w-3 text-primary" /> {f}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
