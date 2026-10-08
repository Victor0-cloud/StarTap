import { SUPPORT_EMAIL } from "@/lib/site";

/** Support contact. Shows the configured address (SUPPORT_EMAIL in src/lib/site.ts) — never a placeholder address. */
export function ContactLine() {
 return SUPPORT_EMAIL
  ? <p>Email: <a className="text-link" href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a></p>
  : <p className="contact-pending">A support email address is being set up and will be listed here soon.</p>;
}
