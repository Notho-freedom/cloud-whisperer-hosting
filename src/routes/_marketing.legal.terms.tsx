import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/legal/terms")({
  head: () => ({ meta: [{ title: "Conditions d'utilisation | Hostiq" }, { name: "description", content: "Conditions générales d'utilisation Hostiq." }] }),
  component: () => <LegalDoc title="Conditions d'utilisation" />,
});

function LegalDoc({ title }: { title: string }) {
  return (
    <article>
      <h1 className="text-3xl font-bold">{title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">Dernière mise à jour : 1er mars 2024</p>
      <div className="mt-8 space-y-4 text-muted-foreground">
        <p>Les présentes conditions régissent votre utilisation des services Hostiq. En créant un compte, vous acceptez ces conditions.</p>
        <h2 className="text-xl font-semibold text-foreground">1. Services</h2>
        <p>Hostiq fournit des services d'enregistrement de noms de domaine, d'hébergement web et de messagerie professionnelle via des partenaires tiers.</p>
        <h2 className="text-xl font-semibold text-foreground">2. Compte</h2>
        <p>Vous êtes responsable de la confidentialité de vos identifiants et des activités sur votre compte.</p>
        <h2 className="text-xl font-semibold text-foreground">3. Facturation</h2>
        <p>Les abonnements sont facturés mensuellement ou annuellement. Les add-ons sont facturés à l'usage.</p>
        <h2 className="text-xl font-semibold text-foreground">4. Résiliation</h2>
        <p>Vous pouvez résilier à tout moment depuis votre console. Les domaines restent valides jusqu'à expiration.</p>
      </div>
    </article>
  );
}
