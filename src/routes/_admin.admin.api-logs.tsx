import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { API_LOGS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/api-logs")({
  component: ApiLogs,
});

function ApiLogs() {
  return (
    <>
      <AdminPageHeader title="Logs API" description="Tous les appels sortants vers les providers." />
      <AdminPageContent>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Heure</TableHead><TableHead>Provider</TableHead><TableHead>Endpoint</TableHead><TableHead>Statut</TableHead><TableHead>Latence</TableHead><TableHead>User</TableHead></TableRow></TableHeader>
            <TableBody>
              {API_LOGS.map((l) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{l.ts.slice(11, 19)}</TableCell>
                  <TableCell><Badge variant="outline">{l.provider}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.endpoint}</TableCell>
                  <TableCell><Badge variant={l.status >= 500 ? "destructive" : l.status >= 400 ? "warning" : "success"} className="font-mono">{l.status}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.latencyMs}ms</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{l.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
