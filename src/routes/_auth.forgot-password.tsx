import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_auth/forgot-password")({
  head: () => ({
    meta: [
      { title: "Mot de passe oublié | Hostiq" },
      { name: "description", content: "Réinitialisez votre mot de passe Hostiq." },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    setSent(true);
    toast.success("Email envoyé !");
  };

  if (sent) {
    return (
      <div className="text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
          <Mail className="h-6 w-6 text-primary" />
        </div>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Vérifiez votre boîte mail</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Si <span className="font-mono">{email}</span> existe, un lien a été envoyé.
        </p>
        <Link to="/login" className="mt-6 inline-block text-sm text-primary hover:underline">
          Retour à la connexion
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Mot de passe oublié ?</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Entrez votre email pour recevoir un lien de réinitialisation.
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Envoyer le lien
        </Button>
      </form>
      <Link to="/login" className="mt-6 block text-center text-sm text-muted-foreground hover:text-foreground">
        ← Retour à la connexion
      </Link>
    </div>
  );
}
