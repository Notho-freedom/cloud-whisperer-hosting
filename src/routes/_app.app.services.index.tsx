import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, RefreshCw, Loader2, Cpu, Globe, GitBranch, Pause, Play, ExternalLink, Star, MoreHorizontal, Database as DBIcon } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { listServices, syncRenderServices, suspendService, resumeService } from "@/api/render/services.functions";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/")({
  head: () => ({ meta: [{ title: "Services | Hostiq" }] }),
  component: ServicesIndex,
});

type Svc = {
  id: string;
  name: string;
  type: string;
  runtime?: string | null;
  region: string;
  plan?: string | null;
  repo?: string | null;
  branch?: string | null;
  prod_url?: string | null;
  suspended?: boolean;
  status?: string;
  is_favorite?: boolean;
  created_at?: string;
};

const TYPE_LABEL: Record<string, string> = {
  web_service: "Web Service",
  private_service: "Private Service",
  background_worker: "Worker",
  cron_job: "Cron Job",
  static_site: "Static Site",
};

function ServicesIndex() {
  const qc = useQueryClient();
  const [query, setQuery] = React.useState("");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");

  const { data = [], isLoading } = useQuery({
    queryKey: ["render", "services"],
    queryFn: () => listServices() as Promise<Svc[]>,
  });

  const sync = useMutation({
    mutationFn: () => syncRenderServices(),
    onSuccess: (r: any) => {
      toast.success(`Synced ${r?.synced ?? 0} services from Render`);
      qc.invalidateQueries({ queryKey: ["render", "services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const items = (data as Svc[]).filter((s) =>
    s.name.toLowerCase().includes(query.toLowerCase()) &&
    (typeFilter === "all" || s.type === typeFilter)
  );

  return (
    <>
      <PageHeader
        title="Services"
        description="Web services, workers, cron jobs and static sites powered by Render."
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => sync.mutate()} disabled={sync.isPending}>
              {sync.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
              Sync from Render
            </Button>
            <Button asChild size="sm">
              <Link to="/app/services/new"><Plus className="h-3.5 w-3.5" /> New Service</Link>
            </Button>
          </>
        }
      />
      <PageContent>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Filter services…" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>
          <div className="inline-flex rounded-md border border-border bg-card p-0.5">
            {[
              { v: "all", l: "All" },
              { v: "web_service", l: "Web" },
              { v: "private_service", l: "Private" },
              { v: "background_worker", l: "Workers" },
              { v: "cron_job", l: "Cron" },
              { v: "static_site", l: "Static" },
            ].map((t) => (
              <button key={t.v} onClick={() => setTypeFilter(t.v)}
                className={cn("rounded px-2.5 py-1 text-xs font-medium",
                  typeFilter === t.v ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {t.l}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : items.length === 0 ? (
          <EmptyState onSync={() => sync.mutate()} loading={sync.isPending} />
        ) : (
          <Card className="divide-y divide-border">
            {items.map((s) => <ServiceRow key={s.id} s={s} />)}
          </Card>
        )}
      </PageContent>
    </>
  );
}

function ServiceRow({ s }: { s: Svc }) {
  const qc = useQueryClient();
  const toggle = useMutation({
    mutationFn: () => (s.suspended ? resumeService({ data: { id: s.id } }) : suspendService({ data: { id: s.id } })),
    onSuccess: () => {
      toast.success(s.suspended ? "Service resumed" : "Service suspended");
      qc.invalidateQueries({ queryKey: ["render", "services"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <div className="group flex items-center gap-3 p-3 hover:bg-muted/30">
      <Link to="/app/services/$serviceId" params={{ serviceId: s.id }} className="flex flex-1 items-center gap-3 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-primary">
          {s.type === "static_site" ? <Globe className="h-4 w-4" /> : s.type === "cron_job" ? <RefreshCw className="h-4 w-4" /> : s.type === "background_worker" ? <Cpu className="h-4 w-4" /> : <DBIcon className="h-4 w-4" />}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate text-sm font-semibold">{s.name}</p>
            {s.suspended && <Badge variant="outline" className="border-warning/40 text-[9px] uppercase text-warning">Suspended</Badge>}
          </div>
          <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
            <span>{TYPE_LABEL[s.type] ?? s.type}</span>
            {s.runtime && <span className="rounded bg-muted px-1.5 py-0.5 font-mono">{s.runtime}</span>}
            <span>·</span>
            <span>{s.region}</span>
            {s.repo && <><span>·</span><GitBranch className="h-3 w-3" /><span className="truncate max-w-[180px]">{s.repo.replace(/^https?:\/\/github\.com\//, "")}{s.branch ? `@${s.branch}` : ""}</span></>}
          </div>
        </div>
        {s.prod_url && (
          <a href={s.prod_url} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()}
             className="hidden text-xs text-muted-foreground hover:text-foreground md:inline-flex items-center gap-1">
            <ExternalLink className="h-3 w-3" />{s.prod_url.replace(/^https?:\/\//, "").slice(0, 40)}
          </a>
        )}
        <Badge variant={s.suspended ? "outline" : "success"} className="text-[10px]">{s.suspended ? "Paused" : "Live"}</Badge>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onSelect={() => toggle.mutate()}>
            {s.suspended ? <><Play className="mr-2 h-3.5 w-3.5" /> Resume</> : <><Pause className="mr-2 h-3.5 w-3.5" /> Suspend</>}
          </DropdownMenuItem>
          <DropdownMenuItem asChild><Link to="/app/services/$serviceId/settings" params={{ serviceId: s.id }}>Settings</Link></DropdownMenuItem>
          {s.prod_url && <DropdownMenuItem asChild><a href={s.prod_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-3.5 w-3.5" /> Visit</a></DropdownMenuItem>}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function EmptyState({ onSync, loading }: { onSync: () => void; loading: boolean }) {
  return (
    <Card className="p-12 text-center">
      <Cpu className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
      <h3 className="text-base font-semibold">No services yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">Create a new service, or sync existing services from your Render workspace.</p>
      <div className="mt-5 flex justify-center gap-2">
        <Button onClick={onSync} variant="outline" disabled={loading}>
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Sync from Render
        </Button>
        <Button asChild><Link to="/app/services/new"><Plus className="h-3.5 w-3.5" /> New Service</Link></Button>
      </div>
    </Card>
  );
}
