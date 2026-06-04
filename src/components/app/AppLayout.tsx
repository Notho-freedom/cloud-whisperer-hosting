import * as React from "react";
import { Link, useLocation, useNavigate, useMatches, Outlet } from "@tanstack/react-router";
import {
  LayoutGrid, Server, Rocket, ScrollText, BarChart3, Globe2, Mail, Database, Plug, Users,
  CreditCard, KeyRound, Settings as SettingsIcon, Bell, Search, ChevronDown, LogOut, ShieldCheck,
  Sparkles, Plus, Menu, ChevronRight, ArrowLeft, Activity, GaugeCircle, FolderTree,
  SlidersHorizontal, FileClock, LifeBuoy, ChevronsUpDown, CircleDot,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { listNotifications } from "@/api/notifications-api";
import { getSite } from "@/api/sites-api";

// ─── Workspace nav ──────────────────────────────────────────────────────────
const WORKSPACE_NAV: Array<{
  label: string;
  items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }>;
}> = [
  { label: "Overview", items: [
    { to: "/app", label: "Dashboard", icon: LayoutGrid, exact: true },
    { to: "/app/sites", label: "Projects", icon: Server },
    { to: "/app/deployments", label: "Deployments", icon: Rocket },
  ]},
  { label: "Monitor", items: [
    { to: "/app/notifications", label: "Notifications", icon: Bell },
  ]},
  { label: "Resources", items: [
    { to: "/app/domains", label: "Domains", icon: Globe2 },
    { to: "/app/email", label: "Email", icon: Mail },
  ]},
  { label: "Workspace", items: [
    { to: "/app/team", label: "Team", icon: Users },
    { to: "/app/billing", label: "Billing", icon: CreditCard },
    { to: "/app/api-keys", label: "API Keys", icon: KeyRound },
    { to: "/app/support", label: "Support", icon: LifeBuoy },
    { to: "/app/settings/profile", label: "Settings", icon: SettingsIcon },
  ]},
];

// ─── Project (per-site) nav ────────────────────────────────────────────────
const PROJECT_NAV = (projectId: string): Array<{
  label: string;
  items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }>; exact?: boolean }>;
}> => [
  { label: "Monitor", items: [
    { to: `/app/sites/${projectId}`, label: "Overview", icon: LayoutGrid, exact: true },
    { to: `/app/sites/${projectId}/events`, label: "Events", icon: Activity },
    { to: `/app/sites/${projectId}/logs`, label: "Logs", icon: ScrollText },
    { to: `/app/sites/${projectId}/analytics`, label: "Metrics", icon: BarChart3 },
  ]},
  { label: "Manage", items: [
    { to: `/app/sites/${projectId}/deployments`, label: "Deployments", icon: Rocket },
    { to: `/app/sites/${projectId}/source`, label: "Source", icon: FolderTree },
    { to: `/app/sites/${projectId}/env`, label: "Environment", icon: SlidersHorizontal },
    { to: `/app/sites/${projectId}/domains`, label: "Domains", icon: Globe2 },
    { to: `/app/sites/${projectId}/settings`, label: "Settings", icon: SettingsIcon },
  ]},
];

// Detect project id from matched routes (only set when inside /app/sites/$projectId/*)
function useProjectId(): string | null {
  const matches = useMatches();
  for (const m of matches) {
    const params = m.params as Record<string, string> | undefined;
    if (params?.projectId) return params.projectId;
  }
  return null;
}

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const projectId = useProjectId();

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-60 shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        {projectId ? <ProjectSidebar projectId={projectId} /> : <WorkspaceSidebar />}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-sidebar-border bg-sidebar" onClick={(e) => e.stopPropagation()}>
            {projectId ? (
              <ProjectSidebar projectId={projectId} onNavigate={() => setMobileOpen(false)} />
            ) : (
              <WorkspaceSidebar onNavigate={() => setMobileOpen(false)} />
            )}
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenMobile={() => setMobileOpen(true)} projectId={projectId} />
        <main className="flex-1"><Outlet /></main>
      </div>
    </div>
  );
}

// ─── Workspace sidebar ─────────────────────────────────────────────────────
function WorkspaceSidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const auth = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        <Link to="/app" onClick={onNavigate} className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>
      <div className="border-b border-sidebar-border p-3">
        <WorkspaceSwitcher />
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {WORKSPACE_NAV.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.exact ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                return (
                  <Link key={item.to} to={item.to} onClick={onNavigate}
                    className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                      active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
                    <item.icon className="h-4 w-4" />{item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      {auth.hasRole("admin") && (
        <div className="border-t border-sidebar-border p-2">
          <Link to="/admin" onClick={onNavigate}
            className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-2.5 py-2 text-[13px] text-destructive transition-colors hover:bg-destructive/10">
            <span className="inline-flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4" /> Admin console</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      )}
      <PlatformStatusFooter />
    </div>
  );
}

// ─── Project sidebar (Render-style, contextual) ────────────────────────────
function ProjectSidebar({ projectId, onNavigate }: { projectId: string; onNavigate?: () => void }) {
  const location = useLocation();
  const { data: site } = useQuery({
    queryKey: ["site", projectId],
    queryFn: () => getSite({ data: { id: projectId } }),
  });
  const groups = PROJECT_NAV(projectId);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center gap-2 border-b border-sidebar-border px-3">
        <Link to="/app" onClick={onNavigate} className="flex items-center gap-2">
          <Logo />
        </Link>
      </div>
      <div className="border-b border-sidebar-border px-3 py-3">
        <Link to="/app/sites" onClick={onNavigate}
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3 w-3" /> Projects
        </Link>
        <div className="mt-2 flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary/30 to-primary/10 text-[11px] font-bold text-primary">
            {(site?.name?.[0] ?? "P").toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight">{site?.name ?? projectId.slice(0, 8)}</p>
            <p className="truncate text-[10px] uppercase tracking-wide text-muted-foreground">Web Service</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 space-y-5 overflow-y-auto px-2 py-4">
        {groups.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/60">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.exact ? location.pathname === item.to : location.pathname === item.to || location.pathname.startsWith(item.to + "/");
                return (
                  <Link key={item.to} to={item.to} onClick={onNavigate}
                    className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium transition-colors",
                      active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground")}>
                    <item.icon className="h-4 w-4" />{item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
      <PlatformStatusFooter />
    </div>
  );
}

function PlatformStatusFooter() {
  return (
    <div className="border-t border-sidebar-border p-2">
      <div className="flex items-center justify-between rounded-md px-2 py-1.5 text-[11px] text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-success" />
          All systems normal
        </span>
        <ChevronsUpDown className="h-3 w-3 opacity-50" />
      </div>
    </div>
  );
}

function WorkspaceSwitcher() {
  const auth = useAuth();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex w-full items-center gap-2 rounded-md border border-sidebar-border bg-sidebar-accent/40 px-2 py-1.5 text-left hover:bg-sidebar-accent">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-[10px] font-bold text-primary-foreground">
            {(auth.user?.name?.[0] || "W").toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[12px] font-semibold">{auth.user?.name ?? "My Workspace"}</p>
            <p className="truncate text-[10px] text-muted-foreground">Personal</p>
          </div>
          <ChevronsUpDown className="h-3.5 w-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-60">
        <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground">Workspaces</DropdownMenuLabel>
        <DropdownMenuItem>
          <CircleDot className="mr-2 h-4 w-4 text-primary" />
          <span className="flex-1">{auth.user?.name ?? "Personal"}</span>
          <Badge variant="outline" className="text-[9px]">Hobby</Badge>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>
          <Plus className="mr-2 h-4 w-4" /> Create workspace
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ─── Top header (breadcrumb + search + notif + user) ───────────────────────
function useBreadcrumbSegments(projectId: string | null) {
  const location = useLocation();
  const { data: site } = useQuery({
    queryKey: ["site", projectId],
    queryFn: () => getSite({ data: { id: projectId! } }),
    enabled: !!projectId,
  });
  const segments: Array<{ label: string; to?: string; icon?: React.ComponentType<{ className?: string }> }> = [];
  segments.push({ label: "My Workspace", to: "/app", icon: LayoutGrid });
  if (projectId) {
    segments.push({ label: "Projects", to: "/app/sites", icon: Server });
    segments.push({ label: site?.name ?? projectId.slice(0, 6), to: `/app/sites/${projectId}` });
    // sub
    const path = location.pathname;
    const trailing = path.replace(`/app/sites/${projectId}`, "").split("/").filter(Boolean)[0];
    const map: Record<string, string> = {
      deployments: "Deployments", logs: "Logs", source: "Source", env: "Environment",
      domains: "Domains", settings: "Settings", analytics: "Metrics", events: "Events",
    };
    if (trailing && map[trailing]) segments.push({ label: map[trailing] });
    return segments;
  }
  // Non-project: derive from URL
  const top = location.pathname.replace(/^\/app\/?/, "").split("/")[0];
  const topMap: Record<string, string> = {
    sites: "Projects", deployments: "Deployments", domains: "Domains", email: "Email",
    team: "Team", billing: "Billing", "api-keys": "API Keys", support: "Support",
    settings: "Settings", notifications: "Notifications",
  };
  if (top && topMap[top]) segments.push({ label: topMap[top] });
  return segments;
}

function AppHeader({ onOpenMobile, projectId }: { onOpenMobile: () => void; projectId: string | null }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const segments = useBreadcrumbSegments(projectId);
  const { data: notifs } = useQuery({ queryKey: ["notifications"], queryFn: () => listNotifications(), retry: 1 });
  const list = Array.isArray(notifs) ? notifs : [];
  const unread = list.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobile} aria-label="Menu"><Menu className="h-5 w-5" /></Button>
      <nav className="hidden min-w-0 items-center gap-1 text-[13px] md:flex">
        {segments.map((s, i) => (
          <React.Fragment key={i}>
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />}
            {s.to ? (
              <Link to={s.to} className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 text-muted-foreground hover:bg-accent hover:text-foreground">
                {s.icon && <s.icon className="h-3.5 w-3.5" />}{s.label}
              </Link>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded px-1.5 py-0.5 font-medium text-foreground">{s.label}</span>
            )}
          </React.Fragment>
        ))}
      </nav>
      <div className="ml-auto flex items-center gap-1.5">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search…" className="h-8 w-56 pl-8 pr-10 text-[13px]" />
          <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">⌘K</kbd>
        </div>
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative h-8 w-8">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span><Badge variant="secondary" className="text-[10px]">{unread} unread</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {list.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">No notifications</p>}
            {list.slice(0, 4).map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/app/notifications" })}>View all notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-1.5 rounded-md p-0.5 pl-0.5 hover:bg-accent">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
                {(auth.user?.name?.[0] || "U").toUpperCase()}
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{auth.user?.name || "User"}</span>
                <span className="truncate text-xs text-muted-foreground">{auth.user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/app/settings/profile" })}><SettingsIcon className="mr-2 h-4 w-4" /> Settings</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/app/billing" })}><CreditCard className="mr-2 h-4 w-4" /> Billing</DropdownMenuItem>
            {auth.hasRole("admin") && (
              <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}><ShieldCheck className="mr-2 h-4 w-4" /> Admin console</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { auth.logout(); navigate({ to: "/" }); }} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function PageHeader({ title, description, actions, breadcrumbs }: {
  title: React.ReactNode; description?: React.ReactNode; actions?: React.ReactNode;
  breadcrumbs?: Array<{ label: string; to?: string }>;
}) {
  return (
    <div className="border-b border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 pb-5 pt-6 md:px-6">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
            {breadcrumbs.map((b, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span>/</span>}
                {b.to ? <Link to={b.to} className="hover:text-foreground">{b.label}</Link> : <span className="text-foreground">{b.label}</span>}
              </React.Fragment>
            ))}
          </nav>
        )}
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
            {description && <div className="mt-1 text-sm text-muted-foreground">{description}</div>}
          </div>
          {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4 py-6 md:px-6", className)}>{children}</div>;
}

export { Menu as MobileMenuIcon };
