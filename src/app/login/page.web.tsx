import type { Metadata } from "next";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { LoginForm } from "@/components/account/LoginForm";
import { paymentsLive } from "@/lib/payments/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Sign in | StarTap", robots: { index: false, follow: false } };

export default function LoginPage() {
  if (!paymentsLive()) notFound();
  return <Suspense fallback={<main className="empty-state">Loading…</main>}><LoginForm /></Suspense>;
}
