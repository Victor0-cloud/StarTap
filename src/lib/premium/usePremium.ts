"use client";
import { useSyncExternalStore } from "react";
import { PAYMENTS_UI_ENABLED } from "./flag.ts";
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

let snapshot: PremiumAccess = PAYMENTS_UI_ENABLED ? { ...CLOSED, paymentsOn: true, loading: true } : CLOSED;
const listeners = new Set<() => void>();
let started = false;

function emit() {
  listeners.forEach(listener => listener());
}

async function load() {
  const session = readSavedSession();
  const headers = new Headers();
  if (session?.accessToken) headers.set("authorization", `Bearer ${session.accessToken}`);
  try {
    const response = await fetch("/api/subscription/status/", { headers, cache: "no-store" });
    if (response.status === 401) {
      writeSavedSession(null);
      snapshot = { ...CLOSED, paymentsOn: true };
      emit();
      return;
    }
    if (!response.ok) {
      snapshot = { ...CLOSED, paymentsOn: true };
      emit();
      return;
    }
    const body = await response.json() as Partial<PremiumAccess & { paymentsEnabled: boolean }>;
    if (body.paymentsEnabled !== true) {
      snapshot = CLOSED;
      emit();
      return;
    }
    snapshot = {
      paymentsOn: true,
      loading: false,
      isPremium: body.isPremium === true,
      email: typeof body.email === "string" ? body.email : null,
      plan: typeof body.plan === "string" ? body.plan : null,
      status: typeof body.status === "string" ? body.status : null,
      currentPeriodEnd: typeof body.currentPeriodEnd === "string" ? body.currentPeriodEnd : null,
    };
    writePremiumCache({ ...snapshot, savedAt: Date.now() });
  } catch {
    snapshot = { ...CLOSED, paymentsOn: true };
  }
  emit();
}

function subscribe(listener: () => void) {
  if (!PAYMENTS_UI_ENABLED) return () => {};
  listeners.add(listener);
  if (!started) {
    started = true;
    void load();
  }
  return () => listeners.delete(listener);
}

export function usePremium(): PremiumAccess {
  const live = useSyncExternalStore(subscribe, () => snapshot, () => PAYMENTS_UI_ENABLED ? { ...CLOSED, paymentsOn: true, loading: true } : CLOSED);
  return PAYMENTS_UI_ENABLED ? live : CLOSED;
}

export function refreshPremium(): Promise<void> {
  if (!PAYMENTS_UI_ENABLED) return Promise.resolve();
  started = true;
  return load();
}
