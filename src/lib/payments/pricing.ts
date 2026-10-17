import { paymentsLive } from "./env.ts";
import { currencyChargeable, isPlanId, PRICE_APPROVAL, resolvePlan, type CurrencyCode, type ResolvedPlan } from "./plans.ts";
import type { PriceQuoteView } from "./quote.ts";

export type PricePreference = "local" | "USD" | "absent";

/**
 * ISO 3166-1 alpha-2 → ISO 4217. Unknown countries are not listed and resolve to USD.
 * Every current EU member maps to EUR, including members whose cash currency is not the euro.
 * That EUR row stays disabled until it is verified. GB is GBP, not EUR.
 */
export const COUNTRY_CURRENCY: Record<string, CurrencyCode> = {
  NG: "NGN",
  GH: "GHS",
  KE: "KES",
  ZA: "ZAR",
  UG: "UGX",
  TZ: "TZS",
  RW: "RWF",
  ZM: "ZMW",
  EG: "EGP",
  MA: "MAD",
  CI: "XOF",
  SN: "XOF",
  CM: "XAF",
  US: "USD",
  GB: "GBP",
  // EU members.
  AT: "EUR", BE: "EUR", BG: "EUR", HR: "EUR", CY: "EUR", CZ: "EUR", DK: "EUR", EE: "EUR",
  FI: "EUR", FR: "EUR", DE: "EUR", GR: "EUR", HU: "EUR", IE: "EUR", IT: "EUR", LV: "EUR",
  LT: "EUR", LU: "EUR", MT: "EUR", NL: "EUR", PL: "EUR", PT: "EUR", RO: "EUR", SK: "EUR",
  SI: "EUR", ES: "EUR", SE: "EUR",
};

export function currencyForCountry(country: string | null): CurrencyCode {
  if (!country) return "USD";
  return COUNTRY_CURRENCY[country] ?? "USD";
}

const ISO2 = /^[A-Z]{2}$/;

/**
 * Country comes from STARTAP_GEO_COUNTRY when that override is a real alpha-2 code,
 * otherwise from the platform header x-vercel-ip-country. Anything else is unknown.
 */
export function resolveCountry(countryHeader: string | null | undefined, env: Record<string, string | undefined>): string | null {
  const override = env.STARTAP_GEO_COUNTRY?.trim().toUpperCase() ?? "";
  if (ISO2.test(override)) return override;
  const header = countryHeader?.trim().toUpperCase() ?? "";
  return ISO2.test(header) ? header : null;
}

/** The only preference the client may send. Anything else, including a currency code, is invalid. */
export function readPreference(value: unknown): PricePreference | "invalid" {
  if (value === undefined || value === null) return "absent";
  if (typeof value !== "string") return "invalid";
  const token = value.trim();
  if (!token) return "invalid";
  if (token.toLowerCase() === "local") return "local";
  if (token.toUpperCase() === "USD") return "USD";
  return "invalid";
}

export type PriceQuote = PriceQuoteView & {
  monthlyPlan: ResolvedPlan;
  yearlyPlan: ResolvedPlan;
};

export function toPublicQuote(quote: PriceQuote): PriceQuoteView {
  return {
    priceStatus: quote.priceStatus,
    country: quote.country,
    localCurrency: quote.localCurrency,
    currency: quote.currency,
    usdFallback: quote.usdFallback,
    localAvailable: quote.localAvailable,
    monthly: quote.monthly,
    yearly: quote.yearly,
  };
}

/**
 * Server offer. Amount, country and currency on the client body are not arguments.
 * `preference` is only local, USD, or absent. An absent choice uses the local currency when it is chargeable.
 */
export function resolveQuote(input: {
  env: Record<string, string | undefined>;
  countryHeader: string | null | undefined;
  preference: PricePreference;
  plan?: unknown;
}): { ok: true; quote: PriceQuote; selected: ResolvedPlan | null } | { ok: false; status: number; error: string } {
  if (!paymentsLive(input.env)) return { ok: false, status: 503, error: "Payments are not available" };
  if (input.plan !== undefined && !isPlanId(input.plan)) return { ok: false, status: 400, error: "Choose a monthly or yearly plan" };
  const country = resolveCountry(input.countryHeader, input.env);
  const localCurrency = currencyForCountry(country);
  if (!currencyChargeable("USD", input.env)) return { ok: false, status: 503, error: "Payments are not available" };
  const localChargeable = currencyChargeable(localCurrency, input.env);
  const wantLocal = input.preference === "local" || (input.preference === "absent" && localChargeable);
  const currency: CurrencyCode = wantLocal && localChargeable ? localCurrency : "USD";
  const monthly = resolvePlan("premium_monthly", currency, input.env);
  const yearly = resolvePlan("premium_yearly", currency, input.env);
  if (!monthly || !yearly) return { ok: false, status: 503, error: "Payments are not available" };
  const selected = input.plan === undefined ? null : input.plan === "premium_monthly" ? monthly : yearly;
  const quote: PriceQuote = {
    priceStatus: PRICE_APPROVAL,
    country,
    localCurrency,
    currency,
    usdFallback: currency === "USD" && localCurrency !== "USD",
    localAvailable: localChargeable && localCurrency !== "USD",
    monthly: { plan: monthly.plan, amount: monthly.amount, currency: monthly.currency, label: monthly.label, per: monthly.per },
    yearly: { plan: yearly.plan, amount: yearly.amount, currency: yearly.currency, label: yearly.label, per: yearly.per },
    monthlyPlan: monthly,
    yearlyPlan: yearly,
  };
  return { ok: true, quote, selected };
}
