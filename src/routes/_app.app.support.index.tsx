import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { listTickets } from "@/api/support-api";

export const Route = createFileRoute("/_app/app/support/")({
  head: () => ({ meta: [{ title: "Support | Hostiq" }] }),
  component: SupportList,
});

function SupportList() {
  const { data: tickets = [], isLoading } = useQuery({ queryKey: ["tickets"], queryFn: () => listTickets() });
  return (
    <>
      <PageHeader title="Support" description="Vos tickets et historique d'échanges."
        actions={<Button asChild><Link to="/app/support/new"><Plus className="h-4 w-4" />Nouveau ticket</Link></Button>} />
      <PageContent>
        <Card>
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : tickets.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Aucun ticket pour le moment.</div>
          ) : (
            <div className="divide-y divide-border">
              {tickets.map((t) => (
                <Link key={t.id} to="/app/support/$ticketId" params={{ ticketId: t.id }} className="flex items-center gap-4 p-4 hover:bg-muted/30">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium truncate">{t.subject}</span>
                      <Badge variant="outline" className="text-[10px]">{t.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">Mis à jour le {new Date(t.updated_at).toLocaleString("fr-FR")}</p>
                  </div>
                  <StatusBadge status={t.priority} />
                  <StatusBadge status={t.status} />
                </Link>
              ))}
            </div>
          )}
        </Card>
      </PageContent>
    </>
  );
}
