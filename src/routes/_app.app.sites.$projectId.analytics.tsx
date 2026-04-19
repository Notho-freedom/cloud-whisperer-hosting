import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, MousePointerClick, Zap, Globe2 } from "lucide-react";

export const Route = createFileRoute("/_app/app/sites/$projectId/analytics")({
  component: Analytics,
});

function Analytics() {
  const stats = [
    { icon: Eye, label: "Visiteurs uniques", value: "12 482", delta: "+8.2%" },
    { icon: MousePointerClick, label: "Pages vues", value: "48 921", delta: "+5.1%" },
    { icon: Zap, label: "LCP médian", value: "1.2s", delta: "Excellent" },
    { icon: Globe2, label: "Top pays", value: "🇫🇷 France", delta: "61%" },
  ];
  return (
    <PageContent className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}><CardContent className="p-5">
            <div className="flex items-center justify-between"><span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span><s.icon className="h-4 w-4 text-muted-foreground" /></div>
            <p className="mt-3 text-2xl font-semibold">{s.value}</p>
            <p className="mt-1 text-xs text-success">{s.delta}</p>
          </CardContent></Card>
        ))}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Trafic — 30 derniers jours</CardTitle></CardHeader>
        <CardContent>
          <div className="h-64 rounded-md bg-gradient-to-t from-primary/15 to-transparent flex items-end gap-1 p-4">
            {Array.from({ length: 30 }).map((_, i) => (
              <div key={i} className="flex-1 rounded-sm bg-primary/60" style={{ height: `${20 + Math.sin(i / 3) * 30 + (i % 7) * 8}%` }} />
            ))}
          </div>
        </CardContent>
      </Card>
    </PageContent>
  );
}
