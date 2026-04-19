import { createFileRoute, Outlet, Link, useLocation } from "@tanstack/react-router";
import { PageHeader } from "@/components/app/AppLayout";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/billing")({
  head: () => ({ meta: [{ title: "Facturation | Hostiq" }] }),
  component: BillingShell,
});

const TABS = [
  { to: "/app/billing", label: "Vue d'ensemble" },
  { to: "/app/billing/plan", label: "Plan & add-ons" },
  { to: "/app/billing/invoices", label: "Factures" },
  { to: "/app/billing/payment-methods", label: "Moyens de paiement" },
  { to: "/app/billing/usage", label: "Consommation" },
];

function BillingShell() {
  const loc = useLocation();
  return (
    <>
      <PageHeader title="Facturation" description="Gérez votre plan, vos factures et moyens de paiement." />
      <div className="border-b border-border bg-surface/30">
        <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 md:px-6">
          {TABS.map((t) => {
            const active = loc.pathname === t.to;
            return (
              <Link key={t.to} to={t.to} className={cn("border-b-2 px-3 py-3 text-sm font-medium whitespace-nowrap transition-colors",
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
