import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/deploys")({
  head: () => ({ meta: [{ title: "Deploys | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Deploys" description="All deploys with rollback and cancel." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Deploys — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
