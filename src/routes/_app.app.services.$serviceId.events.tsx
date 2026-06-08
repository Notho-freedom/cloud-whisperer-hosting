import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Activity, Rocket, AlertCircle, Pause, Play, GitCommit, ScrollText } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listEvents } from "@/api/render/services.functions";

export const Route = createFileRoute("/_app/app/services/$serviceId/events")({
  head: () => ({ meta: [{ title: "Events | Hostiq" }] }),
  component: EventsPage,
});

function iconFor(type: string) {
  if (type?.includes("deploy")) return Rocket;
  if (type?.includes("crash") || type?.includes("fail")) return AlertCircle;
  if (type?.includes("suspend")) return Pause;
  if (type?.includes("resume") || type?.includes("live")) return Play;
  if (type?.includes("commit")) return GitCommit;
  if (type?.includes("log")) return ScrollText;
  return Activity;
}

function EventsPage() {
  const { serviceId } = Route.useParams();
  const { data = [], isLoading } = useQuery({
    queryKey: ["svc", serviceId, "events"],
    queryFn: () => listEvents({ data: { serviceId, limit: 100 } }) as Promise<any[]>,
    refetchInterval: 30000,
  });

  // Group by day
  const groups = new Map<string, any[]>();
  for (const ev of data as any[]) {
    const at = ev.timestamp ?? ev.occurred_at ?? new Date().toISOString();
    const day = new Date(at).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" });
    if (!groups.has(day)) groups.set(day, []);
    groups.get(day)!.push({ ...ev, _at: at });
  }

  return (
    <>
      <PageHeader title="Events" description="Service lifecycle, deploys, scaling and incidents." />
      <PageContent>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : data.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">No events yet.</Card>
        ) : (
          <div className="space-y-6">
            {[...groups.entries()].map(([day, evs]) => (
              <div key={day}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{day}</p>
                <Card className="divide-y divide-border">
                  {evs.map((ev, i) => {
                    const Icon = iconFor(ev.type ?? "");
                    return (
                      <div key={ev.id ?? i} className="flex items-start gap-3 p-3">
                        <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
                          <Icon className="h-3.5 w-3.5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{(ev.type ?? "event").replace(/_/g, " ")}</p>
                          {ev.details && typeof ev.details === "object" && Object.keys(ev.details).length > 0 && (
                            <pre className="mt-1 overflow-x-auto rounded bg-muted/40 px-2 py-1 text-[11px] text-muted-foreground">{JSON.stringify(ev.details, null, 0).slice(0, 200)}</pre>
                          )}
                        </div>
                        <Badge variant="outline" className="text-[10px] tabular-nums">
                          {new Date(ev._at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </Badge>
                      </div>
                    );
                  })}
                </Card>
              </div>
            ))}
          </div>
        )}
      </PageContent>
    </>
  );
}
