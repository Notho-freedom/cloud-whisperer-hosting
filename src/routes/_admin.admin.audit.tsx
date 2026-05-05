import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { adminListAuditLog } from "@/api/admin-api";

export const Route = createFileRoute("/_admin/admin/audit")({ component: AuditPage });

function AuditPage() {
  const { data: logs = [], isLoading } = useQuery({ queryKey: ["admin", "audit"], queryFn: () => adminListAuditLog() });
  return (
    <>
      <AdminPageHeader title="Audit trail" description="Historique immuable des actions." />
      <AdminPageContent>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Timestamp</TableHead><TableHead>Acteur</TableHead><TableHead>Action</TableHead><TableHead>Cible</TableHead><TableHead>IP</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((a: { id: string; created_at: string; actor_email: string | null; action: string; target: string | null; ip: string | null }) => (
                <TableRow key={a.id}>
                  <TableCell className="font-mono text-xs">{new Date(a.created_at).toLocaleString("fr-FR")}</TableCell>
                  <TableCell className="text-sm">{a.actor_email ?? "—"}</TableCell>
                  <TableCell><Badge variant="outline" className="font-mono">{a.action}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{a.target ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">{a.ip ?? "—"}</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !isLoading && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">Aucune action enregistrée</TableCell></TableRow>}
            </TableBody>
          </Table>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
