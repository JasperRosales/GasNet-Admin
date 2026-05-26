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

export type StaffRole = "Admin" | "Staff" | "Manager";

export interface StaffProfile {
  branch_id: number | null;
  role: StaffRole;
  username: string;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  profile: StaffProfile | null;
  loading: boolean;
  error: string | null;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);
const PROFILE_FETCH_TIMEOUT_MS = 4000;

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const isReadyRef = useRef(false);
  const sessionUserIdRef = useRef<string | null>(null);

  const readCachedProfile = () => {
    try {
      const raw = localStorage.getItem("staffProfile");
      const userId = localStorage.getItem("staffProfileUserId");
      if (!raw || !userId) return null;
      const parsed = JSON.parse(raw) as StaffProfile;
      return { userId, profile: parsed };
    } catch {
      return null;
    }
  };

  const writeCachedProfile = (userId: string, profileData: StaffProfile) => {
    try {
      localStorage.setItem("staffProfileUserId", userId);
      localStorage.setItem("staffProfile", JSON.stringify(profileData));
    } catch {
      // Ignore storage errors (private mode, quotas, etc.)
    }
  };

  const clearCachedProfile = () => {
    try {
      localStorage.removeItem("staffProfileUserId");
      localStorage.removeItem("staffProfile");
    } catch {
      // Ignore storage errors.
    }
  };

  const fetchProfile = async (
    activeSession: Session | null,
    options?: { preserveOnError?: boolean },
  ) => {
    if (!activeSession?.user) {
      if (!options?.preserveOnError) {
        setProfile(null);
      }
      return;
    }

    const { data, error: profileError } = await supabase
      .from("staff")
      .select("branch_id, role, username")
      .eq("staff_id", activeSession.user.id)
      .maybeSingle();

    if (profileError) {
      if (!options?.preserveOnError) {
        setProfile(null);
      }
      setError(profileError.message);
      return;
    }

    if (!data) {
      if (!options?.preserveOnError) {
        setProfile(null);
      }
      clearCachedProfile();
      return;
    }

    const nextProfile = {
      branch_id: data.branch_id,
      role: data.role as StaffRole,
      username: data.username,
    };
    setProfile(nextProfile);
    writeCachedProfile(activeSession.user.id, nextProfile);
    setError(null);
  };

  const fetchProfileWithTimeout = async (
    activeSession: Session | null,
    options?: { preserveOnError?: boolean },
  ) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;
    const timeoutPromise = new Promise<"timeout">((resolve) => {
      timeoutId = setTimeout(() => resolve("timeout"), PROFILE_FETCH_TIMEOUT_MS);
    });

    const result = await Promise.race([
      fetchProfile(activeSession, options).then(() => "ok" as const),
      timeoutPromise,
    ]);

    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (result === "timeout") {
      setError("Profile load timed out. Please check your connection.");
    }
  };

  const refreshProfile = async () => {
    setError(null);
    await fetchProfile(session);
  };

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
      sessionUserIdRef.current = data.session?.user.id ?? null;
      const cached = readCachedProfile();
      if (cached && cached.userId === sessionUserIdRef.current) {
        setProfile(cached.profile);
      } else if (data.session) {
        setProfile(null);
      }

      if (data.session && cached?.userId === sessionUserIdRef.current) {
        void fetchProfileWithTimeout(data.session, { preserveOnError: true });
      } else {
        await fetchProfileWithTimeout(data.session);
      }
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
        const previousUserId = sessionUserIdRef.current;
        setSession(newSession);
        sessionUserIdRef.current = newSession?.user.id ?? null;
        if (!isReadyRef.current) {
          setLoading(true);
          await fetchProfile(newSession);
          if (isMounted) {
            setLoading(false);
            isReadyRef.current = true;
          }
          return;
        }

        if (!newSession) {
          clearCachedProfile();
          setProfile(null);
          return;
        }
        const preserveOnError =
          previousUserId !== null && previousUserId === newSession.user.id;
        void fetchProfile(newSession, { preserveOnError });
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
      profile,
      loading,
      error,
      refreshProfile,
    }),
    [session, profile, loading, error],
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
