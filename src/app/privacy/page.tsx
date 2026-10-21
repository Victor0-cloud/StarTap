import type { Metadata } from "next";
import { InfoPage } from "@/components/site/SiteChrome";
import { ContactLine } from "@/components/site/ContactLine";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Privacy Policy | StarTap", description: "How StarTap handles your data. Free play needs no account and has no ads, analytics or tracking cookies; scores and settings stay on your device.", path: "/privacy/" });

// Keep this page in step with what the game actually does. Last checked against the code: 7 October 2026
// (local storage only; no accounts, analytics, ads, cookies or third-party requests).
export default function Privacy() {
 return <InfoPage eyebrow="✦ PRIVACY POLICY" title="YOUR GAME STAYS ON YOUR DEVICE." intro={<p>Last updated: 7 October 2026</p>}>
  <section className="info-section">
   <h2>The short version</h2>
   <ul>
    <li>StarTap has <strong>no accounts</strong> and never asks for your name, email or location.</li>
    <li>There are <strong>no ads, no analytics and no tracking cookies</strong>.</li>
    <li>Your scores, streak and settings are saved <strong>only on your own device</strong>.</li>
   </ul>
  </section>
  <section className="info-section">
   <h2>What is stored on your device</h2>
   <p>To remember your game, StarTap uses your browser&apos;s local storage (or the Android app&apos;s own storage). This includes your answers and scores, daily streak, Star Passport stamps, Adventure progress, chosen mascot, sound on/off, which intro videos you have watched, and display quality settings.</p>
   <p>This information is not sent to us or anyone else. You can delete it at any time by clearing this site&apos;s data in your browser settings, or by clearing the app&apos;s storage or uninstalling it on Android.</p>
  </section>
  <section className="info-section">
   <h2>Sharing your score</h2>
   <p>When you choose to share or copy a result, StarTap creates a short text with your score and a link to the game. It contains no star names or answers. It goes only where you send it, through your device&apos;s own share sheet or clipboard.</p>
  </section>
  <section className="info-section">
   <h2>Website hosting</h2>
   <p>Like any website, the server that delivers startap.fun receives standard technical information with each request (such as IP address, browser type and the page requested) in order to deliver and protect the site. StarTap does not use this information to identify or profile players.</p>
  </section>
  <section className="info-section">
   <h2>Links to other sites</h2>
   <p>Photo credits link to their sources (for example Wikimedia Commons). Those sites have their own privacy policies, which apply if you visit them.</p>
  </section>
  <section className="info-section">
   <h2>Children</h2>
   <p>StarTap does not collect personal information from anyone, including children.</p>
  </section>
  <section className="info-section">
   <h2>Changes and contact</h2>
   <p>If StarTap&apos;s handling of information changes, this page will be updated and the date above revised.</p>
   <ContactLine/>
  </section>
 </InfoPage>;
}
