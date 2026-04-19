import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { SITES } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/sites")({
  component: AdminSites,
});

function AdminSites() {
  return (
    <>
      <AdminPageHeader title="Sites" description={`${SITES.length} projets hébergés`} />
      <AdminPageContent>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Framework</TableHead><TableHead>Repo</TableHead><TableHead>Région</TableHead><TableHead>Créé le</TableHead></TableRow></TableHeader>
            <TableBody>
              {SITES.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline">{s.framework}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{s.gitRepo}</TableCell>
                  <TableCell className="font-mono text-xs">{s.region}</TableCell>
                  <TableCell className="text-sm">{new Date(s.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
