import { CheckCircle2, Globe2, Activity, GitBranch } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Mockup d'une console hébergement (style Vercel/Linear).
 * Utilisé dans le hero + landing pour une démo visuelle premium.
 */
export function ConsoleMockup({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative rounded-xl border border-border/60 bg-card shadow-xl shadow-primary/5 ring-1 ring-foreground/5",
        className,
      )}
    >
      {/* Window chrome */}
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
        <div className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning/60" />
          <span className="h-2.5 w-2.5 rounded-full bg-success/60" />
        </div>
        <div className="ml-3 flex-1 truncate rounded-md bg-muted/60 px-3 py-1 text-center font-mono text-[11px] text-muted-foreground">
          console.hostiq.io / projects / acme-landing
        </div>
      </div>

      <div className="grid grid-cols-[180px_1fr] divide-x divide-border/60 text-xs">
        {/* Sidebar */}
        <div className="space-y-1 p-3">
          {[
            { label: "Vue d'ensemble", active: true },
            { label: "Déploiements" },
            { label: "Domaines" },
            { label: "Variables" },
            { label: "Analytics" },
            { label: "Logs" },
            { label: "Paramètres" },
          ].map((i) => (
            <div
              key={i.label}
              className={cn(
                "rounded-md px-2 py-1.5 transition-colors",
                i.active
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-muted-foreground",
              )}
            >
              {i.label}
            </div>
          ))}
        </div>

        {/* Main */}
        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-mono text-sm font-semibold">acme-landing</div>
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                <Globe2 className="h-2.5 w-2.5" /> acme.com
                <span>·</span>
                <GitBranch className="h-2.5 w-2.5" /> main
              </div>
            </div>
            <span className="inline-flex items-center gap-1 rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-medium text-success">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Production · Live
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Visiteurs (24h)", value: "12.8k", trend: "+18%" },
              { label: "Latence p95", value: "42ms", trend: "−6ms" },
              { label: "Uptime 30j", value: "100%", trend: "SLA OK" },
            ].map((kpi) => (
              <div key={kpi.label} className="rounded-md border border-border/60 bg-background/60 p-2">
                <div className="text-[9px] uppercase tracking-wider text-muted-foreground">
                  {kpi.label}
                </div>
                <div className="mt-0.5 font-mono text-base font-semibold">{kpi.value}</div>
                <div className="text-[9px] text-success">{kpi.trend}</div>
              </div>
            ))}
          </div>

          <div className="rounded-md border border-border/60 bg-background/60 p-2">
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Déploiements récents
              </span>
              <Activity className="h-3 w-3 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              {[
                { sha: "f2d8a1c", msg: "feat: hero animation", t: "il y a 2m", ok: true },
                { sha: "8b1c40e", msg: "fix: form validation", t: "il y a 1h", ok: true },
                { sha: "c91e2f7", msg: "chore: deps", t: "il y a 4h", ok: true },
              ].map((d) => (
                <div key={d.sha} className="flex items-center gap-2 text-[10px]">
                  <CheckCircle2 className="h-3 w-3 text-success" />
                  <code className="font-mono text-muted-foreground">{d.sha}</code>
                  <span className="flex-1 truncate">{d.msg}</span>
                  <span className="text-muted-foreground">{d.t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
