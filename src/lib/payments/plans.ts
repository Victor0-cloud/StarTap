// Central plan catalogue. Every amount is an UNAPPROVED placeholder.
// There is no live foreign-exchange conversion. A currency is chargeable only when its row is
// enabled and both Flutterwave plan ids exist: FLW_PLAN_MONTHLY_<CUR> and FLW_PLAN_YEARLY_<CUR>.
// Those names keep the existing FLW_PLAN_MONTHLY_NGN / _USD / YEARLY_* variables.

export const PRICE_APPROVAL = "UNAPPROVED" as const;

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
  /** Flutterwave recurring billing for this currency has been confirmed. Stays false until then. */
  recurringVerified: boolean;
  /** Flutterwave LIVE accepts charges in this currency on this account. Stays false until then. */
  liveVerified: boolean;
  /** Shown to operators. Every note says the amounts are not approved prices. */
  note: string;
  monthly: number;
  yearly: number;
};

const UNVERIFIED = "UNAPPROVED placeholder. Disabled until Flutterwave LIVE, recurring billing, and account approval are confirmed.";

export const CURRENCY_TABLE: Record<CurrencyCode, CurrencyRow> = {
  USD: { enabled: true, recurringVerified: false, liveVerified: false, monthly: 5, yearly: 40, note: "USD base. UNAPPROVED placeholder. Enabled for the existing test plans. Not live-verified." },
  NGN: { enabled: true, recurringVerified: false, liveVerified: false, monthly: 2500, yearly: 25000, note: "Matches the existing test plans. UNAPPROVED placeholder. Enabled for test checkout. Not live-verified." },
  GHS: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 80, yearly: 600, note: UNVERIFIED },
  KES: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 700, yearly: 5500, note: UNVERIFIED },
  ZAR: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 90, yearly: 700, note: UNVERIFIED },
  UGX: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 20000, yearly: 150000, note: UNVERIFIED },
  TZS: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 15000, yearly: 110000, note: UNVERIFIED },
  RWF: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 7000, yearly: 55000, note: UNVERIFIED },
  ZMW: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 140, yearly: 1100, note: UNVERIFIED },
  EGP: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 250, yearly: 2000, note: UNVERIFIED },
  MAD: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 50, yearly: 400, note: UNVERIFIED },
  XOF: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 3000, yearly: 24000, note: UNVERIFIED },
  XAF: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 3000, yearly: 24000, note: UNVERIFIED },
  GBP: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 4, yearly: 32, note: UNVERIFIED },
  EUR: { enabled: false, recurringVerified: false, liveVerified: false, monthly: 5, yearly: 40, note: UNVERIFIED },
};

export const PLAN_CATALOG: Record<PlanId, { label: string; per: string }> = {
  premium_monthly: { label: "Monthly", per: "per month" },
  premium_yearly: { label: "Yearly", per: "per year" },
};

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
  if (!row.enabled) return false;
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
  /** Always the catalogue marker, so callers cannot forget the prices are placeholders. */
  priceStatus: typeof PRICE_APPROVAL;
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
    amount: plan === "premium_monthly" ? row.monthly : row.yearly,
    paymentPlanId,
    label: meta.label,
    per: meta.per,
    priceStatus: PRICE_APPROVAL,
  };
}

/** Match a verified charge back to exactly one catalogue price. Ambiguous or unknown amounts fail closed. */
export function planForAmount(amount: number, currency: string, env: Record<string, string | undefined>): ResolvedPlan | null {
  if (!isCurrency(currency)) return null;
  const hits = PLAN_IDS.map(plan => resolvePlan(plan, currency, env)).filter((row): row is ResolvedPlan => row !== null && moneySame(row.amount, amount));
  return hits.length === 1 ? hits[0] : null;
}

function moneySame(a: number, b: number): boolean {
  return Number.isFinite(a) && Number.isFinite(b) && Math.round(a * 100) === Math.round(b * 100);
}

export function planIdMatches(plan: PlanId, currency: CurrencyCode, providerPlanId: string, env: Record<string, string | undefined>): boolean {
  const configured = resolvePlan(plan, currency, env)?.paymentPlanId;
  return configured !== undefined && String(configured) === providerPlanId;
}
