import { createFileRoute } from "@tanstack/react-router";
import {
  Globe2, Rocket, Mail, Shield, Zap, Code2, Users, Activity,
  GitBranch, Lock, BarChart3, Bell, Database, Terminal
} from "lucide-react";
import { Card } from "@/components/ui/card";

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
    items: [
      { icon: Globe2, t: "500+ extensions", d: "Recherche instantanée multi-TLD." },
      { icon: Lock, t: "DNSSEC & lock", d: "Protégez vos domaines contre le détournement." },
      { icon: GitBranch, t: "Éditeur DNS visuel", d: "A, AAAA, CNAME, MX, TXT, SRV, CAA." },
    ],
  },
  {
    title: "Hébergement",
    items: [
      { icon: Rocket, t: "Push to deploy", d: "Git intégré, builds automatiques." },
      { icon: Zap, t: "Edge global", d: "100+ régions, latence minimale." },
      { icon: Activity, t: "Monitoring & logs", d: "Logs runtime + Web Vitals." },
    ],
  },
  {
    title: "Email pro",
    items: [
      { icon: Mail, t: "Multi-provider", d: "Google, Microsoft, Zoho — au choix." },
      { icon: Users, t: "Alias illimités", d: "support@, contact@, etc." },
      { icon: Shield, t: "SPF/DKIM/DMARC auto", d: "Délivrabilité optimale." },
    ],
  },
  {
    title: "Plateforme",
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
    <div className="container mx-auto max-w-7xl px-4 py-20">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">Toutes les fonctionnalités</h1>
        <p className="mt-4 text-muted-foreground">
          Une plateforme complète pour bâtir, déployer et scaler.
        </p>
      </div>
      <div className="mt-16 space-y-16">
        {GROUPS.map((g) => (
          <div key={g.title}>
            <h2 className="text-2xl font-bold">{g.title}</h2>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((it) => (
                <Card key={it.t} className="p-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <it.icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 font-semibold">{it.t}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{it.d}</p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
