import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/StatusBadge";
import { Plus, Loader2 } from "lucide-react";
import { adminListIncidents, adminCreateIncident } from "@/api/admin-api";

export const Route = createFileRoute("/_admin/admin/status")({ component: AdminStatus });

function AdminStatus() {
  const qc = useQueryClient();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const { data: incidents = [], isLoading } = useQuery({ queryKey: ["admin", "incidents"], queryFn: () => adminListIncidents() });
  const create = useMutation({
    mutationFn: () => adminCreateIncident({ data: { title, severity: "minor", status: "investigating" } }),
    onSuccess: () => { toast.success("Incident déclaré"); setTitle(""); setOpen(false); qc.invalidateQueries({ queryKey: ["admin", "incidents"] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <>
      <AdminPageHeader title="Status & incidents" actions={<Button onClick={() => setOpen((v) => !v)}><Plus className="h-4 w-4" />Déclarer un incident</Button>} />
      <AdminPageContent className="space-y-3">
        {open && (
          <Card><CardContent className="p-4 flex gap-2">
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Titre de l'incident…" />
            <Button onClick={() => create.mutate()} disabled={!title || create.isPending}>{create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}</Button>
          </CardContent></Card>
        )}
        {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : incidents.length === 0 ? (
          <Card><CardContent className="p-12 text-center text-sm text-muted-foreground">Aucun incident en cours</CardContent></Card>
        ) : incidents.map((i: { id: string; title: string; status: string | null; started_at: string; updates: Array<{ at: string; body: string }> | null }) => (
          <Card key={i.id}><CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div><p className="font-semibold">{i.title}</p><p className="text-xs text-muted-foreground">Démarré: {new Date(i.started_at).toLocaleString("fr-FR")}</p></div>
              <StatusBadge status={i.status ?? "investigating"} />
            </div>
            {Array.isArray(i.updates) && i.updates.length > 0 && (
              <div className="mt-4 space-y-2 border-l-2 border-border pl-4">
                {i.updates.map((u, k) => (
                  <div key={k}><p className="text-xs text-muted-foreground">{new Date(u.at).toLocaleString("fr-FR")}</p><p className="text-sm">{u.body}</p></div>
                ))}
              </div>
            )}
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
