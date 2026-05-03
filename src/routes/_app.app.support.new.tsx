import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTicket } from "@/server/support.functions";

export const Route = createFileRoute("/_app/app/support/new")({
  component: NewTicket,
});

function NewTicket() {
  const [subject, setSubject] = React.useState("");
  const [body, setBody] = React.useState("");
  const [category, setCategory] = React.useState("other");
  const [priority, setPriority] = React.useState<"low" | "normal" | "high" | "urgent">("normal");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: () => createTicket({ data: { subject, body, category, priority } }),
    onSuccess: (t) => {
      toast.success("Ticket créé");
      qc.invalidateQueries({ queryKey: ["tickets"] });
      navigate({ to: "/app/support/$ticketId", params: { ticketId: t.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Nouveau ticket" breadcrumbs={[{ label: "Support", to: "/app/support" }, { label: "Nouveau" }]} />
      <PageContent>
        <Card><CardContent className="p-6 space-y-4">
          <div><Label>Sujet</Label><Input className="mt-1.5" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Décrivez en quelques mots…" /></div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Catégorie</Label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="domains">Domaines</option>
                <option value="hosting">Hébergement</option>
                <option value="email">Email</option>
                <option value="billing">Facturation</option>
                <option value="other">Autre</option>
              </select>
            </div>
            <div>
              <Label>Priorité</Label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as typeof priority)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="low">Basse</option>
                <option value="normal">Normale</option>
                <option value="high">Haute</option>
                <option value="urgent">Urgente</option>
              </select>
            </div>
          </div>
          <div><Label>Message</Label><Textarea rows={8} className="mt-1.5" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Expliquez votre demande en détail…" /></div>
          <Button onClick={() => m.mutate()} disabled={!subject || !body || m.isPending}>
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer le ticket"}
          </Button>
        </CardContent></Card>
      </PageContent>
    </>
  );
}
