import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { File, Folder, Loader2 } from "lucide-react";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { getSite, getSiteUploadManifest } from "@/api/sites-api";
import { getGithubTree, getGithubFile } from "@/api/github-api.server";

export const Route = createFileRoute("/_app/app/sites/$projectId/source")({
  head: () => ({ meta: [{ title: "Source | Hostiq" }] }),
  component: SourceView,
});

function SourceView() {
  const { projectId } = Route.useParams();
  const { data: site } = useQuery({ queryKey: ["site", projectId], queryFn: () => getSite({ data: { id: projectId } }) });

  const repoFullName = React.useMemo(() => {
    if (!site?.git_repo) return null;
    const m = site.git_repo.match(/github\.com\/([\w.-]+\/[\w.-]+)/);
    return m?.[1]?.replace(/\.git$/, "") ?? null;
  }, [site]);

  if (!site) return <PageContent><Loader2 className="h-4 w-4 animate-spin" /></PageContent>;
  return repoFullName
    ? <GithubSource fullName={repoFullName} branch={site.git_branch ?? "main"} />
    : <UploadSource siteId={projectId} />;
}

function GithubSource({ fullName, branch }: { fullName: string; branch: string }) {
  const { data: tree = [], isLoading } = useQuery({
    queryKey: ["gh-tree", fullName, branch],
    queryFn: () => getGithubTree({ data: { fullName, branch } }),
  });
  const [path, setPath] = React.useState<string | null>(null);
  const fileQ = useQuery({
    queryKey: ["gh-file", fullName, branch, path],
    queryFn: () => getGithubFile({ data: { fullName, branch, path: path! } }),
    enabled: !!path,
  });
  const files = tree.filter((t) => t.type === "blob");

  return (
    <PageContent>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Card><CardContent className="p-0">
          <div className="border-b border-border px-3 py-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{fullName} @ {branch}</div>
          <div className="max-h-[600px] overflow-auto">
            {isLoading && <div className="p-4"><Loader2 className="h-4 w-4 animate-spin" /></div>}
            {files.map((f) => (
              <button key={f.sha} onClick={() => setPath(f.path)}
                className={`flex w-full items-center gap-2 px-3 py-1.5 text-left text-xs font-mono hover:bg-muted/40 ${path === f.path ? "bg-muted/60" : ""}`}>
                <File className="h-3 w-3 text-muted-foreground" />
                <span className="truncate">{f.path}</span>
              </button>
            ))}
          </div>
        </CardContent></Card>
        <Card><CardContent className="p-0">
          <div className="border-b border-border px-3 py-2 text-xs font-mono">{path ?? "Sélectionnez un fichier"}</div>
          <pre className="max-h-[600px] overflow-auto p-4 font-mono text-[11px] leading-relaxed">
            {fileQ.isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
            {fileQ.data?.text ?? ""}
          </pre>
        </CardContent></Card>
      </div>
    </PageContent>
  );
}

function UploadSource({ siteId }: { siteId: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["site-upload", siteId],
    queryFn: () => getSiteUploadManifest({ data: { siteId } }),
  });
  if (isLoading) return <PageContent><Loader2 className="h-4 w-4 animate-spin" /></PageContent>;
  if (!data) return <PageContent><p className="text-sm text-muted-foreground">Aucune source disponible. Ce site n'est pas connecté à GitHub et aucun upload n'a été enregistré.</p></PageContent>;
  const manifest = (data.manifest as Array<{ path: string; size: number }>) ?? [];
  return (
    <PageContent>
      <Card><CardContent className="p-0">
        <div className="border-b border-border px-3 py-2 text-xs uppercase text-muted-foreground">{manifest.length} fichiers — {(data.total_bytes / 1024).toFixed(1)} KB</div>
        <div className="max-h-[600px] overflow-auto">
          {manifest.map((f) => (
            <div key={f.path} className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono">
              <Folder className="h-3 w-3 text-muted-foreground" />
              <span className="flex-1 truncate">{f.path}</span>
              <span className="text-muted-foreground">{f.size} B</span>
            </div>
          ))}
        </div>
      </CardContent></Card>
    </PageContent>
  );
}
