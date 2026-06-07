import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/domains")({
  head: () => ({ meta: [{ title: "Custom Domains | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Custom Domains" description="Custom domains, TLS and DNS verification." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Custom Domains — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
