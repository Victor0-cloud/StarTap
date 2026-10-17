import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PaymentCancel } from "@/components/account/PaymentResult";
import { paymentsLive } from "@/lib/payments/env";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout closed | StarTap", robots: { index: false, follow: false } };

export default function PaymentCancelPage() {
  if (!paymentsLive()) notFound();
  return <PaymentCancel />;
}
