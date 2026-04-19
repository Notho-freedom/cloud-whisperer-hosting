import * as React from "react";
import { Link, useLocation, useNavigate, Outlet } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Users,
  Globe2,
  Server,
  Mail,
  Receipt,
  PackageOpen,
  LifeBuoy,
  Plug,
  ScrollText,
  Activity,
  Megaphone,
  FileText,
  ShieldAlert,
  Settings,
  ArrowLeft,
  Menu,
  Search,
  ChevronDown,
  LogOut,
} from "lucide-react";
import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NAV: Array<{
  label: string;
  items: Array<{ to: string; label: string; icon: React.ComponentType<{ className?: string }> }>;
}> = [
  {
    label: "Vue globale",
    items: [
      { to: "/admin", label: "Dashboard", icon: LayoutDashboard },
      { to: "/admin/audit", label: "Audit trail", icon: ScrollText },
      { to: "/admin/api-logs", label: "Logs API", icon: Activity },
    ],
  },
  {
    label: "Utilisateurs & Ressources",
    items: [
      { to: "/admin/users", label: "Utilisateurs", icon: Users },
      { to: "/admin/domains", label: "Domaines", icon: Globe2 },
      { to: "/admin/sites", label: "Sites", icon: Server },
      { to: "/admin/email", label: "Boîtes mail", icon: Mail },
    ],
  },
  {
    label: "Commerce",
    items: [
      { to: "/admin/billing", label: "Revenus & factures", icon: Receipt },
      { to: "/admin/plans", label: "Plans & promos", icon: PackageOpen },
    ],
  },
  {
    label: "Opérations",
    items: [
      { to: "/admin/support", label: "Support", icon: LifeBuoy },
      { to: "/admin/providers", label: "Providers", icon: Plug },
      { to: "/admin/status", label: "Status & incidents", icon: ShieldAlert },
      { to: "/admin/announcements", label: "Annonces", icon: Megaphone },
      { to: "/admin/blog", label: "Blog", icon: FileText },
      { to: "/admin/settings", label: "Paramètres", icon: Settings },
    ],
  },
];

export function AdminLayout() {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-sidebar lg:block">
        <Sidebar />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" />
          <aside
            className="absolute left-0 top-0 h-full w-72 border-r border-border bg-sidebar"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onNavigate={() => setOpen(false)} />
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onOpen={() => setOpen(true)} />
        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const location = useLocation();
  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-5">
        <Link to="/admin" onClick={onNavigate} className="flex items-center gap-2">
          <Logo withWordmark={false} size={26} />
          <span className="text-sm font-semibold tracking-tight">
            Hostiq <span className="text-destructive">Admin</span>
          </span>
        </Link>
      </div>

      <div className="px-3 py-4">
        <Link to="/app" onClick={onNavigate}>
          <Button variant="outline" size="sm" className="w-full justify-start gap-2">
            <ArrowLeft className="h-4 w-4" /> Retour console
          </Button>
        </Link>
      </div>

      <nav className="flex-1 space-y-5 overflow-y-auto px-3 pb-4">
        {NAV.map((group) => (
          <div key={group.label}>
            <p className="px-2 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
              {group.label}
            </p>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const active =
                  item.to === "/admin"
                    ? location.pathname === "/admin"
                    : location.pathname.startsWith(item.to);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      "flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-destructive/10 text-destructive"
                        : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground",
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="border-t border-sidebar-border p-3">
        <div className="rounded-md bg-destructive/5 p-3 text-xs text-destructive">
          <p className="font-semibold">Mode administration</p>
          <p className="mt-1 text-destructive/80">
            Toutes vos actions sont enregistrées dans l'audit trail.
          </p>
        </div>
      </div>
    </div>
  );
}

function Header({ onOpen }: { onOpen: () => void }) {
  const auth = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur md:px-6">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onOpen} aria-label="Menu">
        <Menu className="h-5 w-5" />
      </Button>

      <Badge variant="destructive" className="hidden md:inline-flex">
        ADMIN
      </Badge>

      <div className="relative hidden flex-1 max-w-md md:block">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Rechercher utilisateur, domaine, ticket…" className="h-9 pl-9" />
      </div>

      <div className="ml-auto flex items-center gap-1.5">
        <ThemeToggle />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 rounded-md p-1 hover:bg-accent">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-destructive text-xs font-semibold text-destructive-foreground">
                A
              </div>
              <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>{auth.user?.email || "admin"}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate({ to: "/app" })}>
              Quitter le mode admin
            </DropdownMenuItem>
            <DropdownMenuItem
              onSelect={() => {
                auth.logout();
                navigate({ to: "/" });
              }}
              className="text-destructive focus:text-destructive"
            >
              <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}

export function AdminPageHeader({
  title,
  description,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="border-b border-border bg-surface/50">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
            {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
          </div>
          {actions && <div className="flex shrink-0 gap-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
}

export function AdminPageContent({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8", className)}>{children}</div>;
}
