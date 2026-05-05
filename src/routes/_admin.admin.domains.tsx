import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { Loader2 } from "lucide-react";
import { adminListDomains } from "@/api/admin-api.server";

export const Route = createFileRoute("/_admin/admin/domains")({ component: AdminDomains });

function AdminDomains() {
  const { data: domains = [], isLoading } = useQuery({ queryKey: ["admin", "domains"], queryFn: () => adminListDomains() });
  return (
    <>
      <AdminPageHeader title="Domaines" description={`${domains.length} domaines vendus via PlanetHoster`} />
      <AdminPageContent>
        <Card>
          {isLoading ? <div className="p-12 flex justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div> : (
          <Table>
            <TableHeader><TableRow><TableHead>Domaine</TableHead><TableHead>TLD</TableHead><TableHead>Statut</TableHead><TableHead>Expire</TableHead><TableHead>Prix/an</TableHead></TableRow></TableHeader>
            <TableBody>
              {domains.map((d: { name: string; tld: string; status: string; expires_at: string | null; price_per_year: number | null }) => (
                <TableRow key={d.name}>
                  <TableCell className="font-mono">{d.name}</TableCell>
                  <TableCell>{d.tld}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="text-sm">{d.expires_at ? new Date(d.expires_at).toLocaleDateString("fr-FR") : "—"}</TableCell>
                  <TableCell className="font-mono">{d.price_per_year ?? 0} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>)}
        </Card>
      </AdminPageContent>
    </>
  );
}
