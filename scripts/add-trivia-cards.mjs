// Adds typed trivia cards to batch questions whose trivia line comes from a quoted source.
// Each card reuses the question's existing trivia text and points at the source whose quote supports it.
// Run: node scripts/add-trivia-cards.mjs && node scripts/add-batch.mjs 1 && node scripts/add-batch.mjs 2 && node scripts/add-batch.mjs 3
import { readFileSync, writeFileSync } from "node:fs";

// questionId → [trivia type, index of the supporting source, display source name]
const CARDS = {
 "billie-eilish-birthplace": ["record_breaker", 0, "Britannica"],
 "tate-mcrae-hometown": ["world_connection", 0, "Capital FM"],
 "peso-pluma-birthplace": ["star_secret", 0, "El Espectador"],
 "rose-birthplace": ["before_the_fame", 1, "Study International"],
 "victor-wembanyama-birthplace": ["record_breaker", 0, "Britannica"],
 "julien-alfred-birthplace": ["record_breaker", 2, "NBC Olympics"],
 "oscar-piastri-birthplace": ["star_secret", 0, "Formula1.com"],
 "timothee-chalamet-hometown": ["world_connection", 0, "Britannica"],
 "malala-yousafzai-birthplace": ["big_moment", 0, "Britannica"],
 "zaha-hadid-birthplace": ["big_moment", 0, "Britannica"],
 "funke-akindele-birthplace": ["big_moment", 0, "Nigerian Tribune"],
 "fela-kuti-birthplace": ["culture_spotlight", 0, "Britannica"],
 "alan-turing-bletchley-park": ["landmark_moment", 0, "Britannica"],
 "anousheh-ansari-birthplace": ["wow_fact", 0, "Britannica"],
 "brian-lara-birthplace": ["record_breaker", 0, "Britannica"],
};
let added = 0;
for (const n of [1, 2, 3]) {
 const file = new URL(`../src/content/batches/batch-${n}.json`, import.meta.url);
 const batch = JSON.parse(readFileSync(file, "utf8"));
 for (const { question: q } of batch.entries) {
  const card = CARDS[q.id];
  if (!card) continue;
  const [type, index, sourceName] = card, source = q.sources[index];
  if (!q.trivia || !source?.quote) throw new Error("No trivia or quote for " + q.id);
  q.triviaCard = { type, text: q.trivia, sourceUrl: source.url, sourceName, quote: source.quote };
  added++;
 }
 writeFileSync(file, JSON.stringify(batch, null, 1) + "\n");
}
if (added !== Object.keys(CARDS).length) throw new Error(`Only ${added} of ${Object.keys(CARDS).length} cards matched`);
console.log(`${added} trivia cards added`);
