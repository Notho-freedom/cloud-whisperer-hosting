import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/services/$serviceId/environment")({
  head: () => ({ meta: [{ title: "Environment | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Environment" description="Env vars, secret files and env groups." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Environment — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
