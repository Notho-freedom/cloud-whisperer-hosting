import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/status")({
  head: () => ({
    meta: [
      { title: "Statut des services | Hostiq" },
      { name: "description", content: "État en temps réel des services Hostiq : domaines, hébergement, email, API." },
      { property: "og:title", content: "Statut Hostiq" },
      { property: "og:description", content: "Tous les systèmes opérationnels." },
    ],
  }),
  component: StatusPage,
});

const SERVICES = [
  "Console Hostiq",
  "API publique",
  "Domaines (PlanetHoster)",
  "Hébergement (Vercel)",
  "Email — Google Workspace",
  "Email — Microsoft 365",
  "Email — Zoho",
  "DNS",
  "Facturation",
];

function StatusPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-20">
      <div className="text-center">
        <Badge className="bg-success/15 text-success hover:bg-success/15">
          <CheckCircle2 className="mr-1.5 h-3 w-3" /> Tous les systèmes opérationnels
        </Badge>
        <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">Statut des services</h1>
        <p className="mt-3 text-muted-foreground">Mis à jour il y a 30 secondes.</p>
      </div>
      <Card className="mt-12 divide-y divide-border">
        {SERVICES.map((s) => (
          <div key={s} className="flex items-center justify-between p-4">
            <span className="font-medium">{s}</span>
            <Badge className="bg-success/15 text-success hover:bg-success/15">
              <CheckCircle2 className="mr-1.5 h-3 w-3" /> Opérationnel
            </Badge>
          </div>
        ))}
      </Card>
      <Card className="mt-8 p-6">
        <h2 className="text-lg font-semibold">Historique des incidents (30 jours)</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Aucun incident reporté sur les 30 derniers jours.
        </p>
      </Card>
    </div>
  );
}
