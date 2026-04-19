import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Globe2, Server, Mail, ArrowUpRight, TrendingUp, Activity, Plus,
  CheckCircle2, AlertTriangle, Rocket, GitBranch, Clock,
} from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { DOMAINS, SITES, MAILBOXES, DEPLOYMENTS, NOTIFICATIONS, INVOICES } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/")({
  head: () => ({ meta: [{ title: "Dashboard | Hostiq" }] }),
  component: Dashboard,
});

function Dashboard() {
  const stats = [
    { label: "Domaines", value: DOMAINS.length, icon: Globe2, to: "/app/domains", delta: "+1 ce mois" },
    { label: "Sites actifs", value: SITES.length, icon: Server, to: "/app/sites", delta: "+2 ce mois" },
    { label: "Boîtes mail", value: MAILBOXES.length, icon: Mail, to: "/app/email", delta: "—" },
    { label: "Uptime moyen", value: "99,98%", icon: Activity, to: "/app/sites", delta: "30 derniers jours" },
  ];

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Vue d'ensemble de vos ressources, performances et alertes."
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/domains/search"><Plus className="h-4 w-4" />Domaine</Link>
            </Button>
            <Button asChild>
              <Link to="/app/sites/new"><Plus className="h-4 w-4" />Nouveau site</Link>
            </Button>
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
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {s.label}
                    </span>
                    <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                  </div>
                  <div className="mt-3 flex items-baseline gap-2">
                    <span className="text-2xl font-semibold tracking-tight">{s.value}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">{s.delta}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent deployments */}
          <Card className="lg:col-span-2">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-base">Déploiements récents</CardTitle>
                <p className="text-xs text-muted-foreground">Dernières activités sur vos sites.</p>
              </div>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/app/sites">Tout voir <ArrowUpRight className="h-3.5 w-3.5" /></Link>
              </Button>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <div className="divide-y divide-border">
                {DEPLOYMENTS.slice(0, 4).map((d) => (
                  <div key={d.id} className="flex items-center gap-4 px-6 py-3 hover:bg-muted/30">
                    <Rocket className="h-4 w-4 shrink-0 text-muted-foreground" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{d.commitMsg}</span>
                        <Badge variant="outline" className="hidden font-mono text-[10px] sm:inline-flex">
                          {d.commitSha}
                        </Badge>
                      </div>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        <GitBranch className="h-3 w-3" /> {d.branch}
                        <span>·</span>
                        <Clock className="h-3 w-3" /> {d.duration ? `${d.duration}s` : "en cours"}
                        <span>·</span>
                        <span>{d.author}</span>
                      </div>
                    </div>
                    <StatusBadge status={d.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Alerts & next invoice */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Alertes</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {NOTIFICATIONS.filter((n) => !n.read).slice(0, 3).map((n) => (
                  <div key={n.id} className="flex items-start gap-3">
                    {n.type === "domain" ? (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-warning" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{n.title}</p>
                      <p className="text-xs text-muted-foreground line-clamp-2">{n.body}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" size="sm" asChild className="w-full">
                  <Link to="/app/notifications">Voir tout</Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Prochaine facture</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-semibold tracking-tight">
                    {INVOICES[0].amount.toFixed(2)} €
                  </span>
                  <Badge variant="secondary" className="text-xs">
                    <TrendingUp className="h-3 w-3 mr-1" />Plan Pro
                  </Badge>
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Émise le {new Date(INVOICES[0].date).toLocaleDateString("fr-FR")}
                </p>
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
