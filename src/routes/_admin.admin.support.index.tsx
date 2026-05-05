import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2 } from "lucide-react";
import { adminListTickets } from "@/api/admin-api";

export const Route = createFileRoute("/_admin/admin/support/")({ component: AdminSupport });

function AdminSupport() {
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ["admin", "tickets"], queryFn: () => adminListTickets() });
  return (
    <>
      <AdminPageHeader title="File de tickets" actions={<Link to="/admin/support/macros"><Button variant="outline">Macros</Button></Link>} />
      <AdminPageContent>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <div className="divide-y divide-border">
            {(tickets as Array<{ id: string; subject: string; category: string; priority: string; status: string; updated_at: string }>).map((t) => (
              <div key={t.id} className="flex items-center gap-4 p-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t.subject}</span>
                    <Badge variant="outline" className="text-[10px]">#{t.id.slice(0, 8)}</Badge>
                    <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">MAJ {new Date(t.updated_at).toLocaleString("fr-FR")}</p>
                </div>
                <StatusBadge status={t.priority} />
                <StatusBadge status={t.status} />
              </div>
            ))}
            {tickets.length === 0 && <div className="p-12 text-center text-sm text-muted-foreground">Aucun ticket</div>}
          </div>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
