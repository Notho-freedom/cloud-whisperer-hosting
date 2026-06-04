import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Github, Upload, Search, Loader2, Rocket, ArrowLeft, FilePlus2, Lock } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageContent, PageHeader } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { createSite, deployFromUpload } from "@/api/sites-api";
import { getGithubConnection, listGithubRepos, inspectGithubRepo, startGithubOAuth } from "@/api/github-api";

export const Route = createFileRoute("/_app/app/sites/new")({
  head: () => ({ meta: [{ title: "New project | Hostiq" }] }),
  component: NewProject,
});

function slugify(s: string) {
  return s.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

function NewProject() {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [search, setSearch] = React.useState("");
  const [importing, setImporting] = React.useState<{ fullName: string; branch?: string; name: string; framework?: string } | null>(null);
  const [uploadFiles, setUploadFiles] = React.useState<Array<{ path: string; data: string; size: number }>>([]);

  const { data: gh } = useQuery({ queryKey: ["github-conn"], queryFn: () => getGithubConnection() });
  const { data: repos = [] } = useQuery({ queryKey: ["github-repos"], queryFn: () => listGithubRepos(), enabled: !!gh });

  const inspect = useMutation({ mutationFn: (fullName: string) => inspectGithubRepo({ data: { fullName } }) });

  const create = useMutation({
    mutationFn: async () => {
      if (!importing) throw new Error("Pick a source first");
      const site = await createSite({ data: {
        name: importing.name,
        framework: importing.framework ?? "static",
        githubRepoFullName: importing.fullName,
        branch: importing.branch ?? "main",
      }});
      return site;
    },
    onSuccess: (site) => {
      toast.success("Project created");
      qc.invalidateQueries({ queryKey: ["sites"] });
      navigate({ to: "/app/sites/$projectId", params: { projectId: site.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deployUpload = useMutation({
    mutationFn: async (name: string) => deployFromUpload({ data: { name, framework: null, files: uploadFiles } }),
    onSuccess: (r) => {
      toast.success("Upload deployed");
      qc.invalidateQueries({ queryKey: ["sites"] });
      navigate({ to: "/app/sites/$projectId/deployments/$deploymentId", params: { projectId: r.siteId!, deploymentId: r.deploymentId } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const createEmpty = useMutation({
    mutationFn: async (name: string) => createSite({ data: { name, framework: "static" } }),
    onSuccess: (site) => { toast.success("Empty project created"); qc.invalidateQueries({ queryKey: ["sites"] }); navigate({ to: "/app/sites/$projectId", params: { projectId: site.id } }); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleFiles(fl: FileList | File[]) {
    const arr = Array.from(fl);
    const out: Array<{ path: string; data: string; size: number }> = [];
    for (const f of arr) {
      const path = ((f as File & { webkitRelativePath?: string }).webkitRelativePath) || f.name;
      const buf = await f.arrayBuffer();
      const b64 = btoa(String.fromCharCode(...new Uint8Array(buf)));
      out.push({ path: path.replace(/^\.\//, ""), data: b64, size: f.size });
    }
    setUploadFiles(out);
    const name = slugify(arr[0]?.name?.replace(/\.[^.]+$/, "") || "my-site") || "my-site";
    deployUpload.mutate(name);
  }

  const filteredRepos = (repos as Array<{ id: string; fullName: string; name: string; description?: string; defaultBranch: string; private: boolean }>)
    .filter((r) => r.fullName.toLowerCase().includes(search.toLowerCase()));

  // ── Import confirm screen
  if (importing) {
    return (
      <>
        <PageHeader title="Configure & deploy"
          breadcrumbs={[{ label: "Projects", to: "/app/sites" }, { label: "New" }, { label: "Configure" }]} />
        <PageContent className="max-w-2xl">
          <Button variant="ghost" size="sm" onClick={() => setImporting(null)} className="mb-3"><ArrowLeft className="h-4 w-4" /> Back</Button>
          <Card>
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center gap-3">
                <Github className="h-5 w-5" />
                <div className="min-w-0">
                  <p className="truncate font-semibold">{importing.fullName}</p>
                  <p className="text-xs text-muted-foreground">Branch <span className="font-mono">{importing.branch ?? "main"}</span></p>
                </div>
                {importing.framework && <Badge variant="outline" className="ml-auto text-[10px] uppercase">{importing.framework}</Badge>}
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground">Project name</label>
                <Input className="mt-1 font-mono" value={importing.name}
                  onChange={(e) => setImporting({ ...importing, name: slugify(e.target.value) })} />
                <p className="mt-1 text-[11px] text-muted-foreground">URL: <span className="font-mono">{importing.name}.vercel.app</span></p>
              </div>
              <Button onClick={() => create.mutate()} disabled={create.isPending || !importing.name} className="w-full">
                {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
                Deploy
              </Button>
            </CardContent>
          </Card>
        </PageContent>
      </>
    );
  }

  return (
    <>
      <PageHeader title="Let's build something new"
        breadcrumbs={[{ label: "Projects", to: "/app/sites" }, { label: "New" }]} />
      <PageContent className="!max-w-5xl">
        {/* Big search input */}
        <Card className="mb-6">
          <CardContent className="p-3">
            <div className="flex items-center gap-2 rounded-md border border-border bg-background px-3 py-2">
              <FilePlus2 className="h-4 w-4 text-muted-foreground" />
              <Input className="border-0 bg-transparent p-0 text-sm focus-visible:ring-0" placeholder="Paste a Git URL or describe your project…" />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Import Git Repository */}
          <section>
            <h2 className="mb-3 text-sm font-semibold">Import Git Repository</h2>
            <Card>
              <CardContent className="space-y-3 p-3">
                {!gh ? (
                  <div className="flex flex-col items-start gap-3 rounded-md border border-dashed border-border p-5">
                    <Github className="h-6 w-6 text-muted-foreground" />
                    <p className="text-sm">Connect your GitHub account to import a repository.</p>
                    <Button onClick={async () => { const { url } = await startGithubOAuth(); window.location.href = url; }} size="sm">
                      <Github className="h-4 w-4" /> Connect GitHub
                    </Button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                      <Input placeholder="Search…" className="h-8 pl-8" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <div className="max-h-[360px] overflow-auto rounded-md border border-border divide-y divide-border">
                      {filteredRepos.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">No repositories found.</p>}
                      {filteredRepos.map((r) => (
                        <div key={r.id} className="flex items-center gap-3 p-3 hover:bg-muted/30">
                          <Github className="h-4 w-4 shrink-0 text-muted-foreground" />
                          <div className="min-w-0 flex-1">
                            <p className="flex items-center gap-1.5 truncate text-sm font-medium">
                              {r.name} {r.private && <Lock className="h-3 w-3 text-muted-foreground" />}
                            </p>
                            <p className="truncate text-[11px] text-muted-foreground">{r.fullName}</p>
                          </div>
                          <Button size="sm" variant="outline" onClick={async () => {
                            const insp = await inspect.mutateAsync(r.fullName).catch(() => null);
                            setImporting({
                              fullName: r.fullName, branch: insp?.branch ?? r.defaultBranch,
                              name: slugify(r.name), framework: insp?.framework ?? undefined,
                            });
                          }}>Import</Button>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </section>

          {/* Building blocks */}
          <section>
            <h2 className="mb-3 text-sm font-semibold">Building blocks</h2>
            <div className="space-y-3">
              <BlockCard icon={<Upload className="h-5 w-5" />} title="Upload files" desc="Drag & drop a folder (HTML/CSS/JS, build output)." action={
                <label className="cursor-pointer">
                  <input type="file" multiple
                    // @ts-expect-error webkit
                    webkitdirectory="" directory=""
                    className="hidden"
                    onChange={(e) => e.target.files && handleFiles(e.target.files)} />
                  <Button variant="outline" size="sm" asChild><span>{deployUpload.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Select"}</span></Button>
                </label>
              } />
              <BlockCard icon={<FilePlus2 className="h-5 w-5" />} title="Create Empty Project" desc="Skip Git setup and deploy later." action={
                <Button variant="outline" size="sm" onClick={() => {
                  const name = prompt("Project name (lowercase, dashes)");
                  if (name) createEmpty.mutate(slugify(name));
                }}>Create</Button>
              } />
            </div>
          </section>
        </div>

        {/* Templates */}
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold">Clone Template</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {TEMPLATES.map((t) => (
              <Card key={t.name} className="overflow-hidden transition-all hover:border-primary/40">
                <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-muted to-card text-3xl font-bold text-muted-foreground/40">
                  {t.icon}
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="mt-0.5 line-clamp-2 text-[11px] text-muted-foreground">{t.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </PageContent>
    </>
  );
}

function BlockCard({ icon, title, desc, action }: { icon: React.ReactNode; title: string; desc: string; action: React.ReactNode }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-border bg-muted/40">{icon}</div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{title}</p>
          <p className="truncate text-[11px] text-muted-foreground">{desc}</p>
        </div>
        {action}
      </CardContent>
    </Card>
  );
}

const TEMPLATES = [
  { name: "Vite + React", desc: "Modern React SPA with Vite and TypeScript.", icon: "⚡" },
  { name: "Next.js", desc: "Full-stack React framework with SSR/SSG.", icon: "▲" },
  { name: "Astro", desc: "Content-driven sites with island architecture.", icon: "🚀" },
  { name: "Static HTML", desc: "Plain HTML/CSS/JS, zero build.", icon: "📄" },
];
