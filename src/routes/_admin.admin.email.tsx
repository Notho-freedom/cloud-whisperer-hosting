import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { adminListMailboxes } from "@/api/admin-api.server";

export const Route = createFileRoute("/_admin/admin/email")({ component: AdminEmail });

function AdminEmail() {
  const { data: mailboxes = [], isLoading } = useQuery({ queryKey: ["admin", "mailboxes"], queryFn: () => adminListMailboxes() });
  return (
    <>
      <AdminPageHeader title="Boîtes mail" description={`${mailboxes.length} boîtes — tous providers`} />
      <AdminPageContent>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Adresse</TableHead><TableHead>Provider</TableHead><TableHead>Plan</TableHead><TableHead>Quota</TableHead></TableRow></TableHeader>
            <TableBody>
              {mailboxes.map((m) => (
                <TableRow key={m.id}>
                  <TableCell className="font-mono">{m.address}</TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{m.provider}</Badge></TableCell>
                  <TableCell className="text-sm">{m.plan ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{m.used_gb ?? 0}/{m.quota_gb ?? 0} GB</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
