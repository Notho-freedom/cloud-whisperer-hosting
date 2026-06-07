import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/scaling")({
  head: () => ({ meta: [{ title: "Scaling | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Scaling" description="Instances, autoscaling and plan." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Scaling — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
