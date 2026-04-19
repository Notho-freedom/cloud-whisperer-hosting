import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Trash2, KeyRound } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { MAILBOXES } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/email/$mailboxId")({
  head: ({ params }) => ({ meta: [{ title: `Boîte mail | Hostiq` }] }),
  component: MailboxDetail,
});

function MailboxDetail() {
  const { mailboxId } = Route.useParams();
  const mb = MAILBOXES.find((m) => m.id === mailboxId) ?? MAILBOXES[0];
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
            <TabsTrigger value="aliases">Alias</TabsTrigger>
            <TabsTrigger value="forwards">Transferts</TabsTrigger>
            <TabsTrigger value="security">Sécurité</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            <Card>
              <CardHeader><CardTitle className="text-base">Stockage</CardTitle></CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between"><span className="text-2xl font-semibold">{mb.usedGb} GB</span><span className="text-sm text-muted-foreground">/ {mb.quotaGb} GB</span></div>
                <Progress value={(mb.usedGb / mb.quotaGb) * 100} className="mt-2" />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="aliases" className="mt-6 space-y-4">
            <Card className="p-4 flex gap-2"><Input className="font-mono" placeholder="contact@acme.com" /><Button><Plus className="h-4 w-4" />Ajouter</Button></Card>
            <Card>
              <div className="divide-y divide-border">
                {mb.aliases.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun alias.</p>}
                {mb.aliases.map((a) => (
                  <div key={a} className="flex items-center justify-between p-4">
                    <span className="font-mono text-sm">{a}</span>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="forwards" className="mt-6 space-y-4">
            <Card className="p-4 flex gap-2"><Input className="font-mono" placeholder="autre@email.com" /><Button><Plus className="h-4 w-4" />Ajouter</Button></Card>
            <Card>
              <div className="divide-y divide-border">
                {mb.forwards.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucun transfert.</p>}
                {mb.forwards.map((f) => (
                  <div key={f} className="flex items-center justify-between p-4">
                    <span className="font-mono text-sm">{f}</span>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="security" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Mot de passe</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2"><Input type="password" placeholder="Nouveau mot de passe" /><Button><KeyRound className="h-4 w-4" />Réinitialiser</Button></div>
                <p className="text-xs text-muted-foreground">Le mot de passe sera transmis au provider via API.</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContent>
    </>
  );
}
