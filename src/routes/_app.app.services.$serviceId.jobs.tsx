import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/jobs")({
  head: () => ({ meta: [{ title: "Jobs | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Jobs" description="One-off jobs and cron runs." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Jobs — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
