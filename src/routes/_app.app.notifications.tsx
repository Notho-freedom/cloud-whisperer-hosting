import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle2, CreditCard, Globe2 } from "lucide-react";
import { NOTIFICATIONS } from "@/lib/mocks";
import { cn } from "@/lib/utils";

const ICONS = { deploy: CheckCircle2, domain: Globe2, billing: CreditCard, security: AlertTriangle, system: Bell };

export const Route = createFileRoute("/_app/app/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  return (
    <>
      <PageHeader title="Notifications" actions={<Button variant="outline">Marquer tout comme lu</Button>} />
      <PageContent>
        <Card>
          <div className="divide-y divide-border">
            {NOTIFICATIONS.map((n) => {
              const Icon = ICONS[n.type];
              return (
                <div key={n.id} className={cn("flex items-start gap-3 p-4", !n.read && "bg-primary/5")}>
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("fr-FR")}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2" />}
                </div>
              );
            })}
          </div>
        </Card>
      </PageContent>
    </>
  );
}
