import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { ExternalLink, GitBranch, Rocket } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SITES } from "@/lib/mocks";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/sites/$projectId")({
  head: ({ params }) => ({ meta: [{ title: `${params.projectId} | Hostiq` }] }),
  component: SiteShell,
});

const TABS = [
  { to: "", label: "Vue d'ensemble" },
  { to: "/deployments", label: "Déploiements" },
  { to: "/domains", label: "Domaines" },
  { to: "/env", label: "Variables" },
  { to: "/analytics", label: "Analytics" },
  { to: "/logs", label: "Logs" },
  { to: "/settings", label: "Paramètres" },
];

function SiteShell() {
  const { projectId } = Route.useParams();
  const site = SITES.find((s) => s.id === projectId) ?? SITES[0];
  const location = useLocation();
  const base = `/app/sites/${projectId}`;

  return (
    <>
      <PageHeader
        title={site.name}
        breadcrumbs={[{ label: "Sites", to: "/app/sites" }, { label: site.name }]}
        description={
          <span className="inline-flex flex-wrap items-center gap-3">
            <a href={site.prodUrl} className="inline-flex items-center gap-1 text-primary hover:underline">
              {site.prodUrl} <ExternalLink className="h-3 w-3" />
            </a>
            <Badge variant="outline" className="text-[10px] uppercase">{site.framework}</Badge>
            <span className="inline-flex items-center gap-1 text-xs"><GitBranch className="h-3 w-3" />{site.gitRepo}</span>
          </span>
        }
        actions={<Button><Rocket className="h-4 w-4" />Redéployer</Button>}
      />
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 md:px-6">
          {TABS.map((t) => {
            const href = base + t.to;
            const active = location.pathname === href || (t.to === "" && location.pathname === base);
            return (
              <Link
                key={t.label}
                to={href}
                className={cn(
                  "border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground",
                )}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
      <Outlet />
    </>
  );
}
