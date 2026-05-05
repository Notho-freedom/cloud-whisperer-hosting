import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { assertCapabilityReady, getAppBaseUrl } from "@/lib/provider-readiness";

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { getUserOrgId } = await import("./_helpers");
    const orgId = await getUserOrgId(context.userId);
    const [{ data: members }, { data: invites }] = await Promise.all([
      context.supabase.from("organization_members").select("*, profiles(name,email,avatar_url)").eq("org_id", orgId),
      context.supabase.from("team_invites").select("*").eq("org_id", orgId).is("accepted_at", null),
    ]);
    return { members: members ?? [], invites: invites ?? [] };
  });

export const inviteMember = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      email: z.string().email(),
      role: z.enum(["owner", "admin", "member", "billing", "viewer"]).default("member"),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    assertCapabilityReady("teamInvites");
    const [
      { supabaseAdmin },
      { getUserOrgId },
      { sendTransactionalEmail },
    ] = await Promise.all([
      import("@/integrations/supabase/admin"),
      import("./_helpers"),
      import("./email"),
    ]);
    const orgId = await getUserOrgId(context.userId);
    const { data: invite, error } = await supabaseAdmin
      .from("team_invites")
      .insert({ org_id: orgId, email: data.email, role: data.role, invited_by: context.userId })
      .select()
      .single();
    if (error) throw error;
    try {
      await sendTransactionalEmail({
        to: data.email,
        subject: "Vous êtes invité sur Hostiq",
        html: `<p>Vous avez été invité à rejoindre une équipe Hostiq.</p><p>Acceptez l'invitation : <a href="${getAppBaseUrl()}/app/team/accept?token=${invite.token}">Rejoindre</a></p>`,
      });
    } catch (e) {
      await supabaseAdmin.from("team_invites").delete().eq("id", invite.id);
      throw new Error(e instanceof Error ? e.message : "L'invitation n'a pas pu être envoyée.");
    }
    return invite;
  });
