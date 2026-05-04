import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { exchangeCodeForToken, gh } from "@/server/github.server";

export const Route = createFileRoute("/api/public/github/callback")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const code = url.searchParams.get("code");
        const state = url.searchParams.get("state");
        if (!code || !state) return new Response("Missing code/state", { status: 400 });
        const userId = state.split(".")[0];
        if (!userId) return new Response("Invalid state", { status: 400 });
        try {
          const tok = await exchangeCodeForToken(code);
          const me = await gh<{ id: number; login: string; avatar_url: string }>("/user", tok.access_token);
          await supabaseAdmin.from("github_connections").upsert(
            {
              user_id: userId,
              github_user_id: String(me.id),
              username: me.login,
              avatar_url: me.avatar_url,
              access_token: tok.access_token,
              scopes: tok.scope ? tok.scope.split(",") : [],
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id" },
          );
          throw redirect({ to: "/app/settings/integrations", search: { gh: "ok" } as never });
        } catch (e) {
          if (e instanceof Response) return e;
          // redirect throws
          if ((e as { isRedirect?: boolean })?.isRedirect) throw e;
          console.error("GitHub OAuth callback error:", e);
          return new Response(`OAuth error: ${(e as Error).message}`, { status: 500 });
        }
      },
    },
  },
});
