import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "./supabase";

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isReadyRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadSession = async () => {
      setLoading(true);
      setError(null);

      const { data, error: sessionError } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (sessionError) {
        setError(sessionError.message);
      }

      setSession(data.session);
      if (isMounted) {
        setLoading(false);
        isReadyRef.current = true;
      }
    };

    loadSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        if (!isMounted) return;
        setError(null);
        setSession(newSession);
        if (!isReadyRef.current) {
          setLoading(true);
          if (isMounted) {
            setLoading(false);
            isReadyRef.current = true;
          }
          return;
        }

        if (!newSession) {
          return;
        }
      },
    );

    return () => {
      isMounted = false;
      authListener.subscription.unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error,
    }),
    [session, loading, error],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
