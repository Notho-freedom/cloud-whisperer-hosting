import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Search, Lock, Unlock, RefreshCw, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { listDomains } from "@/server/domains.server";

export const Route = createFileRoute("/_app/app/domains/")({
  head: () => ({ meta: [{ title: "Domaines | Hostiq" }] }),
  component: DomainsList,
});

function DomainsList() {
  const { data: domains = [], isLoading } = useQuery({
    queryKey: ["domains"],
    queryFn: () => listDomains(),
  });
  return (
    <>
      <PageHeader
        title="Domaines"
        description={`${domains.length} domaine${domains.length > 1 ? "s" : ""} géré${domains.length > 1 ? "s" : ""}`}
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
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center p-12 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
            </div>
          ) : domains.length === 0 ? (
            <div className="p-12 text-center text-sm text-muted-foreground">
              Aucun domaine. <Link to="/app/domains/search" className="text-primary hover:underline">Achetez votre premier domaine</Link>.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Domaine</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead>Expire le</TableHead>
                  <TableHead>Auto-renew</TableHead>
                  <TableHead>Lock</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {domains.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Link to="/app/domains/$domain" params={{ domain: d.name }} className="font-mono font-medium hover:text-primary">
                        {d.name}
                      </Link>
                    </TableCell>
                    <TableCell><StatusBadge status={d.status} /></TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {d.expires_at ? new Date(d.expires_at).toLocaleDateString("fr-FR") : "—"}
                    </TableCell>
                    <TableCell>
                      {d.auto_renew ? (
                        <span className="inline-flex items-center gap-1 text-xs text-success"><RefreshCw className="h-3 w-3" />Activé</span>
                      ) : (
                        <span className="text-xs text-muted-foreground">Désactivé</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {d.locked ? <Lock className="h-3.5 w-3.5 text-success" /> : <Unlock className="h-3.5 w-3.5 text-warning" />}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Card>
      </PageContent>
    </>
  );
}
