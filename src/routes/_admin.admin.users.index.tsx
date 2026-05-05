import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Search, Loader2 } from "lucide-react";
import { adminListUsers } from "@/api/admin-api.server";

export const Route = createFileRoute("/_admin/admin/users/")({ component: UsersList });

function UsersList() {
  const { data: users = [], isLoading } = useQuery({
    queryKey: ["admin", "users"],
    queryFn: () => adminListUsers(),
  });
  return (
    <>
      <AdminPageHeader title="Utilisateurs" description={`${users.length} comptes`} actions={<Button variant="outline">Exporter CSV</Button>} />
      <AdminPageContent>
        <Card>
          <div className="border-b border-border p-4 flex gap-2">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher email…" className="pl-9" /></div>
          </div>
          {isLoading ? (
            <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Email</TableHead><TableHead>Inscrit le</TableHead></TableRow></TableHeader>
              <TableBody>
                {users.map((u: { id: string; email: string | null; name: string | null; created_at: string }) => (
                  <TableRow key={u.id}>
                    <TableCell><Link to="/admin/users/$userId" params={{ userId: u.id }} className="hover:text-primary font-medium text-sm">{u.name ?? "—"}</Link></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{u.email}</TableCell>
                    <TableCell className="text-sm">{new Date(u.created_at).toLocaleDateString("fr-FR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </AdminPageContent>
    </>
  );
}
