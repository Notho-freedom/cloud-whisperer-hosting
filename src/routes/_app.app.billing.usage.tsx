import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/_app/app/billing/usage")({
  component: UsagePage,
});

const USAGE = [
  { k: "Bande passante", used: 240, max: 1000, suffix: " GB", price: "10 € / 100 GB sup." },
  { k: "Builds Vercel", used: 412, max: 1000, suffix: "", price: "incl." },
  { k: "Requêtes API", used: 28000, max: 100000, suffix: "", price: "incl." },
  { k: "Stockage email", used: 18.1, max: 90, suffix: " GB", price: "1 € / GB sup." },
];

function UsagePage() {
  return (
    <PageContent className="space-y-4">
      {USAGE.map((u) => (
        <Card key={u.k}><CardHeader><CardTitle className="text-base flex items-center justify-between">{u.k}<span className="text-xs font-normal text-muted-foreground">{u.price}</span></CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-baseline justify-between"><span className="text-2xl font-semibold font-mono">{u.used.toLocaleString("fr-FR")}{u.suffix}</span><span className="text-sm text-muted-foreground">/ {u.max.toLocaleString("fr-FR")}{u.suffix}</span></div>
            <Progress value={(u.used / u.max) * 100} className="mt-3" />
          </CardContent>
        </Card>
      ))}
    </PageContent>
  );
}
