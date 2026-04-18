import { createFileRoute, Outlet, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_marketing/legal")({
  component: LegalLayout,
});

const LEGAL = [
  { to: "/legal/terms", label: "Conditions" },
  { to: "/legal/privacy", label: "Confidentialité" },
  { to: "/legal/cookies", label: "Cookies" },
  { to: "/legal/sla", label: "SLA" },
] as const;

function LegalLayout() {
  return (
    <div className="container mx-auto max-w-6xl px-4 py-16">
      <div className="grid gap-10 md:grid-cols-[200px_1fr]">
        <aside>
          <h2 className="text-sm font-semibold">Légal</h2>
          <nav className="mt-4 flex flex-col gap-1">
            {LEGAL.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                className="rounded-md px-3 py-1.5 text-sm text-muted-foreground hover:bg-accent hover:text-foreground"
                activeProps={{ className: "bg-accent text-foreground" }}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </aside>
        <div className="prose prose-invert max-w-none">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
