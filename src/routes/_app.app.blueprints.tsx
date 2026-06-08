import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { FileCode2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/app/blueprints")({
  head: () => ({ meta: [{ title: "Blueprints | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Blueprints" description="Provision and sync entire stacks from a render.yaml file."
        actions={<Button size="sm" disabled><Plus className="h-3.5 w-3.5" /> New Blueprint</Button>} />
      <PageContent>
        <Card className="p-12 text-center">
          <FileCode2 className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold">No blueprints yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Connect a Git repository containing a <span className="font-mono text-foreground">render.yaml</span> to provision
            services, datastores and environment groups in one shot.
          </p>
        </Card>
      </PageContent>
    </>
  );
}
