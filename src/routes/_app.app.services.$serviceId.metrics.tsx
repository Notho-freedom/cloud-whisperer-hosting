import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/metrics")({
  head: () => ({ meta: [{ title: "Metrics | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Metrics" description="CPU, memory, requests and bandwidth." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Metrics — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
