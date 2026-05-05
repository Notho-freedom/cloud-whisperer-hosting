import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { adminListPlans } from "@/api/admin-api.server";

export const Route = createFileRoute("/_admin/admin/plans")({ component: AdminPlans });

function AdminPlans() {
  const { data: plans = [], isLoading } = useQuery({ queryKey: ["admin", "plans"], queryFn: () => adminListPlans() });
  return (
    <>
      <AdminPageHeader title="Plans" description="Catalogue des forfaits Hostiq." />
      <AdminPageContent className="space-y-6">
        {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <div className="grid gap-3 md:grid-cols-3">
            {plans.map((p: { id: string; name: string; price_cents: number; currency: string; features: string[] | null; popular: boolean | null }) => (
              <Card key={p.id}><CardContent className="p-5">
                <div className="flex items-start justify-between">
                  <div><p className="font-semibold">{p.name}</p><p className="text-xs text-muted-foreground">{p.id}</p></div>
                  {p.popular && <Badge variant="success">Populaire</Badge>}
                </div>
                <p className="mt-3 text-2xl font-semibold">{(p.price_cents / 100).toFixed(2)} {p.currency}<span className="text-xs font-normal text-muted-foreground">/mois</span></p>
                <ul className="mt-3 space-y-1 text-xs text-muted-foreground">
                  {(p.features ?? []).slice(0, 6).map((f, i) => <li key={i}>· {f}</li>)}
                </ul>
              </CardContent></Card>
            ))}
          </div>
        )}
      </AdminPageContent>
    </>
  );
}
