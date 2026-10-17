import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentSuccess } from "@/components/account/PaymentResult";
import { paymentsLive } from "@/lib/payments/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment received | StarTap", robots: { index: false, follow: false } };

export default function PaymentSuccessPage() {
  if (!paymentsLive()) notFound();
  return <PaymentSuccess />;
}
