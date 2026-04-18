import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/domains")({
  head: () => ({
    meta: [
      { title: "Domaines — Trouvez le nom parfait | Hostiq" },
      {
        name: "description",
        content: "500+ extensions, prix transparents, gestion DNS complète. Achetez votre domaine en 30 secondes.",
      },
      { property: "og:title", content: "Domaines — Hostiq" },
      { property: "og:description", content: "Trouvez et achetez votre nom de domaine sur Hostiq." },
    ],
  }),
  component: DomainsPage,
});

const TLDS = [
  { tld: ".com", price: "9,99", popular: true },
  { tld: ".io", price: "39,99", popular: true },
  { tld: ".dev", price: "14,99", popular: true },
  { tld: ".app", price: "16,99" },
  { tld: ".fr", price: "8,99" },
  { tld: ".net", price: "11,99" },
  { tld: ".org", price: "10,99" },
  { tld: ".ai", price: "89,99" },
  { tld: ".co", price: "29,99" },
  { tld: ".tech", price: "44,99" },
  { tld: ".store", price: "49,99" },
  { tld: ".xyz", price: "2,99" },
];

function DomainsPage() {
  const [query, setQuery] = useState("");
  const [searched, setSearched] = useState("");
  const [loading, setLoading] = useState(false);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setTimeout(() => {
      setSearched(query.trim().toLowerCase().replace(/\s+/g, "-"));
      setLoading(false);
    }, 700);
  };

  return (
    <div className="border-b border-border/60">
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="absolute inset-0 bg-radial-emerald" />
        <div className="container relative mx-auto max-w-5xl px-4 py-20">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
              Trouvez votre <span className="gradient-text">nom de domaine</span>
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">
              Recherche instantanée parmi 500+ extensions. Prix transparents, sans surprise.
            </p>
          </div>
          <form onSubmit={onSearch} className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="mon-super-projet"
                className="h-12 pl-10 font-mono"
              />
            </div>
            <Button type="submit" size="lg" className="h-12" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Rechercher"}
            </Button>
          </form>
        </div>
      </section>

      {searched && (
        <section className="border-b border-border/60 py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-xl font-semibold">Résultats pour « {searched} »</h2>
            <div className="space-y-2">
              {TLDS.slice(0, 8).map((t, i) => {
                const available = i % 3 !== 0;
                return (
                  <Card key={t.tld} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-base">
                        {searched}
                        <span className="text-primary">{t.tld}</span>
                      </span>
                      {t.popular && <Badge variant="secondary">Populaire</Badge>}
                      {available ? (
                        <Badge className="bg-success/15 text-success hover:bg-success/15">
                          <Check className="mr-1 h-3 w-3" /> Disponible
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <X className="mr-1 h-3 w-3" /> Pris
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-sm">
                        {t.price} €<span className="text-muted-foreground">/an</span>
                      </span>
                      <Button size="sm" disabled={!available}>
                        {available ? "Ajouter" : "Indisponible"}
                      </Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <h2 className="text-2xl font-bold">Extensions populaires</h2>
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {TLDS.map((t) => (
              <Card key={t.tld} className="p-4 text-center">
                <div className="font-mono text-lg font-semibold text-primary">{t.tld}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  dès {t.price} €/an
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
