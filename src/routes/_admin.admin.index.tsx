import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Users, Globe2, Server, LifeBuoy, Mail, Building2, Loader2 } from "lucide-react";
import { adminKpis } from "@/api/admin-api";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin · Hostiq" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const { data, isLoading } = useQuery({ queryKey: ["admin-kpis"], queryFn: () => adminKpis() });
  const kpis = [
    { label: "Utilisateurs", value: data?.users ?? 0, icon: Users },
    { label: "Organisations", value: data?.orgs ?? 0, icon: Building2 },
    { label: "Domaines", value: data?.domains ?? 0, icon: Globe2 },
    { label: "Sites", value: data?.sites ?? 0, icon: Server },
    { label: "Boîtes mail", value: data?.mailboxes ?? 0, icon: Mail },
    { label: "Tickets ouverts", value: data?.openTickets ?? 0, icon: LifeBuoy },
  ];
  return (
    <>
      <AdminPageHeader title="Dashboard global" description="KPIs en temps réel et état de la plateforme." />
      <AdminPageContent>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {kpis.map((k) => (
              <Card key={k.label}><CardContent className="p-4">
                <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</span><k.icon className="h-4 w-4 text-muted-foreground" /></div>
                <p className="mt-2 text-2xl font-semibold">{k.value.toLocaleString("fr-FR")}</p>
              </CardContent></Card>
            ))}
          </div>
        )}
      </AdminPageContent>
    </>
  );
}
