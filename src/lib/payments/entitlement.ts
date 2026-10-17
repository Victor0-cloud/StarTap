import type { PlanId } from "./plans.ts";

/** entitlements.status check: active, expired, cancelled, pending, failed. */
export type EntitlementStatus = "active" | "expired" | "cancelled" | "pending" | "failed";

export type EntitlementRow = {
  userId: string;
  plan: PlanId;
  status: EntitlementStatus;
  provider: string;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
};

/** Add one billing period in UTC. Month-end dates roll with Date (31 Jan + 1 month = 2 or 3 Mar). */
export function addPeriod(from: Date, plan: PlanId): Date {
  const next = new Date(from.getTime());
  if (plan === "premium_yearly") next.setUTCFullYear(next.getUTCFullYear() + 1);
  else next.setUTCMonth(next.getUTCMonth() + 1);
  return next;
}

/**
 * A lapsed row is not Premium, including status "active" whose period has ended.
 * Cancelled keeps access until currentPeriodEnd, then stops.
 */
export function entitlementIsActive(row: Pick<EntitlementRow, "status" | "currentPeriodEnd"> | null, now: Date): boolean {
  if (!row || (row.status !== "active" && row.status !== "cancelled")) return false;
  if (!row.currentPeriodEnd) return false;
  const end = new Date(row.currentPeriodEnd);
  return Number.isFinite(end.getTime()) && end.getTime() > now.getTime();
}

/** Extend from the later of now and the current end, so an early renewal stacks. */
export function extendEntitlement(existing: EntitlementRow | null, plan: PlanId, now: Date): EntitlementRow {
  const currentEnd = existing?.currentPeriodEnd ? new Date(existing.currentPeriodEnd) : null;
  const base = currentEnd && currentEnd.getTime() > now.getTime() ? currentEnd : now;
  return {
    userId: existing?.userId ?? "",
    plan,
    status: "active",
    provider: "flutterwave",
    currentPeriodStart: now.toISOString(),
    currentPeriodEnd: addPeriod(base, plan).toISOString(),
  };
}

export function cancelEntitlement(existing: EntitlementRow): EntitlementRow {
  return { ...existing, status: "cancelled" };
}
