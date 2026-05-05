import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader2 } from "lucide-react";
import { adminListApiLogs } from "@/api/admin-api.server";

export const Route = createFileRoute("/_admin/admin/api-logs")({ component: ApiLogs });

function ApiLogs() {
  const { data: logs = [], isLoading } = useQuery({ queryKey: ["admin", "api-logs"], queryFn: () => adminListApiLogs(), refetchInterval: 30000 });
  return (
    <>
      <AdminPageHeader title="Logs API" description="Tous les appels sortants vers les providers." />
      <AdminPageContent>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Heure</TableHead><TableHead>Provider</TableHead><TableHead>Endpoint</TableHead><TableHead>Statut</TableHead><TableHead>Latence</TableHead></TableRow></TableHeader>
            <TableBody>
              {logs.map((l: { id: string; created_at: string; provider: string; endpoint: string; status: number | null; latency_ms: number | null }) => (
                <TableRow key={l.id}>
                  <TableCell className="font-mono text-xs">{new Date(l.created_at).toLocaleTimeString("fr-FR")}</TableCell>
                  <TableCell><Badge variant="outline">{l.provider}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.endpoint}</TableCell>
                  <TableCell><Badge variant={(l.status ?? 0) >= 500 ? "destructive" : (l.status ?? 0) >= 400 ? "warning" : "success"} className="font-mono">{l.status ?? "—"}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{l.latency_ms ?? 0}ms</TableCell>
                </TableRow>
              ))}
              {logs.length === 0 && !isLoading && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-12">Aucun appel récent</TableCell></TableRow>}
            </TableBody>
          </Table>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
