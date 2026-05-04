import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Mail } from "lucide-react";
import { listEmailProviders } from "@/server/email.server";

export const Route = createFileRoute("/_app/app/email/providers")({
  head: () => ({ meta: [{ title: "Providers email | Hostiq" }] }),
  component: ProvidersPage,
});

function ProvidersPage() {
  const { data: providers = [] } = useQuery({ queryKey: ["email-providers"], queryFn: () => listEmailProviders() });
  return (
    <>
      <PageHeader title="Providers email" description="Choisissez le fournisseur lors de la création d'une boîte." breadcrumbs={[{ label: "Email", to: "/app/email" }, { label: "Providers" }]} />
      <PageContent>
        <div className="grid gap-4 md:grid-cols-3">
          {providers.map((p) => (
            <Card key={p.id}><CardContent className="p-5">
              <Mail className="h-5 w-5 text-primary" />
              <p className="mt-3 font-semibold">{p.name}</p>
              <p className="text-sm text-muted-foreground">{p.description}</p>
              <p className="mt-2 text-lg font-semibold">{p.pricePerMailbox} €<span className="text-xs font-normal text-muted-foreground"> /boîte</span></p>
            </CardContent></Card>
          ))}
        </div>
      </PageContent>
    </>
  );
}
