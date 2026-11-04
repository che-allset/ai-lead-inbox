import { createBrowserClient } from "@supabase/ssr";

// Supabase client for the browser. Only used on the login page.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}