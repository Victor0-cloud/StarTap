import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { PaymentSuccess } from "@/components/account/PaymentResult";
import { paymentsLive } from "@/lib/payments/env";
import { parseTxRef } from "@/lib/payments/fields";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Payment | StarTap", robots: { index: false, follow: false } };

type Query = { transaction_id?: string | string[]; tx_ref?: string | string[]; status?: string | string[] };

function one(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : Array.isArray(value) ? value[0] ?? "" : "";
}

export default async function PaymentSuccessPage({ searchParams }: { searchParams: Promise<Query> }) {
  if (!paymentsLive()) notFound();
  const params = await searchParams;
  const transactionId = one(params.transaction_id).trim();
  const txRef = one(params.tx_ref).trim();
  const status = one(params.status).trim().toLowerCase();
  // Flutterwave sends cancel and decline here with status=cancelled and no transaction_id.
  // The query status is only a hint for which page to show. The server confirms the charge.
  if (!/^\d{1,20}$/.test(transactionId) || status === "cancelled") {
    const safe = parseTxRef(txRef) ? `?tx_ref=${encodeURIComponent(txRef)}` : "";
    redirect(`/payment/cancel/${safe}`);
  }
  return <PaymentSuccess />;
}
