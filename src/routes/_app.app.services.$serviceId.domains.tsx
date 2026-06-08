import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash2, Globe2, ShieldCheck, AlertTriangle } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { listCustomDomains, addCustomDomain, verifyCustomDomain, deleteCustomDomain } from "@/api/render/services.functions";
import { toast } from "sonner";

export const Route = createFileRoute("/_app/app/services/$serviceId/domains")({
  head: () => ({ meta: [{ title: "Custom Domains | Hostiq" }] }),
  component: DomainsPage,
});

function DomainsPage() {
  const { serviceId } = Route.useParams();
  const qc = useQueryClient();
  const { data = [], isLoading } = useQuery({
    queryKey: ["svc", serviceId, "domains"],
    queryFn: () => listCustomDomains({ data: { id: serviceId } }) as Promise<any[]>,
  });
  const refresh = () => qc.invalidateQueries({ queryKey: ["svc", serviceId, "domains"] });
  const verify = useMutation({
    mutationFn: (domainId: string) => verifyCustomDomain({ data: { id: serviceId, domainId } }),
    onSuccess: () => { toast.success("Verification triggered"); refresh(); },
    onError: (e: Error) => toast.error(e.message),
  });
  const del = useMutation({
    mutationFn: (domainId: string) => deleteCustomDomain({ data: { id: serviceId, domainId } }),
    onSuccess: () => { toast.success("Domain removed"); refresh(); },
  });

  return (
    <>
      <PageHeader title="Custom Domains" description="Custom domains, TLS and DNS verification."
        actions={<AddDomainDialog serviceId={serviceId} onCreated={refresh} />} />
      <PageContent>
        {isLoading ? (
          <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : data.length === 0 ? (
          <Card className="p-10 text-center text-sm text-muted-foreground">
            <Globe2 className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
            No custom domains yet.
          </Card>
        ) : (
          <Card className="divide-y divide-border">
            {(data as any[]).map((d) => {
              const verified = d.verificationStatus === "verified" || d.status === "verified";
              return (
                <div key={d.id} className="flex items-center gap-3 p-3">
                  <Globe2 className="h-4 w-4 text-muted-foreground" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{d.name}</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">{d.createdAt ? new Date(d.createdAt).toLocaleString() : ""}</p>
                  </div>
                  {verified ? (
                    <Badge variant="success" className="text-[10px]"><ShieldCheck className="mr-1 h-3 w-3" /> Verified</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px] border-warning/40 text-warning"><AlertTriangle className="mr-1 h-3 w-3" /> Pending</Badge>
                  )}
                  {!verified && <Button variant="ghost" size="sm" onClick={() => verify.mutate(d.id)}>Verify</Button>}
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => del.mutate(d.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              );
            })}
          </Card>
        )}
      </PageContent>
    </>
  );
}

function AddDomainDialog({ serviceId, onCreated }: { serviceId: string; onCreated: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const add = useMutation({
    mutationFn: () => addCustomDomain({ data: { id: serviceId, name } }),
    onSuccess: () => { toast.success("Domain added"); setOpen(false); setName(""); onCreated(); },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button size="sm"><Plus className="h-3.5 w-3.5" /> Add Domain</Button></DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add custom domain</DialogTitle></DialogHeader>
        <Input placeholder="example.com" value={name} onChange={(e) => setName(e.target.value.toLowerCase())} />
        <p className="text-xs text-muted-foreground">After adding, configure your DNS to point to the Render target shown, then click Verify.</p>
        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={() => add.mutate()} disabled={!name || add.isPending}>
            {add.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
