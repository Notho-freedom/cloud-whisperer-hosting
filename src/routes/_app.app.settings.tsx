import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/settings")({
  head: () => ({ meta: [{ title: "Paramètres | Hostiq" }] }),
  component: SettingsShell,
});

const TABS = [
  { to: "/app/settings/profile", label: "Profil" },
  { to: "/app/settings/security", label: "Sécurité" },
  { to: "/app/settings/preferences", label: "Préférences" },
  { to: "/app/settings/integrations", label: "Intégrations" },
  { to: "/app/settings/danger", label: "Danger zone" },
];

function SettingsShell() {
  const loc = useLocation();
  return (
    <>
      <PageHeader title="Paramètres" />
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 md:px-6">
          {TABS.map((t) => {
            const active = loc.pathname === t.to;
            return (
              <Link key={t.to} to={t.to} className={cn("border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap",
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
