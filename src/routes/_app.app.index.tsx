import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe2, Server, Mail, ArrowUpRight, Activity, Plus,
  CheckCircle2, AlertTriangle, Rocket, Clock,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { listDomains } from "@/server/domains.server";
import { listSites } from "@/server/sites.server";
import { listMailboxes } from "@/server/email.server";
import { listNotifications } from "@/server/notifications.server";
import { getBillingOverview } from "@/server/billing.server";

export const Route = createFileRoute("/_app/app/")({
  head: () => ({ meta: [{ title: "Dashboard | Hostiq" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { data: domains = [] } = useQuery({ queryKey: ["domains"], queryFn: () => listDomains() });
  const { data: sites = [] } = useQuery({ queryKey: ["sites"], queryFn: () => listSites() });
  const { data: mailboxes = [] } = useQuery({ queryKey: ["mailboxes"], queryFn: () => listMailboxes() });
  const { data: notifs = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => listNotifications() });
  const { data: billing } = useQuery({ queryKey: ["billing"], queryFn: () => getBillingOverview() });

  const stats = [
    { label: "Domaines", value: domains.length, icon: Globe2, to: "/app/domains" as const },
    { label: "Sites actifs", value: sites.length, icon: Server, to: "/app/sites" as const },
    { label: "Boîtes mail", value: mailboxes.length, icon: Mail, to: "/app/email" as const },
    { label: "Notifications", value: notifs.filter((n) => !n.read).length, icon: Activity, to: "/app/notifications" as const },
  ];
  const nextInvoice = billing?.invoices?.[0];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de vos ressources, performances et alertes."
        actions={
          <>
            <Button variant="outline" asChild><Link to="/app/domains/search"><Plus className="h-4 w-4" />Domaine</Link></Button>
            <Button asChild><Link to="/app/sites/new"><Plus className="h-4 w-4" />Nouveau site</Link></Button>
          </>
        }
      />
      <PageContent className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <Link key={s.label} to={s.to}>
              <Card className="group transition-all hover:border-primary/40 hover:shadow-md">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{s.label}</span>
                    <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight">{s.value}</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Sites récents</CardTitle>
                <p className="text-xs text-muted-foreground">Vos derniers projets déployés.</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/sites">Tout voir <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="divide-y divide-border">
                {sites.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun site. Créez-en un.</p>}
                {sites.slice(0, 5).map((s) => (
                  <Link key={s.id} to="/app/sites/$projectId" params={{ projectId: s.id }} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30">
                    <Rocket className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{s.name}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {s.last_deploy_at ? new Date(s.last_deploy_at).toLocaleString("fr-FR") : "Jamais déployé"}
                      </div>
                    </div>
                    {s.prod_url && <a href={s.prod_url} target="_blank" rel="noreferrer" className="text-xs text-primary hover:underline">Ouvrir</a>}
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Alertes</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {notifs.filter((n) => !n.read).slice(0, 3).map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    {n.type === "domain" ? <AlertTriangle className="h-4 w-4 shrink-0 text-warning" /> : <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    </div>
                  </div>
                ))}
                {notifs.filter((n) => !n.read).length === 0 && <p className="text-sm text-muted-foreground">Tout est calme.</p>}
                <Button variant="ghost" size="sm" asChild className="w-full"><Link to="/app/notifications">Voir tout</Link></Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-base">Facturation</CardTitle></CardHeader>
              <CardContent>
                {nextInvoice ? (
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tracking-tight">{Number(nextInvoice.amount).toFixed(2)} €</span>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Dernière facture · {new Date(nextInvoice.date).toLocaleDateString("fr-FR")}
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-muted-foreground">Aucune facture pour l'instant.</p>
                )}
                <Button variant="outline" size="sm" className="mt-4 w-full" asChild>
                  <Link to="/app/billing">Gérer la facturation</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </PageContent>
    </>
  );
}
