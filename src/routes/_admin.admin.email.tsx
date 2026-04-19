import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { MAILBOXES } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/email")({
  component: AdminEmail,
});

function AdminEmail() {
  return (
    <>
      <AdminPageHeader title="Boîtes mail" description={`${MAILBOXES.length} boîtes — tous providers`} />
      <AdminPageContent>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Adresse</TableHead><TableHead>Provider</TableHead><TableHead>Plan</TableHead><TableHead>Quota</TableHead></TableRow></TableHeader>
            <TableBody>
              {MAILBOXES.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono">{m.address}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{m.provider}</Badge></TableCell>
                  <TableCell className="text-sm">{m.plan}</TableCell>
                  <TableCell className="font-mono text-xs">{m.usedGb}/{m.quotaGb} GB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
