import { createFileRoute } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_marketing/about")({
  head: () => ({
    meta: [
      { title: "À propos | Hostiq" },
      { name: "description", content: "Hostiq simplifie l'hébergement web en orchestrant les meilleures APIs du marché." },
      { property: "og:title", content: "À propos d'Hostiq" },
      { property: "og:description", content: "Notre mission : rendre l'hébergement accessible à tous." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-20">
      <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
        Hébergement, <span className="gradient-text">réinventé</span>
      </h1>
      <p className="mt-6 text-lg text-muted-foreground">
        Hostiq est né d'un constat simple : créer un site web pro nécessite encore trop d'étapes,
        trop de fournisseurs, trop de friction. Nous orchestrons les meilleures APIs du marché
        (PlanetHoster, Vercel, Google, Microsoft, Zoho) pour vous offrir une console unique.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="font-mono text-3xl font-bold text-primary">2024</div>
          <p className="mt-2 text-sm text-muted-foreground">Lancement</p>
        </Card>
        <Card className="p-6">
          <div className="font-mono text-3xl font-bold text-primary">100+</div>
          <p className="mt-2 text-sm text-muted-foreground">Régions edge</p>
        </Card>
        <Card className="p-6">
          <div className="font-mono text-3xl font-bold text-primary">99,99%</div>
          <p className="mt-2 text-sm text-muted-foreground">Uptime garanti</p>
        </Card>
      </div>

      <h2 className="mt-16 text-2xl font-bold">Notre mission</h2>
      <p className="mt-4 text-muted-foreground">
        Démocratiser l'accès à une infrastructure web moderne. Vous concentrer sur votre
        produit, pas sur la plomberie.
      </p>

      <h2 className="mt-12 text-2xl font-bold">Nos valeurs</h2>
      <ul className="mt-4 space-y-3 text-muted-foreground">
        <li><strong className="text-foreground">Transparence</strong> — pas de frais cachés, prix publics.</li>
        <li><strong className="text-foreground">Simplicité</strong> — chaque écran doit être évident.</li>
        <li><strong className="text-foreground">Fiabilité</strong> — votre business compte sur nous.</li>
        <li><strong className="text-foreground">Ouverture</strong> — API-first, exportez vos données quand vous voulez.</li>
      </ul>
    </div>
  );
}
