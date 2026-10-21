import test from "node:test";
import assert from "node:assert/strict";
import { categoryCounts } from "./content/counts.ts";
import { loadRawContent } from "./content/node-content.ts";
import { GENRE_PREVIEWS } from "./game/cinematics.ts";
import { categoryCopy, genreCopy, moreCopy, sitemapPaths } from "./seo-pages.ts";
import { faqJsonLd, homeJsonLd, jsonLdString, SITE_DESCRIPTION, SITE_TITLE } from "./seo.ts";

const counts = categoryCounts(loadRawContent());

test("every world has its own title and description, with the live star count", () => {
  const live = counts.filter(c => c.stars > 0);
  const titles = new Set(live.map(c => categoryCopy(c).title));
  const descriptions = new Set(live.map(c => categoryCopy(c).description));
  assert.equal(titles.size, live.length);
  assert.equal(descriptions.size, live.length);
  for (const c of live) {
    assert.ok(categoryCopy(c).indexable);
    assert.ok(categoryCopy(c).description.startsWith(`${c.stars} `), c.key);
  }
  assert.notEqual(moreCopy(counts).title, categoryCopy(live[0]).title);
});

test("worlds with no stars are honest coming-soon pages and are not indexed", () => {
  for (const c of counts.filter(c => c.stars === 0)) {
    const copy = categoryCopy(c);
    assert.equal(copy.indexable, false, c.key);
    assert.match(copy.title, /Coming Soon/);
  }
});

test("genre and sport pages get unique titles of 60 characters or less", () => {
  const titles = GENRE_PREVIEWS.map(p => genreCopy(p, 10).title);
  assert.equal(new Set(titles).size, titles.length);
  for (const title of titles) assert.ok(title.length <= 60, `${title} (${title.length})`);
  assert.equal(genreCopy({ title: "African Music Legends", description: "x" }, 10).title, "African Music Legends Trivia: Where Stars Come From");
});

test("meta descriptions that name the two stages stay under 160 characters", () => {
  assert.ok(SITE_TITLE.length <= 60, SITE_TITLE);
  assert.equal(SITE_TITLE, "StarTap: Daily Geography Game About Famous Stars");
  assert.ok(SITE_DESCRIPTION.length <= 160, `${SITE_DESCRIPTION.length}`);
  const stages = "Find the country, then the city.";
  for (const c of counts.filter(c => c.stars > 0)) {
    const description = categoryCopy(c).description;
    assert.ok(description.endsWith(stages), c.key);
    assert.ok(description.length <= 160, `${c.key} ${description.length}`);
  }
  assert.ok(moreCopy(counts).description.length <= 160);
  assert.ok(moreCopy(counts).description.endsWith(stages));
  for (const preview of GENRE_PREVIEWS) {
    const stars = counts.find(c => c.key === preview.category)?.subcategories.find(s => s.key === preview.subcategory)?.stars ?? 0;
    const description = genreCopy(preview, stars).description;
    assert.ok(description.endsWith(stages), preview.key);
    assert.ok(description.length <= 160, `${preview.key} ${description.length}: ${description}`);
  }
});

test("the six empty worlds have no stars, so their play screens are not indexed", () => {
  const empty = counts.filter(c => c.stars === 0).map(c => c.key).sort();
  assert.deepEqual(empty, ["culture", "food", "geography", "history", "legends", "science"]);
  for (const key of empty) assert.equal((counts.find(c => c.key === key)?.stars ?? 0) > 0, false);
});

test("the sitemap lists public pages only, with trailing slashes and no duplicates", () => {
  const paths = sitemapPaths({ categories: counts, previews: GENRE_PREVIEWS, premium: true });
  assert.equal(new Set(paths).size, paths.length);
  for (const p of paths) assert.ok(p.endsWith("/") && !p.includes("?"), p);
  for (const banned of ["/login/", "/account/", "/payment/", "/api/", "/welcome/", "/mascot/"]) assert.ok(!paths.some(p => p.startsWith(banned)), banned);
  for (const c of counts.filter(c => c.stars === 0)) assert.ok(!paths.includes(`/category/${c.key}/`), c.key);
  assert.ok(paths.includes("/premium/"));
  assert.ok(!sitemapPaths({ categories: counts, previews: GENRE_PREVIEWS, premium: false }).includes("/premium/"));
  assert.ok(paths.length > 9);
});

test("structured data carries no ratings, reviews or paid prices, and FAQ text is passed through unchanged", () => {
  const home = jsonLdString(homeJsonLd("https://startap.fun", "sales@startap.fun"));
  assert.doesNotMatch(home, /aggregateRating|review|ratingValue/i);
  assert.doesNotMatch(home, /NGN|2500|25000/);
  assert.match(home, /StarTap daily geography game/);
  assert.doesNotMatch(home, /"sameAs"/);
  const faq = faqJsonLd([["Q?", "A <b>."]]) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, "A <b>.");
  assert.ok(!jsonLdString(faq).includes("<"));
});
