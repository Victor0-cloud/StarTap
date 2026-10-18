// Server-only payment configuration. Do not import this from a client component or any
// module the Android build compiles: the variable names include the payment provider and
// the database vendor, and the mobile output scan rejects those strings.
import { CURRENCY_CODES, currencyChargeable } from "./plans.ts";

const REQUIRED = [
  "FLW_SECRET_KEY",
  "FLW_SECRET_HASH",
  "NEXT_PUBLIC_SUPABASE_URL",
  "NEXT_PUBLIC_SUPABASE_ANON_KEY",
  "SUPABASE_SERVICE_ROLE_KEY",
] as const;

export type RequiredPaymentEnv = (typeof REQUIRED)[number];

type Env = Record<string, string | undefined>;

const filled = (env: Env, key: string) => typeof env[key] === "string" && env[key]!.trim().length > 0;

/** https, or http on localhost only (local tooling). Anything else fails closed. */
export function acceptableProjectUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol === "https:") return true;
    return url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

/**
 * Payments are live only when the flag is explicitly on AND every required variable is set.
 * A missing key, a blank key, or a flag of "0" / unset all mean the site behaves as it does today.
 * At least one catalogue currency must be chargeable (enabled, APPROVED, and both FLW_PLAN_<PERIOD>_<CUR> set).
 * USD is not required: an NGN-only launch sets only FLW_PLAN_MONTHLY_NGN and FLW_PLAN_YEARLY_NGN.
 */
export function paymentsLive(env: Env = process.env): boolean {
  const flag = env.STARTAP_PAYMENTS_ENABLED;
  if (flag !== "1" && flag !== "true") return false;
  if (!REQUIRED.every(key => filled(env, key))) return false;
  if (!CURRENCY_CODES.some(code => currencyChargeable(code, env))) return false;
  if (!acceptableProjectUrl(env.NEXT_PUBLIC_SUPABASE_URL!.trim())) return false;
  if (env.SUPABASE_SERVICE_ROLE_KEY!.trim() === env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim()) return false;
  return true;
}

export type ServerEnv = {
  flwSecretKey: string;
  flwSecretHash: string;
  supabaseUrl: string;
  supabaseAnonKey: string;
  serviceRoleKey: string;
};

export function readServerEnv(env: Env = process.env): ServerEnv | null {
  if (!paymentsLive(env)) return null;
  return {
    flwSecretKey: env.FLW_SECRET_KEY!.trim(),
    flwSecretHash: env.FLW_SECRET_HASH!.trim(),
    supabaseUrl: env.NEXT_PUBLIC_SUPABASE_URL!.trim(),
    supabaseAnonKey: env.NEXT_PUBLIC_SUPABASE_ANON_KEY!.trim(),
    serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY!.trim(),
  };
}
