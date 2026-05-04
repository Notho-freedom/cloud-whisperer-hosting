import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, AlertTriangle, CheckCircle2, CreditCard, Globe2 } from "lucide-react";
import { listNotifications, markAllRead, markNotificationRead } from "@/api/notifications-api.server";
import { cn } from "@/lib/utils";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  deploy: CheckCircle2, domain: Globe2, billing: CreditCard, security: AlertTriangle, system: Bell,
};

export const Route = createFileRoute("/_app/app/notifications")({ component: NotificationsPage });

function NotificationsPage() {
  const qc = useQueryClient();
  const { data: list = [] } = useQuery({ queryKey: ["notifications"], queryFn: () => listNotifications() });
  const all = useMutation({ mutationFn: () => markAllRead(), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  const one = useMutation({ mutationFn: (id: string) => markNotificationRead({ data: { id } }), onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }) });
  return (
    <>
      <PageHeader title="Notifications" actions={<Button variant="outline" onClick={() => all.mutate()}>Marquer tout comme lu</Button>} />
      <PageContent>
        <Card>
          <div className="divide-y divide-border">
            {list.length === 0 && <p className="p-8 text-center text-sm text-muted-foreground">Aucune notification.</p>}
            {list.map((n) => {
              const Icon = ICONS[n.type] ?? Bell;
              return (
                <button key={n.id} onClick={() => !n.read && one.mutate(n.id)} className={cn("w-full text-left flex items-start gap-3 p-4 hover:bg-muted/30", !n.read && "bg-primary/5")}>
                  <Icon className="h-4 w-4 mt-0.5 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{new Date(n.created_at).toLocaleString("fr-FR")}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{n.body}</p>
                  </div>
                  {!n.read && <span className="h-2 w-2 rounded-full bg-primary mt-2" />}
                </button>
              );
            })}
          </div>
        </Card>
      </PageContent>
    </>
  );
}
