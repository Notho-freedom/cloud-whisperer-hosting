import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Building2, Plus, Trash2 } from "lucide-react";
import { PAYMENT_METHODS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/billing/payment-methods")({
  component: PaymentMethodsPage,
});

function PaymentMethodsPage() {
  return (
    <PageContent className="space-y-4">
      <div className="flex justify-end"><Button><Plus className="h-4 w-4" />Ajouter</Button></div>
      <div className="grid gap-3 md:grid-cols-2">
        {PAYMENT_METHODS.map((pm) => (
          <Card key={pm.id}><CardContent className="flex items-center gap-3 p-5">
            {pm.type === "card" ? <CreditCard className="h-6 w-6 text-muted-foreground" /> : <Building2 className="h-6 w-6 text-muted-foreground" />}
            <div className="flex-1">
              <p className="font-mono">{pm.type === "card" ? `•••• ${pm.last4}` : `IBAN •••• ${pm.last4}`}</p>
              <p className="text-xs text-muted-foreground">{pm.type === "card" ? `${pm.brand?.toUpperCase()} · ${pm.expMonth}/${pm.expYear}` : "Prélèvement SEPA"}</p>
            </div>
            {pm.default && <Badge variant="success">Par défaut</Badge>}
            <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
          </CardContent></Card>
        ))}
      </div>
    </PageContent>
  );
}
