// Central plan catalogue. Amounts are placeholders and must not be treated as approved prices.
// Database plan ids are premium_monthly and premium_yearly. Flutterwave payment_plan integers come from env.
// The applied payments table only accepts NGN and USD. Another currency needs a new migration.

export const PRICE_APPROVAL = "UNAPPROVED" as const;

/** Stored in payments.plan and entitlements.plan. These strings are the database check constraint. */
export const PLAN_IDS = ["premium_monthly", "premium_yearly"] as const;
export type PlanId = (typeof PLAN_IDS)[number];

/** payments.currency allows only these two. */
export const CURRENCY_CODES = ["NGN", "USD"] as const;
export type CurrencyCode = (typeof CURRENCY_CODES)[number];

export const OFFERED_CURRENCIES = CURRENCY_CODES;

type Price = { amount: number; status: typeof PRICE_APPROVAL; env: string };

export const PLAN_CATALOG: Record<PlanId, { label: string; per: string; prices: Record<CurrencyCode, Price> }> = {
  premium_monthly: {
    label: "Monthly",
    per: "per month",
    prices: {
      NGN: { amount: 2500, status: PRICE_APPROVAL, env: "FLW_PLAN_MONTHLY_NGN" },
      USD: { amount: 5, status: PRICE_APPROVAL, env: "FLW_PLAN_MONTHLY_USD" },
    },
  },
  premium_yearly: {
    label: "Yearly",
    per: "per year",
    prices: {
      NGN: { amount: 25000, status: PRICE_APPROVAL, env: "FLW_PLAN_YEARLY_NGN" },
      USD: { amount: 40, status: PRICE_APPROVAL, env: "FLW_PLAN_YEARLY_USD" },
    },
  },
};

export function isPlanId(value: unknown): value is PlanId {
  return value === "premium_monthly" || value === "premium_yearly";
}

export function isCurrency(value: unknown): value is CurrencyCode {
  return value === "NGN" || value === "USD";
}

/** Flutterwave payment_plan ids are positive integers. A non-numeric env value fails closed. */
export function planIdFromEnv(value: string | undefined): number | null {
  if (!value || !/^\d+$/.test(value.trim())) return null;
  const id = Number(value.trim());
  return Number.isSafeInteger(id) && id > 0 ? id : null;
}

export type ResolvedPlan = {
  plan: PlanId;
  currency: CurrencyCode;
  amount: number;
  paymentPlanId: number;
  label: string;
  /** Always the catalogue marker, so callers cannot forget the prices are placeholders. */
  priceStatus: typeof PRICE_APPROVAL;
};

export function resolvePlan(plan: unknown, currency: unknown, env: Record<string, string | undefined>): ResolvedPlan | null {
  if (!isPlanId(plan) || !isCurrency(currency)) return null;
  const price = PLAN_CATALOG[plan].prices[currency];
  const paymentPlanId = planIdFromEnv(env[price.env]);
  if (paymentPlanId === null) return null;
  return { plan, currency, amount: price.amount, paymentPlanId, label: PLAN_CATALOG[plan].label, priceStatus: price.status };
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
