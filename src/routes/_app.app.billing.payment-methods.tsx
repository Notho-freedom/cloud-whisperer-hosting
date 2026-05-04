import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, Trash2 } from "lucide-react";
import { listPaymentMethods, removePaymentMethod, setDefaultPaymentMethod } from "@/server/billing.server";

export const Route = createFileRoute("/_app/app/billing/payment-methods")({ component: PaymentMethodsPage });

function PaymentMethodsPage() {
  const qc = useQueryClient();
  const { data: pms = [] } = useQuery({ queryKey: ["pms"], queryFn: () => listPaymentMethods() });
  const setDef = useMutation({ mutationFn: (id: string) => setDefaultPaymentMethod({ data: { id } }), onSuccess: () => { toast.success("Défaut mis à jour"); qc.invalidateQueries({ queryKey: ["pms"] }); } });
  const remove = useMutation({ mutationFn: (id: string) => removePaymentMethod({ data: { id } }), onSuccess: () => { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["pms"] }); } });
  return (
    <PageContent className="space-y-4">
      <p className="text-sm text-muted-foreground">Les moyens de paiement sont gérés via Stripe Checkout lors d'un changement de plan.</p>
      <div className="grid gap-3 md:grid-cols-2">
        {pms.length === 0 && <Card className="p-8 text-center text-sm text-muted-foreground">Aucun moyen de paiement enregistré.</Card>}
        {pms.map((pm) => (
          <Card key={pm.id}><CardContent className="flex items-center gap-3 p-5">
            {pm.type === "card" ? <CreditCard className="h-6 w-6 text-muted-foreground" /> : <Building2 className="h-6 w-6 text-muted-foreground" />}
            <div className="flex-1">
              <p className="font-mono">•••• {pm.last4}</p>
              <p className="text-xs text-muted-foreground">{pm.brand?.toUpperCase()} {pm.exp_month && `· ${pm.exp_month}/${pm.exp_year}`}</p>
            </div>
            {pm.is_default ? <Badge variant="success">Par défaut</Badge> : <Button size="sm" variant="outline" onClick={() => setDef.mutate(pm.id)}>Par défaut</Button>}
            <Button variant="ghost" size="icon" className="text-destructive" onClick={() => remove.mutate(pm.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </PageContent>
  );
}
