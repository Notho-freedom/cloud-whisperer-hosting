import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe2, Rocket, Mail, Shield, Zap, Code2, Users, Activity,
  GitBranch, Lock, BarChart3, Bell, Database, Terminal, ArrowRight,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_marketing/features")({
  head: () => ({
    meta: [
      { title: "Fonctionnalités complètes | Hostiq" },
      { name: "description", content: "Toutes les fonctionnalités pour héberger votre web : domaines, sites, emails, monitoring, équipes." },
      { property: "og:title", content: "Fonctionnalités Hostiq" },
      { property: "og:description", content: "L'ensemble des outils Hostiq pour vos projets web." },
    ],
  }),
  component: FeaturesPage,
});

const GROUPS = [
  {
    title: "Domaines",
    desc: "Achat, gestion DNS, sécurité, transferts.",
    items: [
      { icon: Globe2, t: "500+ extensions", d: "Recherche instantanée multi-TLD." },
      { icon: Lock, t: "DNSSEC & lock", d: "Protégez vos domaines contre le détournement." },
      { icon: GitBranch, t: "Éditeur DNS visuel", d: "A, AAAA, CNAME, MX, TXT, SRV, CAA." },
    ],
  },
  {
    title: "Hébergement",
    desc: "Edge mondial, déploiements continus, monitoring.",
    items: [
      { icon: Rocket, t: "Push to deploy", d: "Git intégré, builds automatiques." },
      { icon: Zap, t: "Edge global", d: "100+ régions, latence minimale." },
      { icon: Activity, t: "Monitoring & logs", d: "Logs runtime + Web Vitals." },
    ],
  },
  {
    title: "Email pro",
    desc: "Multi-provider, alias illimités, sécurité.",
    items: [
      { icon: Mail, t: "Multi-provider", d: "Google, Microsoft, Zoho — au choix." },
      { icon: Users, t: "Alias illimités", d: "support@, contact@, etc." },
      { icon: Shield, t: "SPF/DKIM/DMARC auto", d: "Délivrabilité optimale." },
    ],
  },
  {
    title: "Plateforme",
    desc: "API-first, équipes, monitoring, automatisation.",
    items: [
      { icon: Code2, t: "API & webhooks", d: "Tout est scriptable." },
      { icon: BarChart3, t: "Analytics intégrées", d: "Trafic et conversions." },
      { icon: Bell, t: "Notifications", d: "Email, Slack, webhook." },
      { icon: Database, t: "Backups", d: "Snapshots quotidiens." },
      { icon: Terminal, t: "CLI", d: "hostiq deploy depuis votre terminal." },
      { icon: Users, t: "Équipes & rôles", d: "Permissions fines par projet." },
    ],
  },
];

function FeaturesPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh opacity-60" />
        <div className="container relative mx-auto max-w-3xl px-4 py-20 text-center">
          <Badge variant="outline" className="mb-4">Fonctionnalités</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Tout pour <span className="gradient-text">bâtir, déployer, scaler</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Une plateforme complète qui remplace 5 outils.
          </p>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-20">
        <div className="space-y-20">
          {GROUPS.map((g) => (
            <div key={g.title}>
              <div className="mb-8 max-w-xl">
                <h2 className="text-3xl font-bold tracking-tight">{g.title}</h2>
                <p className="mt-2 text-muted-foreground">{g.desc}</p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {g.items.map((it) => (
                  <Card key={it.t} className="group p-6 transition-all hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary ring-1 ring-primary/20 transition-all group-hover:bg-primary group-hover:text-primary-foreground">
                      <it.icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-5 font-semibold">{it.t}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{it.d}</p>
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>

        <Card className="mt-20 overflow-hidden border-primary/30 p-10 text-center md:p-14">
          <div className="absolute inset-0 bg-mesh opacity-60" />
          <div className="relative">
            <h2 className="text-balance text-3xl font-bold md:text-4xl">Prêt à explorer la console ?</h2>
            <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
              Créez un compte gratuit et testez toutes les fonctionnalités.
            </p>
            <div className="mt-6">
              <Link to="/signup">
                <Button size="lg" className="shadow-lg shadow-primary/20">
                  Démarrer<ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
