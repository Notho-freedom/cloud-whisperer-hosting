import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Rocket, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSite } from "@/server/sites.functions";

export const Route = createFileRoute("/_app/app/sites/new")({
  head: () => ({ meta: [{ title: "Nouveau site | Hostiq" }] }),
  component: NewSite,
});

function NewSite() {
  const [name, setName] = React.useState("");
  const [framework, setFramework] = React.useState("nextjs");
  const [gitRepo, setGitRepo] = React.useState("");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const create = useMutation({
    mutationFn: () => createSite({ data: { name, framework, gitRepo: gitRepo || undefined } }),
    onSuccess: (site) => {
      toast.success("Site créé");
      qc.invalidateQueries({ queryKey: ["sites"] });
      navigate({ to: "/app/sites/$projectId", params: { projectId: site.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Créer un site"
        description="Connectez un repo Git ou créez un projet vide."
        breadcrumbs={[{ label: "Sites", to: "/app/sites" }, { label: "Nouveau" }]}
      />
      <PageContent>
        <Card className="max-w-2xl">
          <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Nom du projet</Label>
              <Input
                className="mt-1.5 font-mono"
                placeholder="my-awesome-app"
                value={name}
                onChange={(e) => setName(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"))}
              />
              <p className="mt-1 text-xs text-muted-foreground">Lettres minuscules, chiffres et tirets uniquement.</p>
            </div>
            <div>
              <Label>Framework</Label>
              <Input className="mt-1.5 font-mono" value={framework} onChange={(e) => setFramework(e.target.value)} />
            </div>
            <div>
              <Label>URL du repo Git (optionnel)</Label>
              <Input
                className="mt-1.5 font-mono"
                placeholder="https://github.com/user/repo"
                value={gitRepo}
                onChange={(e) => setGitRepo(e.target.value)}
              />
            </div>
            <Button onClick={() => create.mutate()} disabled={!name || create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Rocket className="h-4 w-4" />Créer & déployer</>}
            </Button>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}

