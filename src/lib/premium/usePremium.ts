"use client";
import { useSyncExternalStore } from "react";
import { PAYMENTS_UI_ENABLED } from "./flag.ts";
import { loadPremiumStatus, premiumStatusIsStale } from "./load-status.ts";
import { readSavedSession, writePremiumCache, writeSavedSession } from "./session.ts";

export type PremiumAccess = {
  paymentsOn: boolean;
  loading: boolean;
  isPremium: boolean;
  email: string | null;
  plan: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
};

const CLOSED: PremiumAccess = {
  paymentsOn: false,
  loading: false,
  isPremium: false,
  email: null,
  plan: null,
  status: null,
  currentPeriodEnd: null,
};

const SERVER_SNAPSHOT: PremiumAccess = PAYMENTS_UI_ENABLED ? { ...CLOSED, paymentsOn: true, loading: true } : CLOSED;

let snapshot: PremiumAccess = SERVER_SNAPSHOT;
const listeners = new Set<() => void>();
const loaded: { token: string | null | undefined; withSync: boolean } = { token: undefined, withSync: false };
let sessionSync: (() => Promise<void>) | null = null;
let inflight: Promise<void> | null = null;

function emit() {
  listeners.forEach(listener => listener());
}

/** /premium registers this so the status call copies the Supabase session before it reads the token. */
export function bindPremiumSession(sync: () => Promise<void>) {
  sessionSync = sync;
}

/** Hide purchase controls while a fresh status read is in flight. Safe to call from a layout effect. */
export function markPremiumPending() {
  if (!PAYMENTS_UI_ENABLED || snapshot.loading) return;
  snapshot = { ...snapshot, paymentsOn: true, loading: true };
  emit();
}

async function load() {
  const withSync = sessionSync !== null;
  const result = await loadPremiumStatus({
    sync: sessionSync ?? undefined,
    readSession: readSavedSession,
    fetchStatus: async authorization => {
      const headers = new Headers();
      if (authorization) headers.set("authorization", authorization);
      const response = await fetch("/api/subscription/status/", { headers, cache: "no-store" });
      const body = await response.json().catch(() => ({}));
      return { ok: response.ok, status: response.status, body };
    },
  });
  if (result.unauthorized) writeSavedSession(null);
  snapshot = result.access;
  loaded.token = result.unauthorized ? null : readSavedSession()?.accessToken ?? null;
  loaded.withSync = withSync;
  if (snapshot.paymentsOn && snapshot.isPremium) writePremiumCache({ ...snapshot, savedAt: Date.now() });
  emit();
}

function startLoad(force: boolean): Promise<void> {
  if (!PAYMENTS_UI_ENABLED) return Promise.resolve();
  if (inflight && !force) return inflight;
  const previous = force ? inflight : null;
  const run = (async () => {
    if (previous) await previous.catch(() => {});
    await load();
  })();
  const tracked = run.finally(() => { if (inflight === tracked) inflight = null; });
  inflight = tracked;
  return tracked;
}

function subscribe(listener: () => void) {
  if (!PAYMENTS_UI_ENABLED) return () => {};
  listeners.add(listener);
  const token = readSavedSession()?.accessToken ?? null;
  if (premiumStatusIsStale(loaded, { token, syncBound: sessionSync !== null })) void startLoad(false);
  return () => listeners.delete(listener);
}

export function usePremium(): PremiumAccess {
  return useSyncExternalStore(subscribe, () => snapshot, () => SERVER_SNAPSHOT);
}

export function refreshPremium(): Promise<void> {
  return startLoad(true);
}
