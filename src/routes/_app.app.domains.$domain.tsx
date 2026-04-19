import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Lock, Unlock, RefreshCw, Shield, Settings as SettingsIcon, ExternalLink, Copy } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { DOMAINS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/domains/$domain")({
  loader: ({ params }) => {
    const d = DOMAINS.find((x) => x.name === params.domain);
    if (!d) throw notFound();
    return d;
  },
  head: ({ loaderData }) => ({ meta: [{ title: `${loaderData?.name ?? "Domaine"} | Hostiq` }] }),
  errorComponent: ({ error }) => <div className="p-8 text-sm text-destructive">{error.message}</div>,
  notFoundComponent: () => (
    <div className="p-8 text-center">
      <p className="text-sm text-muted-foreground">Domaine introuvable.</p>
      <Button asChild variant="link"><Link to="/app/domains">Retour</Link></Button>
    </div>
  ),
  component: DomainDetail,
});

function DomainDetail() {
  const d = Route.useLoaderData();
  return (
    <>
      <PageHeader
        title={<span className="font-mono">{d.name}</span>}
        breadcrumbs={[{ label: "Domaines", to: "/app/domains" }, { label: d.name }]}
        actions={
          <>
            <Button variant="outline" asChild>
              <Link to="/app/domains/$domain/dns" params={{ domain: d.name }}>
                <SettingsIcon className="h-4 w-4" />Gérer DNS
              </Link>
            </Button>
            <Button><RefreshCw className="h-4 w-4" />Renouveler</Button>
          </>
        }
      />
      <PageContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
            <TabsTrigger value="contacts">Contacts WHOIS</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
            <TabsTrigger value="transfer">Transfert</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Statut</p>
                <div className="mt-2"><StatusBadge status={d.status} /></div>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Expire le</p>
                <p className="mt-2 font-mono text-lg font-semibold">{new Date(d.expiresAt).toLocaleDateString("fr-FR")}</p>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Prix renouvellement</p>
                <p className="mt-2 text-lg font-semibold">{d.pricePerYear.toFixed(2)} € / an</p>
              </CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-base">Préférences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Row label="Renouvellement automatique" description="Renouvelle automatiquement avant expiration.">
                  <Switch defaultChecked={d.autoRenew} />
                </Row>
                <Row label="Verrouillage du transfert" description="Empêche tout transfert non autorisé.">
                  <Switch defaultChecked={d.locked} />
                </Row>
                <Row label="WHOIS Privacy" description="Masque vos coordonnées dans le registre public.">
                  <Switch defaultChecked={d.privacy} />
                </Row>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nameservers" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Nameservers</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {d.nameservers.map((ns, i) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-2">
                    <span className="font-mono text-sm">{ns}</span>
                    <Button variant="ghost" size="icon"><Copy className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
                <Button variant="outline" size="sm">Modifier les nameservers</Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contacts" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Contacts WHOIS</CardTitle></CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {(["Registrant", "Admin", "Tech", "Billing"] as const).map((c) => (
                  <div key={c} className="rounded-md border border-border p-4">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c}</p>
                    <p className="mt-2 text-sm">Marie Dupont</p>
                    <p className="text-xs text-muted-foreground">marie@acme.com · +33 6 12 34 56 78</p>
                    <Button variant="link" size="sm" className="mt-1 h-auto p-0 text-xs">Modifier</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-4">
            <Card><CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-success" />
                <div className="flex-1">
                  <p className="font-medium">DNSSEC</p>
                  <p className="text-xs text-muted-foreground">Activé · Algorithme RSASHA256</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center gap-3">
                {d.locked ? <Lock className="h-5 w-5 text-success" /> : <Unlock className="h-5 w-5 text-warning" />}
                <div className="flex-1">
                  <p className="font-medium">Lock du domaine</p>
                  <p className="text-xs text-muted-foreground">Empêche les transferts non autorisés.</p>
                </div>
                <Switch defaultChecked={d.locked} />
              </div>
            </CardContent></Card>
          </TabsContent>

          <TabsContent value="transfer" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Transférer ce domaine</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Pour transférer vers un autre registrar, déverrouillez le domaine puis demandez le code EPP.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline">Récupérer le code EPP</Button>
                  <Button variant="outline">Initier le transfert sortant <ExternalLink className="h-3.5 w-3.5" /></Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}

function Row({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </div>
      {children}
    </div>
  );
}
