import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/StatusBadge";
import { ANNOUNCEMENTS } from "@/lib/mocks";
import { Plus } from "lucide-react";

export const Route = createFileRoute("/_admin/admin/announcements")({
  component: Announcements,
});

function Announcements() {
  return (
    <>
      <AdminPageHeader title="Annonces" description="Bannières & broadcasts email." actions={<Button><Plus className="h-4 w-4" />Nouvelle annonce</Button>} />
      <AdminPageContent className="space-y-3">
        {ANNOUNCEMENTS.map((a) => (
          <Card key={a.id}><CardContent className="flex items-start gap-4 p-5">
            <div className="flex-1"><p className="font-semibold">{a.title}</p><p className="text-sm text-muted-foreground mt-1">{a.body}</p><p className="text-xs text-muted-foreground mt-2">Audience: {a.audience} · Programmé: {new Date(a.scheduledAt).toLocaleString("fr-FR")}</p></div>
            <StatusBadge status={a.status} />
          </CardContent></Card>
        ))}
      </AdminPageContent>
    </>
  );
}
