import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Rocket, GitBranch, Globe2, KeyRound, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { listSiteDeployments } from "@/api/sites-api";

export const Route = createFileRoute("/_app/app/sites/$projectId/events")({
  component: Events,
});

type Event = { id: string; type: "deploy" | "domain" | "env" | "status"; title: string; subtitle?: string; ts: string; status?: string };

function Events() {
  const { projectId } = Route.useParams();
  const { data, isLoading } = useQuery({ queryKey: ["deployments", projectId], queryFn: () => listSiteDeployments({ data: { siteId: projectId } }) });

  const events: Event[] = (data?.db ?? []).map((d) => ({
    id: d.id,
    type: "deploy" as const,
    title: d.status === "ready" ? "Deployment ready" : d.status === "error" ? "Deployment failed" : d.status === "building" ? "Build started" : "Deployment queued",
    subtitle: d.commit_msg ?? `Commit ${d.commit_sha?.slice(0, 7) ?? ""} on ${d.branch ?? "main"}`,
    ts: d.created_at,
    status: d.status,
  }));

  // group by day
  const groups: Record<string, Event[]> = {};
  for (const e of events) {
    const day = new Date(e.ts).toLocaleDateString("fr-FR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
    (groups[day] ??= []).push(e);
  }

  return (
    <PageContent className="space-y-6">
      {isLoading && <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>}
      {!isLoading && events.length === 0 && (
        <Card className="p-12 text-center text-sm text-muted-foreground">No events yet.</Card>
      )}
      {Object.entries(groups).map(([day, list]) => (
        <div key={day}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{day}</p>
          <Card className="divide-y divide-border">
            {list.map((e) => <EventRow key={e.id} e={e} />)}
          </Card>
        </div>
      ))}
    </PageContent>
  );
}

function EventRow({ e }: { e: Event }) {
  const Icon = e.type === "deploy" ? Rocket : e.type === "domain" ? Globe2 : e.type === "env" ? KeyRound : GitBranch;
  const tone = e.status === "ready" ? "text-success" : e.status === "error" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="flex items-start gap-3 p-4">
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted ${tone}`}>
        {e.status === "ready" ? <CheckCircle2 className="h-4 w-4" /> : e.status === "error" ? <AlertCircle className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{e.title}</p>
        {e.subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{e.subtitle}</p>}
      </div>
      <span className="shrink-0 text-[11px] text-muted-foreground">{new Date(e.ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}</span>
    </div>
  );
}
