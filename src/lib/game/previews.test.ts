// Genre / sport pages show PLAY FIVE only from live verified counts; nothing is hardcoded. Visual assets never change content.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { categoryCounts, MIN_PLAYABLE } from "../content/counts.ts";
import { loadRawContent } from "../content/node-content.ts";
import { GENRE_PREVIEWS, previewForSubcategory } from "./cinematics.ts";

const counts = categoryCounts(loadRawContent());
const sub = (category: string, key: string) => counts.find(c => c.key === category)!.subcategories.find(s => s.key === key);

test("every sport has its own hero page; every newly completed Music genre keeps its genre page", () => {
 for (const s of counts.find(c => c.key === "sports")!.subcategories.filter(s => s.playable)) assert.ok(previewForSubcategory("sports", s.key), `sports/${s.key} has a hero page`);
 for (const key of ["amapiano", "rock", "reggae-dancehall", "country", "electronic", "global-icons", "soul-legends-80s-90s"]) assert.ok(previewForSubcategory("music", key), `music/${key}`);
});

test("every preview page's button follows the live count exactly (no Play Five below 5 verified stars)", () => {
 for (const g of GENRE_PREVIEWS) {
  const s = g.subcategory ? sub(g.category, g.subcategory) : undefined;
  assert.equal(Boolean(s?.playable && g.subcategory), (s?.stars ?? 0) >= MIN_PLAYABLE, `${g.category}/${g.key}`);
 }
 const view = readFileSync(new URL("../../components/cinematic/GenrePreview.tsx", import.meta.url), "utf8");
 const list = readFileSync(new URL("../../app/category/[slug]/page.tsx", import.meta.url), "utf8");
 assert.match(view, /\{playable && preview\.subcategory\s*\? <Link[^>]*play\/\?sub=/, "detail page: PLAY FIVE only when playable");
 assert.match(list, /\{s\.playable\s*\? <SubPlayAction /, "list row: PLAY FIVE (or UNLOCK) only when playable");
 assert.match(view, /preview\.cinematic && <GenreIntro/, "pages without a clip (sports) never try to play one; a missing intro never blocks gameplay");
});
