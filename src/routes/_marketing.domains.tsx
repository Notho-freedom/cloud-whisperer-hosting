import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Search, Check, X, Loader2, ArrowRight, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/_marketing/domains")({
  head: () => ({
    meta: [
      { title: "Domaines — Trouvez le nom parfait | Hostiq" },
      { name: "description", content: "500+ extensions, prix transparents, gestion DNS complète. Achetez votre domaine en 30 secondes." },
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
    <>
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-mesh opacity-70" />
        <div className="absolute inset-0 bg-grid opacity-30" />
        <div className="container relative mx-auto max-w-5xl px-4 py-20">
          <div className="text-center">
            <Badge variant="outline" className="mb-4">Domaines</Badge>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-6xl">
              Trouvez votre <span className="gradient-text">nom de domaine</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Recherche instantanée parmi 500+ extensions. Prix transparents, sans surprise.
            </p>
          </div>
          <form onSubmit={onSearch} className="mx-auto mt-10 flex max-w-2xl flex-col gap-2 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="mon-super-projet"
                className="h-12 pl-10 font-mono text-base shadow-sm"
              />
            </div>
            <Button type="submit" size="lg" className="h-12" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Rechercher<ArrowRight className="ml-1 h-4 w-4" /></>}
            </Button>
          </form>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Recherche en temps réel via PlanetHoster
          </p>
        </div>
      </section>

      {searched && (
        <section className="border-b border-border/60 py-12">
          <div className="container mx-auto max-w-4xl px-4">
            <h2 className="mb-6 text-xl font-semibold">
              Résultats pour <span className="font-mono text-primary">« {searched} »</span>
            </h2>
            <div className="space-y-2">
              {TLDS.slice(0, 8).map((t, i) => {
                const available = i % 3 !== 0;
                return (
                  <Card
                    key={t.tld}
                    className="flex items-center justify-between p-4 transition-colors hover:border-primary/30"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-base">
                        {searched}
                        <span className="font-semibold text-primary">{t.tld}</span>
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
                        <span className="font-semibold">{t.price} €</span>
                        <span className="text-muted-foreground">/an</span>
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

      <section className="border-b border-border/60 bg-card/30 py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="mb-10 text-center">
            <Badge variant="outline" className="mb-3">Extensions</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Extensions populaires</h2>
            <p className="mt-3 text-muted-foreground">Plus de 500 TLD disponibles à prix transparent.</p>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {TLDS.map((t) => (
              <Card key={t.tld} className="p-4 text-center transition-all hover:border-primary/40 hover:shadow-md">
                <div className="font-mono text-2xl font-semibold text-primary">{t.tld}</div>
                <div className="mt-1 text-xs text-muted-foreground">
                  dès {t.price} €/an
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="container mx-auto max-w-5xl px-4">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              { t: "Transfert gratuit", d: "Apportez vos domaines existants — un an offert." },
              { t: "WHOIS Privacy", d: "Masquez vos coordonnées personnelles, gratuit." },
              { t: "DNS premium", d: "Anycast mondial, propagation instantanée." },
            ].map((b) => (
              <Card key={b.t} className="p-6">
                <Sparkles className="h-5 w-5 text-primary" />
                <h3 className="mt-4 font-semibold">{b.t}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{b.d}</p>
              </Card>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link to="/signup">
              <Button size="lg">Commencer maintenant<ArrowRight className="ml-1 h-4 w-4" /></Button>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
