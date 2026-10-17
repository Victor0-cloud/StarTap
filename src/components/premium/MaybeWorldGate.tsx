"use client";
import type { ReactNode } from "react";
import { isFreeWorld } from "@/lib/premium/access";
import { usePremium } from "@/lib/premium/usePremium";
import { PremiumLock } from "./PremiumLock";

/** Leaves free worlds untouched. Premium worlds show the lock instead of their play controls. */
export function MaybeWorldGate({ category, children }: { category: string; children: ReactNode }) {
  const access = usePremium();
  if (!access.paymentsOn || isFreeWorld(category)) return <>{children}</>;
  if (access.loading) return <p className="world-soon">Checking access…</p>;
  if (!access.isPremium) return <PremiumLock kind="world" />;
  return <>{children}</>;
}
