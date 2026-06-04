import * as React from "react";
import { createFileRoute, Outlet, useLocation, useNavigate } from "@tanstack/react-router";
import { PageContent, PageHeader } from "@/components/app/AppLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/settings")({
  head: () => ({ meta: [{ title: "Settings | Hostiq" }] }),
  component: SettingsShell,
});

const SECTIONS = [
  { to: "/app/settings/profile", label: "Profile" },
  { to: "/app/settings/security", label: "Account Security" },
  { to: "/app/settings/preferences", label: "Appearance" },
  { to: "/app/settings/integrations", label: "Integrations" },
  { to: "/app/settings/danger", label: "Delete Account" },
];

function SettingsShell() {
  const loc = useLocation();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (loc.pathname === "/app/settings") navigate({ to: "/app/settings/profile", replace: true });
  }, [loc.pathname, navigate]);

  return (
    <>
      <PageHeader title="Account settings" description="Manage profile, security, appearance and integrations." />
      <PageContent>
        <div className="grid gap-6 lg:grid-cols-[1fr_220px]">
          <div className="min-w-0"><Outlet /></div>
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-0.5 rounded-md border border-border bg-card p-2">
              {SECTIONS.map((s) => {
                const active = loc.pathname === s.to;
                return (
                  <button key={s.to} onClick={() => navigate({ to: s.to })}
                    className={cn("block w-full rounded px-3 py-1.5 text-left text-sm transition-colors",
                      active ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-accent/60 hover:text-foreground")}>
                    {s.label}
                  </button>
                );
              })}
            </div>
          </aside>
        </div>
      </PageContent>
    </>
  );
}
