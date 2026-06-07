import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/settings")({
  head: () => ({ meta: [{ title: "Settings | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Settings" description="Build, deploy hooks, headers, redirects and danger zone." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Settings — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
