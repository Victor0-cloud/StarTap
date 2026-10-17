import { timingSafeEqual } from "node:crypto";

/**
 * Compare the verif-hash header to FLW_SECRET_HASH.
 * Length mismatches still run a compare so the failure doesn't return early on length alone.
 */
export function hashesMatch(provided: string | null | undefined, secret: string | null | undefined): boolean {
  if (!provided || !secret) return false;
  const left = Buffer.from(provided);
  const right = Buffer.from(secret);
  if (left.length !== right.length) {
    timingSafeEqual(right, right);
    return false;
  }
  return timingSafeEqual(left, right);
}
