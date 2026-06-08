import { createFileRoute } from "@tanstack/react-router";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/app/env-groups")({
  head: () => ({ meta: [{ title: "Env Groups | Hostiq" }] }),
  component: Page,
});

function Page() {
  return (
    <>
      <PageHeader title="Env Groups" description="Shared environment variable groups that can be linked to multiple services."
        actions={<Button size="sm" disabled><Plus className="h-3.5 w-3.5" /> New Group</Button>} />
      <PageContent>
        <Card className="p-12 text-center">
          <Layers className="mx-auto mb-3 h-10 w-10 text-muted-foreground/50" />
          <h3 className="text-base font-semibold">No env groups yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Create a group of variables and secret files, then link it to any number of services.
            A change in the group redeploys all linked services automatically.
          </p>
        </Card>
      </PageContent>
    </>
  );
}
