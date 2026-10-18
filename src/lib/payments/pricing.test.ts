import test from "node:test";
import assert from "node:assert/strict";
import { buildCheckout } from "./checkout.ts";
import { paymentsLive } from "./env.ts";
import { CURRENCY_CODES, CURRENCY_TABLE, currencyChargeable, resolvePlan } from "./plans.ts";
import { COUNTRY_CURRENCY, readPreference, resolveCountry, resolveQuote, toPublicQuote } from "./pricing.ts";

const USER = "11111111-1111-4111-8111-111111111111";
const user = { id: USER, email: "player@startap.fun" };

const env: Record<string, string> = {
  STARTAP_PAYMENTS_ENABLED: "1",
  FLW_SECRET_KEY: "test-secret-key",
  FLW_SECRET_HASH: "test-secret-hash",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  FLW_PLAN_MONTHLY_NGN: "101",
  FLW_PLAN_MONTHLY_USD: "102",
  FLW_PLAN_YEARLY_NGN: "201",
  FLW_PLAN_YEARLY_USD: "202",
};

test("country resolution uses the platform header, then USD", () => {
  assert.equal(resolveCountry("ng", {}), "NG");
  assert.equal(resolveCountry("x-vercel", {}), null);
  assert.equal(resolveCountry(null, {}), null);
  assert.equal(resolveCountry("US", { STARTAP_GEO_COUNTRY: "gh" }), "GH");
  assert.equal(resolveCountry("NG", { STARTAP_GEO_COUNTRY: "nope" }), "NG");
  assert.equal(COUNTRY_CURRENCY.NG, "NGN");
  assert.equal(COUNTRY_CURRENCY.GH, "GHS");
  assert.equal(COUNTRY_CURRENCY.KE, "KES");
  assert.equal(COUNTRY_CURRENCY.ZA, "ZAR");
  assert.equal(COUNTRY_CURRENCY.UG, "UGX");
  assert.equal(COUNTRY_CURRENCY.TZ, "TZS");
  assert.equal(COUNTRY_CURRENCY.RW, "RWF");
  assert.equal(COUNTRY_CURRENCY.ZM, "ZMW");
  assert.equal(COUNTRY_CURRENCY.EG, "EGP");
  assert.equal(COUNTRY_CURRENCY.MA, "MAD");
  assert.equal(COUNTRY_CURRENCY.CI, "XOF");
  assert.equal(COUNTRY_CURRENCY.SN, "XOF");
  assert.equal(COUNTRY_CURRENCY.CM, "XAF");
  assert.equal(COUNTRY_CURRENCY.US, "USD");
  assert.equal(COUNTRY_CURRENCY.GB, "GBP");
  assert.equal(COUNTRY_CURRENCY.FR, "EUR");
  assert.equal(COUNTRY_CURRENCY.DE, "EUR");
  assert.equal(COUNTRY_CURRENCY.SE, "EUR");
  assert.equal(COUNTRY_CURRENCY.NO, undefined);

  const nigeria = resolveQuote({ env, countryHeader: "NG", preference: "absent" });
  assert.equal(nigeria.ok, true);
  if (!nigeria.ok) return;
  assert.equal(nigeria.quote.currency, "NGN");
  assert.equal(nigeria.quote.monthly.amount, 2500);
  assert.equal(nigeria.quote.yearly.amount, 25000);
  assert.equal(nigeria.quote.usdFallback, false);
  assert.equal(nigeria.quote.localAvailable, true);
  assert.equal(nigeria.quote.priceStatus, "APPROVED");

  const unknown = resolveQuote({ env, countryHeader: "ZZ", preference: "absent" });
  assert.equal(unknown.ok, true);
  if (!unknown.ok) return;
  assert.equal(unknown.quote.currency, "USD");
  assert.equal(unknown.quote.localCurrency, "USD");
  assert.equal(unknown.quote.monthly.amount, 5);
  assert.equal(unknown.quote.yearly.amount, 40);
  assert.equal(unknown.quote.usdFallback, false);
  assert.equal(unknown.quote.priceStatus, "APPROVED");
});

test("only USD and NGN carry approved final prices; every other row is a disabled placeholder", () => {
  assert.deepEqual(
    { status: CURRENCY_TABLE.USD.priceStatus, monthly: CURRENCY_TABLE.USD.monthlyMinor, yearly: CURRENCY_TABLE.USD.yearlyMinor, enabled: CURRENCY_TABLE.USD.enabled },
    { status: "APPROVED", monthly: 500, yearly: 4_000, enabled: true },
  );
  assert.deepEqual(
    { status: CURRENCY_TABLE.NGN.priceStatus, monthly: CURRENCY_TABLE.NGN.monthlyMinor, yearly: CURRENCY_TABLE.NGN.yearlyMinor, enabled: CURRENCY_TABLE.NGN.enabled },
    { status: "APPROVED", monthly: 250_000, yearly: 2_500_000, enabled: true },
  );
  for (const code of CURRENCY_CODES) {
    const row = CURRENCY_TABLE[code];
    // Approved is not live-verified. Both stay false until Flutterwave LIVE is confirmed.
    assert.equal(row.recurringVerified, false, code);
    assert.equal(row.liveVerified, false, code);
    if (code === "USD" || code === "NGN") {
      assert.match(row.note, /APPROVED final price/, code);
      assert.doesNotMatch(row.note, /UNAPPROVED|placeholder/i, code);
      continue;
    }
    assert.equal(row.priceStatus, "UNAPPROVED", code);
    assert.equal(row.enabled, false, code);
    assert.match(row.note, /UNAPPROVED placeholder/, code);
    // A plan id alone never makes an unapproved row chargeable.
    const withPlans = { ...env, [`FLW_PLAN_MONTHLY_${code}`]: "301", [`FLW_PLAN_YEARLY_${code}`]: "302" };
    assert.equal(currencyChargeable(code, withPlans), false, code);
    assert.equal(resolvePlan("premium_monthly", code, withPlans), null, code);
  }
  assert.equal(resolvePlan("premium_yearly", "NGN", env)?.priceStatus, "APPROVED");
  assert.equal(resolvePlan("premium_monthly", "USD", env)?.priceStatus, "APPROVED");
});

test("client currency, amount and country cannot choose the charge", () => {
  assert.equal(readPreference(""), "invalid");
  assert.equal(readPreference("NGN"), "invalid");
  assert.equal(readPreference("EUR"), "invalid");
  assert.equal(readPreference(5), "invalid");
  assert.equal(readPreference(" local "), "local");
  assert.equal(readPreference("usd"), "USD");

  const tampered = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "local", amount: 1, price: 1, country: "US" },
    env,
    countryHeader: "NG",
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(tampered.ok, true);
  if (!tampered.ok) return;
  assert.equal(tampered.pending.amount, 2500);
  assert.equal(tampered.pending.currency, "NGN");
  assert.equal(tampered.providerBody.payment_plan, 101);
  assert.equal(JSON.stringify(toPublicQuote({
    priceStatus: "APPROVED",
    country: "NG",
    localCurrency: "NGN",
    currency: "NGN",
    usdFallback: false,
    localAvailable: true,
    monthly: tampered.plan.plan === "premium_monthly" ? { plan: "premium_monthly", amount: 2500, currency: "NGN", label: "Monthly", per: "per month" } : tampered.plan,
    yearly: { plan: "premium_yearly", amount: 25000, currency: "NGN", label: "Yearly", per: "per year" },
    monthlyPlan: tampered.plan,
    yearlyPlan: tampered.plan,
  })).includes("paymentPlanId"), false);

  const named = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "NGN", amount: 1, country: "NG" },
    env,
    countryHeader: "US",
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(named.ok, false);
  if (named.ok) return;
  assert.equal(named.status, 400);

  const forcedUsd = buildCheckout({
    user,
    body: { plan: "premium_yearly", currency: "USD", amount: 25000, country: "NG" },
    env,
    countryHeader: "NG",
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(forcedUsd.ok, true);
  if (!forcedUsd.ok) return;
  assert.equal(forcedUsd.pending.currency, "USD");
  assert.equal(forcedUsd.pending.amount, 40);
  assert.equal(forcedUsd.providerBody.payment_plan, 202);
});

test("disabled or plan-less currencies fall back to USD", () => {
  for (const header of ["GH", "KE", "GB", "FR", "DE"]) {
    const quote = resolveQuote({ env, countryHeader: header, preference: "local" });
    assert.equal(quote.ok, true, header);
    if (!quote.ok) continue;
    assert.equal(quote.quote.currency, "USD", header);
    assert.equal(quote.quote.usdFallback, true, header);
    assert.equal(quote.quote.localAvailable, false, header);
    assert.equal(quote.quote.monthly.amount, 5);
  }

  const half = resolveQuote({ env: { ...env, FLW_PLAN_YEARLY_NGN: "" }, countryHeader: "NG", preference: "local" });
  assert.equal(half.ok, true);
  if (!half.ok) return;
  assert.equal(half.quote.currency, "USD");
  assert.equal(half.quote.usdFallback, true);

  const noNgn = { ...env };
  delete noNgn.FLW_PLAN_MONTHLY_NGN;
  delete noNgn.FLW_PLAN_YEARLY_NGN;
  const nigeria = resolveQuote({ env: noNgn, countryHeader: "NG", preference: "local" });
  assert.equal(nigeria.ok, true);
  if (!nigeria.ok) return;
  assert.equal(nigeria.quote.currency, "USD");
  assert.equal(nigeria.quote.usdFallback, true);

  const enabledButNoPlan = {
    ...env,
    STARTAP_GEO_COUNTRY: "GH",
  };
  assert.equal(CURRENCY_TABLE.GHS.enabled, false);
  const ghana = resolveQuote({ env: enabledButNoPlan, countryHeader: "NG", preference: "absent" });
  assert.equal(ghana.ok, true);
  if (!ghana.ok) return;
  assert.equal(ghana.quote.country, "GH");
  assert.equal(ghana.quote.localCurrency, "GHS");
  assert.equal(ghana.quote.currency, "USD");

  assert.equal(paymentsLive({ ...env, FLW_PLAN_MONTHLY_USD: undefined, FLW_PLAN_YEARLY_USD: undefined }), false);
  const noUsd = resolveQuote({
    env: { ...env, FLW_PLAN_MONTHLY_USD: "", FLW_PLAN_YEARLY_USD: "" },
    countryHeader: "US",
    preference: "USD",
  });
  assert.equal(noUsd.ok, false);
  if (noUsd.ok) return;
  assert.equal(noUsd.status, 503);
});

test("payments stay unavailable when the flag is unset", () => {
  assert.equal(paymentsLive({}), false);
  assert.equal(paymentsLive({ ...env, STARTAP_PAYMENTS_ENABLED: undefined }), false);
  const quote = resolveQuote({ env: { ...env, STARTAP_PAYMENTS_ENABLED: "0" }, countryHeader: "NG", preference: "local" });
  assert.equal(quote.ok, false);
  if (quote.ok) return;
  assert.equal(quote.status, 503);
  const checkout = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "local", amount: 1, country: "NG" },
    env: { ...env, STARTAP_PAYMENTS_ENABLED: "" },
    countryHeader: "NG",
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(checkout.ok, false);
  if (checkout.ok) return;
  assert.equal(checkout.status, 503);
});
