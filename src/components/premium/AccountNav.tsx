"use client";
import Link from "next/link";
import { usePremium } from "@/lib/premium/usePremium";

/** Header links. Absent unless the payments flag was baked on for this web build. */
export function AccountNav() {
  const access = usePremium();
  if (!access.paymentsOn) return null;
  return <>
    <Link href="/premium/">PREMIUM</Link>
    <Link href={access.email ? "/account/" : "/login/"}>{access.email ? "ACCOUNT" : "LOG IN"}</Link>
  </>;
}
