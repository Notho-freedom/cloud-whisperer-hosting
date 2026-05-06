import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PageHeader, PageContent } from "@/components/app/AppLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { inviteMember } from "@/api/team-api";
import { getPlatformCapabilities } from "@/api/platform-api";

export const Route = createFileRoute("/_app/app/team/invite")({
  component: InviteMember,
});

function InviteMember() {
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "member" | "billing" | "viewer">("member");
  const navigate = useNavigate();
  const qc = useQueryClient();
  const { data: capabilities = [] } = useQuery({ queryKey: ["platform-capabilities"], queryFn: () => getPlatformCapabilities() });
  const inviteCapability = (capabilities as Array<{ key: string; ready: boolean; reason: string | null }>).find((cap) => cap.key === "teamInvites");
  const m = useMutation({
    mutationFn: () => inviteMember({ data: { email, role } }),
    onSuccess: () => {
      toast.success("Invitation envoyée");
      qc.invalidateQueries({ queryKey: ["team"] });
      navigate({ to: "/app/team" });
    },
    onError: (e: Error) => toast.error(e.message),
  });
  return (
    <>
      <PageHeader title="Inviter un membre" breadcrumbs={[{ label: "Équipe", to: "/app/team" }, { label: "Inviter" }]} />
      <PageContent>
        <Card><CardContent className="p-6 space-y-4 max-w-xl">
          {inviteCapability && !inviteCapability.ready && (
            <div className="rounded-md border border-destructive/30 p-3 text-sm">
              <p className="font-medium">Invitations indisponibles</p>
              <p className="mt-1 text-muted-foreground">{inviteCapability.reason}</p>
            </div>
          )}
          <div><Label>Email</Label><Input type="email" className="mt-1.5" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="collegue@acme.com" /></div>
          <div><Label>Rôle</Label>
            <select value={role} onChange={(e) => setRole(e.target.value as typeof role)} className="mt-1.5 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
              <option value="admin">Admin — accès complet</option>
              <option value="member">Member — gestion ressources</option>
              <option value="billing">Billing — factures uniquement</option>
              <option value="viewer">Viewer — lecture seule</option>
            </select>
          </div>
          <Button onClick={() => m.mutate()} disabled={!email || m.isPending || inviteCapability?.ready === false}>
            {m.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Envoyer l'invitation"}
          </Button>
        </CardContent></Card>
      </PageContent>
    </>
  );
}
