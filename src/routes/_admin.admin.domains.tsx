import { createFileRoute } from "@tanstack/react-router";
import { AdminPageHeader, AdminPageContent } from "@/components/admin/AdminLayout";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { DOMAINS } from "@/lib/mocks";

export const Route = createFileRoute("/_admin/admin/domains")({
  component: AdminDomains,
});

function AdminDomains() {
  return (
    <>
      <AdminPageHeader title="Domaines" description={`${DOMAINS.length} domaines vendus via PlanetHoster`} />
      <AdminPageContent>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Domaine</TableHead><TableHead>TLD</TableHead><TableHead>Statut</TableHead><TableHead>Expire</TableHead><TableHead>Prix/an</TableHead></TableRow></TableHeader>
            <TableBody>
              {DOMAINS.map((d) => (
                <TableRow key={d.name}>
                  <TableCell className="font-mono">{d.name}</TableCell>
                  <TableCell>{d.tld}</TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="text-sm">{new Date(d.expiresAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="font-mono">{d.pricePerYear} €</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </AdminPageContent>
    </>
  );
}
