import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { Logo } from "@/components/brand/Logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { useAuth } from "@/lib/auth";
import { Sparkles, Zap, Globe2, Shield } from "lucide-react";

export const Route = createFileRoute("/_auth")({
  component: AuthLayout,
});

function AuthLayout() {
  const auth = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (auth.isAuthenticated) {
      navigate({ to: "/app" });
    }
  }, [auth.isAuthenticated, navigate]);

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="flex flex-col p-6 md:p-10">
        <div className="flex items-center justify-between">
          <Link to="/"><Logo /></Link>
          <ThemeToggle />
        </div>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">
            <Outlet />
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Hostiq · <Link to="/legal/terms" className="hover:text-foreground">Conditions</Link> · <Link to="/legal/privacy" className="hover:text-foreground">Confidentialité</Link>
        </p>
      </div>
      <div className="relative hidden overflow-hidden border-l border-border bg-sidebar lg:block">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Sparkles className="h-4 w-4 text-primary" />
            La console que vos équipes attendaient
          </div>

          <div className="space-y-8">
            <blockquote className="text-3xl font-semibold leading-tight tracking-tight text-balance">
              « Hostiq nous a fait gagner des semaines.
              On déploie, on facture, on dort tranquille. »
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 font-mono text-sm font-bold text-primary">
                LM
              </div>
              <div>
                <p className="text-sm font-medium">Léa Martin</p>
                <p className="text-xs text-muted-foreground">CTO @ Acme Studio</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Zap, label: "Deploy < 30s" },
              { icon: Globe2, label: "100+ régions" },
              { icon: Shield, label: "SSL inclus" },
              { icon: Sparkles, label: "Support 24/7" },
            ].map((s) => (
              <div key={s.label} className="flex items-center gap-2 rounded-lg border border-border/60 bg-card/50 px-3 py-2 text-xs backdrop-blur">
                <s.icon className="h-3.5 w-3.5 text-primary" />
                <span className="font-medium">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
