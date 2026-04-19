import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus } from "lucide-react";
import { STATUS_INCIDENTS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/status")({
  component: AdminStatus,
});

function AdminStatus() {
  return (
    <>
      <AdminPageHeader title="Status & incidents" actions={<Button><Plus className="h-4 w-4" />Déclarer un incident</Button>} />
      <AdminPageContent className="space-y-3">
        {STATUS_INCIDENTS.map((i) => (
          <Card key={i.id}><CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{i.title}</p><p className="text-xs text-muted-foreground">Démarré: {new Date(i.startedAt).toLocaleString("fr-FR")}</p></div>
              <StatusBadge status={i.status} />
            </div>
            <div className="mt-4 space-y-2 border-l-2 border-border pl-4">
              {i.updates.map((u, k) => (
                <div key={k}><p className="text-xs text-muted-foreground">{new Date(u.at).toLocaleString("fr-FR")}</p><p className="text-sm">{u.body}</p></div>
              ))}
            </div>
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
