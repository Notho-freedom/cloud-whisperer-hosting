import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, GitBranch, ExternalLink, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { listSites } from "@/api/sites-api.server";

export const Route = createFileRoute("/_app/app/sites/")({
  head: () => ({ meta: [{ title: "Sites | Hostiq" }] }),
  component: SitesList,
});

function SitesList() {
  const { data: sites = [], isLoading } = useQuery({ queryKey: ["sites"], queryFn: () => listSites() });
  return (
    <>
      <PageHeader
        title="Sites"
        description={`${sites.length} projet${sites.length > 1 ? "s" : ""} hébergé${sites.length > 1 ? "s" : ""}`}
        actions={
          <Button asChild><Link to="/app/sites/new"><Plus className="h-4 w-4" />Nouveau site</Link></Button>
        }
      />
      <PageContent>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : sites.length === 0 ? (
          <Card className="p-12 text-center text-sm text-muted-foreground">
            Aucun site. <Link to="/app/sites/new" className="text-primary hover:underline">Créez votre premier site</Link>.
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.map((s) => (
              <Link key={s.id} to="/app/sites/$projectId" params={{ projectId: s.id }}>
                <Card className="group overflow-hidden transition-all hover:border-primary/40 hover:shadow-md">
                  <div className="aspect-video bg-gradient-to-br from-muted via-muted/40 to-card border-b border-border flex items-center justify-center">
                    <span className="font-mono text-2xl font-bold text-muted-foreground/40">{s.name[0].toUpperCase()}</span>
                  </div>
                  <div className="p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold truncate">{s.name}</p>
                      <Badge variant="outline" className="text-[10px] uppercase">{s.framework}</Badge>
                    </div>
                    {s.prod_url && (
                      <a href={s.prod_url} className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate" onClick={(e) => e.stopPropagation()}>
                        {s.prod_url.replace("https://", "")} <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" />{s.git_branch ?? "main"}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
