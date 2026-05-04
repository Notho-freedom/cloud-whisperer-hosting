import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Loader2 } from "lucide-react";
import { createMailbox, listEmailProviders } from "@/server/email.functions";
import { listDomains } from "@/server/domains.functions";

export const Route = createFileRoute("/_app/app/email/new")({
  head: () => ({ meta: [{ title: "Nouvelle boîte mail | Hostiq" }] }),
  component: NewMailbox,
});

function NewMailbox() {
  const navigate = useNavigate();
  const { data: providers = [] } = useQuery({ queryKey: ["email-providers"], queryFn: () => listEmailProviders() });
  const { data: domains = [] } = useQuery({ queryKey: ["domains"], queryFn: () => listDomains() });
  const [provider, setProvider] = React.useState<"google" | "microsoft" | "zoho">("google");
  const [local, setLocal] = React.useState("");
  const [domain, setDomain] = React.useState("");

  React.useEffect(() => { if (!domain && domains[0]) setDomain(domains[0].name); }, [domains, domain]);

  const create = useMutation({
    mutationFn: () => createMailbox({ data: { address: `${local}@${domain}`, provider, plan: "Standard", quotaGb: 30 } }),
    onSuccess: () => { toast.success("Boîte créée"); navigate({ to: "/app/email" }); },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader title="Créer une boîte mail" breadcrumbs={[{ label: "Email", to: "/app/email" }, { label: "Nouvelle" }]} />
      <PageContent className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">1. Provider</h3>
          <div className="grid gap-4 md:grid-cols-3">
            {providers.map((p) => (
              <button key={p.id} type="button" onClick={() => setProvider(p.id as typeof provider)}
                className={`text-left rounded-lg border p-5 transition ${provider === p.id ? "border-primary ring-2 ring-primary/20" : "border-border hover:border-primary/40"}`}>
                <Mail className="h-5 w-5 text-primary" />
                <p className="mt-3 font-semibold">{p.name}</p>
                <p className="text-sm text-muted-foreground">{p.description}</p>
                <p className="mt-2 text-lg font-semibold">{p.pricePerMailbox} €<span className="text-xs font-normal text-muted-foreground"> /boîte/mois</span></p>
              </button>
            ))}
          </div>
        </div>
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">2. Configuration</h3>
            <div className="grid gap-4 sm:grid-cols-[2fr_1fr_2fr] sm:items-end">
              <div><Label>Adresse</Label><Input className="mt-1.5 font-mono" placeholder="hello" value={local} onChange={(e) => setLocal(e.target.value)} /></div>
              <div className="text-center pb-2.5 font-mono text-muted-foreground">@</div>
              <div>
                <Label>Domaine</Label>
                {domains.length === 0
                  ? <Input className="mt-1.5 font-mono" placeholder="aucun domaine" disabled />
                  : <select className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm" value={domain} onChange={(e) => setDomain(e.target.value)}>
                      {domains.map((d) => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>}
              </div>
            </div>
            <Button onClick={() => create.mutate()} disabled={!local || !domain || create.isPending}>
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer la boîte"}
            </Button>
          </CardContent>
        </Card>
      </PageContent>
    </>
  );
}
