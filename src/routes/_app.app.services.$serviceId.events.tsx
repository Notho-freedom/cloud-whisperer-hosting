import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/events")({
  head: () => ({ meta: [{ title: "Events | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Events" description="Activity timeline for this service." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Events — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
