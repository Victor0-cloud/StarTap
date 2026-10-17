import { createClient } from "@supabase/supabase-js";
import type { ServerEnv } from "./env.ts";

export type AuthUser = { id: string; email: string };

/** Verify the caller's Supabase access token. The service role is never used here. */
export async function userFromRequest(request: Request, env: ServerEnv): Promise<AuthUser | null> {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  const token = header.slice("Bearer ".length).trim();
  if (!token || token.length > 8192) return null;
  const supabase = createClient(env.supabaseUrl, env.supabaseAnonKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { data, error } = await supabase.auth.getUser(token);
  if (error || !data.user?.id || !data.user.email) return null;
  return { id: data.user.id, email: data.user.email.toLowerCase() };
}
