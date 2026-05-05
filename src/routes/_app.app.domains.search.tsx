import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Search, X, ShoppingCart, Loader2 } from "lucide-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createDomainCheckout, searchDomains } from "@/api/domains-api";
import { getPlatformCapabilities } from "@/api/platform-api";
import { useAuth } from "@/lib/auth";

type SearchResult = Awaited<ReturnType<typeof searchDomains>>[number];

export const Route = createFileRoute("/_app/app/domains/search")({
  head: () => ({ meta: [{ title: "Acheter un domaine | Hostiq" }] }),
  component: DomainSearch,
});

function DomainSearch() {
  const auth = useAuth();
  const [query, setQuery] = React.useState("monprojet");
  const [selected, setSelected] = React.useState<SearchResult | null>(null);
  const [termYears, setTermYears] = React.useState(1);
  const [registrant, setRegistrant] = React.useState({
    firstName: "",
    lastName: "",
    email: auth.user?.email ?? "",
    companyName: "",
    address1: "",
    address2: "",
    city: "",
    postalCode: "",
    state: "",
    countryCode: "FR",
  });

  React.useEffect(() => {
    const parts = (auth.user?.name || "").trim().split(/\s+/).filter(Boolean);
    setRegistrant((current) => ({
      ...current,
      firstName: current.firstName || parts[0] || "",
      lastName: current.lastName || parts.slice(1).join(" ") || "",
      email: current.email || auth.user?.email || "",
    }));
  }, [auth.user?.email, auth.user?.name]);

  const { data: capabilities = [] } = useQuery({
    queryKey: ["platform-capabilities"],
    queryFn: () => getPlatformCapabilities(),
  });
  const domainSearchCapability = capabilities.find((cap) => cap.key === "domainSearch");
  const domainPurchaseCapability = capabilities.find((cap) => cap.key === "domainPurchase");

  const search = useMutation({
    mutationFn: () =>
      searchDomains({
        data: {
          query: query.replace(/\..+$/, "").toLowerCase().replace(/[^a-z0-9-]/g, ""),
          tlds: ["com", "fr", "io", "dev", "app", "net"],
        },
      }),
    onError: (e: Error) => toast.error(e.message),
  });

  const checkout = useMutation({
    mutationFn: () =>
      createDomainCheckout({
        data: {
          domainName: selected!.domain,
          termYears,
          registrant: {
            firstName: registrant.firstName,
            lastName: registrant.lastName,
            email: registrant.email,
            companyName: registrant.companyName || undefined,
            address1: registrant.address1,
            address2: registrant.address2 || undefined,
            city: registrant.city,
            postalCode: registrant.postalCode,
            state: registrant.state,
            countryCode: registrant.countryCode.toUpperCase(),
          },
        },
      }),
    onSuccess: ({ checkoutUrl }) => {
      window.location.assign(checkoutUrl);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const totalPrice = selected ? selected.price * termYears : 0;

  return (
    <>
      <PageHeader
        title="Acheter un domaine"
        description="Recherche et achat réels via PlanetHoster et Stripe."
        breadcrumbs={[{ label: "Domaines", to: "/app/domains" }, { label: "Recherche" }]}
      />
      <PageContent className="space-y-6">
        {domainSearchCapability && !domainSearchCapability.ready && (
          <Card className="border-destructive/30 p-4 text-sm">
            <p className="font-medium">Recherche indisponible</p>
            <p className="mt-1 text-muted-foreground">{domainSearchCapability.reason}</p>
          </Card>
        )}

        <Card className="p-6">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              search.mutate();
            }}
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
            <Button type="submit" size="lg" disabled={search.isPending || domainSearchCapability?.ready === false}>
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
              {search.data.map((r) => (
                <div key={r.domain} className="flex items-center gap-4 px-6 py-3">
                  <div className="flex-1">
                    <p className="font-mono font-medium">{r.domain}</p>
                    <p className="text-xs text-muted-foreground">
                      {r.renewalPrice.toFixed(2)} {r.currency} / renouvellement
                      {r.isPremium ? " · Domaine premium" : ""}
                    </p>
                  </div>
                  {r.available ? (
                    <>
                      <span className="font-mono text-sm font-semibold">
                        {r.price.toFixed(2)} {r.currency} / an
                      </span>
                      <Button
                        size="sm"
                        disabled={domainPurchaseCapability?.ready === false}
                        onClick={() => setSelected(r)}
                      >
                        <ShoppingCart className="h-3.5 w-3.5" />
                        Continuer
                      </Button>
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
        )}

        {selected && (
          <Card className="p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Commande réelle</p>
              <h3 className="font-mono text-lg font-semibold">{selected.domain}</h3>
              {domainPurchaseCapability && !domainPurchaseCapability.ready && (
                <p className="mt-1 text-sm text-destructive">{domainPurchaseCapability.reason}</p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Durée</Label>
                <select
                  className="mt-1.5 h-10 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
                  value={termYears}
                  onChange={(e) => setTermYears(Number(e.target.value))}
                >
                  {Array.from({ length: 10 }, (_, index) => index + 1).map((years) => (
                    <option key={years} value={years}>
                      {years} an{years > 1 ? "s" : ""}
                    </option>
                  ))}
                </select>
                <p className="mt-1 text-xs text-muted-foreground">
                  Total estimé: {totalPrice.toFixed(2)} {selected.currency}
                </p>
              </div>
              <div>
                <Label>Email registrant</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.email}
                  onChange={(e) => setRegistrant((current) => ({ ...current, email: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Prénom</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.firstName}
                  onChange={(e) => setRegistrant((current) => ({ ...current, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Nom</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.lastName}
                  onChange={(e) => setRegistrant((current) => ({ ...current, lastName: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Société</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.companyName}
                  onChange={(e) => setRegistrant((current) => ({ ...current, companyName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Adresse</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.address1}
                  onChange={(e) => setRegistrant((current) => ({ ...current, address1: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <Label>Complément d'adresse</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.address2}
                  onChange={(e) => setRegistrant((current) => ({ ...current, address2: e.target.value }))}
                />
              </div>
              <div>
                <Label>Ville</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.city}
                  onChange={(e) => setRegistrant((current) => ({ ...current, city: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <Label>Code postal</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.postalCode}
                  onChange={(e) => setRegistrant((current) => ({ ...current, postalCode: e.target.value }))}
                />
              </div>
              <div>
                <Label>Région / État</Label>
                <Input
                  className="mt-1.5"
                  value={registrant.state}
                  onChange={(e) => setRegistrant((current) => ({ ...current, state: e.target.value }))}
                />
              </div>
              <div>
                <Label>Pays (ISO-2)</Label>
                <Input
                  className="mt-1.5 font-mono"
                  maxLength={2}
                  value={registrant.countryCode}
                  onChange={(e) =>
                    setRegistrant((current) => ({
                      ...current,
                      countryCode: e.target.value.toUpperCase(),
                    }))
                  }
                />
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => checkout.mutate()}
                disabled={
                  checkout.isPending ||
                  domainPurchaseCapability?.ready === false ||
                  !registrant.firstName ||
                  !registrant.lastName ||
                  !registrant.email ||
                  !registrant.address1 ||
                  !registrant.city ||
                  !registrant.postalCode ||
                  !registrant.state ||
                  registrant.countryCode.length !== 2
                }
              >
                {checkout.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Payer et enregistrer"}
              </Button>
              <Button variant="outline" onClick={() => setSelected(null)} disabled={checkout.isPending}>
                Annuler
              </Button>
            </div>
          </Card>
        )}
      </PageContent>
    </>
  );
}
