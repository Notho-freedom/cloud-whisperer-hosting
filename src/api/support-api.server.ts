import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getUserOrgId } from "./_helpers.server";

export const listTickets = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data, error } = await context.supabase
      .from("tickets")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  });

export const getTicket = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ id: z.string().uuid() }).parse)
  .handler(async ({ data, context }) => {
    const [{ data: ticket }, { data: messages }] = await Promise.all([
      context.supabase.from("tickets").select("*").eq("id", data.id).maybeSingle(),
      context.supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", data.id)
        .order("sent_at", { ascending: true }),
    ]);
    return { ticket, messages: messages ?? [] };
  });

export const createTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    z.object({
      subject: z.string().min(3).max(200),
      body: z.string().min(3).max(8000),
      priority: z.enum(["low", "normal", "high", "urgent"]).default("normal"),
      category: z.string().min(1).max(40).default("other"),
    }).parse,
  )
  .handler(async ({ data, context }) => {
    const orgId = await getUserOrgId(context.userId);
    const { data: ticket, error } = await supabaseAdmin
      .from("tickets")
      .insert({
        org_id: orgId,
        user_id: context.userId,
        subject: data.subject,
        priority: data.priority,
        category: data.category,
      })
      .select()
      .single();
    if (error) throw error;
    await supabaseAdmin.from("ticket_messages").insert({
      ticket_id: ticket.id,
      author_id: context.userId,
      body: data.body,
    });
    return ticket;
  });

export const replyTicket = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(z.object({ ticketId: z.string().uuid(), body: z.string().min(1).max(8000) }).parse)
  .handler(async ({ data, context }) => {
    const { error } = await context.supabase.from("ticket_messages").insert({
      ticket_id: data.ticketId,
      author_id: context.userId,
      body: data.body,
    });
    if (error) throw error;
    return { ok: true };
  });
