import { createFileRoute, Link, Outlet, useLocation } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ExternalLink, GitBranch, Rocket, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSite, redeploySite } from "@/api/sites-api";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/sites/$projectId")({
  head: ({ params }) => ({ meta: [{ title: `${params.projectId} | Hostiq` }] }),
  component: SiteShell,
});

const TABS = [
  { to: "", label: "Vue d'ensemble" },
  { to: "/deployments", label: "Déploiements" },
  { to: "/source", label: "Source" },
  { to: "/logs", label: "Logs" },
  { to: "/domains", label: "Domaines" },
  { to: "/env", label: "Variables" },
  { to: "/settings", label: "Paramètres" },
];

function SiteShell() {
  const { projectId } = Route.useParams();
  const qc = useQueryClient();
  const { data: site } = useQuery({ queryKey: ["site", projectId], queryFn: () => getSite({ data: { id: projectId } }) });
  const location = useLocation();
  const base = `/app/sites/${projectId}`;
  const redeploy = useMutation({
    mutationFn: () => redeploySite({ data: { siteId: projectId } }),
    onSuccess: () => { toast.success("Déploiement lancé"); qc.invalidateQueries({ queryKey: ["deployments", projectId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title={site?.name ?? projectId}
        breadcrumbs={[{ label: "Sites", to: "/app/sites" }, { label: site?.name ?? projectId }]}
        description={
          <span className="inline-flex flex-wrap items-center gap-3">
            {site?.prod_url && <a href={site.prod_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">{site.prod_url} <ExternalLink className="h-3 w-3" /></a>}
            {site?.framework && <Badge variant="outline" className="text-[10px] uppercase">{site.framework}</Badge>}
            {site?.git_repo && <span className="inline-flex items-center gap-1 text-xs"><GitBranch className="h-3 w-3" />{site.git_repo}</span>}
          </span>
        }
        actions={
          <Button onClick={() => redeploy.mutate()} disabled={redeploy.isPending || !site?.vercel_project_id}>
            {redeploy.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Rocket className="h-4 w-4" />}
            Redéployer
          </Button>
        }
      />
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 md:px-6">
          {TABS.map((t) => {
            const href = base + t.to;
            const active = location.pathname === href || (t.to === "" && location.pathname === base);
            return (
              <Link key={t.label} to={href}
                className={cn("border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
                  active ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground")}>
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
