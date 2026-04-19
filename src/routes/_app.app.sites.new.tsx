import { createFileRoute, Link } from "@tanstack/react-router";
import { Github, Upload, FileCode2, Rocket } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_app/app/sites/new")({
  head: () => ({ meta: [{ title: "Nouveau site | Hostiq" }] }),
  component: NewSite,
});

function NewSite() {
  const sources = [
    { icon: Github, title: "Importer depuis Git", desc: "GitHub, GitLab, Bitbucket — déploiement automatique à chaque push." },
    { icon: FileCode2, title: "Démarrer d'un template", desc: "Next.js, Astro, Vite, Remix… Plus de 40 templates prêts à l'emploi." },
    { icon: Upload, title: "Uploader un ZIP", desc: "Drag & drop d'un dossier statique pour un déploiement instantané." },
    { icon: Rocket, title: "Site vide", desc: "Créez la structure et déployez plus tard via API ou CLI." },
  ];
  return (
    <>
      <PageHeader
        title="Créer un site"
        description="Choisissez votre source pour démarrer le déploiement."
        breadcrumbs={[{ label: "Sites", to: "/app/sites" }, { label: "Nouveau" }]}
      />
      <PageContent className="space-y-8">
        <div className="grid gap-4 md:grid-cols-2">
          {sources.map((s) => (
            <Card key={s.title} className="group cursor-pointer p-6 transition-all hover:border-primary/40 hover:shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary"><s.icon className="h-5 w-5" /></div>
                <h3 className="text-lg font-semibold">{s.title}</h3>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{s.desc}</p>
            </Card>
          ))}
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base">Configuration rapide</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div><Label>Nom du projet</Label><Input className="mt-1.5" placeholder="my-awesome-app" /></div>
            <div><Label>URL du repo Git</Label><Input className="mt-1.5 font-mono" placeholder="https://github.com/user/repo" /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div><Label>Branche</Label><Input className="mt-1.5 font-mono" defaultValue="main" /></div>
              <div><Label>Région</Label><Input className="mt-1.5 font-mono" defaultValue="cdg1 (Paris)" /></div>
            </div>
            <Button className="w-full sm:w-auto"><Rocket className="h-4 w-4" />Déployer</Button>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
