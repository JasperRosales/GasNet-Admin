import { createClient, type SupabaseClient } from "@supabase/supabase-js";

type SupabaseConfig = Readonly<{
  url: string;
  publishableKey: string;
}>;

function requireEnv(name: "VITE_SUPABASE_URL" | "VITE_SUPABASE_PUBLISHABLE_KEY"): string {
  const value = import.meta.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function getSupabaseConfig(): SupabaseConfig {
  const url = requireEnv("VITE_SUPABASE_URL");
  const publishableKey = requireEnv("VITE_SUPABASE_PUBLISHABLE_KEY");

  try {
    const parsedUrl = new URL(url);
    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
      throw new Error("URL must use HTTP or HTTPS");
    }
  } catch (error) {
    const detail = error instanceof Error ? ` (${error.message})` : "";
    throw new Error(`Invalid VITE_SUPABASE_URL${detail}`);
  }

  return Object.freeze({ url, publishableKey });
}

const config = getSupabaseConfig();

export const supabase: SupabaseClient = createClient(config.url, config.publishableKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
