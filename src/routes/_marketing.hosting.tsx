import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Rocket, GitBranch, Zap, Globe2, Shield, Activity, Check,
  Terminal, ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/hosting")({
  head: () => ({
    meta: [
      { title: "Hébergement edge — Déploiements illimités | Hostiq" },
      { name: "description", content: "Hébergez vos sites sur un edge mondial. Push to deploy, preview deployments, SSL et CDN inclus." },
      { property: "og:title", content: "Hébergement Hostiq — Powered by edge" },
      { property: "og:description", content: "Déploiements instantanés, edge mondial, zéro infra." },
    ],
  }),
  component: HostingPage,
});

const FEATURES = [
  { icon: GitBranch, title: "Git push to deploy", desc: "Connectez GitHub, GitLab ou Bitbucket. Chaque commit déclenche un build." },
  { icon: Zap, title: "Preview deployments", desc: "Une URL unique par PR. Partagez et reviewez avant le merge." },
  { icon: Globe2, title: "Edge global", desc: "Sites servis depuis 100+ régions. Latence < 50 ms partout." },
  { icon: Shield, title: "SSL & DDoS inclus", desc: "Let's Encrypt auto-renouvelé. Protection DDoS au niveau edge." },
  { icon: Activity, title: "Analytics & Web Vitals", desc: "Mesurez la performance réelle de vos visiteurs." },
  { icon: Rocket, title: "Frameworks détectés", desc: "Next.js, Vite, Astro, Remix… build config automatique." },
];

const FRAMEWORKS = ["Next.js", "Vite", "Astro", "Remix", "SvelteKit", "Nuxt", "Gatsby", "Hugo", "Solid", "Qwik"];

function HostingPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 text-center">
          <Badge variant="secondary" className="mb-6 backdrop-blur">▲ Powered by Vercel API</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Hébergement <span className="gradient-text">edge-first</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Déployez en 1 commit. Servi mondialement. Sans gérer un seul serveur.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup"><Button size="lg" className="shadow-lg shadow-primary/20">Déployer un site<ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
            <Link to="/pricing"><Button size="lg" variant="outline">Voir les plans</Button></Link>
          </div>

          {/* CLI snippet */}
          <Card className="mx-auto mt-14 max-w-2xl overflow-hidden text-left shadow-xl">
            <div className="flex items-center gap-2 border-b border-border/60 bg-muted/40 px-4 py-2">
              <Terminal className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-mono text-xs text-muted-foreground">Terminal</span>
            </div>
            <pre className="p-5 font-mono text-sm leading-relaxed">
              <span className="text-muted-foreground">$ </span><span className="text-foreground">npx hostiq deploy</span>{"\n"}
              <span className="text-muted-foreground">→ Detected framework: Next.js</span>{"\n"}
              <span className="text-muted-foreground">→ Building…</span>{" "}<span className="text-success">done in 18s</span>{"\n"}
              <span className="text-muted-foreground">→ Uploading to edge…</span>{" "}<span className="text-success">done</span>{"\n"}
              <span className="text-success">✓ Live at https://acme.hostiq.app</span>
            </pre>
          </Card>
        </div>
      </section>

      <section className="border-b border-border/60 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mx-auto mb-12 max-w-2xl text-center">
            <Badge variant="outline" className="mb-3">Fonctionnalités</Badge>
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Tout pour livrer plus vite</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="group p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-card/30 py-20">
        <div className="container mx-auto max-w-5xl px-4 text-center">
          <Badge variant="outline" className="mb-3">Frameworks</Badge>
          <h2 className="text-3xl font-bold tracking-tight">Tous vos frameworks supportés</h2>
          <p className="mt-3 text-muted-foreground">Détection automatique. Zéro config.</p>
          <div className="mt-10 flex flex-wrap justify-center gap-2">
            {FRAMEWORKS.map((f) => (
              <Badge key={f} variant="outline" className="px-4 py-2 font-mono text-sm shadow-sm">
                <Check className="mr-1.5 h-3 w-3 text-primary" /> {f}
              </Badge>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
