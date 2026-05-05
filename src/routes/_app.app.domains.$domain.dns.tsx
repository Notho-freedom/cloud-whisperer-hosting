import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { getDomain, listDnsRecords, upsertDnsRecord, deleteDnsRecord } from "@/api/domains-api";

export const Route = createFileRoute("/_app/app/domains/$domain/dns")({
  head: ({ params }) => ({ meta: [{ title: `DNS · ${params.domain}` }] }),
  component: DnsEditor,
});

const TYPES = ["A", "AAAA", "CNAME", "MX", "TXT", "NS", "SRV"] as const;

function DnsEditor() {
  const { domain } = Route.useParams();
  const qc = useQueryClient();
  const { data: d } = useQuery({ queryKey: ["domain", domain], queryFn: () => getDomain({ data: { name: domain } }) });
  const domainId = d?.domain?.id;
  const { data: records = [] } = useQuery({
    queryKey: ["dns", domainId],
    queryFn: () => listDnsRecords({ data: { domainId: domainId! } }),
    enabled: !!domainId,
  });

  const [type, setType] = React.useState<typeof TYPES[number]>("A");
  const [name, setName] = React.useState("@");
  const [value, setValue] = React.useState("");
  const [ttl, setTtl] = React.useState(3600);

  const add = useMutation({
    mutationFn: () => upsertDnsRecord({ data: { domainId: domainId!, type, name, value, ttl } }),
    onSuccess: () => { toast.success("Enregistrement ajouté"); setValue(""); qc.invalidateQueries({ queryKey: ["dns", domainId] }); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (id: string) => deleteDnsRecord({ data: { id } }),
    onSuccess: () => { toast.success("Supprimé"); qc.invalidateQueries({ queryKey: ["dns", domainId] }); },
  });

  return (
    <>
      <PageHeader
        title={<span>DNS · <span className="font-mono">{domain}</span></span>}
        breadcrumbs={[{ label: "Domaines", to: "/app/domains" }, { label: domain, to: "/app/domains/$domain" }, { label: "DNS" }]}
      />
      <PageContent className="space-y-4">
        <Card className="p-4">
          <div className="grid gap-2 md:grid-cols-[100px_140px_1fr_100px_auto]">
            <Select value={type} onValueChange={(v) => setType(v as typeof TYPES[number])}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
            <Input placeholder="@ ou subdomain" value={name} onChange={(e) => setName(e.target.value)} className="font-mono" />
            <Input placeholder="valeur" value={value} onChange={(e) => setValue(e.target.value)} className="font-mono" />
            <Input type="number" value={ttl} onChange={(e) => setTtl(Number(e.target.value))} className="font-mono" />
            <Button disabled={!domainId || !value || add.isPending} onClick={() => add.mutate()}>
              <Plus className="h-4 w-4" />Ajouter
            </Button>
          </div>
        </Card>
        <Card>
          <Table>
            <TableHeader><TableRow>
              <TableHead className="w-20">Type</TableHead>
              <TableHead>Nom</TableHead>
              <TableHead>Valeur</TableHead>
              <TableHead className="w-20">TTL</TableHead>
              <TableHead className="w-24 text-right">Actions</TableHead>
            </TableRow></TableHeader>
            <TableBody>
              {records.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-sm text-muted-foreground py-8">Aucun enregistrement.</TableCell></TableRow>}
              {records.map((r) => (
                <TableRow key={r.id}>
                  <TableCell><Badge variant="outline" className="font-mono">{r.type}</Badge></TableCell>
                  <TableCell className="font-mono text-sm">{r.name}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground max-w-md truncate">{r.value}</TableCell>
                  <TableCell className="font-mono text-xs">{r.ttl}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => del.mutate(r.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
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
