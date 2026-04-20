import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail, Shield, Smartphone, Users, Calendar, FileText, ArrowRight, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/email")({
  head: () => ({
    meta: [
      { title: "Email Pro — Multi-provider unifié | Hostiq" },
      { name: "description", content: "Connectez Google Workspace, Microsoft 365 ou Zoho. Une seule console pour toutes vos boîtes mail pro." },
      { property: "og:title", content: "Email Pro — Hostiq" },
      { property: "og:description", content: "Email pro multi-provider, géré depuis Hostiq." },
    ],
  }),
  component: EmailPage,
});

const PROVIDERS = [
  {
    name: "Google Workspace",
    desc: "Gmail, Drive, Meet, Calendar.",
    price: "5,90",
    accent: "bg-gradient-to-r from-blue-500 via-emerald-500 to-amber-500",
    perks: ["Gmail 30 GB", "Google Meet", "Drive partagé", "Calendar"],
  },
  {
    name: "Microsoft 365",
    desc: "Outlook, Teams, OneDrive, Office.",
    price: "5,60",
    accent: "bg-gradient-to-r from-blue-600 to-cyan-500",
    perks: ["Outlook 50 GB", "Teams", "OneDrive 1 TB", "Office en ligne"],
  },
  {
    name: "Zoho Mail",
    desc: "Email pro complet, prix imbattable.",
    price: "0,90",
    accent: "bg-gradient-to-r from-orange-500 to-red-500",
    perks: ["Mail 5 GB", "Calendar", "Tasks", "Anti-spam"],
  },
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
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container relative mx-auto max-w-5xl px-4 py-20 text-center">
          <Badge variant="outline" className="mb-4">Email Pro</Badge>
          <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
            Email pro, <span className="gradient-text">votre choix de provider</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            <span className="font-mono text-foreground">hello@votre-domaine.com</span> — gérez Google Workspace, Microsoft 365 ou Zoho depuis une seule console.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup"><Button size="lg">Activer mon email pro<ArrowRight className="ml-1 h-4 w-4" /></Button></Link>
          </div>
        </div>
      </section>

      <section className="border-b border-border/60 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-3">Providers</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Choisissez votre provider</h2>
            <p className="mt-3 text-muted-foreground">Une UI commune, vos providers favoris.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {PROVIDERS.map((p) => (
              <Card key={p.name} className="overflow-hidden transition-all hover:border-primary/30 hover:shadow-xl">
                <div className={`h-1.5 ${p.accent}`} />
                <div className="p-6">
                  <h3 className="text-lg font-semibold">{p.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
                  <div className="mt-6 flex items-baseline gap-1">
                    <span className="font-mono text-4xl font-bold">{p.price} €</span>
                    <span className="text-sm text-muted-foreground">/utilisateur/mois</span>
                  </div>
                  <ul className="mt-6 space-y-2">
                    {p.perks.map((perk) => (
                      <li key={perk} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-primary" /> {perk}
                      </li>
                    ))}
                  </ul>
                  <Link to="/signup" className="mt-6 block">
                    <Button className="w-full" variant="outline">Activer</Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          <p className="mt-8 text-center text-sm text-muted-foreground">
            <Badge variant="secondary" className="mr-2">Multi-provider</Badge>
            Mélangez les providers selon les domaines. Une seule facture.
          </p>
        </div>
      </section>

      <section className="bg-card/30 py-20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="mb-12 text-center">
            <Badge variant="outline" className="mb-3">Fonctionnalités</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Inclus partout</h2>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <Card key={f.title} className="group p-6 transition-all hover:border-primary/40">
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
    </>
  );
}
