import test from "node:test";
import assert from "node:assert/strict";
import { entitlementIsActive } from "./entitlement.ts";
import { publicWebhookFields, txRefFor, type PaymentRow, type VerifiedTx } from "./fields.ts";
import { handleWebhook, premiumFromState, type WebhookState } from "./webhook.ts";

const USER = "11111111-1111-4111-8111-111111111111";
const EXTRA = "22222222-2222-4222-8222-222222222222";
const EMAIL = "player@startap.fun";
const HASH = "test-secret-hash";

const env: Record<string, string> = {
  STARTAP_PAYMENTS_ENABLED: "1",
  FLW_SECRET_KEY: "test-secret-key",
  FLW_SECRET_HASH: HASH,
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  FLW_PLAN_MONTHLY_NGN: "101",
  FLW_PLAN_MONTHLY_USD: "102",
  FLW_PLAN_YEARLY_NGN: "201",
  FLW_PLAN_YEARLY_USD: "202",
};

const blank = (): WebhookState => ({ events: [], payments: [], entitlements: [], profiles: [{ id: USER, email: EMAIL }] });

function pending(amount = 2500, currency: PaymentRow["currency"] = "NGN"): PaymentRow {
  return {
    txRef: txRefFor(USER, "premium_monthly", currency, EXTRA),
    flwId: null,
    userId: USER,
    plan: "premium_monthly",
    amount,
    currency,
    status: "pending",
    verifiedAt: null,
    email: EMAIL,
  };
}

function verified(over: Partial<VerifiedTx> = {}): VerifiedTx {
  return {
    id: "99",
    txRef: txRefFor(USER, "premium_monthly", "NGN", EXTRA),
    amount: 2500,
    currency: "NGN",
    status: "successful",
    email: EMAIL,
    metaUserId: USER,
    metaPlan: "premium_monthly",
    ...over,
  };
}

async function charge(state: WebhookState, tx: VerifiedTx, header: string | null = HASH, calls?: { n: number }) {
  return handleWebhook({
    headerHash: header,
    secretHash: HASH,
    payload: {
      event: "charge.completed",
      data: { id: Number(tx.id), tx_ref: tx.txRef, amount: 1, currency: "EUR", status: "successful", card: { first_6digits: "424242", token: "card-token" } },
    },
    state,
    env,
    now: new Date("2026-10-17T12:00:00.000Z"),
    verify: async () => {
      if (calls) calls.n += 1;
      return { ok: true, tx };
    },
  });
}

test("invalid hash rejected", async () => {
  const calls = { n: 0 };
  const outcome = await charge(blank(), verified(), "wrong-hash", calls);
  assert.equal(outcome.status, 401);
  assert.equal(calls.n, 0);
  assert.equal(outcome.write, null);
  assert.equal(outcome.state.entitlements.length, 0);
});

test("card fields on the webhook body are dropped", () => {
  const fields = publicWebhookFields({
    event: "charge.completed",
    data: { id: 99, tx_ref: "st.x", card: { first_6digits: "424242", token: "card-token" }, customer: { email: EMAIL } },
  });
  assert.equal(JSON.stringify(fields).includes("424242"), false);
  assert.equal(JSON.stringify(fields).includes("card-token"), false);
});

test("duplicate/replayed webhook idempotent", async () => {
  const calls = { n: 0 };
  const state = blank();
  state.payments.push(pending());
  const first = await charge(state, verified(), HASH, calls);
  assert.equal(first.body.granted, true);
  assert.equal(first.state.payments[0]?.status, "successful");
  assert.equal(first.state.entitlements.length, 1);
  const end = first.state.entitlements[0]?.currentPeriodEnd;
  assert.equal(premiumFromState(first.state, USER, new Date("2026-10-18T00:00:00.000Z")).isPremium, true);
  assert.equal(JSON.stringify(first.write).includes("424242"), false);
  assert.equal(JSON.stringify(first.write).includes("card-token"), false);

  const second = await charge(first.state, verified(), HASH, calls);
  assert.equal(second.body.duplicate, true);
  assert.equal(second.write, null);
  assert.equal(second.state.entitlements[0]?.currentPeriodEnd, end);
  assert.equal(calls.n, 2);
});

test("wrong amount", async () => {
  const low = blank();
  low.payments.push(pending());
  const amount = await charge(low, verified({ amount: 2499.99 }));
  assert.equal(amount.body.granted, false);
  assert.equal(amount.body.reason, "amount");
  assert.equal(amount.state.entitlements.length, 0);
  assert.equal(amount.state.payments[0]?.status, "failed");

});

test("wrong currency", async () => {
  const usd = blank();
  usd.payments.push(pending());
  const currency = await charge(usd, verified({ currency: "USD", amount: 2500 }));
  assert.equal(currency.body.reason, "currency");
  assert.equal(currency.body.granted, false);
  assert.equal(currency.state.entitlements.length, 0);
});

test("wrong tx_ref", async () => {
  const state = blank();
  state.payments.push(pending());
  const outcome = await charge(state, verified({ txRef: "client-supplied-ref" }));
  assert.equal(outcome.body.granted, false);
  assert.equal(outcome.body.reason, "reference");
  assert.equal(outcome.state.entitlements.length, 0);
});

test("failed/cancelled don't grant", async () => {
  for (const status of ["failed", "cancelled"]) {
    const state = blank();
    state.payments.push(pending());
    const outcome = await charge(state, verified({ status, id: status === "failed" ? "31" : "32" }));
    assert.equal(outcome.body.granted, false);
    assert.equal(outcome.body.reason, "failed");
    assert.equal(outcome.state.entitlements.length, 0);
    assert.equal(outcome.state.payments[0]?.status, status === "cancelled" ? "cancelled" : "failed");
  }
});

test("subscription.cancelled keeps access until the period ends", async () => {
  const state = blank();
  state.payments.push(pending());
  const granted = await charge(state, verified());
  const outcome = await handleWebhook({
    headerHash: HASH,
    secretHash: HASH,
    payload: { event: "subscription.cancelled", data: { status: "deactivated", customer: { email: EMAIL }, plan: { id: 101 } } },
    state: granted.state,
    env,
    now: new Date("2026-10-20T00:00:00.000Z"),
    verify: async () => { throw new Error("cancel must not verify a charge"); },
  });
  assert.equal(outcome.body.cancelled, true);
  const row = outcome.state.entitlements[0];
  assert.equal(row?.status, "cancelled");
  assert.equal(row?.currentPeriodEnd, granted.state.entitlements[0]?.currentPeriodEnd);
  assert.equal(entitlementIsActive(row ?? null, new Date("2026-11-01T00:00:00.000Z")), true);
  assert.equal(entitlementIsActive(row ?? null, new Date("2026-12-01T00:00:00.000Z")), false);
});

test("expired not active", () => {
  const state = blank();
  state.entitlements.push({
    userId: USER,
    plan: "premium_monthly",
    status: "active",
    provider: "flutterwave",
    currentPeriodStart: "2026-01-01T00:00:00.000Z",
    currentPeriodEnd: "2026-02-01T00:00:00.000Z",
  });
  assert.equal(premiumFromState(state, USER, new Date("2026-02-01T00:00:00.000Z")).isPremium, false);
  assert.equal(premiumFromState(state, USER, new Date("2026-01-15T00:00:00.000Z")).isPremium, true);
});
