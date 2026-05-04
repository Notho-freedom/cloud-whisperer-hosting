import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserOrgId } from "./_helpers.server";
import { sendTransactionalEmail } from "./email.server";

export const listTeam = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
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
        html: `<p>Vous avez été invité à rejoindre une équipe Hostiq.</p><p>Acceptez l'invitation : <a href="https://hostinq.lovable.app/app/team/accept?token=${invite.token}">Rejoindre</a></p>`,
      });
    } catch (e) {
      console.error("Email send failed:", e);
    }
    return invite;
  });
