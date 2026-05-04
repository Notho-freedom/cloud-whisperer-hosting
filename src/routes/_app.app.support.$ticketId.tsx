import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/StatusBadge";
import { getTicket, replyTicket } from "@/api/support-api.server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/support/$ticketId")({ component: TicketDetail });

function TicketDetail() {
  const { ticketId } = Route.useParams();
  const qc = useQueryClient();
  const { data } = useQuery({ queryKey: ["ticket", ticketId], queryFn: () => getTicket({ data: { id: ticketId } }) });
  const [body, setBody] = React.useState("");
  const reply = useMutation({
    mutationFn: () => replyTicket({ data: { ticketId, body } }),
    onSuccess: () => { setBody(""); toast.success("Envoyé"); qc.invalidateQueries({ queryKey: ["ticket", ticketId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  if (!data?.ticket) return <PageContent><p className="text-sm text-muted-foreground">Chargement…</p></PageContent>;
  const t = data.ticket;
  return (
    <>
      <PageHeader
        title={t.subject}
        breadcrumbs={[{ label: "Support", to: "/app/support" }, { label: `#${t.id.slice(0,8)}` }]}
        description={<span className="inline-flex gap-2 items-center"><Badge variant="outline">{t.category}</Badge><StatusBadge status={t.priority} /><StatusBadge status={t.status} /></span>}
      />
      <PageContent className="space-y-4 max-w-3xl">
        {data.messages.map((m) => (
          <Card key={m.id} className={cn(m.is_staff && "border-primary/30 bg-primary/5")}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{m.author_name ?? "Utilisateur"}{m.is_staff && <Badge variant="success" className="ml-2 text-[10px]">Staff</Badge>}</p>
                <p className="text-xs text-muted-foreground">{new Date(m.sent_at).toLocaleString("fr-FR")}</p>
              </div>
              <p className="mt-3 text-sm leading-relaxed whitespace-pre-wrap">{m.body}</p>
            </CardContent>
          </Card>
        ))}
        <Card><CardContent className="p-4 space-y-3">
          <Textarea rows={5} placeholder="Répondre…" value={body} onChange={(e) => setBody(e.target.value)} />
          <div className="flex justify-end gap-2"><Button onClick={() => reply.mutate()} disabled={!body || reply.isPending}>Envoyer</Button></div>
        </CardContent></Card>
      </PageContent>
    </>
  );
}
