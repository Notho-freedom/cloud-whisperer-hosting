import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Search, Pause, Play, Copy, Download } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { listLogs } from "@/api/render/services.functions";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app/app/services/$serviceId/logs")({
  head: () => ({ meta: [{ title: "Logs | Hostiq" }] }),
  component: LogsPage,
});

function levelClass(level?: string) {
  const l = (level ?? "").toLowerCase();
  if (l === "error" || l === "fatal") return "text-destructive";
  if (l === "warn" || l === "warning") return "text-warning";
  if (l === "info") return "text-foreground";
  return "text-muted-foreground";
}

function LogsPage() {
  const { serviceId } = Route.useParams();
  const [paused, setPaused] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  React.useEffect(() => { const t = setTimeout(() => setDebounced(search), 400); return () => clearTimeout(t); }, [search]);

  const { data = [], isLoading, isFetching } = useQuery({
    queryKey: ["svc", serviceId, "logs", debounced],
    queryFn: () => listLogs({ data: { id: serviceId, limit: 200, search: debounced || undefined } }) as Promise<any[]>,
    refetchInterval: paused ? false : 3000,
  });

  const logs = (data as any[]) ?? [];

  const copyAll = () => {
    const text = logs.map((l) => `${l.timestamp ?? ""} ${l.level ?? ""} ${l.message ?? l.text ?? ""}`).join("\n");
    navigator.clipboard.writeText(text);
    toast.success("Logs copied to clipboard");
  };
  const download = () => {
    const text = logs.map((l) => JSON.stringify(l)).join("\n");
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `logs-${serviceId}-${Date.now()}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <PageHeader
        title="Logs"
        description={
          <span className="inline-flex items-center gap-2">
            <span className={cn("inline-block h-1.5 w-1.5 rounded-full", paused ? "bg-muted-foreground" : "bg-success animate-pulse")} />
            {paused ? "Paused" : "Live (3s polling)"}
            {isFetching && !paused && <Loader2 className="h-3 w-3 animate-spin" />}
          </span>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setPaused((p) => !p)}>
              {paused ? <><Play className="h-3.5 w-3.5" /> Resume</> : <><Pause className="h-3.5 w-3.5" /> Pause</>}
            </Button>
            <Button variant="outline" size="sm" onClick={copyAll}><Copy className="h-3.5 w-3.5" /> Copy</Button>
            <Button variant="outline" size="sm" onClick={download}><Download className="h-3.5 w-3.5" /> Download</Button>
          </>
        }
      />
      <PageContent>
        <div className="mb-3 relative">
          <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Filter logs…" value={search} onChange={(e) => setSearch(e.target.value)} className="h-9 pl-8" />
        </div>
        <Card className="h-[calc(100vh-300px)] min-h-[400px] overflow-auto bg-[#0b0d10] p-3 font-mono text-[12px] leading-relaxed">
          {isLoading ? (
            <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /></div>
          ) : logs.length === 0 ? (
            <p className="py-12 text-center text-muted-foreground">No log lines.</p>
          ) : (
            logs.map((l: any, i: number) => (
              <div key={i} className="flex gap-3 py-0.5">
                <span className="shrink-0 text-muted-foreground/60 tabular-nums">{l.timestamp ? new Date(l.timestamp).toLocaleTimeString() : ""}</span>
                {l.level && <Badge variant="outline" className={cn("h-4 shrink-0 px-1 text-[9px] uppercase", levelClass(l.level))}>{l.level}</Badge>}
                <span className={cn("min-w-0 break-all", levelClass(l.level))}>{l.message ?? l.text ?? JSON.stringify(l)}</span>
              </div>
            ))
          )}
        </Card>
      </PageContent>
    </>
  );
}
