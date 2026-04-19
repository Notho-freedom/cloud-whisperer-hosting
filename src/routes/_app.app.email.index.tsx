import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Mail } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { MAILBOXES } from "@/lib/mocks";

const PROVIDER_LABEL: Record<string, string> = {
  google: "Google Workspace",
  microsoft: "Microsoft 365",
  zoho: "Zoho Mail",
};

export const Route = createFileRoute("/_app/app/email/")({
  head: () => ({ meta: [{ title: "Email Pro | Hostiq" }] }),
  component: EmailList,
});

function EmailList() {
  return (
    <>
      <PageHeader
        title="Boîtes mail"
        description={`${MAILBOXES.length} boîtes — multi-provider`}
        actions={
          <>
            <Button variant="outline" asChild><Link to="/app/email/providers">Providers</Link></Button>
            <Button asChild><Link to="/app/email/new"><Plus className="h-4 w-4" />Nouvelle boîte</Link></Button>
          </>
        }
      />
      <PageContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {MAILBOXES.map((mb) => (
            <Link key={mb.id} to="/app/email/$mailboxId" params={{ mailboxId: mb.id }}>
              <Card className="p-5 transition-all hover:border-primary/40 hover:shadow-md">
                <div className="flex items-start justify-between">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary"><Mail className="h-4 w-4" /></div>
                  <Badge variant="outline" className="text-[10px]">{PROVIDER_LABEL[mb.provider]}</Badge>
                </div>
                <p className="mt-3 font-mono font-medium truncate">{mb.address}</p>
                <p className="text-xs text-muted-foreground truncate">{mb.plan}</p>
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Stockage</span><span className="font-mono">{mb.usedGb} / {mb.quotaGb} GB</span></div>
                  <Progress value={(mb.usedGb / mb.quotaGb) * 100} className="mt-1.5 h-1.5" />
                </div>
                <div className="mt-3 flex gap-1.5">
                  {mb.aliases.length > 0 && <Badge variant="secondary" className="text-[10px]">{mb.aliases.length} alias</Badge>}
                  {mb.forwards.length > 0 && <Badge variant="secondary" className="text-[10px]">{mb.forwards.length} forward</Badge>}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </PageContent>
    </>
  );
}
