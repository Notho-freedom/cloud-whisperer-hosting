import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AUDIT_LOG } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/audit")({
  component: AuditPage,
});

function AuditPage() {
  return (
    <>
      <AdminPageHeader title="Audit trail" description="Historique immuable des actions." />
      <AdminPageContent>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Acteur</TableHead><TableHead>Action</TableHead><TableHead>Cible</TableHead><TableHead>IP</TableHead></TableRow></TableHeader>
            <TableBody>
              {AUDIT_LOG.map((a) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{new Date(a.ts).toLocaleString("fr-FR")}</TableCell>
                  <TableCell className="text-sm">{a.actor}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono">{a.action}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{a.target}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.ip}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
