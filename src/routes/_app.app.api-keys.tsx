import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { KeyRound, Plus, Trash2, Loader2, Copy } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { listApiKeys, createApiKey, revokeApiKey } from "@/api/apikeys-api.server";

export const Route = createFileRoute("/_app/app/api-keys")({
  component: ApiKeysPage,
});

function ApiKeysPage() {
  const qc = useQueryClient();
  const { data: keys = [], isLoading } = useQuery({ queryKey: ["api-keys"], queryFn: () => listApiKeys() });
  const [name, setName] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [created, setCreated] = React.useState<string | null>(null);

  const create = useMutation({
    mutationFn: () => createApiKey({ data: { name, scopes: ["read", "write"] } }),
    onSuccess: (k) => {
      setCreated(k.key);
      setName("");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const revoke = useMutation({
    mutationFn: (id: string) => revokeApiKey({ data: { id } }),
    onSuccess: () => {
      toast.success("Clé révoquée");
      qc.invalidateQueries({ queryKey: ["api-keys"] });
    },
  });

  return (
    <>
      <PageHeader title="Clés API" description="Pilotez Hostiq en API depuis vos scripts et CI."
        actions={
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) setCreated(null); }}>
            <DialogTrigger asChild><Button><Plus className="h-4 w-4" />Nouvelle clé</Button></DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>{created ? "Clé créée" : "Créer une clé API"}</DialogTitle></DialogHeader>
              {created ? (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Copiez-la maintenant — elle ne sera plus affichée.</p>
                  <div className="flex gap-2">
                    <Input readOnly value={created} className="font-mono text-xs" />
                    <Button size="icon" variant="outline" onClick={() => { navigator.clipboard.writeText(created); toast.success("Copié"); }}><Copy className="h-4 w-4" /></Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div><Label>Nom</Label><Input className="mt-1.5" value={name} onChange={(e) => setName(e.target.value)} placeholder="CI/CD prod" /></div>
                  <Button onClick={() => create.mutate()} disabled={!name || create.isPending}>
                    {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer"}
                  </Button>
                </div>
              )}
            </DialogContent>
          </Dialog>
        }
      />
      <PageContent>
        <Card>
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : keys.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">Aucune clé API.</div>
          ) : (
            <div className="divide-y divide-border">
              {keys.map((k) => (
                <div key={k.id} className="flex items-center gap-4 p-4">
                  <KeyRound className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{k.name}</p>
                    <p className="font-mono text-xs text-muted-foreground">{k.prefix}••••••••••••</p>
                    <div className="mt-1 flex flex-wrap gap-1">{(k.scopes ?? []).map((s) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
                  </div>
                  <div className="text-xs text-muted-foreground">{k.last_used_at ? new Date(k.last_used_at).toLocaleString("fr-FR") : "Jamais utilisée"}</div>
                  <Button variant="ghost" size="icon" className="text-destructive" onClick={() => revoke.mutate(k.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </PageContent>
    </>
  );
}
