import * as React from "react";
import { Link, useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard, Globe2, Server, Mail, CreditCard, LifeBuoy, Users,
  KeyRound, Settings, Bell, Search, ChevronDown, LogOut, ShieldCheck,
  Sparkles, Plus, Menu, X,
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

const NAV_GROUPS: Array<{
  label: string;
  items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  { label: "Pilotage", items: [
    { to: "/app", label: "Dashboard", icon: LayoutDashboard },
    { to: "/app/notifications", label: "Notifications", icon: Bell },
  ]},
  { label: "Ressources", items: [
    { to: "/app/domains", label: "Domaines", icon: Globe2 },
    { to: "/app/sites", label: "Sites", icon: Server },
    { to: "/app/email", label: "Email Pro", icon: Mail },
  ]},
  { label: "Compte", items: [
    { to: "/app/billing", label: "Facturation", icon: CreditCard },
    { to: "/app/team", label: "Équipe", icon: Users },
    { to: "/app/api-keys", label: "Clés API", icon: KeyRound },
    { to: "/app/support", label: "Support", icon: LifeBuoy },
    { to: "/app/settings/profile", label: "Paramètres", icon: Settings },
  ]},
];

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <SidebarContent />
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setMobileOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <aside className="absolute left-0 top-0 h-full w-72 border-r border-border bg-sidebar" onClick={(e) => e.stopPropagation()}>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
      <div className="flex min-w-0 flex-1 flex-col">
        <AppHeader onOpenMobile={() => setMobileOpen(true)} />
        <main className="flex-1"><Outlet /></main>
      </div>
    </div>
  );
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  const auth = useAuth();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center border-b border-sidebar-border px-5">
        <Link to="/app" onClick={onNavigate}><Logo /></Link>
      </div>
      <div className="px-3 py-4">
        <Button asChild className="w-full justify-start gap-2" size="sm">
          <Link to="/app/sites/new" onClick={onNavigate}><Plus className="h-4 w-4" /> Nouveau site</Link>
        </Button>
      </div>
      <nav className="flex-1 space-y-6 overflow-y-auto px-3 pb-4">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">{group.label}</p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active = item.to === "/app" ? location.pathname === "/app" : location.pathname.startsWith(item.to);
                return (
                  <Link key={item.to} to={item.to} onClick={onNavigate}
                    className={cn("flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
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
        <div className="border-t border-sidebar-border p-3">
          <Link to="/admin" onClick={onNavigate}>
            <div className="flex items-center justify-between rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10">
              <span className="inline-flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4" /> Admin</span>
              <ChevronDown className="h-4 w-4 -rotate-90" />
            </div>
          </Link>
        </div>
      )}
      <div className="border-t border-sidebar-border p-3">
        <Link to="/app/billing/plan" onClick={onNavigate}
          className="block rounded-lg border border-primary/30 bg-primary/5 p-3 transition-colors hover:bg-primary/10">
          <div className="flex items-center gap-2"><Sparkles className="h-4 w-4 text-primary" /><span className="text-sm font-semibold">Passez Pro</span></div>
          <p className="mt-1 text-xs text-muted-foreground">Domaines inclus, support prioritaire & plus.</p>
        </Link>
      </div>
    </div>
  );
}

function AppHeader({ onOpenMobile }: { onOpenMobile: () => void }) {
  const auth = useAuth();
  const navigate = useNavigate();
  const { data: notifs, isLoading } = useQuery({ 
    queryKey: ["notifications"], 
    queryFn: () => listNotifications(),
    retry: 1,
  });
  const list = Array.isArray(notifs) ? notifs : [];
  const unread = list.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpenMobile} aria-label="Menu"><Menu className="h-5 w-5" /></Button>
      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher domaine, site, facture…" className="h-9 pl-9 pr-14" />
        <kbd className="pointer-events-none absolute right-2 top-1/2 hidden -translate-y-1/2 select-none items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground sm:inline-flex">⌘K</kbd>
      </div>
      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              {unread > 0 && <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-primary" />}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel className="flex items-center justify-between">
              <span>Notifications</span><Badge variant="secondary" className="text-[10px]">{unread} non lues</Badge>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {list.length === 0 && <p className="p-4 text-center text-xs text-muted-foreground">Aucune notification</p>}
            {list.slice(0, 4).map((n) => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start gap-0.5 py-2">
                <span className="text-sm font-medium">{n.title}</span>
                <span className="text-xs text-muted-foreground line-clamp-2">{n.body}</span>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/app/notifications" })}>Voir toutes les notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 pl-1 hover:bg-accent">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-glow text-xs font-semibold text-primary-foreground">
                {(auth.user?.name?.[0] || "U").toUpperCase()}
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col">
                <span className="text-sm font-medium">{auth.user?.name || "Utilisateur"}</span>
                <span className="text-xs text-muted-foreground truncate">{auth.user?.email}</span>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/app/settings/profile" })}><Settings className="mr-2 h-4 w-4" /> Paramètres</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate({ to: "/app/billing" })}><CreditCard className="mr-2 h-4 w-4" /> Facturation</DropdownMenuItem>
            {auth.hasRole("admin") && (
              <DropdownMenuItem onSelect={() => navigate({ to: "/admin" })}><ShieldCheck className="mr-2 h-4 w-4" /> Console admin</DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => { auth.logout(); navigate({ to: "/" }); }} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
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
    <div className="border-b border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-3 flex items-center gap-1.5 text-xs text-muted-foreground">
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
            <h1 className="truncate text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function PageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8", className)}>{children}</div>;
}

export { Menu as MobileMenuIcon, X as MobileCloseIcon };
