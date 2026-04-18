import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Shield, Smartphone, Users, Calendar, FileText } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/email")({
  head: () => ({
    meta: [
      { title: "Email Pro — Multi-provider unifié | Hostiq" },
      {
        name: "description",
        content: "Connectez Google Workspace, Microsoft 365 ou Zoho. Une seule console pour toutes vos boîtes mail pro.",
      },
      { property: "og:title", content: "Email Pro — Hostiq" },
      { property: "og:description", content: "Email pro multi-provider, géré depuis Hostiq." },
    ],
  }),
  component: EmailPage,
});

const PROVIDERS = [
  { name: "Google Workspace", desc: "Gmail, Drive, Meet, Calendar.", price: "5,90", color: "from-blue-500 to-red-500" },
  { name: "Microsoft 365", desc: "Outlook, Teams, OneDrive, Office.", price: "5,60", color: "from-blue-600 to-cyan-500" },
  { name: "Zoho Mail", desc: "Email pro complet, prix imbattable.", price: "0,90", color: "from-orange-500 to-red-500" },
];

const FEATURES = [
  { icon: Mail, title: "Boîtes illimitées", desc: "Créez autant d'adresses que nécessaire sur vos domaines." },
  { icon: Shield, title: "Anti-spam & DKIM", desc: "Configuration SPF/DKIM/DMARC automatique." },
  { icon: Smartphone, title: "Mobile-ready", desc: "IMAP, POP3, ActiveSync — vos apps habituelles fonctionnent." },
  { icon: Users, title: "Alias & groupes", desc: "support@, contact@, équipe@ — illimités." },
  { icon: Calendar, title: "Calendrier partagé", desc: "Réunions, disponibilités, sync entre équipiers." },
  { icon: FileText, title: "Stockage cloud", desc: "Drive intégré selon le provider choisi." },
];

function EmailPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-emerald" />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 text-center">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl">
            Email pro, <span className="gradient-text">votre choix de provider</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            hello@votre-domaine.com — gérez Google Workspace, Microsoft 365 ou Zoho depuis une seule console.
          </p>
        </div>
      </section>

      <section className="border-b border-border/60 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="mb-10 text-center text-3xl font-bold">Choisissez votre provider</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {PROVIDERS.map((p) => (
              <Card key={p.name} className="overflow-hidden p-6">
                <div className={`h-1 -mx-6 -mt-6 mb-6 bg-gradient-to-r ${p.color}`} />
                <h3 className="text-lg font-semibold">{p.name}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="font-mono text-3xl font-bold">{p.price} €</span>
                  <span className="text-sm text-muted-foreground">/utilisateur/mois</span>
                </div>
                <Link to="/signup" className="mt-6 block">
                  <Button className="w-full" variant="outline">Activer</Button>
                </Link>
              </Card>
            ))}
          </div>
          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Badge variant="secondary" className="mr-2">Multi-provider</Badge>
            Mélangez les providers selon les domaines. Une seule facture.
          </p>
        </div>
      </section>

      <section className="py-20">
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
    </>
  );
}
