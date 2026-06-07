import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/env-groups")({
  head: () => ({ meta: [{ title: "Env Groups | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Env Groups" description="Shared environment variable groups." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Env Groups — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
