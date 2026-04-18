import { createFileRoute, Link } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/verify-email")({
  head: () => ({
    meta: [
      { title: "Vérifier votre email | Hostiq" },
      { name: "description", content: "Confirmez votre adresse email pour activer votre compte." },
    ],
  }),
  component: VerifyEmailPage,
});

function VerifyEmailPage() {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Mail className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Vérifiez votre email</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Nous avons envoyé un lien de confirmation à votre adresse. Cliquez dessus pour activer votre compte.
      </p>
      <div className="mt-8 flex flex-col gap-2">
        <Button onClick={() => toast.success("Email renvoyé !")} variant="outline">Renvoyer l'email</Button>
        <Link to="/app" className="text-sm text-muted-foreground hover:text-foreground">
          Continuer vers la console →
        </Link>
      </div>
    </div>
  );
}
