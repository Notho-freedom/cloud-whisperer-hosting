import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2 } from "lucide-react";
import { listPlans, createCheckoutSession, getBillingOverview } from "@/api/billing-api";

export const Route = createFileRoute("/_app/app/billing/plan")({ component: PlanPicker });

function PlanPicker() {
  const { data: plans = [] } = useQuery({ queryKey: ["plans"], queryFn: () => listPlans() });
  const { data: billing } = useQuery({ queryKey: ["billing"], queryFn: () => getBillingOverview() });
  const current = billing?.subscription?.plan_id ?? "starter";
  const checkout = useMutation({
    mutationFn: (planId: string) => createCheckoutSession({ data: { planId } }),
    onSuccess: (r) => { if (r.url && !r.free) window.location.href = r.url; else toast.success("Plan activé"); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <PageContent className="space-y-8">
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((p) => (
          <Card key={p.id} className={p.popular ? "border-primary/50 ring-2 ring-primary/20 relative" : "relative"}>
            {p.popular && <Badge variant="success" className="absolute -top-2 left-6"><Sparkles className="h-3 w-3 mr-1" />Populaire</Badge>}
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold">{p.name}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-4 text-3xl font-semibold">{(p.price_cents / 100).toFixed(0)} €<span className="text-sm font-normal text-muted-foreground">/mois</span></p>
              <Button
                className="mt-4 w-full"
                variant={p.popular ? "default" : "outline"}
                disabled={current === p.id || checkout.isPending}
                onClick={() => checkout.mutate(p.id)}
              >
                {checkout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : current === p.id ? "Plan actuel" : "Choisir"}
              </Button>
              <ul className="mt-6 space-y-2 text-sm">
                {(p.features as string[] ?? []).map((f) => <li key={f} className="flex gap-2"><Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />{f}</li>)}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContent>
  );
}
