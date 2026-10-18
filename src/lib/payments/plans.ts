// Central plan catalogue.
// USD and NGN amounts are APPROVED final prices (Victor, Oct 17, 2026): USD 5 / 40, NGN 2500 / 25000.
// Every other row is an UNAPPROVED placeholder and stays disabled.
// Approved is not live-verified. Only NGN is liveVerified (Oct 17, 2026, NGN-only launch). USD stays unverified and is
// not chargeable in production because no LIVE USD plan ids are set. recurringVerified stays false everywhere.
// Amounts are minor units (hundredths): 449 is 4.49. There is no live foreign-exchange conversion.
// A currency is chargeable only when its row is enabled and both Flutterwave plan ids exist:
// FLW_PLAN_MONTHLY_<CUR> and FLW_PLAN_YEARLY_<CUR>.
// Those names keep the existing FLW_PLAN_MONTHLY_NGN / _USD / YEARLY_* variables.
import { amountFromMinor, moneyEqual } from "./money.ts";

/** APPROVED means Victor approved the amount. It does not mean Flutterwave LIVE is verified. */
export type PriceStatus = "APPROVED" | "UNAPPROVED";

/** Stored in payments.plan and entitlements.plan. These strings are the database check constraint. */
export const PLAN_IDS = ["premium_monthly", "premium_yearly"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/** ISO 4217 codes this server knows. Charging one still requires the row to be enabled and a plan id. */
export const CURRENCY_CODES = [
  "USD", "NGN", "GHS", "KES", "ZAR", "UGX", "TZS", "RWF", "ZMW", "EGP", "MAD", "XOF", "XAF", "GBP", "EUR",
] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export type CurrencyRow = {
  /** Off until Victor enables it. USD and NGN match the existing test plans. */
  enabled: boolean;
  /** APPROVED only for prices Victor approved. An UNAPPROVED row is never chargeable, even if enabled. */
  priceStatus: PriceStatus;
  /** Flutterwave recurring billing for this currency has been confirmed. Stays false until then. */
  recurringVerified: boolean;
  /** Flutterwave LIVE accepts charges in this currency on this account. Stays false until then. */
  liveVerified: boolean;
  /** Shown to operators. Says whether the amounts are approved and what is still unverified. */
  note: string;
  /** Hundredths of the currency. 449 is 4.49. This is the stored and compared amount. */
  monthlyMinor: number;
  yearlyMinor: number;
};

const UNVERIFIED = "UNAPPROVED placeholder. Disabled until Flutterwave LIVE, recurring billing, and account approval are confirmed.";

export const CURRENCY_TABLE: Record<CurrencyCode, CurrencyRow> = {
  USD: { enabled: true, priceStatus: "APPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 500, yearlyMinor: 4_000, note: "USD base. APPROVED final price (Victor, Oct 17, 2026): 5 monthly, 40 yearly. Matches Flutterwave test plans 246245 and 246247. Not live-verified." },
  NGN: { enabled: true, priceStatus: "APPROVED", recurringVerified: false, liveVerified: true, monthlyMinor: 250_000, yearlyMinor: 2_500_000, note: "APPROVED final price (Victor, Oct 17, 2026): 2500 monthly, 25000 yearly. Matches Flutterwave test plans 246244 and 246246. LIVE: local and international cards enabled on the live dashboard (checked Oct 17, 2026). Recurring renewal not yet observed live." },
  GHS: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 2_500, yearlyMinor: 20_000, note: UNVERIFIED },
  KES: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 25_000, yearlyMinor: 200_000, note: UNVERIFIED },
  ZAR: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 4_000, yearlyMinor: 32_000, note: UNVERIFIED },
  UGX: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 700_000, yearlyMinor: 5_500_000, note: UNVERIFIED },
  TZS: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 450_000, yearlyMinor: 3_500_000, note: UNVERIFIED },
  RWF: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 700_000, yearlyMinor: 5_500_000, note: UNVERIFIED },
  ZMW: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 14_000, yearlyMinor: 110_000, note: UNVERIFIED },
  EGP: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 25_000, yearlyMinor: 200_000, note: UNVERIFIED },
  MAD: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 5_000, yearlyMinor: 40_000, note: UNVERIFIED },
  XOF: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 300_000, yearlyMinor: 2_400_000, note: UNVERIFIED },
  XAF: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 300_000, yearlyMinor: 2_400_000, note: UNVERIFIED },
  GBP: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 399, yearlyMinor: 2_999, note: UNVERIFIED },
  EUR: { enabled: false, priceStatus: "UNAPPROVED", recurringVerified: false, liveVerified: false, monthlyMinor: 449, yearlyMinor: 3_599, note: UNVERIFIED },
};

export const PLAN_CATALOG: Record<PlanId, { label: string; per: string }> = {
  premium_monthly: { label: "Monthly", per: "per month" },
  premium_yearly: { label: "Yearly", per: "per year" },
};

export function priceStatusFor(currency: CurrencyCode): PriceStatus {
  return CURRENCY_TABLE[currency].priceStatus;
}

export function isPlanId(value: unknown): value is PlanId {
  return value === "premium_monthly" || value === "premium_yearly";
}

export function isCurrency(value: unknown): value is CurrencyCode {
  return typeof value === "string" && (CURRENCY_CODES as readonly string[]).includes(value);
}

/** FLW_PLAN_MONTHLY_NGN, FLW_PLAN_YEARLY_USD, and the same shape for any catalogue currency. */
export function planEnvName(plan: PlanId, currency: CurrencyCode): string {
  return `FLW_PLAN_${plan === "premium_monthly" ? "MONTHLY" : "YEARLY"}_${currency}`;
}

/** Flutterwave payment_plan ids are positive integers. A non-numeric env value fails closed. */
export function planIdFromEnv(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const id = Number(value.trim());
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export function currencyChargeable(currency: CurrencyCode, env: Record<string, string | undefined>): boolean {
  const row = CURRENCY_TABLE[currency];
  if (!row.enabled || row.priceStatus !== "APPROVED") return false;
  return planIdFromEnv(env[planEnvName("premium_monthly", currency)]) !== null
    && planIdFromEnv(env[planEnvName("premium_yearly", currency)]) !== null;
}

export type ResolvedPlan = {
  plan: PlanId;
  currency: CurrencyCode;
  amount: number;
  paymentPlanId: number;
  label: string;
  per: string;
  /** The row's approval marker. Only APPROVED rows resolve, because only they are chargeable. */
  priceStatus: PriceStatus;
};

export function resolvePlan(plan: unknown, currency: unknown, env: Record<string, string | undefined>): ResolvedPlan | null {
  if (!isPlanId(plan) || !isCurrency(currency) || !currencyChargeable(currency, env)) return null;
  const row = CURRENCY_TABLE[currency];
  const paymentPlanId = planIdFromEnv(env[planEnvName(plan, currency)]);
  if (paymentPlanId === null) return null;
  const meta = PLAN_CATALOG[plan];
  return {
    plan,
    currency,
    amount: amountFromMinor(plan === "premium_monthly" ? row.monthlyMinor : row.yearlyMinor),
    paymentPlanId,
    label: meta.label,
    per: meta.per,
    priceStatus: row.priceStatus,
  };
}

/** Match a verified charge back to exactly one catalogue price. Ambiguous or unknown amounts fail closed. */
export function planForAmount(amount: number | string, currency: string, env: Record<string, string | undefined>): ResolvedPlan | null {
  if (!isCurrency(currency)) return null;
  const hits = PLAN_IDS.map(plan => resolvePlan(plan, currency, env)).filter((row): row is ResolvedPlan => row !== null && moneyEqual(row.amount, amount));
  return hits.length === 1 ? hits[0] : null;
}

export function planIdMatches(plan: PlanId, currency: CurrencyCode, providerPlanId: string, env: Record<string, string | undefined>): boolean {
  const configured = resolvePlan(plan, currency, env)?.paymentPlanId;
  return configured !== undefined && String(configured) === providerPlanId;
}
