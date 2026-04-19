import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, MoreHorizontal } from "lucide-react";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusBadge } from "@/components/StatusBadge";
import { TEAM_MEMBERS } from "@/lib/mocks";

export const Route = createFileRoute("/_app/app/team/")({
  component: TeamPage,
});

function TeamPage() {
  return (
    <>
      <PageHeader title="Équipe" description={`${TEAM_MEMBERS.length} membres`}
        actions={<Button asChild><Link to="/app/team/invite"><Plus className="h-4 w-4" />Inviter</Link></Button>} />
      <PageContent>
        <Card>
          <Table>
            <TableHeader><TableRow><TableHead>Membre</TableHead><TableHead>Rôle</TableHead><TableHead>Dernière activité</TableHead><TableHead>Statut</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
            <TableBody>
              {TEAM_MEMBERS.map((m) => (
                <TableRow key={m.id}>
                  <TableCell><div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-xs font-semibold text-primary-foreground">{m.name[0]}</div>
                    <div><p className="font-medium text-sm">{m.name}</p><p className="text-xs text-muted-foreground">{m.email}</p></div>
                  </div></TableCell>
                  <TableCell><Badge variant="outline" className="capitalize">{m.role}</Badge></TableCell>
                  <TableCell className="text-sm text-muted-foreground">{m.lastActiveAt}</TableCell>
                  <TableCell><StatusBadge status={m.status} /></TableCell>
                  <TableCell className="text-right"><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </PageContent>
    </>
  );
}
