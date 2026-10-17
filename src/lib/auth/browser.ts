"use client";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { writeSavedSession } from "@/lib/premium/session";

let client: SupabaseClient | null = null;

export function browserAuth(): SupabaseClient {
  if (client) return client;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) throw new Error("Auth is not configured");
  client = createClient(url, key, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return client;
}

export async function syncSavedSession(): Promise<void> {
  const { data } = await browserAuth().auth.getSession();
  const session = data.session;
  if (!session?.access_token) {
    writeSavedSession(null);
    return;
  }
  writeSavedSession({ accessToken: session.access_token, expiresAt: session.expires_at ?? null });
}
