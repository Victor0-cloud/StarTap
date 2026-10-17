import { PaymentsDisclosure } from "@/components/site/PaymentsDisclosure";
import { SUPPORT_EMAIL } from "@/lib/site";

/**
 * Website legal pages only. The Android build keeps ContactLine.tsx, which has no payment copy.
 * This file is aliased in the server build, so the processor name never enters the Android export.
 */
export function ContactLine() {
  return <>
    {SUPPORT_EMAIL
      ? <p>Email: <a className="text-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
      : <p className="contact-pending">A support email address is being set up and will be listed here soon.</p>}
    <p>The Android app has no accounts and stores progress only on the device. Free play on the website does not need an account. StarTap Premium, when it is offered, is optional.</p>
    <p>A Premium account stores the email address you sign in with, the plan, the status, and the date access renews or ends. A payment record stores the reference, plan, amount, currency, status, and the time it was confirmed. StarTap does not store card numbers.</p>
    <PaymentsDisclosure page="privacy" />
    <PaymentsDisclosure page="terms" />
    <PaymentsDisclosure page="support" />
    <p>Refunds and billing questions: email sales@startap.fun from the address you used to pay.</p>
  </>;
}
