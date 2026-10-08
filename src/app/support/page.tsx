import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/site/SiteChrome";
import { ContactLine } from "@/components/site/ContactLine";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "Support | StarTap", description: "Help with StarTap: saving progress, daily editions, sound, intro videos and reporting a content error.", path: "/support/" });

const FAQ = [
 ["My progress or streak disappeared.", "Progress is saved in your browser on this device. It is lost if site data is cleared, in private/incognito windows, or when you switch browser or device. The Android app keeps its own separate progress."],
 ["When does Today's Five change?", "A new five begins every day at midnight UTC. Everyone gets the same stars on the same day."],
 ["The map doesn't respond.", "Make sure the page has finished loading, then drag to spin and tap to place your pin. If it still sticks, refresh the page — locked answers are saved and the game continues where you left off."],
 ["There's no sound.", "Check the sound button in the game and your device volume. Browsers only play sound after you tap or click something on the page."],
 ["Can I skip the intro videos?", "Yes. SKIP appears after a moment, or press Esc on a keyboard. Each intro can be watched again with ▶ REPLAY INTRO."],
 ["I think an answer is wrong.", "Thank you — please send the star's name, the question and what you think is wrong, using the contact details below."],
 ["Is there an Android app?", "Yes, it is on its way to Google Play. The website and the app share the same game."],
] as const;

export default function Support() {
 return <InfoPage eyebrow="✦ SUPPORT" title="NEED A HAND?" intro={<p>Quick answers first. New to the game? Start with <Link className="text-link" href="/how-to-play/">How to play</Link>.</p>}>
  <section className="info-section faq">
   {FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}
  </section>
  <section className="info-section">
   <h2>Contact</h2>
   <ContactLine/>
  </section>
 </InfoPage>;
}
