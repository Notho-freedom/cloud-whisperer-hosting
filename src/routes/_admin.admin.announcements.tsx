import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/StatusBadge";
import { adminListAnnouncements, adminCreateAnnouncement } from "@/api/admin-api.server";
import { Plus, Loader2 } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/announcements")({ component: Announcements });

function Announcements() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [body, setBody] = React.useState("");
  const { data: list = [], isLoading } = useQuery({ queryKey: ["admin", "announcements"], queryFn: () => adminListAnnouncements() });
  const create = useMutation({
    mutationFn: () => adminCreateAnnouncement({ data: { title, body, audience: "all", status: "scheduled" } }),
    onSuccess: () => { toast.success("Annonce créée"); setTitle(""); setBody(""); setOpen(false); qc.invalidateQueries({ queryKey: ["admin", "announcements"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <>
      <AdminPageHeader title="Annonces" description="Bannières & broadcasts." actions={<Button onClick={() => setOpen((v) => !v)}><Plus className="h-4 w-4" />Nouvelle annonce</Button>} />
      <AdminPageContent className="space-y-3">
        {open && (
          <Card><CardContent className="p-4 space-y-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre…" />
            <Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="Contenu…" rows={3} />
            <Button onClick={() => create.mutate()} disabled={!title || create.isPending}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Publier"}</Button>
          </CardContent></Card>
        )}
        {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : list.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Aucune annonce</CardContent></Card>
        ) : (list as Array<{ id: string; title: string; body: string | null; audience: string | null; scheduled_at: string | null; status: string | null }>).map((a) => (
          <Card key={a.id}><CardContent className="flex items-start gap-4 p-5">
            <div className="flex-1"><p className="font-semibold">{a.title}</p><p className="text-sm text-muted-foreground mt-1">{a.body}</p><p className="text-xs text-muted-foreground mt-2">Audience: {a.audience ?? "all"}{a.scheduled_at && ` · Programmé: ${new Date(a.scheduled_at).toLocaleString("fr-FR")}`}</p></div>
            <StatusBadge status={a.status ?? "draft"} />
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
