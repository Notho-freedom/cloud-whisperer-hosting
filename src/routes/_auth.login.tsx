import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/login")({
  head: () => ({
    meta: [
      { title: "Connexion | Hostiq" },
      { name: "description", content: "Accédez à votre console Hostiq." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await auth.login(email, password);
      toast.success("Connecté !");
      navigate({ to: "/app" });
    } catch {
      toast.error("Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Bon retour</h1>
      <p className="mt-2 text-sm text-muted-foreground">Connectez-vous à votre compte Hostiq.</p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password">Mot de passe</Label>
            <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-primary">
              Oublié ?
            </Link>
          </div>
          <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          Se connecter
        </Button>
      </form>
      <div className="mt-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">OU</span>
        <div className="h-px flex-1 bg-border" />
      </div>
      <div className="mt-6 grid gap-2">
        <Button variant="outline" type="button" onClick={() => toast.info("OAuth à brancher")}>
          Continuer avec Google
        </Button>
        <Button variant="outline" type="button" onClick={() => toast.info("OAuth à brancher")}>
          Continuer avec GitHub
        </Button>
      </div>
      <p className="mt-6 text-center text-sm text-muted-foreground">
        Pas encore de compte ?{" "}
        <Link to="/signup" className="font-medium text-primary hover:underline">Créer un compte</Link>
      </p>
    </div>
  );
}
