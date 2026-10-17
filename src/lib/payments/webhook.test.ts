import test from "node:test";
import assert from "node:assert/strict";
import { buildCheckout } from "./checkout.ts";
import { entitlementIsActive } from "./entitlement.ts";
import { publicVerifiedTransaction, publicWebhookFields, txRefFor, type PaymentRow, type VerifiedTx } from "./fields.ts";
import { formatMoney, moneyEqual, toMinorUnits } from "./money.ts";
import { CURRENCY_TABLE, planForAmount } from "./plans.ts";
import { browserPaymentReference, confirmationStatus, verifySignedInPayment } from "./verify.ts";
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

function entitlement(plan: "premium_monthly" | "premium_yearly", end: string) {
  return {
    userId: USER,
    plan,
    status: "active" as const,
    provider: "flutterwave",
    currentPeriodStart: "2026-10-17T00:00:00.000Z",
    currentPeriodEnd: end,
  };
}

test("a different plan keeps the longer term and never shortens paid time", () => {
  const now = new Date("2026-10-17T12:00:00.000Z");
  const logs: string[] = [];
  const original = console.info;
  console.info = (msg?: unknown) => { logs.push(String(msg)); };
  try {
    const yearly = blank();
    yearly.entitlements.push(entitlement("premium_yearly", "2027-10-17T00:00:00.000Z"));
    yearly.payments.push(pending());
    const monthlyCharge = finalizeVerifiedCharge({ state: yearly, tx: verified(), env, now, userId: USER });
    assert.equal(monthlyCharge.body.reason, "plan_conflict");
    assert.equal(monthlyCharge.body.granted, true);
    assert.equal(monthlyCharge.state.payments[0]?.status, "successful");
    assert.equal(monthlyCharge.state.entitlements.length, 1);
    assert.equal(monthlyCharge.state.entitlements[0]?.plan, "premium_yearly");
    assert.equal(monthlyCharge.state.entitlements[0]?.currentPeriodEnd, "2027-11-17T00:00:00.000Z");

    const monthly = blank();
    monthly.entitlements.push(entitlement("premium_monthly", "2026-11-01T00:00:00.000Z"));
    monthly.payments.push({ ...pending(40, "USD"), plan: "premium_yearly", txRef: txRefFor(USER, "premium_yearly", "USD", EXTRA) });
    const yearlyCharge = finalizeVerifiedCharge({
      state: monthly,
      tx: verified({
        id: "77",
        amount: 40,
        currency: "USD",
        txRef: txRefFor(USER, "premium_yearly", "USD", EXTRA),
        metaPlan: "premium_yearly",
        paymentPlanId: "202",
      }),
      env,
      now,
      userId: USER,
    });
    assert.equal(yearlyCharge.body.reason, "plan_conflict");
    assert.equal(yearlyCharge.state.entitlements[0]?.plan, "premium_yearly");
    assert.equal(yearlyCharge.state.entitlements[0]?.currentPeriodEnd, "2027-11-01T00:00:00.000Z");

    const same = blank();
    same.entitlements.push(entitlement("premium_yearly", "2027-10-17T00:00:00.000Z"));
    same.payments.push({ ...pending(40, "USD"), plan: "premium_yearly", txRef: txRefFor(USER, "premium_yearly", "USD", EXTRA) });
    const before = logs.length;
    const renewed = finalizeVerifiedCharge({
      state: same,
      tx: verified({
        id: "78",
        amount: 40,
        currency: "USD",
        txRef: txRefFor(USER, "premium_yearly", "USD", EXTRA),
        metaPlan: "premium_yearly",
        paymentPlanId: "202",
      }),
      env,
      now,
      userId: USER,
    });
    assert.equal(renewed.body.reason, undefined);
    assert.equal(renewed.state.entitlements[0]?.plan, "premium_yearly");
    assert.equal(renewed.state.entitlements[0]?.currentPeriodEnd, "2028-10-17T00:00:00.000Z");
    assert.equal(logs.slice(before).some(line => line.includes("plan_conflict")), false);
  } finally {
    console.info = original;
  }
  assert.equal(logs.filter(line => line.includes("plan_conflict")).length, 2);
  for (const line of logs) {
    const parsed = JSON.parse(line) as { scope: string; event: string; reason: string };
    assert.equal(parsed.scope, "startap-payments");
    assert.equal(parsed.event, "finalize");
    assert.equal(parsed.reason, "plan_conflict");
  }
});

test("malformed payment references are rejected before any provider call", async () => {
  const samples = [
    { tx_ref: "garbage-'; drop table x;--" },
    { tx_ref: "a".repeat(5000) },
    { tx_ref: "st.★.premium_monthly.NGN.★" },
    { tx_ref: "" },
    { tx_ref: " " },
    { transaction_id: "12; drop" },
    { transaction_id: "★" },
    { transaction_id: "" },
    {},
  ];
  for (const body of samples) {
    let calls = 0;
    const outcome = await verifySignedInPayment({
      user: signer,
      body,
      state: blank(),
      env,
      verify: async () => { calls += 1; return { ok: false, retry: false }; },
      verifyReference: async () => { calls += 1; return { ok: false, absent: true, retry: false }; },
    });
    assert.equal(outcome.status, 400, JSON.stringify(body));
    assert.equal(outcome.write, null);
    assert.equal(calls, 0);
  }
  assert.equal(browserPaymentReference({ tx_ref: "garbage-'; drop table x;--", status: "successful", amount: 1 }), null);
});

test("a reference with no successful charge cancels only the pending row", async () => {
  const state = blank();
  state.payments.push(pending());
  const txRef = state.payments[0]!.txRef;
  let idCalls = 0;
  const outcome = await verifySignedInPayment({
    user: signer,
    body: { tx_ref: txRef, status: "cancelled" },
    state,
    env,
    verify: async () => { idCalls += 1; return { ok: false, retry: false }; },
    verifyReference: async () => ({ ok: false, absent: true, retry: false }),
  });
  assert.equal(idCalls, 0);
  assert.equal(outcome.write?.eventKey, `checkout.cancelled:${txRef}`);
  assert.equal(outcome.state.payments[0]?.status, "cancelled");
  assert.equal(outcome.state.entitlements.length, 0);
  assert.equal(confirmationStatus(outcome.state, USER, txRef, new Date("2026-10-17T12:00:00.000Z")), "cancelled");

  const again = await verifySignedInPayment({
    user: signer,
    body: { tx_ref: txRef },
    state: outcome.state,
    env,
    verify: async () => { idCalls += 1; return { ok: false, retry: false }; },
    verifyReference: async () => ({ ok: false, absent: true, retry: false }),
  });
  assert.equal(again.write, null);
  assert.equal(again.state.payments[0]?.status, "cancelled");
});

test("a verified failed charge is marked failed and a pending charge stays pending", async () => {
  const failedState = blank();
  failedState.payments.push(pending());
  const failed = await verifySignedInPayment({
    user: signer,
    body: { tx_ref: failedState.payments[0]!.txRef },
    state: failedState,
    env,
    verify: async () => { throw new Error("id verify should not run"); },
    verifyReference: async () => ({ ok: true, tx: verified({ status: "failed", id: "41" }) }),
  });
  assert.equal(failed.state.payments[0]?.status, "failed");
  assert.equal(failed.write?.eventKey, "charge.completed:41");
  assert.equal(confirmationStatus(failed.state, USER, failedState.payments[0]!.txRef, new Date()), "failed");

  const waiting = blank();
  waiting.payments.push(pending());
  const pendingOutcome = await verifySignedInPayment({
    user: signer,
    body: { tx_ref: waiting.payments[0]!.txRef },
    state: waiting,
    env,
    verify: async () => ({ ok: false, retry: false }),
    verifyReference: async () => ({ ok: true, tx: verified({ status: "pending", id: "42" }) }),
  });
  assert.equal(pendingOutcome.write, null);
  assert.equal(pendingOutcome.body.reason, "pending");
  assert.equal(waiting.payments[0]?.status, "pending");
  assert.equal(confirmationStatus(pendingOutcome.state, USER, waiting.payments[0]!.txRef, new Date()), "pending");
});

test("browser status cancelled is ignored when verify by reference is successful", async () => {
  const state = blank();
  state.payments.push(pending());
  const outcome = await verifySignedInPayment({
    user: signer,
    body: { tx_ref: state.payments[0]!.txRef, status: "cancelled", amount: 1, currency: "EUR" },
    state,
    env,
    now: new Date("2026-10-17T12:00:00.000Z"),
    verify: async () => { throw new Error("id verify should not run"); },
    verifyReference: async () => ({ ok: true, tx: verified() }),
  });
  assert.equal(outcome.body.granted, true);
  assert.equal(outcome.state.payments[0]?.status, "successful");
  assert.equal(outcome.state.entitlements.length, 1);
  assert.equal(outcome.write?.eventKey, "charge.completed:99");
});

test("a provider outage does not cancel a pending checkout", async () => {
  const state = blank();
  state.payments.push(pending());
  const denied = await verifySignedInPayment({
    user: signer,
    body: { tx_ref: state.payments[0]!.txRef, status: "cancelled" },
    state,
    env,
    verify: async () => ({ ok: false, retry: false }),
    verifyReference: async () => ({ ok: false, absent: false, retry: false }),
  });
  assert.equal(denied.status, 503);
  assert.equal(denied.write, null);
  assert.equal(denied.state.payments[0]?.status, "pending");

  const paid = blank();
  paid.payments.push({ ...pending(), status: "successful", flwId: "99" });
  const kept = await verifySignedInPayment({
    user: signer,
    body: { tx_ref: paid.payments[0]!.txRef },
    state: paid,
    env,
    verify: async () => ({ ok: false, retry: false }),
    verifyReference: async () => ({ ok: false, absent: true, retry: false }),
  });
  assert.equal(kept.write, null);
  assert.equal(kept.state.payments[0]?.status, "successful");
});

test("decimal EUR and GBP amounts match in minor units", async () => {
  assert.equal(moneyEqual(4.49, "4.490"), true);
  assert.equal(moneyEqual("35.99", 35.99), true);
  assert.equal(moneyEqual("3.99", "3.9900"), true);
  assert.equal(moneyEqual(29.99, "29.99"), true);
  assert.equal(moneyEqual(29.99, 30), false);
  assert.equal(moneyEqual(4.49, 4.5), false);
  assert.equal(toMinorUnits(1.005), null);
  assert.equal(moneyEqual(1.005, 1.01), false);
  assert.equal(formatMoney(2500), "2,500");
  assert.equal(formatMoney(5), "5");
  assert.equal(formatMoney(4.49), "4.49");
  assert.equal(formatMoney(35.99), "35.99");
  assert.equal(formatMoney(3.99), "3.99");
  assert.equal(formatMoney(29.99), "29.99");
  assert.equal(CURRENCY_TABLE.USD.monthlyMinor, 500);
  assert.equal(CURRENCY_TABLE.USD.yearlyMinor, 4_000);
  assert.equal(CURRENCY_TABLE.NGN.monthlyMinor, 250_000);
  assert.equal(CURRENCY_TABLE.NGN.yearlyMinor, 2_500_000);
  assert.equal(CURRENCY_TABLE.NGN.note.includes("246246"), true);
  assert.equal(CURRENCY_TABLE.NGN.note.includes("20000"), true);
  assert.equal(CURRENCY_TABLE.GHS.monthlyMinor, 2_500);
  assert.equal(CURRENCY_TABLE.GHS.yearlyMinor, 20_000);
  assert.equal(CURRENCY_TABLE.KES.monthlyMinor, 25_000);
  assert.equal(CURRENCY_TABLE.KES.yearlyMinor, 200_000);
  assert.equal(CURRENCY_TABLE.ZAR.monthlyMinor, 4_000);
  assert.equal(CURRENCY_TABLE.ZAR.yearlyMinor, 32_000);
  assert.equal(CURRENCY_TABLE.UGX.monthlyMinor, 700_000);
  assert.equal(CURRENCY_TABLE.UGX.yearlyMinor, 5_500_000);
  assert.equal(CURRENCY_TABLE.TZS.monthlyMinor, 450_000);
  assert.equal(CURRENCY_TABLE.TZS.yearlyMinor, 3_500_000);
  assert.equal(CURRENCY_TABLE.RWF.monthlyMinor, 700_000);
  assert.equal(CURRENCY_TABLE.RWF.yearlyMinor, 5_500_000);
  assert.equal(CURRENCY_TABLE.ZMW.monthlyMinor, 14_000);
  assert.equal(CURRENCY_TABLE.ZMW.yearlyMinor, 110_000);
  assert.equal(CURRENCY_TABLE.EGP.monthlyMinor, 25_000);
  assert.equal(CURRENCY_TABLE.EGP.yearlyMinor, 200_000);
  assert.equal(CURRENCY_TABLE.MAD.monthlyMinor, 5_000);
  assert.equal(CURRENCY_TABLE.MAD.yearlyMinor, 40_000);
  assert.equal(CURRENCY_TABLE.XOF.monthlyMinor, 300_000);
  assert.equal(CURRENCY_TABLE.XOF.yearlyMinor, 2_400_000);
  assert.equal(CURRENCY_TABLE.XAF.monthlyMinor, 300_000);
  assert.equal(CURRENCY_TABLE.XAF.yearlyMinor, 2_400_000);
  assert.equal(CURRENCY_TABLE.EUR.enabled, false);
  assert.equal(CURRENCY_TABLE.GBP.enabled, false);

  const previousEur = CURRENCY_TABLE.EUR.enabled;
  const previousGbp = CURRENCY_TABLE.GBP.enabled;
  CURRENCY_TABLE.EUR.enabled = true;
  CURRENCY_TABLE.GBP.enabled = true;
  env.FLW_PLAN_MONTHLY_EUR = "401";
  env.FLW_PLAN_YEARLY_EUR = "402";
  env.FLW_PLAN_MONTHLY_GBP = "501";
  env.FLW_PLAN_YEARLY_GBP = "502";
  try {
    const buyer = { id: USER, email: EMAIL };
    const gbp = buildCheckout({
      user: buyer,
      body: { plan: "premium_yearly", currency: "local", amount: 1, country: "US" },
      env,
      countryHeader: "GB",
      requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
    });
    assert.equal(gbp.ok, true);
    if (!gbp.ok) return;
    assert.equal(JSON.stringify(gbp.providerBody.amount), "29.99");
    assert.equal(gbp.providerBody.payment_plan, 502);
    assert.equal(gbp.pending.currency, "GBP");
    assert.equal(formatMoney(gbp.pending.amount), "29.99");
    assert.equal(moneyEqual(gbp.pending.amount, "29.990"), true);

    const eur = buildCheckout({
      user: buyer,
      body: { plan: "premium_monthly", currency: "local" },
      env,
      countryHeader: "FR",
      requestUrl: "https://startap.fun/api/flutterwave/create-checkout/",
    });
    assert.equal(eur.ok, true);
    if (!eur.ok) return;
    assert.equal(JSON.stringify(eur.providerBody.amount), "4.49");
    assert.equal(eur.providerBody.payment_plan, 401);
    assert.equal(formatMoney(eur.pending.amount), "4.49");

    const parsed = publicVerifiedTransaction({
      status: "success",
      data: {
        id: 88,
        tx_ref: eur.txRef,
        amount: "4.490",
        currency: "EUR",
        status: "successful",
        payment_plan: 401,
        meta: { user_id: USER, plan: "premium_monthly" },
      },
    });
    assert.ok(parsed);
    if (!parsed) return;
    assert.equal(moneyEqual(parsed.amount, eur.pending.amount), true);
    const state = blank();
    state.payments.push(eur.pending);
    const granted = await charge(state, { ...parsed, email: EMAIL });
    assert.equal(granted.body.granted, true);
    assert.equal(granted.state.payments[0]?.status, "successful");

    const off = blank();
    off.payments.push(eur.pending);
    const penny = await verifyCall(off, { ...parsed, amount: 4.5, email: EMAIL }, signer);
    assert.equal(penny.body.granted, false);
    assert.equal(penny.body.reason, "amount");

    const yearly = planForAmount("35.99", "EUR", env);
    assert.equal(yearly?.plan, "premium_yearly");
    assert.equal(yearly ? JSON.stringify(yearly.amount) : "", "35.99");
    assert.equal(formatMoney(yearly?.amount ?? 0), "35.99");
    assert.equal(planForAmount(35.98, "EUR", env), null);
    assert.equal(planForAmount("4.49", "EUR", env)?.plan, "premium_monthly");
  } finally {
    CURRENCY_TABLE.EUR.enabled = previousEur;
    CURRENCY_TABLE.GBP.enabled = previousGbp;
    delete env.FLW_PLAN_MONTHLY_EUR;
    delete env.FLW_PLAN_YEARLY_EUR;
    delete env.FLW_PLAN_MONTHLY_GBP;
    delete env.FLW_PLAN_YEARLY_GBP;
  }
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
