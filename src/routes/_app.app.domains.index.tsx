import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, MoreHorizontal, Lock, Unlock, RefreshCw } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { DOMAINS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/domains/")({
  head: () => ({ meta: [{ title: "Domaines | Hostiq" }] }),
  component: DomainsList,
});

function DomainsList() {
  return (
    <>
      <PageHeader
        title="Domaines"
        description={`${DOMAINS.length} domaines gérés via PlanetHoster`}
        actions={
          <Button asChild>
            <Link to="/app/domains/search"><Plus className="h-4 w-4" />Acheter un domaine</Link>
          </Button>
        }
      />
      <PageContent>
        <Card>
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Rechercher un domaine…" className="pl-9" />
            </div>
            <Button variant="outline" size="sm">Filtrer</Button>
            <Button variant="outline" size="sm">Exporter CSV</Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Domaine</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Expire le</TableHead>
                <TableHead>Auto-renew</TableHead>
                <TableHead>Lock</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {DOMAINS.map((d) => (
                <TableRow key={d.name}>
                  <TableCell>
                    <Link to="/app/domains/$domain" params={{ domain: d.name }} className="font-mono font-medium hover:text-primary">
                      {d.name}
                    </Link>
                  </TableCell>
                  <TableCell><StatusBadge status={d.status} /></TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(d.expiresAt).toLocaleDateString("fr-FR")}
                  </TableCell>
                  <TableCell>
                    {d.autoRenew ? (
                      <span className="inline-flex items-center gap-1 text-xs text-success"><RefreshCw className="h-3 w-3" />Activé</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">Désactivé</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {d.locked ? <Lock className="h-3.5 w-3.5 text-success" /> : <Unlock className="h-3.5 w-3.5 text-warning" />}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageContent>
    </>
  );
}
