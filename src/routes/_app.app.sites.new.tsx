import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Github, Upload, FilePlus2, Loader2, ArrowRight, ArrowLeft, Rocket, Search, Folder } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createSite } from "@/api/sites-api";
import { deployFromUpload } from "@/api/sites-api";
import { getGithubConnection, listGithubRepos, inspectGithubRepo, listGithubBranches, startGithubOAuth } from "@/api/github-api.server";

export const Route = createFileRoute("/_app/app/sites/new")({
  head: () => ({ meta: [{ title: "Nouveau site | Hostiq" }] }),
  component: NewSite,
});

type Source = "github" | "upload" | "empty" | null;
type EnvVar = { key: string; value: string };

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function NewSite() {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [source, setSource] = React.useState<Source>(null);

  // GitHub
  const [repoFullName, setRepoFullName] = React.useState<string>("");
  const [branch, setBranch] = React.useState<string>("main");
  const [repoQuery, setRepoQuery] = React.useState("");

  // Upload
  const [files, setFiles] = React.useState<Array<{ path: string; data: string; size: number }>>([]);

  // Config
  const [name, setName] = React.useState("");
  const [framework, setFramework] = React.useState<string>("");
  const [envs, setEnvs] = React.useState<EnvVar[]>([]);

  const navigate = useNavigate();
  const qc = useQueryClient();

  const { data: gh } = useQuery({ queryKey: ["github-conn"], queryFn: () => getGithubConnection() });
  const { data: repos = [] } = useQuery({
    queryKey: ["github-repos"], queryFn: () => listGithubRepos(), enabled: !!gh,
  });
  const inspect = useMutation({
    mutationFn: (v: { fullName: string; branch?: string }) => inspectGithubRepo({ data: v }),
    onSuccess: (r) => { setBranch(r.branch); if (r.framework) setFramework(r.framework); },
  });
  const branchesQ = useQuery({
    queryKey: ["github-branches", repoFullName],
    queryFn: () => listGithubBranches({ data: { fullName: repoFullName } }),
    enabled: !!repoFullName,
  });

  const create = useMutation({
    mutationFn: async () => {
      if (source === "upload") {
        const r = await deployFromUpload({ data: { name, framework: framework || null, files } });
        return { siteId: r.siteId, deploymentId: r.deploymentId };
      }
      const site = await createSite({ data: {
        name,
        framework: framework || "static",
        githubRepoFullName: source === "github" ? repoFullName : undefined,
        branch: source === "github" ? branch : "main",
      }});
      // env vars (best-effort, after site created)
      if (envs.length) {
        const { upsertEnvVar } = await import("@/api/sites-api");
        for (const e of envs) {
          if (!e.key) continue;
          try { await upsertEnvVar({ data: { siteId: site.id, key: e.key, value: e.value, target: ["production"], type: "plain" } }); } catch {/* */}
        }
      }
      return { siteId: site.id, deploymentId: undefined };
    },
    onSuccess: ({ siteId, deploymentId }) => {
      toast.success("Site créé");
      qc.invalidateQueries({ queryKey: ["sites"] });
      if (deploymentId) {
        navigate({ to: "/app/sites/$projectId/deployments/$deploymentId", params: { projectId: siteId!, deploymentId } });
      } else {
        navigate({ to: "/app/sites/$projectId", params: { projectId: siteId! } });
      }
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filteredRepos = repos.filter((r) => r.fullName.toLowerCase().includes(repoQuery.toLowerCase()));

  async function handleFiles(fileList: FileList | File[]) {
    const arr = Array.from(fileList);
    const out: Array<{ path: string; data: string; size: number }> = [];
    for (const f of arr) {
      const path = ((f as File & { webkitRelativePath?: string }).webkitRelativePath) || f.name;
      const buf = await f.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      out.push({ path: path.replace(/^\.\//, ""), data: b64, size: f.size });
    }
    setFiles(out);
    // auto-detect framework
    const hasIndex = out.some((f) => f.path === "index.html" || f.path.endsWith("/index.html"));
    const hasPkg = out.find((f) => f.path === "package.json");
    if (hasPkg) {
      try {
        const text = atob(hasPkg.data);
        const pkg = JSON.parse(text);
        const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
        if (deps.next) setFramework("nextjs");
        else if (deps.vite) setFramework("vite");
        else if (deps.astro) setFramework("astro");
        else setFramework("");
      } catch {/* */}
    } else if (hasIndex) setFramework("");
    if (!name) {
      const guess = slugify(arr[0]?.name?.replace(/\.[^.]+$/, "") || "my-site");
      setName(guess || "my-site");
    }
  }

  function next() {
    if (step === 1) {
      if (!source) return toast.error("Choisissez une source");
      if (source === "github" && !repoFullName) return toast.error("Sélectionnez un dépôt");
      if (source === "upload" && files.length === 0) return toast.error("Ajoutez des fichiers");
      setStep(2);
    } else if (step === 2) {
      if (!name) return toast.error("Nom de projet requis");
      setStep(3);
    }
  }

  return (
    <>
      <PageHeader title="Créer un site" description="Connectez un repo, uploadez des fichiers, ou démarrez vide."
        breadcrumbs={[{ label: "Sites", to: "/app/sites" }, { label: "Nouveau" }]} />
      <PageContent>
        {/* Stepper */}
        <div className="mb-6 flex items-center gap-3 text-sm">
          {[1, 2, 3].map((n, i) => (
            <React.Fragment key={n}>
              <div className={cn("flex items-center gap-2", step >= n ? "text-foreground" : "text-muted-foreground")}>
                <div className={cn("flex h-7 w-7 items-center justify-center rounded-full border text-xs font-medium",
                  step >= n ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                  {n}
                </div>
                <span>{["Source", "Configuration", "Déploiement"][n - 1]}</span>
              </div>
              {i < 2 && <div className="h-px flex-1 bg-border" />}
            </React.Fragment>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <SourceCard active={source === "github"} onClick={() => setSource("github")}
                icon={<Github className="h-5 w-5" />} title="Importer depuis GitHub"
                desc="Connectez votre compte et choisissez un dépôt." />
              <SourceCard active={source === "upload"} onClick={() => setSource("upload")}
                icon={<Upload className="h-5 w-5" />} title="Uploader des fichiers"
                desc="Glissez-déposez un dossier (HTML/CSS/JS, build…)." />
              <SourceCard active={source === "empty"} onClick={() => setSource("empty")}
                icon={<FilePlus2 className="h-5 w-5" />} title="Projet vide"
                desc="Créez un projet et déployez plus tard." />
            </div>

            {source === "github" && (
              <Card>
                <CardHeader><CardTitle className="text-base">Choisir un dépôt</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {!gh ? (
                    <div className="flex items-center justify-between gap-3 rounded-md border border-border p-4">
                      <p className="text-sm">Connectez votre compte GitHub pour importer un dépôt.</p>
                      <Button onClick={async () => { const { url } = await startGithubOAuth(); window.location.href = url; }}>
                        <Github className="h-4 w-4" /> Connecter GitHub
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center gap-2">
                        <Search className="h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Rechercher un dépôt…" value={repoQuery} onChange={(e) => setRepoQuery(e.target.value)} />
                      </div>
                      <div className="max-h-80 overflow-auto rounded-md border border-border divide-y divide-border">
                        {filteredRepos.length === 0 && <p className="p-4 text-sm text-muted-foreground">Aucun dépôt.</p>}
                        {filteredRepos.map((r) => (
                          <button key={r.id}
                            onClick={() => { setRepoFullName(r.fullName); setName(slugify(r.name)); inspect.mutate({ fullName: r.fullName }); }}
                            className={cn("flex w-full items-center gap-3 p-3 text-left hover:bg-muted/40",
                              repoFullName === r.fullName && "bg-muted/60")}>
                            <Github className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{r.fullName}</p>
                              {r.description && <p className="text-xs text-muted-foreground truncate">{r.description}</p>}
                            </div>
                            {r.private && <Badge variant="outline" className="text-[10px]">Privé</Badge>}
                            <Badge variant="secondary" className="text-[10px] font-mono">{r.defaultBranch}</Badge>
                          </button>
                        ))}
                      </div>
                      {repoFullName && (
                        <div className="flex items-center gap-3">
                          <Label className="text-xs">Branche</Label>
                          <select className="rounded-md border border-border bg-background px-2 py-1.5 text-sm font-mono"
                            value={branch} onChange={(e) => setBranch(e.target.value)}>
                            {(branchesQ.data ?? [branch]).map((b) => <option key={b} value={b}>{b}</option>)}
                          </select>
                          {inspect.isPending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                          {inspect.data?.framework && <Badge variant="outline" className="text-[10px]">Framework détecté: {inspect.data.framework}</Badge>}
                        </div>
                      )}
                    </>
                  )}
                </CardContent>
              </Card>
            )}

            {source === "upload" && (
              <Card>
                <CardHeader><CardTitle className="text-base">Vos fichiers</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <label className="flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed border-border p-8 text-center hover:bg-muted/30">
                    <Folder className="h-8 w-8 text-muted-foreground" />
                    <p className="text-sm font-medium">Cliquez pour sélectionner un dossier (ou faites glisser des fichiers)</p>
                    <p className="text-xs text-muted-foreground">HTML, CSS, JS, images… ou un build complet (dossier <code>dist</code>).</p>
                    <input type="file" multiple
                      // @ts-expect-error directory upload (Chromium/Firefox)
                      webkitdirectory="" directory=""
                      className="hidden"
                      onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                  </label>
                  <input type="file" multiple className="block w-full text-xs"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                  {files.length > 0 && (
                    <div className="rounded-md border border-border p-3 text-xs">
                      <p className="font-medium">{files.length} fichier{files.length > 1 ? "s" : ""} prêt{files.length > 1 ? "s" : ""} ({(files.reduce((a, f) => a + f.size, 0) / 1024).toFixed(1)} KB)</p>
                      <ul className="mt-2 max-h-32 overflow-auto font-mono text-[11px] text-muted-foreground">
                        {files.slice(0, 30).map((f) => <li key={f.path}>{f.path}</li>)}
                        {files.length > 30 && <li>… +{files.length - 30}</li>}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {step === 2 && (
          <Card className="max-w-3xl">
            <CardHeader><CardTitle className="text-base">Configuration</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Nom du projet</Label>
                <Input className="mt-1.5 font-mono" placeholder="my-awesome-app" value={name}
                  onChange={(e) => setName(slugify(e.target.value))} />
                <p className="mt-1 text-xs text-muted-foreground">Lettres minuscules, chiffres, tirets. URL: <span className="font-mono">{name || "your-site"}.vercel.app</span></p>
              </div>
              <div>
                <Label>Framework {source === "upload" && <span className="text-xs text-muted-foreground">(laisser vide pour HTML statique)</span>}</Label>
                <Input className="mt-1.5 font-mono" placeholder="nextjs, vite, astro, …" value={framework}
                  onChange={(e) => setFramework(e.target.value)} />
              </div>
              <div>
                <div className="flex items-center justify-between">
                  <Label>Variables d'environnement</Label>
                  <Button variant="ghost" size="sm" onClick={() => setEnvs([...envs, { key: "", value: "" }])}>+ Ajouter</Button>
                </div>
                <div className="mt-2 space-y-2">
                  {envs.map((e, i) => (
                    <div key={i} className="flex gap-2">
                      <Input className="font-mono" placeholder="KEY" value={e.key}
                        onChange={(ev) => { const c = [...envs]; c[i] = { ...c[i], key: ev.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }; setEnvs(c); }} />
                      <Input className="font-mono" placeholder="value" value={e.value}
                        onChange={(ev) => { const c = [...envs]; c[i] = { ...c[i], value: ev.target.value }; setEnvs(c); }} />
                      <Button variant="ghost" size="sm" onClick={() => setEnvs(envs.filter((_, j) => j !== i))}>×</Button>
                    </div>
                  ))}
                  {envs.length === 0 && <p className="text-xs text-muted-foreground">Aucune variable. Vous pourrez en ajouter plus tard.</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {step === 3 && (
          <Card className="max-w-2xl">
            <CardHeader><CardTitle className="text-base">Récapitulatif</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              <Row k="Source" v={source === "github" ? `GitHub: ${repoFullName} @ ${branch}` : source === "upload" ? `${files.length} fichiers` : "Projet vide"} />
              <Row k="Nom" v={name} />
              <Row k="Framework" v={framework || "static"} />
              <Row k="Variables" v={`${envs.filter((e) => e.key).length} définie(s)`} />
            </CardContent>
          </Card>
        )}

        <div className="mt-6 flex items-center gap-2">
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
              <ArrowLeft className="h-4 w-4" /> Retour
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={next} className="ml-auto">Continuer <ArrowRight className="h-4 w-4" /></Button>
          ) : (
            <Button onClick={() => create.mutate()} disabled={create.isPending} className="ml-auto">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
              Déployer
            </Button>
          )}
        </div>
      </PageContent>
    </>
  );
}

function SourceCard({ active, onClick, icon, title, desc }: { active: boolean; onClick: () => void; icon: React.ReactNode; title: string; desc: string }) {
  return (
    <button onClick={onClick} className={cn(
      "flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
      active ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30"
    )}>
      <div className={cn("rounded-md border border-border bg-background p-2", active && "border-primary text-primary")}>{icon}</div>
      <p className="font-medium">{title}</p>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}
function Row({ k, v }: { k: string; v: string }) {
  return <div className="flex justify-between gap-3"><span className="text-muted-foreground">{k}</span><span className="font-medium">{v}</span></div>;
}
