import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/legal/privacy")({
  head: () => ({ meta: [{ title: "Confidentialité | Hostiq" }, { name: "description", content: "Politique de confidentialité Hostiq." }] }),
  component: PrivacyPage,
});

function PrivacyPage() {
  return (
    <article>
      <h1 className="text-3xl font-bold">Politique de confidentialité</h1>
      <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : 1er mars 2024</p>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>Hostiq respecte votre vie privée. Cette politique décrit les données que nous collectons et comment nous les utilisons.</p>
        <h2 className="text-xl font-semibold text-foreground">Données collectées</h2>
        <p>Email, nom, informations de facturation, données techniques (IP, user-agent) à des fins de sécurité.</p>
        <h2 className="text-xl font-semibold text-foreground">Conformité RGPD</h2>
        <p>Vous disposez d'un droit d'accès, de rectification et de suppression de vos données. Contactez-nous à privacy@hostiq.io.</p>
      </div>
    </article>
  );
}
