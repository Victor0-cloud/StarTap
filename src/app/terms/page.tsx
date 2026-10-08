import type { Metadata } from "next";
import { InfoPage } from "@/components/site/SiteChrome";
import { ContactLine } from "@/components/site/ContactLine";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Terms of Use | StarTap", description: "The terms for playing StarTap on the web and on Android.", path: "/terms/" });

export default function Terms() {
 return <InfoPage eyebrow="✦ TERMS OF USE" title="FAIR PLAY, PLAIN TERMS." intro={<p>Last updated: 7 October 2026</p>}>
  <section className="info-section">
   <h2>Using StarTap</h2>
   <p>StarTap is a free game you can play on the web at startap.fun and in the StarTap Android app. By playing, you agree to these terms. If you do not agree, please do not use StarTap.</p>
  </section>
  <section className="info-section">
   <h2>Game content</h2>
   <p>Questions, clues and stories are written from published sources and checked before release, but mistakes can happen. StarTap is for entertainment and is not a reference source. If you spot an error, please tell us through the Support page.</p>
   <p>The people featured in StarTap are not affiliated with StarTap and do not endorse it. Their names are used only to identify them. Photographs are used under their stated licences, with credits shown in the game.</p>
  </section>
  <section className="info-section">
   <h2>Your scores</h2>
   <p>Scores, streaks and progress are kept on your device. They may be lost if you clear your browser or app data, change device or browser, or use private browsing. StarTap cannot restore them.</p>
  </section>
  <section className="info-section">
   <h2>Acceptable use</h2>
   <p>Please don&apos;t try to disrupt the website or app, interfere with other players, or copy and redistribute StarTap&apos;s artwork, videos, music or game content without permission.</p>
  </section>
  <section className="info-section">
   <h2>Availability and changes</h2>
   <p>StarTap is provided &ldquo;as is&rdquo;. Features, questions and daily editions may change, and the game may occasionally be unavailable. To the extent the law allows, StarTap is not liable for any loss arising from use of, or inability to use, the game.</p>
   <p>These terms may be updated from time to time; the date above shows the latest version.</p>
  </section>
  <section className="info-section">
   <h2>Contact</h2>
   <ContactLine/>
  </section>
 </InfoPage>;
}
