export type StatusBody = {
  paymentsEnabled?: boolean;
  /** False when Premium cannot be bought from this region yet. Absent means available. */
  regionAvailable?: boolean;
  isPremium?: boolean;
  email?: unknown;
  plan?: unknown;
  status?: unknown;
  currentPeriodEnd?: unknown;
};

type Access = {
  paymentsOn: boolean;
  loading: boolean;
  isPremium: boolean;
  email: string | null;
  plan: string | null;
  status: string | null;
  currentPeriodEnd: string | null;
};

const CLOSED: Access = {
  paymentsOn: false,
  loading: false,
  isPremium: false,
  email: null,
  plan: null,
  status: null,
  currentPeriodEnd: null,
};

const text = (value: unknown) => typeof value === "string" ? value : null;

/**
 * Read Premium for the signed-in player.
 * `sync` copies the live Supabase session into the saved token first. /account does this;
 * a status call that skips it can go out with no Authorization header and look like a free player.
 */
export async function loadPremiumStatus(input: {
  sync?: () => Promise<void>;
  readSession: () => { accessToken: string } | null;
  fetchStatus: (authorization: string | null) => Promise<{ ok: boolean; status: number; body: StatusBody }>;
}): Promise<{ authorization: string | null; unauthorized: boolean; access: Access }> {
  if (input.sync) {
    try { await input.sync(); } catch { /* keep the saved token */ }
  }
  const token = input.readSession()?.accessToken ?? null;
  const authorization = token ? `Bearer ${token}` : null;
  try {
    const response = await input.fetchStatus(authorization);
    if (response.status === 401) return { authorization, unauthorized: true, access: { ...CLOSED, paymentsOn: true } };
    if (!response.ok) return { authorization, unauthorized: false, access: { ...CLOSED, paymentsOn: true } };
    if (response.body.paymentsEnabled !== true) return { authorization, unauthorized: false, access: CLOSED };
    // TEMPORARY LAUNCH BEHAVIOR — Premium gating currently applies only where checkout is supported.
    // Nothing to buy from this region: a free player sees the site as it is with payments off (no locks).
    // A Premium member keeps Premium wherever they are.
    if (response.body.regionAvailable === false && response.body.isPremium !== true) return { authorization, unauthorized: false, access: CLOSED };
    return {
      authorization,
      unauthorized: false,
      access: {
        paymentsOn: true,
        loading: false,
        isPremium: response.body.isPremium === true,
        email: text(response.body.email),
        plan: text(response.body.plan),
        status: text(response.body.status),
        currentPeriodEnd: text(response.body.currentPeriodEnd),
      },
    };
  } catch {
    return { authorization, unauthorized: false, access: { ...CLOSED, paymentsOn: true } };
  }
}

/** An anonymous read must not stick after the session appears, or after /premium binds session sync. */
export function premiumStatusIsStale(
  loaded: { token: string | null | undefined; withSync: boolean },
  now: { token: string | null; syncBound: boolean },
): boolean {
  if (loaded.token === undefined) return true;
  if (loaded.token !== now.token) return true;
  return now.syncBound && !loaded.withSync;
}
