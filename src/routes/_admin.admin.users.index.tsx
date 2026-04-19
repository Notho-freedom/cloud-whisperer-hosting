import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Search, MoreHorizontal } from "lucide-react";
import { ADMIN_USERS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/users/")({
  component: UsersList,
});

function UsersList() {
  return (
    <>
      <AdminPageHeader title="Utilisateurs" description={`${ADMIN_USERS.length} comptes actifs`} actions={<Button variant="outline">Exporter CSV</Button>} />
      <AdminPageContent>
        <Card>
          <div className="border-b border-border p-4 flex gap-2">
            <div className="relative flex-1 max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Rechercher email…" className="pl-9" /></div>
            <Button variant="outline" size="sm">Filtres</Button>
          </div>
          <Table>
            <TableHeader><TableRow><TableHead>Utilisateur</TableHead><TableHead>Plan</TableHead><TableHead>MRR</TableHead><TableHead>Sites</TableHead><TableHead>Domaines</TableHead><TableHead>Statut</TableHead><TableHead></TableHead></TableRow></TableHeader>
            <TableBody>
              {ADMIN_USERS.map((u) => (
                <TableRow key={u.id}>
                  <TableCell><Link to="/admin/users/$userId" params={{ userId: u.id }} className="hover:text-primary"><p className="font-medium text-sm">{u.name}</p><p className="text-xs text-muted-foreground">{u.email}</p></Link></TableCell>
                  <TableCell><Badge variant="outline">{u.plan}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{u.mrr} €</TableCell>
                  <TableCell className="font-mono text-sm">{u.sites}</TableCell>
                  <TableCell className="font-mono text-sm">{u.domains}</TableCell>
                  <TableCell><StatusBadge status={u.status} /></TableCell>
                  <TableCell><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
