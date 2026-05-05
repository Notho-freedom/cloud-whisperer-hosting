import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { adminListSites } from "@/api/admin-api";

export const Route = createFileRoute("/_admin/admin/sites")({ component: AdminSites });

function AdminSites() {
  const { data: sites = [], isLoading } = useQuery({ queryKey: ["admin", "sites"], queryFn: () => adminListSites() });
  return (
    <>
      <AdminPageHeader title="Sites" description={`${sites.length} projets hébergés`} />
      <AdminPageContent>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Nom</TableHead><TableHead>Framework</TableHead><TableHead>Repo</TableHead><TableHead>Région</TableHead><TableHead>Créé le</TableHead></TableRow></TableHeader>
            <TableBody>
              {sites.map((s: { id: string; name: string; framework: string | null; git_repo: string | null; region: string | null; created_at: string }) => (
                <TableRow key={s.id}>
                  <TableCell className="font-medium">{s.name}</TableCell>
                  <TableCell><Badge variant="outline">{s.framework ?? "—"}</Badge></TableCell>
                  <TableCell className="font-mono text-xs">{s.git_repo ?? "—"}</TableCell>
                  <TableCell className="font-mono text-xs">{s.region ?? "—"}</TableCell>
                  <TableCell className="text-sm">{new Date(s.created_at).toLocaleDateString("fr-FR")}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
