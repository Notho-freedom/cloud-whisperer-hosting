import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Database, KeyRound, Plus, ShieldCheck, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/app/datastores")({
  head: () => ({ meta: [{ title: "Datastores | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader
        title="Datastores"
        description="Managed Postgres with HA + PITR, Key-Value (Redis-compatible), and disk snapshots."
        actions={<Button size="sm" disabled><Plus className="h-3.5 w-3.5" /> New Datastore</Button>}
      />
      <PageContent>
        <Tabs defaultValue="postgres">
          <TabsList>
            <TabsTrigger value="postgres"><Database className="mr-1.5 h-3.5 w-3.5" /> Postgres</TabsTrigger>
            <TabsTrigger value="kv"><KeyRound className="mr-1.5 h-3.5 w-3.5" /> Key-Value</TabsTrigger>
            <TabsTrigger value="disks"><History className="mr-1.5 h-3.5 w-3.5" /> Disk Snapshots</TabsTrigger>
          </TabsList>
          <TabsContent value="postgres" className="mt-4">
            <EmptyDatastore icon={Database} title="No Postgres instances"
              description="Create a managed Postgres instance with high availability, point-in-time recovery and automated exports."
              features={["High Availability failover", "PITR up to 7 days", "Automated daily exports", "Connection pooling"]} />
          </TabsContent>
          <TabsContent value="kv" className="mt-4">
            <EmptyDatastore icon={KeyRound} title="No Key-Value instances"
              description="Redis-compatible Key-Value store with configurable eviction policy and persistence."
              features={["maxmemory policy control", "AOF + RDB persistence", "TLS in transit", "Sub-ms latency"]} />
          </TabsContent>
          <TabsContent value="disks" className="mt-4">
            <Card className="p-10 text-center text-sm text-muted-foreground">
              <History className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
              No disk snapshots. Snapshots appear here once you attach a persistent disk to a service.
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}

function EmptyDatastore({ icon: Icon, title, description, features }: any) {
  return (
    <Card className="p-10">
      <div className="mx-auto max-w-md text-center">
        <Icon className="mx-auto mb-4 h-12 w-12 text-muted-foreground/40" />
        <h3 className="text-base font-semibold">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        <div className="mt-5 flex flex-wrap justify-center gap-1.5">
          {features.map((f: string) => (
            <Badge key={f} variant="outline" className="text-[11px]"><ShieldCheck className="mr-1 h-3 w-3 text-success" />{f}</Badge>
          ))}
        </div>
        <Button className="mt-5" size="sm" disabled><Plus className="h-3.5 w-3.5" /> Create instance</Button>
        <p className="mt-2 text-[11px] text-muted-foreground">Datastore provisioning wizard coming next.</p>
      </div>
    </Card>
  );
}
