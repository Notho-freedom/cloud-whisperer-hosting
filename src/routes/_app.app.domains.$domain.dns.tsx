import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Download, Upload, Trash2, Edit3 } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DNS_RECORDS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/domains/$domain/dns")({
  head: ({ params }) => ({ meta: [{ title: `DNS · ${params.domain} | Hostiq` }] }),
  component: DnsEditor,
});

function DnsEditor() {
  const { domain } = Route.useParams();
  const records = DNS_RECORDS[domain] ?? DNS_RECORDS["acme.com"];

  return (
    <>
      <PageHeader
        title={<span>DNS · <span className="font-mono">{domain}</span></span>}
        breadcrumbs={[
          { label: "Domaines", to: "/app/domains" },
          { label: domain, to: "/app/domains/$domain" },
          { label: "DNS" },
        ]}
        actions={
          <>
            <Button variant="outline" size="sm"><Upload className="h-4 w-4" />Importer zone</Button>
            <Button variant="outline" size="sm"><Download className="h-4 w-4" />Exporter</Button>
            <Button size="sm"><Plus className="h-4 w-4" />Ajouter</Button>
          </>
        }
      />
      <PageContent>
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Type</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Valeur</TableHead>
                <TableHead className="w-20">TTL</TableHead>
                <TableHead className="w-20">Prio</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Badge variant="outline" className="font-mono">{r.type}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-md truncate">{r.value}</TableCell>
                  <TableCell className="font-mono text-xs">{r.ttl}</TableCell>
                  <TableCell className="font-mono text-xs">{r.priority ?? "—"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><Edit3 className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="icon" className="text-destructive"><Trash2 className="h-3.5 w-3.5" /></Button>
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
