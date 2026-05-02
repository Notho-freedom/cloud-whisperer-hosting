import * as React from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type UserRole = "user" | "admin" | "support";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: UserRole[];
}

interface AuthContextValue {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  refreshRoles: () => Promise<void>;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

async function fetchUserData(supaUser: User): Promise<AuthUser> {
  const [{ data: profile }, { data: rolesData }] = await Promise.all([
    supabase.from("profiles").select("name, avatar_url").eq("id", supaUser.id).maybeSingle(),
    supabase.from("user_roles").select("role").eq("user_id", supaUser.id),
  ]);
  return {
    id: supaUser.id,
    email: supaUser.email ?? "",
    name: profile?.name ?? supaUser.email?.split("@")[0] ?? "Utilisateur",
    avatarUrl: profile?.avatar_url ?? undefined,
    roles: (rolesData?.map((r) => r.role as UserRole)) ?? ["user"],
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [user, setUser] = React.useState<AuthUser | null>(null);
  const [loading, setLoading] = React.useState(true);

  const loadUser = React.useCallback(async (s: Session | null) => {
    if (!s?.user) {
      setUser(null);
      return;
    }
    try {
      const u = await fetchUserData(s.user);
      setUser(u);
    } catch (e) {
      console.error("loadUser failed", e);
      setUser({
        id: s.user.id,
        email: s.user.email ?? "",
        name: s.user.email?.split("@")[0] ?? "Utilisateur",
        roles: ["user"],
      });
    }
  }, []);

  React.useEffect(() => {
    // Listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      // Defer Supabase calls to avoid deadlock
      setTimeout(() => { void loadUser(s); }, 0);
    });

    // THEN check existing session
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      void loadUser(s).finally(() => setLoading(false));
    });

    return () => subscription.unsubscribe();
  }, [loadUser]);

  const login = React.useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signup = React.useCallback(async (email: string, password: string, name: string) => {
    const redirectUrl = `${window.location.origin}/app`;
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { name },
      },
    });
    if (error) throw error;
  }, []);

  const logout = React.useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, []);

  const signInWithGoogle = React.useCallback(async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (error) throw error;
  }, []);

  const refreshRoles = React.useCallback(async () => {
    if (session) await loadUser(session);
  }, [session, loadUser]);

  const value: AuthContextValue = {
    user,
    session,
    loading,
    isAuthenticated: !!session,
    hasRole: (role) => !!user?.roles.includes(role),
    login,
    signup,
    logout,
    signInWithGoogle,
    refreshRoles,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
