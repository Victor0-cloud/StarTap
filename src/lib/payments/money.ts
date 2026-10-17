/** Compare money in minor units so 4.99 and 4.990 are the same value and 5 is not. */
export function moneyEqual(a: number, b: number): boolean {
  if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
  return Math.round(a * 100) === Math.round(b * 100);
}
