import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Users, Globe2, Server, LifeBuoy, Activity, Mail, Receipt } from "lucide-react";
import { ADMIN_KPIS, PROVIDERS_STATUS, AUDIT_LOG } from "@/lib/mocks";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/_admin/admin/")({
  head: () => ({ meta: [{ title: "Admin · Hostiq" }] }),
  component: AdminDashboard,
});

function AdminDashboard() {
  const kpis = [
    { label: "MRR", value: `${ADMIN_KPIS.mrr.toLocaleString("fr-FR")} €`, delta: `+${ADMIN_KPIS.mrrDelta}%`, icon: TrendingUp },
    { label: "Clients", value: ADMIN_KPIS.customers.toLocaleString("fr-FR"), delta: `+${ADMIN_KPIS.customersDelta}%`, icon: Users },
    { label: "Domaines", value: ADMIN_KPIS.domainsManaged.toLocaleString("fr-FR"), delta: "—", icon: Globe2 },
    { label: "Sites", value: ADMIN_KPIS.sitesHosted.toLocaleString("fr-FR"), delta: "—", icon: Server },
    { label: "Boîtes mail", value: ADMIN_KPIS.mailboxes.toLocaleString("fr-FR"), delta: "—", icon: Mail },
    { label: "Tickets ouverts", value: ADMIN_KPIS.openTickets, delta: "SLA OK", icon: LifeBuoy },
    { label: "Uptime", value: `${ADMIN_KPIS.uptime}%`, delta: "30j", icon: Activity },
    { label: "API calls 24h", value: ADMIN_KPIS.apiCalls24h.toLocaleString("fr-FR"), delta: "—", icon: Receipt },
  ];
  return (
    <>
      <AdminPageHeader title="Dashboard global" description="KPIs en temps réel et état de la plateforme." />
      <AdminPageContent className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {kpis.map((k) => (
            <Card key={k.label}><CardContent className="p-4">
              <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">{k.label}</span><k.icon className="h-4 w-4 text-muted-foreground" /></div>
              <p className="mt-2 text-2xl font-semibold">{k.value}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{k.delta}</p>
            </CardContent></Card>
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader><CardTitle className="text-base">État des providers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {PROVIDERS_STATUS.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-md border border-border p-3">
                  <div><p className="text-sm font-medium">{p.name}</p><p className="text-xs text-muted-foreground">{p.latencyMs}ms · {p.lastCheck}</p></div>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base">Audit récent</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {AUDIT_LOG.map((a) => (
                <div key={a.id} className="flex items-center justify-between text-sm">
                  <div><p className="font-mono text-xs">{a.action}</p><p className="text-xs text-muted-foreground">{a.actor} · {a.target}</p></div>
                  <span className="text-xs text-muted-foreground">{new Date(a.ts).toLocaleString("fr-FR")}</span>
                </div>
              ))}
              <Link to="/admin/audit"><Badge variant="outline">Voir tout l'audit →</Badge></Link>
            </CardContent>
          </Card>
        </div>
      </AdminPageContent>
    </>
  );
}
