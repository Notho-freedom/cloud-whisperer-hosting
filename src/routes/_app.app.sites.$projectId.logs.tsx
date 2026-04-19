import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_app/app/sites/$projectId/logs")({
  component: Logs,
});

const SAMPLE = Array.from({ length: 30 }).map((_, i) => ({
  ts: `2025-04-19T09:${String(40 - i).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}Z`,
  level: i % 9 === 0 ? "ERROR" : i % 5 === 0 ? "WARN" : "INFO",
  msg: [
    "GET / 200 12ms",
    "POST /api/checkout 200 87ms",
    "GET /blog/article-12 200 42ms",
    "GET /api/auth/session 200 8ms",
    "POST /api/contact 422 14ms validation_error",
    "Webhook stripe.subscription.updated processed",
  ][i % 6],
}));

function Logs() {
  return (
    <PageContent>
      <Card className="p-3">
        <div className="flex gap-2">
          <Input placeholder="Filtrer les logs…" className="font-mono" />
          <Button variant="outline" size="sm">Live</Button>
        </div>
      </Card>
      <Card className="mt-4 overflow-hidden">
        <pre className="overflow-auto p-4 font-mono text-xs leading-relaxed">
          {SAMPLE.map((l, i) => (
            <div key={i} className="flex gap-3">
              <span className="text-muted-foreground">{l.ts.slice(11, 19)}</span>
              <Badge variant={l.level === "ERROR" ? "destructive" : l.level === "WARN" ? "warning" : "secondary"} className="h-4 px-1.5 text-[9px]">{l.level}</Badge>
              <span className="text-foreground/80">{l.msg}</span>
            </div>
          ))}
        </pre>
      </Card>
    </PageContent>
  );
}
