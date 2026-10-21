import Link from "next/link";

/**
 * Short server-rendered description placed AFTER a game screen, so crawlers and no-JS readers get real text on pages whose
 * game only renders in the browser. It sits below the game in normal flow: it never overlays the map or changes game flow.
 * Web only: the Android build renders nothing, so the app's screens are unchanged.
 */
export function PageAbout({ id, title, children, link }: { id: string; title: string; children: React.ReactNode; link?: { href: string; label: string } }) {
 if (process.env.NEXT_PUBLIC_STARTAP_TARGET === "android") return null;
 return <section className="page-about" aria-labelledby={id}>
  <h2 id={id}>{title}</h2>
  {children}
  {link && <p><Link className="text-link" href={link.href}>{link.label}</Link></p>}
 </section>;
}
