import test from "node:test";
import assert from "node:assert/strict";
import { entitlementIsActive } from "./entitlement.ts";
import { publicVerifiedTransaction, publicWebhookFields, txRefFor, type PaymentRow, type VerifiedTx } from "./fields.ts";
import { confirmationStatus, verifySignedInPayment } from "./verify.ts";
import { finalizeVerifiedCharge, handleWebhook, premiumFromState, type WebhookState } from "./webhook.ts";

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
    paymentPlanId: "101",
    ...over,
  };
}

const signer = { id: USER, email: EMAIL };
const OTHER = "33333333-3333-4333-8333-333333333333";

function verifyCall(state: WebhookState, tx: VerifiedTx, user: { id: string; email: string } | null, body?: Record<string, unknown>, calls?: { n: number }) {
  return verifySignedInPayment({
    user,
    body: body ?? { transaction_id: tx.id, tx_ref: tx.txRef, status: "successful", amount: 1, currency: "EUR", plan: "lifetime", user_id: "browser-supplied" },
    state,
    env,
    now: new Date("2026-10-17T12:00:00.000Z"),
    verify: async id => {
      if (calls) calls.n += 1;
      if (id !== tx.id) return { ok: false, retry: false };
      return { ok: true, tx };
    },
  });
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
  const tx = verified({ amount: 2499.99 });
  const amount = await charge(low, tx);
  assert.equal(amount.body.granted, false);
  assert.equal(amount.body.reason, "amount");
  assert.equal(amount.state.entitlements.length, 0);
  assert.equal(amount.state.payments[0]?.status, "failed");

  const viaPage = blank();
  viaPage.payments.push(pending());
  const page = await verifyCall(viaPage, tx, signer);
  assert.equal(page.body.granted, false);
  assert.equal(page.body.reason, "amount");
  assert.equal(page.state.entitlements.length, 0);
});

test("wrong currency", async () => {
  const usd = blank();
  usd.payments.push(pending());
  const tx = verified({ currency: "USD", amount: 2500 });
  const currency = await charge(usd, tx);
  assert.equal(currency.body.reason, "currency");
  assert.equal(currency.body.granted, false);
  assert.equal(currency.state.entitlements.length, 0);

  const viaPage = blank();
  viaPage.payments.push(pending());
  const page = await verifyCall(viaPage, tx, signer);
  assert.equal(page.body.granted, false);
  assert.equal(page.body.reason, "currency");
  assert.equal(page.state.entitlements.length, 0);
});

test("wrong tx_ref", async () => {
  const state = blank();
  state.payments.push(pending());
  const outcome = await charge(state, verified({ txRef: "client-supplied-ref" }));
  assert.equal(outcome.body.granted, false);
  assert.equal(outcome.body.reason, "reference");
  assert.equal(outcome.state.entitlements.length, 0);

  const viaPage = blank();
  viaPage.payments.push(pending());
  const page = await verifyCall(viaPage, verified({ txRef: "client-supplied-ref", id: "77" }), signer, {
    transaction_id: "77",
    tx_ref: pending().txRef,
  });
  assert.equal(page.status, 400);
  assert.equal(page.write, null);
  assert.equal(page.state.payments[0]?.status, "pending");
  assert.equal(page.state.entitlements.length, 0);
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

test("Flutterwave test-mode rewritten email", async () => {
  const state = blank();
  state.payments.push({ ...pending(), email: "victorotite7+tag@gmail.com" });
  const tx = verified({ email: "ravesb_4f2a9c_victorotite7@gmail.com", id: "10558480", paymentPlanId: "101" });
  const outcome = await charge(state, tx);
  assert.equal(outcome.body.granted, true);
  assert.equal(outcome.body.reason, undefined);
  assert.equal(outcome.state.payments[0]?.status, "successful");
  assert.equal(outcome.state.entitlements.length, 1);
  assert.equal(outcome.write?.eventKey, "charge.completed:10558480");
});

test("correct transaction with a different provider email still succeeds", async () => {
  const state = blank();
  state.payments.push(pending());
  const tx = verified({ email: "someone-else@example.com" });
  const outcome = await verifyCall(state, tx, signer);
  assert.equal(outcome.body.granted, true);
  assert.equal(outcome.state.entitlements.length, 1);
  assert.equal(outcome.state.payments[0]?.status, "successful");
  assert.equal(outcome.state.payments[0]?.email, EMAIL);
});

test("payment belonging to another signed-in user fails", async () => {
  const calls = { n: 0 };
  const state = blank();
  state.payments.push(pending());
  const outcome = await verifyCall(state, verified(), { id: OTHER, email: "other@startap.fun" }, undefined, calls);
  assert.equal(outcome.status, 404);
  assert.equal(calls.n, 0);
  assert.equal(outcome.write, null);
  assert.equal(outcome.state.entitlements.length, 0);
  assert.equal(outcome.state.payments[0]?.status, "pending");
});

test("fake transaction ID fails", async () => {
  const calls = { n: 0 };
  const state = blank();
  state.payments.push(pending());
  const nonsense = await verifyCall(state, verified(), signer, { transaction_id: "not-a-number", tx_ref: pending().txRef }, calls);
  assert.equal(nonsense.status, 400);
  assert.equal(calls.n, 0);
  assert.equal(nonsense.state.entitlements.length, 0);

  const missing = await verifyCall(state, verified({ id: "404" }), signer, { transaction_id: "10558480", tx_ref: pending().txRef }, calls);
  assert.equal(missing.status, 400);
  assert.equal(calls.n, 1);
  assert.equal(missing.write, null);
  assert.equal(missing.state.payments[0]?.status, "pending");
  assert.equal(missing.state.entitlements.length, 0);
});

test("wrong plan fails", async () => {
  const state = blank();
  state.payments.push(pending());
  const tx = verified({ paymentPlanId: "999" });
  const outcome = await charge(state, tx);
  assert.equal(outcome.body.granted, false);
  assert.equal(outcome.body.reason, "plan");
  assert.equal(outcome.state.entitlements.length, 0);
  assert.equal(outcome.state.payments[0]?.status, "failed");

  const viaPage = blank();
  viaPage.payments.push(pending());
  const page = await verifyCall(viaPage, tx, signer);
  assert.equal(page.body.reason, "plan");
  assert.equal(page.state.entitlements.length, 0);
});

test("verify route without login fails", async () => {
  const calls = { n: 0 };
  const state = blank();
  state.payments.push(pending());
  const outcome = await verifyCall(state, verified(), null, undefined, calls);
  assert.equal(outcome.status, 401);
  assert.equal(calls.n, 0);
  assert.equal(outcome.write, null);
  assert.equal(outcome.state.entitlements.length, 0);
});

test("webhook then verify = one grant", async () => {
  const state = blank();
  state.payments.push(pending());
  const tx = verified({ email: "ravesb_4f2a9c_victorotite7@gmail.com" });
  const first = await charge(state, tx);
  assert.equal(first.body.granted, true);
  assert.equal(first.write?.eventKey, `charge.completed:${tx.id}`);
  const end = first.state.entitlements[0]?.currentPeriodEnd;
  const second = await verifyCall(first.state, tx, signer);
  assert.equal(second.body.duplicate, true);
  assert.equal(second.write, null);
  assert.equal(second.state.entitlements.length, 1);
  assert.equal(second.state.entitlements[0]?.currentPeriodEnd, end);
});

test("verify then webhook = one grant", async () => {
  const state = blank();
  state.payments.push(pending());
  const tx = verified({ email: "ravesb_abc_other@example.com", id: "10558480" });
  const first = await verifyCall(state, tx, signer);
  assert.equal(first.body.granted, true);
  assert.equal(first.write?.eventKey, "charge.completed:10558480");
  const end = first.state.entitlements[0]?.currentPeriodEnd;
  const second = await charge(first.state, tx);
  assert.equal(second.body.duplicate, true);
  assert.equal(second.write, null);
  assert.equal(second.state.entitlements.length, 1);
  assert.equal(second.state.entitlements[0]?.currentPeriodEnd, end);
});

test("repeated verify = one grant", async () => {
  const state = blank();
  state.payments.push(pending());
  const tx = verified();
  const first = await verifyCall(state, tx, signer);
  assert.equal(first.body.granted, true);
  const end = first.state.entitlements[0]?.currentPeriodEnd;
  const second = await verifyCall(first.state, tx, signer);
  assert.equal(second.body.duplicate, true);
  assert.equal(second.write, null);
  assert.equal(second.state.entitlements.length, 1);
  assert.equal(second.state.entitlements[0]?.currentPeriodEnd, end);
  const third = await verifyCall(second.state, tx, signer);
  assert.equal(third.body.duplicate, true);
  assert.equal(third.state.entitlements[0]?.currentPeriodEnd, end);
});

test("verify response plan number grants one entitlement", () => {
  const userId = "1a7b0dae-4b2a-4c3d-8e4f-111111111111";
  const txRef = "st.1a7b0dae-4b2a-4c3d-8e4f-111111111111.premium_monthly.NGN.b5112338-2222-4222-8222-222222222222";
  const payload = {
    status: "success",
    data: {
      id: 10558480,
      tx_ref: txRef,
      amount: 2500,
      currency: "NGN",
      charged_amount: 2500,
      status: "successful",
      plan: 246244,
      customer: { email: "ravesb_81e3dead_victorotite7@gmail.com" },
      meta: { user_id: userId, plan: "premium_monthly" },
      card: { first_6digits: "553188", token: "card-token" },
    },
  };
  const tx = publicVerifiedTransaction(payload);
  assert.ok(tx);
  assert.equal(tx.paymentPlanId, "246244");
  assert.equal(JSON.stringify(tx).includes("553188"), false);
  assert.equal(JSON.stringify(tx).includes("card-token"), false);
  const asString = publicVerifiedTransaction({ status: "success", data: { ...payload.data, plan: "246244" } });
  const asPaymentPlan = publicVerifiedTransaction({ status: "success", data: { ...payload.data, plan: undefined, payment_plan: 246244 } });
  const asNested = publicVerifiedTransaction({ status: "success", data: { ...payload.data, plan: { id: "246244" } } });
  assert.equal(asString?.paymentPlanId, "246244");
  assert.equal(asPaymentPlan?.paymentPlanId, "246244");
  assert.equal(asNested?.paymentPlanId, "246244");

  const state = blank();
  state.payments.push({
    txRef,
    flwId: null,
    userId,
    plan: "premium_monthly",
    amount: 2500,
    currency: "NGN",
    status: "pending",
    verifiedAt: null,
    email: "victorotite7+tag@gmail.com",
  });
  const now = new Date("2026-10-17T12:00:00.000Z");
  const outcome = finalizeVerifiedCharge({
    state,
    tx,
    env: { ...env, FLW_PLAN_MONTHLY_NGN: "246244" },
    now,
    userId,
  });
  assert.equal(outcome.body.granted, true);
  assert.equal(outcome.state.entitlements.length, 1);
  assert.equal(outcome.state.entitlements[0]?.userId, userId);
  assert.equal(outcome.state.payments[0]?.status, "successful");
  assert.equal(outcome.state.payments[0]?.email, "victorotite7+tag@gmail.com");
  assert.equal(outcome.write?.eventKey, "charge.completed:10558480");
  assert.equal(confirmationStatus(outcome.state, userId, txRef, now), "active");

  const rejected = blank();
  rejected.payments.push({ ...state.payments[0]!, status: "failed" });
  rejected.events.push("charge.completed:10558480");
  assert.equal(confirmationStatus(rejected, userId, txRef, now), "failed");
  const stillPending = blank();
  stillPending.payments.push({ ...state.payments[0]!, status: "pending" });
  assert.equal(confirmationStatus(stillPending, userId, txRef, now), "pending");
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
