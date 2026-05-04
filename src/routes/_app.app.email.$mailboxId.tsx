import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2 } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { getMailbox, createAlias, deleteAlias, createForward, deleteForward } from "@/server/email.server";

export const Route = createFileRoute("/_app/app/email/$mailboxId")({
  head: () => ({ meta: [{ title: "Boîte mail | Hostiq" }] }),
  component: MailboxDetail,
});

function MailboxDetail() {
  const { mailboxId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["mailbox", mailboxId], queryFn: () => getMailbox({ data: { id: mailboxId } }) });
  const [newAlias, setNewAlias] = React.useState("");
  const [newFwd, setNewFwd] = React.useState("");

  const addAlias = useMutation({
    mutationFn: () => createAlias({ data: { mailboxId, alias: newAlias } }),
    onSuccess: () => { setNewAlias(""); toast.success("Alias ajouté"); qc.invalidateQueries({ queryKey: ["mailbox", mailboxId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delAlias = useMutation({
    mutationFn: (id: string) => deleteAlias({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mailbox", mailboxId] }),
  });
  const addFwd = useMutation({
    mutationFn: () => createForward({ data: { mailboxId, forwardTo: newFwd } }),
    onSuccess: () => { setNewFwd(""); toast.success("Transfert ajouté"); qc.invalidateQueries({ queryKey: ["mailbox", mailboxId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const delFwd = useMutation({
    mutationFn: (id: string) => deleteForward({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mailbox", mailboxId] }),
  });

  if (isLoading) return <PageContent><p className="text-sm text-muted-foreground">Chargement…</p></PageContent>;
  const mb = data?.mailbox;
  if (!mb) return <PageContent><p>Boîte introuvable.</p></PageContent>;
  const aliases = data?.aliases ?? [];
  const forwards = data?.forwards ?? [];

  return (
    <>
      <PageHeader
        title={<span className="font-mono">{mb.address}</span>}
        description={mb.plan}
        breadcrumbs={[{ label: "Email", to: "/app/email" }, { label: mb.address }]}
      />
      <PageContent>
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="aliases">Alias ({aliases.length})</TabsTrigger>
            <TabsTrigger value="forwards">Transferts ({forwards.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Stockage</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-semibold">{Number(mb.used_gb ?? 0).toFixed(1)} GB</span>
                  <span className="text-sm text-muted-foreground">/ {mb.quota_gb} GB</span>
                </div>
                <Progress value={(Number(mb.used_gb ?? 0) / Number(mb.quota_gb || 1)) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aliases" className="mt-6 space-y-4">
            <Card className="p-4 flex gap-2">
              <Input className="font-mono" placeholder="contact@domaine.com" value={newAlias} onChange={(e) => setNewAlias(e.target.value)} />
              <Button onClick={() => addAlias.mutate()} disabled={!newAlias}><Plus className="h-4 w-4" />Ajouter</Button>
            </Card>
            <Card>
              <div className="divide-y divide-border">
                {aliases.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun alias.</p>}
                {aliases.map((a) => (
                  <div key={a.id} className="flex items-center justify-between p-4">
                    <span className="font-mono text-sm">{a.alias}</span>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => delAlias.mutate(a.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="forwards" className="mt-6 space-y-4">
            <Card className="p-4 flex gap-2">
              <Input className="font-mono" placeholder="destinataire@email.com" value={newFwd} onChange={(e) => setNewFwd(e.target.value)} />
              <Button onClick={() => addFwd.mutate()} disabled={!newFwd}><Plus className="h-4 w-4" />Ajouter</Button>
            </Card>
            <Card>
              <div className="divide-y divide-border">
                {forwards.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun transfert.</p>}
                {forwards.map((f) => (
                  <div key={f.id} className="flex items-center justify-between p-4">
                    <span className="font-mono text-sm">{f.forward_to}</span>
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => delFwd.mutate(f.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}
