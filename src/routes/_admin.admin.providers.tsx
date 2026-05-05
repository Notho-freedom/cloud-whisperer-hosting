import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2 } from "lucide-react";
import { adminProviderHealth } from "@/api/admin-api.server";

export const Route = createFileRoute("/_admin/admin/providers")({ component: AdminProviders });

function AdminProviders() {
  const { data: providers = [], isLoading } = useQuery({ queryKey: ["admin", "providers"], queryFn: () => adminProviderHealth(), refetchInterval: 60000 });
  return (
    <>
      <AdminPageHeader title="Providers & intégrations" description="État santé des intégrations actives." />
      <AdminPageContent className="space-y-3">
        {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : providers.map((p: { id: string; name: string; status: string; configured: boolean }) => (
          <Card key={p.id}><CardContent className="flex items-center gap-4 p-5">
            <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.configured ? "Clé API configurée" : "Aucune clé API configurée"}</p></div>
            <StatusBadge status={p.status} />
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
