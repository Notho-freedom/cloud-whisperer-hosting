import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, GitBranch, ExternalLink, Loader2, Search, LayoutGrid, List, Star, MoreHorizontal, Github, ArrowUpRight, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { listSites } from "@/api/sites-api";
import { listNotifications } from "@/api/notifications-api";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Route = createFileRoute("/_app/app/sites/")({
  head: () => ({ meta: [{ title: "Projects | Hostiq" }] }),
  component: SitesList,
});

type SiteRow = Awaited<ReturnType<typeof listSites>>[number];

function loadFavs(): Record<string, true> {
  try { return JSON.parse(localStorage.getItem("hostiq.sitesFavs") || "{}"); } catch { return {}; }
}
function saveFavs(v: Record<string, true>) { localStorage.setItem("hostiq.sitesFavs", JSON.stringify(v)); }

function SitesList() {
  const { data: sites = [], isLoading } = useQuery({ queryKey: ["sites"], queryFn: () => listSites() });
  const { data: notifs = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => listNotifications(), retry: 1 });
  const [view, setView] = React.useState<"grid" | "list">("grid");
  const [query, setQuery] = React.useState("");
  const [favs, setFavs] = React.useState<Record<string, true>>({});
  React.useEffect(() => setFavs(loadFavs()), []);

  function toggleFav(id: string) {
    const next = { ...favs };
    if (next[id]) delete next[id]; else next[id] = true;
    setFavs(next); saveFavs(next);
  }

  const filtered = sites.filter((s) => s.name.toLowerCase().includes(query.toLowerCase()));
  const favorites = filtered.filter((s) => favs[s.id]);
  const others = filtered.filter((s) => !favs[s.id]);
  const alerts = (notifs as Array<{ id: string; title: string; body?: string; read?: boolean; type?: string }>).filter((n) => !n.read).slice(0, 3);

  return (
    <PageContent className="!max-w-[1400px]">
      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        {/* LEFT: Usage + Alerts */}
        <aside className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Usage</p>
                <span className="text-[10px] text-muted-foreground">Last 30 days</span>
              </div>
              <UsageBar label="Edge Requests" value={48000} max={1_000_000} unit="" />
              <UsageBar label="Data Transfer" value={1.33} max={100} unit="GB" />
              <UsageBar label="Fluid Active CPU" value={117} max={14400} unit="s" />
              <UsageBar label="Edge CPU Duration" value={5} max={3600} unit="s" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Alerts</p>
              {alerts.length === 0 && (
                <div className="flex items-center gap-2 rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span>No anomalies detected.</span>
                </div>
              )}
              {alerts.map((n) => (
                <div key={n.id} className="flex items-start gap-2 rounded-md border border-border bg-card p-2.5">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-warning" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium leading-snug">{n.title}</p>
                    {n.body && <p className="line-clamp-2 text-[11px] text-muted-foreground">{n.body}</p>}
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" asChild className="w-full justify-between">
                <Link to="/app/notifications">View all <ArrowUpRight className="h-3 w-3" /></Link>
              </Button>
            </CardContent>
          </Card>
        </aside>

        {/* MAIN */}
        <section>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search projects…" className="h-9 pl-8" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <div className="inline-flex rounded-md border border-border p-0.5">
              <button onClick={() => setView("grid")} className={cn("rounded px-2 py-1", view === "grid" && "bg-accent text-foreground")}><LayoutGrid className="h-4 w-4" /></button>
              <button onClick={() => setView("list")} className={cn("rounded px-2 py-1", view === "list" && "bg-accent text-foreground")}><List className="h-4 w-4" /></button>
            </div>
            <Button asChild className="h-9">
              <Link to="/app/sites/new"><Plus className="h-4 w-4" /> Add New</Link>
            </Button>
          </div>

          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : sites.length === 0 ? (
            <Card className="p-12 text-center text-sm text-muted-foreground">
              No projects yet. <Link to="/app/sites/new" className="text-primary hover:underline">Create your first one</Link>.
            </Card>
          ) : (
            <div className="space-y-8">
              {favorites.length > 0 && (
                <Section title="Your Favorites" view={view} items={favorites} favs={favs} onFav={toggleFav} />
              )}
              <Section title={favorites.length > 0 ? "All Projects" : "Projects"} view={view} items={others} favs={favs} onFav={toggleFav} />
            </div>
          )}
        </section>
      </div>
    </PageContent>
  );
}

function Section({ title, view, items, favs, onFav }: {
  title: string; view: "grid" | "list"; items: SiteRow[]; favs: Record<string, true>; onFav: (id: string) => void;
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground">{title}</h2>
        <Badge variant="outline" className="text-[10px]">{items.length}</Badge>
      </div>
      {view === "grid" ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((s) => <ProjectCard key={s.id} s={s} fav={!!favs[s.id]} onFav={() => onFav(s.id)} />)}
        </div>
      ) : (
        <Card className="divide-y divide-border">
          {items.map((s) => <ProjectRow key={s.id} s={s} fav={!!favs[s.id]} onFav={() => onFav(s.id)} />)}
        </Card>
      )}
    </div>
  );
}

function ProjectCard({ s, fav, onFav }: { s: SiteRow; fav: boolean; onFav: () => void }) {
  const repo = s.git_repo?.replace(/^https?:\/\/github\.com\//, "");
  return (
    <Card className="group relative overflow-hidden transition-all hover:border-primary/40">
      <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); onFav(); }}
        className="absolute right-2 top-2 z-10 rounded p-1 opacity-0 transition-opacity hover:bg-accent group-hover:opacity-100" aria-label="Favorite">
        <Star className={cn("h-4 w-4", fav ? "fill-warning text-warning" : "text-muted-foreground")} />
      </button>
      <Link to="/app/sites/$projectId" params={{ projectId: s.id }} className="block">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-muted to-card font-mono text-sm font-bold text-muted-foreground">
              {s.name[0].toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-semibold leading-tight">{s.name}</p>
              {s.prod_url && (
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {s.prod_url.replace(/^https?:\/\//, "")}
                </p>
              )}
            </div>
          </div>
          {repo && (
            <div className="mt-3 inline-flex max-w-full items-center gap-1.5 rounded border border-border bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">
              <Github className="h-3 w-3 shrink-0" />
              <span className="truncate">{repo}</span>
            </div>
          )}
          <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <span className={cn("h-1.5 w-1.5 rounded-full", s.prod_url ? "bg-success" : "bg-muted-foreground/40")} />
              {s.last_deploy_at ? new Date(s.last_deploy_at).toLocaleDateString("fr-FR") : "Never deployed"}
            </span>
            <Badge variant="outline" className="text-[9px] uppercase">{s.framework}</Badge>
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}

function ProjectRow({ s, fav, onFav }: { s: SiteRow; fav: boolean; onFav: () => void }) {
  return (
    <div className="flex items-center gap-3 p-3 hover:bg-muted/30">
      <button onClick={onFav} className="rounded p-1 hover:bg-accent" aria-label="Favorite">
        <Star className={cn("h-4 w-4", fav ? "fill-warning text-warning" : "text-muted-foreground")} />
      </button>
      <Link to="/app/sites/$projectId" params={{ projectId: s.id }} className="flex flex-1 items-center gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted font-mono text-xs font-bold">
          {s.name[0].toUpperCase()}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{s.name}</p>
          {s.prod_url && <p className="truncate text-xs text-muted-foreground">{s.prod_url.replace(/^https?:\/\//, "")}</p>}
        </div>
        <Badge variant="outline" className="hidden text-[10px] uppercase sm:inline-flex">{s.framework}</Badge>
        <span className="hidden text-xs text-muted-foreground md:inline-flex items-center gap-1">
          <Clock className="h-3 w-3" />{s.last_deploy_at ? new Date(s.last_deploy_at).toLocaleDateString("fr-FR") : "—"}
        </span>
      </Link>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-7 w-7"><MoreHorizontal className="h-4 w-4" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {s.prod_url && <DropdownMenuItem asChild><a href={s.prod_url} target="_blank" rel="noreferrer"><ExternalLink className="mr-2 h-3.5 w-3.5" /> Visit</a></DropdownMenuItem>}
          <DropdownMenuItem asChild><Link to="/app/sites/$projectId/settings" params={{ projectId: s.id }}>Settings</Link></DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function UsageBar({ label, value, max, unit }: { label: string; value: number; max: number; unit: string }) {
  const pct = Math.min(100, (value / max) * 100);
  const fmt = (n: number) => n >= 1000 ? `${(n / 1000).toFixed(n >= 10_000 ? 0 : 1)}K` : `${n}`;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono text-muted-foreground">{fmt(value)}{unit} / {fmt(max)}{unit}</span>
      </div>
      <Progress value={pct} className="h-1.5" />
    </div>
  );
}
