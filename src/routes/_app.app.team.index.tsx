import { createFileRoute, Link } from "@tanstack/react-router";
import { Plus, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listTeam } from "@/server/team.functions";

export const Route = createFileRoute("/_app/app/team/")({
  component: TeamPage,
});

function TeamPage() {
  const { data, isLoading } = useQuery({ queryKey: ["team"], queryFn: () => listTeam() });
  const members = data?.members ?? [];
  const invites = data?.invites ?? [];
  return (
    <>
      <PageHeader title="Équipe" description={`${members.length} membre${members.length > 1 ? "s" : ""}, ${invites.length} invitation${invites.length > 1 ? "s" : ""} en attente`}
        actions={<Button asChild><Link to="/app/team/invite"><Plus className="h-4 w-4" />Inviter</Link></Button>} />
      <PageContent className="space-y-6">
        <Card>
          {isLoading ? (
            <div className="flex justify-center p-12"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
          ) : (
            <Table>
              <TableHeader><TableRow><TableHead>Membre</TableHead><TableHead>Rôle</TableHead><TableHead>Depuis</TableHead></TableRow></TableHeader>
              <TableBody>
                {members.map((m) => {
                  const profile = (m as unknown as { profiles?: { name?: string; email?: string } }).profiles;
                  return (
                    <TableRow key={m.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center text-xs font-semibold text-primary-foreground">
                            {(profile?.name ?? profile?.email ?? "?")[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{profile?.name ?? "—"}</p>
                            <p className="text-xs text-muted-foreground">{profile?.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell><Badge variant="outline" className="capitalize">{m.role}</Badge></TableCell>
                      <TableCell className="text-sm text-muted-foreground">{new Date(m.created_at).toLocaleDateString("fr-FR")}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </Card>
        {invites.length > 0 && (
          <Card>
            <div className="border-b border-border p-4 font-semibold">Invitations en attente</div>
            <Table>
              <TableHeader><TableRow><TableHead>Email</TableHead><TableHead>Rôle</TableHead><TableHead>Expire</TableHead></TableRow></TableHeader>
              <TableBody>
                {invites.map((i) => (
                  <TableRow key={i.id}>
                    <TableCell className="font-mono text-sm">{i.email}</TableCell>
                    <TableCell><Badge variant="outline">{i.role}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{new Date(i.expires_at).toLocaleDateString("fr-FR")}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </PageContent>
    </>
  );
}
