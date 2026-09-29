import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { Session } from "@supabase/supabase-js";
import { getGasUser, type GasUser } from "../services/appService";
import { supabase } from "../services/supabase";

interface AuthContextValue {
  session: Session | null;
  user: GasUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<GasUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    let loadingProfile = false;
    const sync = async (next: Session | null) => {
      if (!mounted) return;
      setSession(next);
      if (!next) {
        setUser(null);
        setLoading(false);
        return;
      }
      if (loadingProfile) return;
      loadingProfile = true;
      setLoading(true);
      try {
        const profile = await getGasUser(next.user);
        if (profile.role !== "Admin") {
          throw new Error("This account is not authorized for the Admin system.");
        }
        if (mounted) {
          setUser(profile);
          setError(null);
        }
      } catch (cause) {
        if (mounted) {
          setUser(null);
          setError(cause instanceof Error ? cause.message : "Unable to load staff profile.");
          await supabase.auth.signOut();
          setSession(null);
        }
      } finally {
        loadingProfile = false;
        if (mounted) setLoading(false);
      }
    };
    void supabase.auth
      .getSession()
      .then(({ data }) => sync(data.session))
      .catch((cause) => {
        if (mounted) {
          setError(cause instanceof Error ? cause.message : "Unable to restore session.");
          setLoading(false);
        }
      });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => {
      void sync(next);
    });
    return () => {
      mounted = false;
      listener.subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setError(null);
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      const message = "Enter the email address used for your Supabase account.";
      setError(message);
      throw new Error(message);
    }
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password,
    });
    if (authError) {
      setError(authError.message);
      throw new Error(authError.message);
    }
    if (!data.session) throw new Error("Supabase did not return a session.");
    // Profile loading happens after authentication so authenticated-only RLS
    // policies can safely resolve the staff role and branch.
  };
  const signOut = async () => {
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) setError(signOutError.message);
    setSession(null);
    setUser(null);
  };
  const value = useMemo(
    () => ({ session, user, loading, error, signIn, signOut }),
    [session, user, loading, error]
  );
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
}
export type { AuthContextValue };
