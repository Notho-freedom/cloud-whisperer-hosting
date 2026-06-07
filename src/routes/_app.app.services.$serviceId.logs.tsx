import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/logs")({
  head: () => ({ meta: [{ title: "Logs | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Logs" description="Live and historical logs." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Logs — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
