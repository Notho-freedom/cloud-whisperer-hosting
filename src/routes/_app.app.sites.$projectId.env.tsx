import { createFileRoute } from "@tanstack/react-router";
import { PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Eye, Plus, Trash2 } from "lucide-react";
import { ENV_VARS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/sites/$projectId/env")({
  component: EnvVars,
});

function EnvVars() {
  return (
    <PageContent className="space-y-6">
      <Card className="p-4">
        <div className="grid gap-2 sm:grid-cols-[1fr_2fr_auto]">
          <Input placeholder="KEY" className="font-mono" />
          <Input placeholder="value" className="font-mono" />
          <Button><Plus className="h-4 w-4" />Ajouter</Button>
        </div>
      </Card>
      <Card>
        <div className="divide-y divide-border">
          {ENV_VARS.map((e) => (
            <div key={e.id} className="flex items-center gap-3 p-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-medium">{e.key}</span>
                  {e.type === "secret" && <Badge variant="outline" className="text-[10px]">SECRET</Badge>}
                </div>
                <p className="font-mono text-xs text-muted-foreground truncate">{e.value}</p>
                <div className="mt-1 flex gap-1">
                  {e.target.map((t) => <Badge key={t} variant="secondary" className="text-[10px]">{t}</Badge>)}
                </div>
              </div>
              <Button variant="ghost" size="icon"><Eye className="h-3.5 w-3.5" /></Button>
              <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
            </div>
          ))}
        </div>
      </Card>
    </PageContent>
  );
}
