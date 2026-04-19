import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { TICKETS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/support/")({
  head: () => ({ meta: [{ title: "Support | Hostiq" }] }),
  component: SupportList,
});

function SupportList() {
  return (
    <>
      <PageHeader title="Support" description="Vos tickets et historique d'échanges."
        actions={<Button asChild><Link to="/app/support/new"><Plus className="h-4 w-4" />Nouveau ticket</Link></Button>} />
      <PageContent>
        <Card>
          <div className="divide-y divide-border">
            {TICKETS.map((t) => (
              <Link key={t.id} to="/app/support/$ticketId" params={{ ticketId: t.id }} className="flex items-center gap-4 p-4 hover:bg-muted/30">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium truncate">{t.subject}</span>
                    <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">Mis à jour le {new Date(t.updatedAt).toLocaleString("fr-FR")} · {t.messages.length} messages</p>
                </div>
                <StatusBadge status={t.priority} />
                <StatusBadge status={t.status} />
              </Link>
            ))}
          </div>
        </Card>
      </PageContent>
    </>
  );
}
