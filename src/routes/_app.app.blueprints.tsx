import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";

export const Route = createFileRoute("/_app/app/blueprints")({
  head: () => ({ meta: [{ title: "Blueprints | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Blueprints" description="Infrastructure-as-code blueprints (render.yaml)." />
      <PageContent>
        <Card className="p-10 text-center text-sm text-muted-foreground">
          Blueprints — coming soon. Backend wiring is ready; UI is being rolled out next.
        </Card>
      </PageContent>
    </>
  );
}
