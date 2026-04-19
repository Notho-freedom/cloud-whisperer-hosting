import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, GitBranch, ExternalLink, MoreHorizontal } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { SITES, DEPLOYMENTS } from "@/lib/mocks";
import { StatusBadge } from "@/components/StatusBadge";

export const Route = createFileRoute("/_app/app/sites/")({
  head: () => ({ meta: [{ title: "Sites | Hostiq" }] }),
  component: SitesList,
});

function SitesList() {
  return (
    <>
      <PageHeader
        title="Sites"
        description={`${SITES.length} projets hébergés via Vercel`}
        actions={
          <Button asChild><Link to="/app/sites/new"><Plus className="h-4 w-4" />Nouveau site</Link></Button>
        }
      />
      <PageContent>
        <div className="mb-4 flex gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Rechercher un site…" className="pl-9" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {SITES.map((s) => {
            const lastDpl = DEPLOYMENTS.find((d) => d.siteId === s.id);
            return (
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
                    <a href={s.prodUrl} className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary truncate" onClick={(e) => e.stopPropagation()}>
                      {s.prodUrl.replace("https://", "")} <ExternalLink className="h-3 w-3" />
                    </a>
                    <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                      <span className="inline-flex items-center gap-1"><GitBranch className="h-3 w-3" />{s.gitBranch}</span>
                      {lastDpl && <StatusBadge status={lastDpl.status} />}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </PageContent>
    </>
  );
}
