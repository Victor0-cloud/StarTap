import test from "node:test";
import assert from "node:assert/strict";
import { buildCheckout, createCheckout } from "./checkout.ts";
import { paymentsLive } from "./env.ts";
import { txRefFor } from "./fields.ts";
import { hostedLink, requestHostedLink } from "./flutterwave.ts";
import { PRICE_APPROVAL } from "./plans.ts";

const USER = "11111111-1111-4111-8111-111111111111";
const user = { id: USER, email: "Player@StarTap.fun" };

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

test("payments stay off unless the flag and every required variable are set", () => {
  assert.equal(paymentsLive({}), false);
  assert.equal(paymentsLive({ ...env, STARTAP_PAYMENTS_ENABLED: "0" }), false);
  assert.equal(paymentsLive({ ...env, FLW_SECRET_KEY: "  " }), false);
  assert.equal(paymentsLive({ ...env, NEXT_PUBLIC_SUPABASE_URL: "http://evil.example" }), false);
  assert.equal(paymentsLive({ ...env, SUPABASE_SERVICE_ROLE_KEY: env.NEXT_PUBLIC_SUPABASE_ANON_KEY }), false);
  assert.equal(paymentsLive(env), true);
  assert.equal(PRICE_APPROVAL, "UNAPPROVED");
});

test("fake plan rejected", () => {
  const oldName = buildCheckout({
    user,
    body: { plan: "monthly", currency: "NGN", amount: 1 },
    env,
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(oldName.ok, false);

  const fake = buildCheckout({
    user,
    body: { plan: "lifetime", currency: "NGN", amount: 1 },
    env,
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(fake.ok, false);
  if (fake.ok) return;
  assert.equal(fake.status, 400);

  const priced = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "NGN", amount: 1, price: 1, tx_ref: "client-ref" },
    env,
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
    id: "22222222-2222-4222-8222-222222222222",
  });
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.providerBody.amount, 2500, "price from server");
  assert.equal(priced.providerBody.currency, "NGN", "currency from server");
  assert.equal(priced.providerBody.payment_plan, 101);
  assert.equal(priced.providerBody.tx_ref, txRefFor(USER, "premium_monthly", "NGN", "22222222-2222-4222-8222-222222222222"));
  assert.equal(priced.pending.amount, 2500);
  assert.equal(priced.pending.status, "pending");
  assert.notEqual(priced.providerBody.tx_ref, "client-ref");
});

test("price from server", () => {
  const priced = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "NGN", amount: 1, price: 9 },
    env,
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.providerBody.amount, 2500);
  assert.equal(priced.pending.amount, 2500);
});

test("currency from server", () => {
  const priced = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "USD", amount: 2500 },
    env,
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(priced.ok, true);
  if (!priced.ok) return;
  assert.equal(priced.providerBody.currency, "USD");
  assert.equal(priced.providerBody.amount, 5);
});

test("fake success URL can't grant", () => {
  const foreign = buildCheckout({
    user,
    body: { plan: "premium_yearly", currency: "USD", successUrl: "https://evil.example/phish", redirect_url: "https://evil.example/phish" },
    env,
    requestUrl: "https://evil.example/api/flutterwave/create-checkout/",
  });
  assert.equal(foreign.ok, true);
  if (!foreign.ok) return;
  assert.equal(foreign.providerBody.redirect_url, "https://startap.fun/payment/success/");
  assert.equal("granted" in foreign.providerBody, false);
  assert.equal(foreign.pending.status, "pending");
  assert.equal(foreign.providerBody.amount, 40);
  assert.equal(foreign.providerBody.payment_plan, 202);

  const preview = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "USD", successUrl: "https://evil.example/steal" },
    env,
    requestUrl: "https://startap-preview.vercel.app/api/flutterwave/create-checkout/",
  });
  assert.equal(preview.ok, true);
  if (!preview.ok) return;
  assert.equal(preview.providerBody.redirect_url, "https://startap-preview.vercel.app/payment/success/");
});

test("unauthenticated checkout rejected", async () => {
  let inserts = 0;
  let links = 0;
  const result = await createCheckout({
    user: null,
    body: { plan: "premium_monthly", currency: "NGN", amount: 1, successUrl: "https://evil.example" },
    env,
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
    insertPending: async () => { inserts += 1; },
    markFailed: async () => {},
    createLink: async () => { links += 1; return { ok: true, link: "https://checkout.flutterwave.com/v3/hosted/pay/abc" }; },
  });
  assert.equal(result.status, 401);
  assert.equal(inserts, 0);
  assert.equal(links, 0);

  const off = await createCheckout({
    user,
    body: { plan: "premium_monthly", currency: "NGN" },
    env: { ...env, STARTAP_PAYMENTS_ENABLED: "0" },
    requestUrl: "https://startap.fun/",
    insertPending: async () => { inserts += 1; },
    markFailed: async () => {},
    createLink: async () => { links += 1; return { ok: false }; },
  });
  assert.equal(off.status, 503);
  assert.equal(inserts, 0);
});

const TEST_KEY = "FLWSECK_TEST-sandbox";
const LIVE_KEY = "FLWSECK-live";
const TEST_LINK = "https://checkout-v2.dev-flutterwave.com/v3/hosted/pay/abc";
const PROD_LINK = "https://checkout.flutterwave.com/v3/hosted/pay/abc";

test("test checkout host accepted with a test key", () => {
  assert.equal(hostedLink(TEST_LINK, TEST_KEY), TEST_LINK);
});

test("test checkout host rejected with a live-style key", () => {
  assert.equal(hostedLink(TEST_LINK, LIVE_KEY), null);
  assert.equal(hostedLink(TEST_LINK, "FLWSECK_TEST"), null);
});

test("lookalike checkout host and http URL rejected", () => {
  assert.equal(hostedLink("https://checkout-v2.dev-flutterwave.com.evil.com/pay", TEST_KEY), null);
  assert.equal(hostedLink("https://evil.checkout-v2.dev-flutterwave.com/pay", TEST_KEY), null);
  assert.equal(hostedLink("http://checkout-v2.dev-flutterwave.com/pay", TEST_KEY), null);
  assert.equal(hostedLink("http://checkout.flutterwave.com/pay", LIVE_KEY), null);
  assert.equal(hostedLink("https://checkout.flutterwave.com.evil.com/pay", LIVE_KEY), null);
});

test("prod checkout host accepted", () => {
  assert.equal(hostedLink(PROD_LINK, LIVE_KEY), PROD_LINK);
  assert.equal(hostedLink(PROD_LINK, TEST_KEY), PROD_LINK);
});

test("requestHostedLink accepts the test host and logs only status and reason", async () => {
  const built = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "NGN" },
    env,
    requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
  });
  assert.equal(built.ok, true);
  if (!built.ok) return;

  const accepted = await requestHostedLink(built.providerBody, TEST_KEY, async () => Response.json({
    status: "success",
    message: "Hosted Link",
    data: { link: TEST_LINK },
  }));
  assert.equal(accepted.ok, true);
  if (accepted.ok) assert.equal(accepted.link, TEST_LINK);

  const logs: string[] = [];
  const original = console.error;
  console.error = (...args: unknown[]) => { logs.push(args.map(String).join(" ")); };
  try {
    const rejected = await requestHostedLink(built.providerBody, LIVE_KEY, async () => Response.json({
      status: "success",
      data: { link: TEST_LINK },
    }, { status: 200 }));
    assert.equal(rejected.ok, false);
    const upstream = await requestHostedLink(built.providerBody, TEST_KEY, async () => new Response("no", { status: 401 }));
    assert.equal(upstream.ok, false);
  } finally {
    console.error = original;
  }

  assert.equal(logs.length, 2);
  const hostLog = JSON.parse(logs[0]) as { status: number; reason: string };
  const upstreamLog = JSON.parse(logs[1]) as { status: number; reason: string };
  assert.equal(hostLog.status, 200);
  assert.equal(hostLog.reason, "host_rejected");
  assert.equal(upstreamLog.status, 401);
  assert.equal(upstreamLog.reason, "upstream");
  for (const line of logs) {
    assert.equal(line.includes(TEST_KEY), false);
    assert.equal(line.includes(LIVE_KEY), false);
    assert.equal(line.includes(TEST_LINK), false);
    assert.equal(line.includes(built.providerBody.customer.email), false);
    assert.equal(line.includes(built.providerBody.tx_ref), false);
  }
});

test("a currency with no plan id is not offered", () => {
  const gbp = buildCheckout({
    user,
    body: { plan: "premium_monthly", currency: "GBP" },
    env,
    requestUrl: "https://startap.fun/",
  });
  assert.equal(gbp.ok, false);
});
