import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/datastores")({
  head: () => ({ meta: [{ title: "Datastores | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Datastores" description="Postgres, Key Value and disks." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Datastores — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
