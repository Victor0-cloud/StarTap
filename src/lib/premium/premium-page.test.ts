import test from "node:test";
import assert from "node:assert/strict";
import { formatPremiumUntil, premiumOffer } from "./offer.ts";
import { loadPremiumStatus, premiumStatusIsStale, type StatusBody } from "./load-status.ts";

const END = "2026-11-17T00:00:00.000Z";

function statusFetch(authed: (authorization: string | null) => boolean) {
  const seen: Array<string | null> = [];
  const fetchStatus = async (authorization: string | null) => {
    seen.push(authorization);
    const signedIn = authed(authorization);
    const body: StatusBody = {
      paymentsEnabled: true,
      isPremium: signedIn,
      email: signedIn ? "player@startap.fun" : null,
      plan: signedIn ? "premium_monthly" : null,
      status: signedIn ? "active" : null,
      currentPeriodEnd: signedIn ? END : null,
    };
    return { ok: true, status: 200, body };
  };
  return { seen, fetchStatus };
}

test("status is read before the session is copied, then again with the bearer token", async () => {
  let token: string | null = null;
  const { seen, fetchStatus } = statusFetch(authorization => authorization === "Bearer jwt-1");
  const early = await loadPremiumStatus({
    readSession: () => token ? { accessToken: token } : null,
    fetchStatus,
  });
  assert.equal(early.authorization, null);
  assert.equal(early.access.isPremium, false);
  assert.equal(premiumOffer(early.access), "purchase");

  const synced = await loadPremiumStatus({
    sync: async () => { token = "jwt-1"; },
    readSession: () => token ? { accessToken: token } : null,
    fetchStatus,
  });
  assert.deepEqual(seen, [null, "Bearer jwt-1"]);
  assert.equal(synced.access.isPremium, true);
  assert.equal(synced.access.plan, "premium_monthly");
  assert.equal(synced.access.status, "active");
  assert.equal(synced.access.currentPeriodEnd, END);
  assert.deepEqual(premiumOffer(synced.access), { until: "Nov 17, 2026" });
});

test("an anonymous status read is stale once the premium page can sync the session", () => {
  const anonymous = { token: null as string | null | undefined, withSync: false };
  assert.equal(premiumStatusIsStale(anonymous, { token: null, syncBound: true }), true);
  assert.equal(premiumStatusIsStale({ token: "jwt-1", withSync: true }, { token: "jwt-1", syncBound: true }), false);
  assert.equal(premiumStatusIsStale({ token: null, withSync: true }, { token: "jwt-1", syncBound: true }), true);
  assert.equal(premiumStatusIsStale({ token: undefined, withSync: false }, { token: null, syncBound: false }), true);
});

test("active and cancelled-but-unexpired members hide the purchase controls", () => {
  assert.equal(premiumOffer({ loading: true, isPremium: false, currentPeriodEnd: null }), "loading");
  assert.equal(premiumOffer({ loading: false, isPremium: false, currentPeriodEnd: null }), "purchase");
  assert.deepEqual(premiumOffer({ loading: false, isPremium: true, currentPeriodEnd: END }), { until: "Nov 17, 2026" });
  assert.deepEqual(
    premiumOffer({ loading: false, isPremium: true, currentPeriodEnd: END }),
    { until: formatPremiumUntil(END) },
  );
  assert.deepEqual(premiumOffer({ loading: false, isPremium: true, currentPeriodEnd: null }), { until: null });
});

test("a region with nothing to buy shows no locks to a free player, but keeps a member's Premium", async () => {
  const free = await loadPremiumStatus({
    readSession: () => null,
    fetchStatus: async () => ({ ok: true, status: 200, body: { paymentsEnabled: true, regionAvailable: false, isPremium: false } }),
  });
  assert.equal(free.access.paymentsOn, false);
  assert.equal(free.access.isPremium, false);
  const member = await loadPremiumStatus({
    readSession: () => ({ accessToken: "jwt-1" }),
    fetchStatus: async () => ({ ok: true, status: 200, body: { paymentsEnabled: true, regionAvailable: false, isPremium: true, plan: "premium_yearly", status: "active", currentPeriodEnd: END } }),
  });
  assert.equal(member.access.paymentsOn, true);
  assert.equal(member.access.isPremium, true);
  const nigeria = await loadPremiumStatus({
    readSession: () => null,
    fetchStatus: async () => ({ ok: true, status: 200, body: { paymentsEnabled: true, regionAvailable: true, isPremium: false } }),
  });
  assert.equal(nigeria.access.paymentsOn, true);
});
