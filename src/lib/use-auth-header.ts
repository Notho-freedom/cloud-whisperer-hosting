import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

export function useAuthHeaderInterceptor() {
  React.useEffect(() => {
    const originalFetch = globalThis.fetch;
    let accessToken: string | null = null;

    const syncToken = async () => {
      const { data } = await supabase.auth.getSession();
      accessToken = data.session?.access_token ?? null;
    };

    void syncToken();
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      accessToken = session?.access_token ?? null;
    });

    globalThis.fetch = async (input: any, init?: any) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input?.url;

      // Only attach auth to our own app requests. Intercepting Supabase auth
      // requests can stall sign-in flows and leave the login UI spinning.
      const isSameOriginRequest =
        typeof window !== "undefined" &&
        !!url &&
        (() => {
          try {
            return new URL(url, window.location.origin).origin === window.location.origin;
          } catch {
            return false;
          }
        })();

      if (isSameOriginRequest && accessToken) {
        const headers = new Headers(init?.headers || {});
        headers.set("x-auth-token", accessToken);
        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    return () => {
      subscription.unsubscribe();
      globalThis.fetch = originalFetch;
    };
  }, []);
}
