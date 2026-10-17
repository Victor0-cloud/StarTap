/**
 * Money is an integer number of minor units (hundredths). 449 is 4.49.
 * The decimal text is parsed. Values are never compared with `===` or `* 100` on a float,
 * so 1.005 does not round into 1.01.
 */

const DECIMAL = /^(-?)(\d+)(?:\.(\d+))?$/;

/** Hundredths, or null when the value is not a finite amount with at most two non-zero decimal places. */
export function toMinorUnits(value: number | string): number | null {
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    return parseDecimal(value.toString());
  }
  if (typeof value !== "string") return null;
  const text = value.trim();
  return text ? parseDecimal(text) : null;
}

function parseDecimal(text: string): number | null {
  const match = DECIMAL.exec(text);
  if (!match) return null;
  const sign = match[1] === "-" ? -1 : 1;
  const whole = match[2]!;
  const frac = match[3] ?? "";
  if (frac.length > 2 && /[^0]/.test(frac.slice(2))) return null;
  const minor = Number(whole) * 100 + Number(frac.slice(0, 2).padEnd(2, "0"));
  if (!Number.isSafeInteger(minor)) return null;
  return sign * minor;
}

/** Major-unit number whose JSON form is the two-decimal catalogue amount. 449 becomes 4.49. */
export function amountFromMinor(minor: number): number {
  if (!Number.isSafeInteger(minor)) throw new Error("amount");
  const sign = minor < 0 ? "-" : "";
  const abs = Math.abs(minor);
  return Number(`${sign}${Math.trunc(abs / 100)}.${String(abs % 100).padStart(2, "0")}`);
}

export function moneyEqual(a: number | string, b: number | string): boolean {
  const left = toMinorUnits(a);
  const right = toMinorUnits(b);
  return left !== null && left === right;
}

/** Whole amounts stay whole. 4.49 stays 4.49. Grouping is en-US so the page does not depend on the server locale. */
export function formatMoney(value: number): string {
  const minor = toMinorUnits(value);
  if (minor === null) return "";
  const negative = minor < 0;
  const abs = Math.abs(minor);
  const whole = Math.trunc(abs / 100).toLocaleString("en-US");
  const frac = abs % 100;
  const body = frac === 0 ? whole : `${whole}.${String(frac).padStart(2, "0")}`;
  return negative ? `-${body}` : body;
}
