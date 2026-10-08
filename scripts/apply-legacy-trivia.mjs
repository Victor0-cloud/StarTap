// Applies the legacy trivia review (src/content/batches/legacy-trivia.json) to the legacy questions.
// Verified lines become trivia cards; the source URL is taken exactly from the saved evidence
// (docs/content-research/legacy-trivia-evidence.json) and must be one of the question's own sources,
// and the quote must appear in the evidence sentence. Unverified lines are marked needs_review and hidden.
// Legacy wording, coordinates and scoring are untouched. Run: node scripts/apply-legacy-trivia.mjs
import { readFileSync, writeFileSync, readdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const read = p => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const review = read("src/content/batches/legacy-trivia.json");
const evidence = new Map(read("docs/content-research/legacy-trivia-evidence.json").map(e => [e.id, e]));
// Quotes taken from a separate render of the same source (not the best-matching sentence), checked by hand.
const SEPARATELY_RENDERED = { "tyla-expanded": "Grammy.com artist page, 'Winner' row for the 66th Annual Grammy Awards" };
const files = readdirSync(new URL("src/content/questions/", root)).filter(f => f.endsWith(".json"));
let cards = 0, held = 0;
for (const file of files) {
 const path = `src/content/questions/${file}`, list = read(path);
 for (const q of list) {
  const card = review.cards[q.id];
  if (card) {
   const [type, text, , sourceName, quote] = card, ev = evidence.get(q.id);
   const url = ev?.best?.url;
   if (!url || !q.sources.some(s => s.url === url)) throw new Error(`${q.id}: evidence URL is not one of its sources`);
   if (!SEPARATELY_RENDERED[q.id] && !ev.best.sentence.includes(quote)) throw new Error(`${q.id}: quote not found in evidence`);
   q.triviaCard = { type, text, sourceUrl: url, sourceName, quote };
   delete q.triviaStatus;
   card[2] = url; cards++;
  } else if (review.needsReview[q.id]) {
   delete q.triviaCard;
   q.triviaStatus = "needs_review";
   q.review.notes = [...(q.review.notes ?? []).filter(n => !n.startsWith("Trivia needs review")), "Trivia needs review: " + review.needsReview[q.id]];
   held++;
  }
 }
 writeFileSync(new URL(path, root), JSON.stringify(list, null, 1) + "\n");
}
writeFileSync(new URL("src/content/batches/legacy-trivia.json", root), JSON.stringify(review, null, 1) + "\n");
console.log(`${cards} legacy trivia cards applied, ${held} marked needs_review`);
