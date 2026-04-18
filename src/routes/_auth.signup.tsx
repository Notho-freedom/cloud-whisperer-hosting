import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/signup")({
  head: () => ({
    meta: [
      { title: "Créer un compte | Hostiq" },
      { name: "description", content: "Créez votre compte Hostiq gratuitement." },
    ],
  }),
  component: SignupPage,
});

function SignupPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.signup(email, password, name);
      toast.success("Compte créé ! Bienvenue.");
      navigate({ to: "/verify-email" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Créer votre compte</h1>
      <p className="mt-2 text-sm text-muted-foreground">Gratuit. Pas de carte bancaire.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nom complet</Label>
          <Input id="name" required value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email pro</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} />
          <ul className="mt-1 space-y-0.5 text-xs text-muted-foreground">
            <li className="flex items-center gap-1"><Check className="h-3 w-3" /> Au moins 8 caractères</li>
            <li className="flex items-center gap-1"><Check className="h-3 w-3" /> Au moins 1 chiffre</li>
          </ul>
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Créer mon compte
        </Button>
        <p className="text-xs text-muted-foreground">
          En créant un compte, vous acceptez nos{" "}
          <Link to="/legal/terms" className="text-primary hover:underline">conditions</Link>.
        </p>
      </form>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Déjà un compte ?{" "}
        <Link to="/login" className="font-medium text-primary hover:underline">Se connecter</Link>
      </p>
    </div>
  );
}
