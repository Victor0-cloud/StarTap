export function PaymentsDisclosure({ page }: { page: "privacy" | "terms" | "support" }) {
  if (page === "privacy") return <p>Premium payments on the website are processed by Flutterwave. Their privacy policy applies on the payment page. StarTap receives the payment result — status, amount, currency and reference — not your card number.</p>;
  if (page === "terms") return <p>Paid plans are billed by Flutterwave on the monthly or yearly schedule you choose, until you cancel. Cancelling stops the next renewal. Access continues until the end of the period already paid for.</p>;
  return <p>Premium checkout is provided by Flutterwave. If the success page is still confirming after a few minutes, email sales@startap.fun from the address you paid with.</p>;
}
