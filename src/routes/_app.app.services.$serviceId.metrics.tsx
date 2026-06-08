import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMetrics } from "@/api/render/services.functions";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/services/$serviceId/metrics")({
  head: () => ({ meta: [{ title: "Metrics | Hostiq" }] }),
  component: MetricsPage,
});

const METRICS: Array<{ key: any; label: string; unit?: string; color: string }> = [
  { key: "cpu", label: "CPU", unit: "%", color: "hsl(var(--primary))" },
  { key: "memory", label: "Memory", unit: "MB", color: "hsl(var(--success))" },
  { key: "instance_count", label: "Instances", color: "hsl(var(--warning))" },
  { key: "http_request_count", label: "HTTP Requests", color: "hsl(var(--primary))" },
  { key: "http_latency", label: "HTTP Latency", unit: "ms", color: "hsl(var(--success))" },
  { key: "bandwidth", label: "Bandwidth", unit: "MB", color: "hsl(var(--warning))" },
];

const RANGES = [
  { v: 1, l: "1h" }, { v: 6, l: "6h" }, { v: 24, l: "24h" }, { v: 24 * 7, l: "7d" },
];

function MetricsPage() {
  const { serviceId } = Route.useParams();
  const [range, setRange] = React.useState(24);

  return (
    <>
      <PageHeader
        title="Metrics"
        description="CPU, memory, requests and bandwidth."
        actions={
          <div className="inline-flex rounded-md border border-border bg-card p-0.5">
            {RANGES.map((r) => (
              <button key={r.v} onClick={() => setRange(r.v)}
                className={cn("rounded px-2.5 py-1 text-xs font-medium",
                  range === r.v ? "bg-accent text-foreground" : "text-muted-foreground hover:text-foreground")}>
                {r.l}
              </button>
            ))}
          </div>
        }
      />
      <PageContent>
        <div className="grid gap-4 md:grid-cols-2">
          {METRICS.map((m) => <MetricCard key={m.key} serviceId={serviceId} range={range} {...m} />)}
        </div>
      </PageContent>
    </>
  );
}

function MetricCard({ serviceId, range, key: _k, label, unit, color, ...rest }: any) {
  const metric = rest.metric ?? _k ?? label.toLowerCase();
  const metricKey = (rest.key ?? metric) as string;
  const { data = [], isLoading } = useQuery({
    queryKey: ["svc", serviceId, "metric", metricKey, range],
    queryFn: () => getMetrics({ data: { id: serviceId, metric: metricKey as any, rangeHours: range } }) as Promise<any[]>,
    refetchInterval: 60000,
  });
  const points = (data as any[]).map((p) => ({
    t: new Date(p.timestamp ?? p.time ?? Date.now()).getTime(),
    v: typeof p.value === "number" ? p.value : Number(p.value ?? 0),
  }));
  const last = points[points.length - 1]?.v;
  const avg = points.length ? points.reduce((s, p) => s + p.v, 0) / points.length : 0;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="mb-2 flex items-baseline justify-between">
          <div>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-0.5 text-lg font-semibold tabular-nums">
              {last != null ? `${last.toFixed(metricKey === "cpu" ? 1 : 0)}${unit ?? ""}` : "—"}
            </p>
          </div>
          <p className="text-[11px] text-muted-foreground tabular-nums">avg {avg.toFixed(1)}{unit ?? ""}</p>
        </div>
        <div className="h-32">
          {isLoading ? (
            <div className="flex h-full items-center justify-center"><Loader2 className="h-4 w-4 animate-spin text-muted-foreground" /></div>
          ) : points.length === 0 ? (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={points} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id={`g-${metricKey}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.35} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="hsl(var(--border))" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="t" tickFormatter={(v) => new Date(v).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                       stroke="hsl(var(--muted-foreground))" fontSize={10} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={10} width={32} />
                <Tooltip contentStyle={{ background: "hsl(var(--popover))", border: "1px solid hsl(var(--border))", fontSize: 12 }}
                         labelFormatter={(v) => new Date(v as number).toLocaleString()} />
                <Area type="monotone" dataKey="v" stroke={color} strokeWidth={2} fill={`url(#g-${metricKey})`} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
