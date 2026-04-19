import * as React from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Check, X, ShoppingCart, Sparkles } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { TLDS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/domains/search")({
  head: () => ({ meta: [{ title: "Acheter un domaine | Hostiq" }] }),
  component: DomainSearch,
});

function DomainSearch() {
  const [query, setQuery] = React.useState("monprojet");
  const [searched, setSearched] = React.useState(true);

  const baseName = query.replace(/\..+$/, "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const results = TLDS.map((t, i) => ({
    ...t,
    domain: baseName + t.tld,
    available: i % 4 !== 0 || t.popular,
  }));

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
            onSubmit={(e) => { e.preventDefault(); setSearched(true); }}
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
            <Button type="submit" size="lg">Rechercher</Button>
          </form>
        </Card>

        {searched && (
          <>
            {/* Best match */}
            <Card className="overflow-hidden border-primary/30 bg-primary/[0.03]">
              <div className="flex flex-col items-start justify-between gap-4 p-6 sm:flex-row sm:items-center">
                <div>
                  <Badge variant="success" className="mb-2"><Sparkles className="h-3 w-3 mr-1" />Recommandé</Badge>
                  <p className="font-mono text-2xl font-semibold">{baseName || "monprojet"}.com</p>
                  <p className="mt-1 text-sm text-muted-foreground">9,99 € / an · Renouvellement 12,99 €</p>
                </div>
                <Button size="lg"><ShoppingCart className="h-4 w-4" />Acheter</Button>
              </div>
            </Card>

            {/* All TLDs */}
            <Card>
              <div className="border-b border-border p-4">
                <h3 className="font-semibold">Autres extensions ({results.length})</h3>
              </div>
              <div className="divide-y divide-border">
                {results.map((r) => (
                  <div key={r.tld} className="flex items-center gap-4 px-6 py-3">
                    <div className="flex-1">
                      <p className="font-mono font-medium">{r.domain}</p>
                      <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                        {r.popular && <Badge variant="outline" className="text-[10px]">Populaire</Badge>}
                        <span>Renouvellement {r.renewalPrice} €</span>
                      </div>
                    </div>
                    {r.available ? (
                      <>
                        <span className="font-mono text-sm font-semibold">{r.pricePerYear.toFixed(2)} €/an</span>
                        <Button size="sm"><ShoppingCart className="h-3.5 w-3.5" />Ajouter</Button>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                        <X className="h-4 w-4" /> Indisponible
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </PageContent>
    </>
  );
}
