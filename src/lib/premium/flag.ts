/**
 * Build-time switch for Premium UI. The Android build and the static web fallback always bake "0".
 * The server build bakes "1" only when every required payment variable is present (see next.config.ts).
 * Runtime still fails closed: the status route reports paymentsEnabled false when variables are missing.
 */
export const PAYMENTS_UI_ENABLED =
  process.env.NEXT_PUBLIC_STARTAP_TARGET !== "android" &&
  process.env.NEXT_PUBLIC_STARTAP_PAYMENTS_ENABLED === "1";
