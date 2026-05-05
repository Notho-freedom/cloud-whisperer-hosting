import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Lock, Unlock, RefreshCw, Shield, Settings as SettingsIcon, ExternalLink, Copy } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { StatusBadge } from "@/components/StatusBadge";
import { getDomain, updateDomainSettings } from "@/api/domains-api";
import { getPlatformCapabilities } from "@/api/platform-api";

export const Route = createFileRoute("/_app/app/domains/$domain")({
  head: ({ params }) => ({ meta: [{ title: `${params.domain} | Hostiq` }] }),
  component: DomainDetail,
});

function DomainDetail() {
  const { domain } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["domain", domain], queryFn: () => getDomain({ data: { name: domain } }) });
  const { data: capabilities = [] } = useQuery({ queryKey: ["platform-capabilities"], queryFn: () => getPlatformCapabilities() });
  const dnsCapability = capabilities.find((cap) => cap.key === "dnsManagement");
  const domainSearchCapability = capabilities.find((cap) => cap.key === "domainSearch");
  const update = useMutation({
    mutationFn: (patch: { id: string; autoRenew?: boolean; locked?: boolean; privacy?: boolean }) => updateDomainSettings({ data: patch }),
    onSuccess: () => { toast.success("Mis à jour"); qc.invalidateQueries({ queryKey: ["domain", domain] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <PageContent><p className="text-sm text-muted-foreground">Chargement…</p></PageContent>;
  const d = data?.domain;
  if (!d) return <PageContent><p>Domaine introuvable. <Link to="/app/domains" className="text-primary">Retour</Link></p></PageContent>;

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{d.name}</span>}
        breadcrumbs={[{ label: "Domaines", to: "/app/domains" }, { label: d.name }]}
        actions={
          <>
            <Button variant="outline" asChild disabled={dnsCapability?.ready === false}>
              <Link to="/app/domains/$domain/dns" params={{ domain: d.name }}><SettingsIcon className="h-4 w-4" />Gérer DNS</Link>
            </Button>
            <Button disabled><RefreshCw className="h-4 w-4" />Renouvellement bientôt</Button>
          </>
        }
      />
      <PageContent>
        {dnsCapability && !dnsCapability.ready && (
          <Card className="mb-4 border-destructive/30 p-4 text-sm">
            <p className="font-medium">Gestion DNS indisponible</p>
            <p className="mt-1 text-muted-foreground">{dnsCapability.reason}</p>
          </Card>
        )}
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="nameservers">Nameservers</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Statut</p>
                <div className="mt-2"><StatusBadge status={d.status} /></div>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Expire le</p>
                <p className="mt-2 font-mono text-lg font-semibold">{d.expires_at ? new Date(d.expires_at).toLocaleDateString("fr-FR") : "—"}</p>
              </CardContent></Card>
              <Card><CardContent className="p-5">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">Prix renouvellement</p>
                <p className="mt-2 text-lg font-semibold">{Number(d.price_per_year ?? 0).toFixed(2)} € / an</p>
              </CardContent></Card>
            </div>
            <Card>
              <CardHeader><CardTitle className="text-base">Préférences</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Row label="Renouvellement automatique"><Switch checked={!!d.auto_renew} disabled /></Row>
                <Row label="Verrouillage du transfert"><Switch checked={!!d.locked} disabled={domainSearchCapability?.ready === false} onCheckedChange={(v) => update.mutate({ id: d.id, locked: v })} /></Row>
                <Row label="WHOIS Privacy"><Switch checked={!!d.privacy} disabled /></Row>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="nameservers" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Nameservers</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {(d.nameservers ?? []).map((ns: string, i: number) => (
                  <div key={i} className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-4 py-2">
                    <span className="font-mono text-sm">{ns}</span>
                    <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(ns)}><Copy className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6 space-y-4">
            <Card><CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Shield className="h-5 w-5 text-success" />
                <div className="flex-1"><p className="font-medium">DNSSEC</p><p className="text-xs text-muted-foreground">Activé</p></div>
                <Switch defaultChecked />
              </div>
            </CardContent></Card>
            <Card><CardContent className="p-6">
              <div className="flex items-center gap-3">
                {d.locked ? <Lock className="h-5 w-5 text-success" /> : <Unlock className="h-5 w-5 text-warning" />}
                <div className="flex-1"><p className="font-medium">Lock du domaine</p></div>
                <Switch checked={!!d.locked} disabled={domainSearchCapability?.ready === false} onCheckedChange={(v) => update.mutate({ id: d.id, locked: v })} />
              </div>
            </CardContent></Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex items-center justify-between gap-4"><p className="text-sm font-medium">{label}</p>{children}</div>;
}
