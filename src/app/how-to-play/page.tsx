import type { Metadata } from "next";
import Link from "next/link";
import { InfoPage } from "@/components/site/SiteChrome";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({ title: "How to play | StarTap", description: "See the star, read the clue, explore the globe and tap your guess. Five rounds, up to 1,000 points each: here is how StarTap works.", path: "/how-to-play/" });

const STEPS = [
 ["See the star", "Each round opens on a famous face from music, sport or screen."],
 ["Read the clue", "A short clue points to a place in their story: where they grew up, trained or broke through."],
 ["Explore the globe", "Drag to spin the world and pinch, scroll or use + / − to zoom. Take your time — there is no clock."],
 ["Tap your guess", "Tap (or click) the spot you think is right. Changed your mind? Tap somewhere else; your pin moves."],
 ["Lock your answer", "Happy with your pin? Press LOCK ANSWER. Once locked, it can't be changed."],
 ["See the correct location", "The real place appears on the map with the distance from your guess and a short story about it."],
 ["Earn points", "Up to 1,000 points a round. The closer your tap, the more you score."],
 ["Complete five rounds", "Five stars make a game. Finish to see your total out of 5,000 and share it — without spoilers."],
] as const;

export default function HowToPlay() {
 return <InfoPage eyebrow="✦ HOW TO PLAY" title="TAP THE WORLD. FIND THE STAR."
  intro={<p className="five-line"><span>5 STARS</span><span>5 QUESTIONS</span><span>5 TAPS</span><em>ONE SCORE</em></p>}>
  <ol className="how-steps">{STEPS.map(([t, d], i) => <li key={t}><b>{String(i + 1).padStart(2, "0")}</b><div><h2>{t}</h2><p>{d}</p></div></li>)}</ol>

  <section className="info-section">
   <h2>Ways to play</h2>
   <ul>
    <li><strong>Today&apos;s Five</strong> — the daily game. Everyone gets the same five stars, and a new set starts at midnight UTC. One tap per star; the closer you are, the higher your score.</li>
    <li><strong>Music World, Sports World and World Mix</strong> — play five whenever you like. These rounds have two steps: first find the <em>country</em> (up to 300 points), then the <em>city</em> (up to 700 points).</li>
   </ul>
  </section>

  <section className="info-section">
   <h2>Tips</h2>
   <ul>
    <li>Stuck? <strong>Another hint</strong> gives a second clue, but costs 200 points that round.</li>
    <li>Scores never go below zero, so a guess is always worth making.</li>
    <li>On a computer: drag with the mouse, scroll to zoom, click to place your pin. <kbd>Esc</kbd> skips an intro video.</li>
    <li>Your progress, streak and Star Passport are saved in this browser — no account needed.</li>
   </ul>
  </section>
  <p><Link className="primary-button" href="/play/">PLAY TODAY&apos;S FIVE <span aria-hidden="true">→</span></Link></p>
 </InfoPage>;
}
