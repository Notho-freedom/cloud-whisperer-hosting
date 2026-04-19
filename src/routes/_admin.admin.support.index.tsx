import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { TICKETS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/support/")({
  component: AdminSupport,
});

function AdminSupport() {
  return (
    <>
      <AdminPageHeader title="File de tickets" actions={<Link to="/admin/support/macros"><Button variant="outline">Macros</Button></Link>} />
      <AdminPageContent>
        <Card>
          <div className="divide-y divide-border">
            {TICKETS.map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.subject}</span>
                    <Badge variant="outline" className="text-[10px]">#{t.id}</Badge>
                    <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">SLA: répondre sous 4h · MAJ {new Date(t.updatedAt).toLocaleString("fr-FR")}</p>
                </div>
                <StatusBadge status={t.priority} />
                <StatusBadge status={t.status} />
                <Button size="sm" variant="outline">Assigner</Button>
              </div>
            ))}
          </div>
        </Card>
      </AdminPageContent>
    </>
  );
}
