import * as React from "react";

export type UserRole = "user" | "admin";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  roles: UserRole[];
}

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  hasRole: (role: UserRole) => boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name: string) => Promise<void>;
  logout: () => void;
  loginAsAdmin: () => void;
}

const AuthContext = React.createContext<AuthContextValue | null>(null);

const STORAGE_KEY = "hostiq.auth.user";

function readStoredUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<AuthUser | null>(null);

  React.useEffect(() => {
    setUser(readStoredUser());
  }, []);

  const persist = React.useCallback((next: AuthUser | null) => {
    setUser(next);
    if (typeof window === "undefined") return;
    if (next) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    else window.localStorage.removeItem(STORAGE_KEY);
  }, []);

  const login = React.useCallback(
    async (email: string, _password: string) => {
      await new Promise((r) => setTimeout(r, 600));
      persist({
        id: "u_demo",
        email,
        name: email.split("@")[0] || "Utilisateur",
        roles: ["user"],
      });
    },
    [persist],
  );

  const signup = React.useCallback(
    async (email: string, _password: string, name: string) => {
      await new Promise((r) => setTimeout(r, 800));
      persist({ id: "u_new", email, name, roles: ["user"] });
    },
    [persist],
  );

  const logout = React.useCallback(() => persist(null), [persist]);

  const loginAsAdmin = React.useCallback(() => {
    persist({
      id: "u_admin",
      email: "admin@hostiq.io",
      name: "Admin",
      roles: ["user", "admin"],
    });
  }, [persist]);

  const value: AuthContextValue = {
    user,
    isAuthenticated: !!user,
    hasRole: (role) => !!user?.roles.includes(role),
    login,
    signup,
    logout,
    loginAsAdmin,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = React.useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
