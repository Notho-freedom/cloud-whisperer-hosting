import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { adminGetUser, adminSetRole } from "@/api/admin-api";

export const Route = createFileRoute("/_admin/admin/users/$userId")({ component: UserDetail });

function UserDetail() {
  const { userId } = Route.useParams();
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "user", userId],
    queryFn: () => adminGetUser({ data: { id: userId } }),
  });
  const setRole = useMutation({
    mutationFn: (role: "user" | "admin" | "support") => adminSetRole({ data: { userId, role } }),
    onSuccess: () => { toast.success("Rôle mis à jour"); qc.invalidateQueries({ queryKey: ["admin", "user", userId] }); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (isLoading) return <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>;
  const profile = data?.profile;
  const roles = data?.roles ?? [];
  const orgs = data?.orgs ?? [];

  return (
    <>
      <AdminPageHeader
        title={profile?.name ?? profile?.email ?? "Utilisateur"}
        description={profile?.email ?? ""}
        actions={<>
          <Button variant="outline" size="sm" onClick={() => setRole.mutate("admin")} disabled={setRole.isPending}>Promouvoir admin</Button>
          <Button variant="outline" size="sm" onClick={() => setRole.mutate("support")} disabled={setRole.isPending}>Support</Button>
          <Button variant="outline" size="sm" onClick={() => setRole.mutate("user")} disabled={setRole.isPending}>User</Button>
        </>}
      />
      <AdminPageContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Card><CardContent className="p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Rôles</p><div className="mt-2 flex gap-1.5 flex-wrap">{roles.map((r) => <Badge key={r.role} variant="outline">{r.role}</Badge>)}</div></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Organisations</p><p className="mt-1.5 text-lg font-semibold">{orgs.length}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-xs uppercase tracking-wider text-muted-foreground">Inscription</p><p className="mt-1.5 text-sm">{profile?.created_at ? new Date(profile.created_at).toLocaleDateString("fr-FR") : "—"}</p></CardContent></Card>
        </div>
      </AdminPageContent>
    </>
  );
}
