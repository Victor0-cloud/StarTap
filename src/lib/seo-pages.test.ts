import test from "node:test";
import assert from "node:assert/strict";
import { categoryCounts } from "./content/counts.ts";
import { loadRawContent } from "./content/node-content.ts";
import { GENRE_PREVIEWS } from "./game/cinematics.ts";
import { categoryCopy, genreCopy, moreCopy, sitemapPaths } from "./seo-pages.ts";
import { faqJsonLd, homeJsonLd, jsonLdString } from "./seo.ts";

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

test("genre and sport pages get unique titles", () => {
  const titles = GENRE_PREVIEWS.map(p => genreCopy(p, 10).title);
  assert.equal(new Set(titles).size, titles.length);
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
  const faq = faqJsonLd([["Q?", "A <b>."]]) as { mainEntity: { name: string; acceptedAnswer: { text: string } }[] };
  assert.equal(faq.mainEntity[0].acceptedAnswer.text, "A <b>.");
  assert.ok(!jsonLdString(faq).includes("<"));
});
