import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, X, ShoppingCart, Loader2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { searchDomains, registerDomain } from "@/api/domains-api";

export const Route = createFileRoute("/_app/app/domains/search")({
  head: () => ({ meta: [{ title: "Acheter un domaine | Hostiq" }] }),
  component: DomainSearch,
});

function DomainSearch() {
  const [query, setQuery] = React.useState("monprojet");
  const navigate = useNavigate();
  const qc = useQueryClient();

  const search = useMutation({
    mutationFn: () => searchDomains({ data: { query: query.replace(/\..+$/, "").toLowerCase().replace(/[^a-z0-9-]/g, ""), tlds: ["com", "fr", "io", "dev", "app", "net"] } }),
  });

  const register = useMutation({
    mutationFn: (input: { name: string; tld: string; pricePerYear: number }) =>
      registerDomain({ data: input }),
    onSuccess: () => {
      toast.success("Domaine enregistré");
      qc.invalidateQueries({ queryKey: ["domains"] });
      navigate({ to: "/app/domains" });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <>
      <PageHeader
        title="Acheter un domaine"
        description="Trouvez le nom parfait parmi 500+ extensions."
        breadcrumbs={[{ label: "Domaines", to: "/app/domains" }, { label: "Recherche" }]}
      />
      <PageContent className="space-y-6">
        <Card className="p-6">
          <form
            onSubmit={(e) => { e.preventDefault(); search.mutate(); }}
            className="flex flex-col gap-2 sm:flex-row"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Cherchez un nom…"
                className="h-11 pl-10 font-mono text-base"
              />
            </div>
            <Button type="submit" size="lg" disabled={search.isPending}>
              {search.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
            </Button>
          </form>
        </Card>

        {search.data && (
          <Card>
            <div className="border-b border-border p-4">
              <h3 className="font-semibold">{search.data.length} résultats</h3>
            </div>
            <div className="divide-y divide-border">
              {search.data.map((r) => {
                const tld = r.domain.split(".").slice(1).join(".");
                return (
                  <div key={r.domain} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1">
                      <p className="font-mono font-medium">{r.domain}</p>
                    </div>
                    {r.available ? (
                      <>
                        <span className="font-mono text-sm font-semibold">{r.price.toFixed(2)} €/an</span>
                        <Button
                          size="sm"
                          disabled={register.isPending}
                          onClick={() => register.mutate({ name: r.domain, tld, pricePerYear: r.price })}
                        >
                          <ShoppingCart className="h-3.5 w-3.5" />Acheter
                        </Button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <X className="h-4 w-4" /> Indisponible
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </PageContent>
    </>
  );
}
