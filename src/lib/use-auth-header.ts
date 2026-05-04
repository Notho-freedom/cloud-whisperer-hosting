import * as React from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook qui configure automatiquement les headers d'authentification
 * pour les server functions en utilisant fetch interceptor
 */
export function useAuthHeaderInterceptor() {
  React.useEffect(() => {
    const originalFetch = globalThis.fetch;

    globalThis.fetch = async (input: any, init?: any) => {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.access_token) {
        const headers = new Headers(init?.headers || {});
        headers.set("x-auth-token", session.access_token);
        return originalFetch(input, { ...init, headers });
      }

      return originalFetch(input, init);
    };

    return () => {
      globalThis.fetch = originalFetch;
    };
  }, []);
}
