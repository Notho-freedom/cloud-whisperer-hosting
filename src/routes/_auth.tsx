import { createFileRoute, Outlet, Link } from "@tanstack/react-router";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme-toggle";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col p-8">
        <div className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-md">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hostiq · <Link to="/legal/terms" className="hover:text-foreground">Conditions</Link>
        </p>
      </div>
      <div className="relative hidden overflow-hidden border-l border-border bg-card lg:block">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="absolute inset-0 bg-radial-emerald" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div />
          <div>
            <blockquote className="text-2xl font-semibold leading-snug">
              « Hostiq nous a fait gagner des semaines.<br />
              On déploie, on facture, on dort tranquille. »
            </blockquote>
            <p className="mt-4 text-sm text-muted-foreground">— Léa, CTO @ Acme</p>
          </div>
          <div className="flex gap-2 text-xs font-mono text-muted-foreground">
            <span>$ hostiq deploy</span>
            <span className="text-primary">✓ Live in 12s</span>
          </div>
        </div>
      </div>
    </div>
  );
}
