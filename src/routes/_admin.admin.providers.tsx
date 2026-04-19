import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { PROVIDERS_STATUS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/providers")({
  component: AdminProviders,
});

function AdminProviders() {
  return (
    <>
      <AdminPageHeader title="Providers & intégrations" description="État santé + clés API plateforme." />
      <AdminPageContent className="space-y-3">
        {PROVIDERS_STATUS.map((p) => (
          <Card key={p.id}><CardContent className="flex items-center gap-4 p-5">
            <div className="flex-1"><p className="font-medium">{p.name}</p><p className="text-xs text-muted-foreground">Latence {p.latencyMs}ms · Vérifié {p.lastCheck}</p></div>
            <StatusBadge status={p.status} />
            <Input type="password" placeholder="API key" className="max-w-xs font-mono" />
            <Button variant="outline" size="sm">Tester</Button>
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
