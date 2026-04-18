import { createFileRoute, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/app")({
  head: () => ({
    meta: [{ title: "Console | Hostiq" }, { name: "description", content: "Console Hostiq." }],
  }),
  component: AppPlaceholder,
});

function AppPlaceholder() {
  const auth = useAuth();
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-border/60">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link to="/"><Logo /></Link>
          <Button variant="ghost" size="sm" onClick={() => auth.logout()}>
            Se déconnecter
          </Button>
        </div>
      </header>
      <main className="container mx-auto max-w-3xl flex-1 px-4 py-20">
        <Card className="p-12 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            Bienvenue {auth.user?.name ? `, ${auth.user.name}` : ""} 👋
          </h1>
          <p className="mt-3 text-muted-foreground">
            Votre console arrive en <strong>Phase 2</strong> : domaines, sites, deployments, DNS…
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            Pour l'instant, profitez du site public.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link to="/"><Button variant="outline">Retour au site</Button></Link>
            <Link to="/pricing"><Button>Voir les tarifs</Button></Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
