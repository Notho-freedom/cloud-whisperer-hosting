import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/legal/cookies")({
  head: () => ({ meta: [{ title: "Cookies | Hostiq" }, { name: "description", content: "Politique cookies Hostiq." }] }),
  component: CookiesPage,
});

function CookiesPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold">Politique cookies</h1>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>Nous utilisons uniquement les cookies strictement nécessaires au fonctionnement de la console et un cookie analytics anonymisé.</p>
        <h2 className="text-xl font-semibold text-foreground">Cookies essentiels</h2>
        <p>Session d'authentification, préférence de thème.</p>
        <h2 className="text-xl font-semibold text-foreground">Analytics</h2>
        <p>Mesure d'audience anonyme. Vous pouvez le désactiver dans vos préférences.</p>
      </div>
    </article>
  );
}
