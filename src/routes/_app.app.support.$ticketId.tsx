import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { TICKETS } from "@/lib/mocks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/support/$ticketId")({
  component: TicketDetail,
});

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const t = TICKETS.find((x) => x.id === ticketId) ?? TICKETS[0];
  return (
    <>
      <PageHeader title={t.subject} breadcrumbs={[{ label: "Support", to: "/app/support" }, { label: `#${t.id}` }]}
        description={<span className="inline-flex gap-2 items-center"><Badge variant="outline">{t.category}</Badge><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></span>} />
      <PageContent className="space-y-4 max-w-3xl">
        {t.messages.map((m) => (
          <Card key={m.id} className={cn(m.isStaff && "border-primary/30 bg-primary/5")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{m.author}{m.isStaff && <Badge variant="success" className="ml-2 text-[10px]">Staff</Badge>}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.sentAt).toLocaleString("fr-FR")}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed">{m.body}</p>
            </CardContent>
          </Card>
        ))}
        <Card><CardContent className="p-4 space-y-3">
          <Textarea rows={5} placeholder="Répondre…" />
          <div className="flex justify-end gap-2"><Button variant="outline">Marquer résolu</Button><Button>Envoyer</Button></div>
        </CardContent></Card>
      </PageContent>
    </>
  );
}
