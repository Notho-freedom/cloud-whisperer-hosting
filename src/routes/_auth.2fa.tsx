import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { toast } from "sonner";

export const Route = createFileRoute("/_auth/2fa")({
  head: () => ({
    meta: [
      { title: "Authentification à 2 facteurs | Hostiq" },
      { name: "description", content: "Confirmez votre identité avec votre code 2FA." },
    ],
  }),
  component: TwoFactorPage,
});

function TwoFactorPage() {
  const navigate = useNavigate();
  const [code, setCode] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (code.length !== 6) return;
    toast.success("Vérifié !");
    navigate({ to: "/app" });
  };

  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <ShieldCheck className="h-6 w-6 text-primary" />
      </div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight">Code de vérification</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Entrez le code à 6 chiffres généré par votre application d'authentification.
      </p>
      <form onSubmit={onSubmit} className="mt-8 flex flex-col items-center gap-6">
        <InputOTP maxLength={6} value={code} onChange={setCode}>
          <InputOTPGroup>
            <InputOTPSlot index={0} />
            <InputOTPSlot index={1} />
            <InputOTPSlot index={2} />
            <InputOTPSlot index={3} />
            <InputOTPSlot index={4} />
            <InputOTPSlot index={5} />
          </InputOTPGroup>
        </InputOTP>
        <Button type="submit" className="w-full" disabled={code.length !== 6}>
          Vérifier
        </Button>
      </form>
      <Link to="/login" className="mt-6 block text-sm text-muted-foreground hover:text-foreground">
        ← Utiliser un autre compte
      </Link>
    </div>
  );
}
