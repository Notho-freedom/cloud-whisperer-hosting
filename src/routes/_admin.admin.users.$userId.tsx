import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ADMIN_USERS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/users/$userId")({
  component: UserDetail,
});

function UserDetail() {
  const { userId } = Route.useParams();
  const u = ADMIN_USERS.find((x) => x.id === userId) ?? ADMIN_USERS[0];
  return (
    <>
      <AdminPageHeader title={u.name} description={u.email} actions={<><Button variant="outline">Impersonate</Button><Button variant="outline" className="text-destructive">Suspendre</Button></>} />
      <AdminPageContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-4">
          {[["Plan", u.plan], ["MRR", `${u.mrr} €`], ["Sites", u.sites], ["Domaines", u.domains]].map(([l, v]) => (
            <Card key={l as string}><CardContent className="p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">{l}</p><p className="mt-1.5 text-lg font-semibold">{v}</p></CardContent></Card>
          ))}
        </div>
        <Card><CardContent className="p-6"><p className="text-sm text-muted-foreground">Inscription: {u.since}</p><Badge variant={u.status === "active" ? "success" : "destructive"} className="mt-2">{u.status}</Badge></CardContent></Card>
      </AdminPageContent>
    </>
  );
}
