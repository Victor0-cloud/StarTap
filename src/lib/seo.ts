import type { Metadata } from "next";

export const SITE_TITLE = "StarTap — 5 stars. 5 questions. 5 taps. One score.";
export const SITE_DESCRIPTION = "A daily geography game about the world's biggest stars. Read the clue, spin the globe, tap where their story happened and see how close you get. Free in your browser, no sign-up.";
export const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "StarTap: 5 stars, 5 questions, 5 taps, one score" };

/**
 * Full metadata for a public page: canonical URL, Open Graph and Twitter card. Next merges metadata shallowly, so a
 * page that sets openGraph must restate all of it — this keeps every page's share card complete.
 * `path` is the canonical route with its trailing slash (the site is exported with trailingSlash).
 */
export function pageMetadata({ title, description = SITE_DESCRIPTION, path, index = true }: { title: string; description?: string; path: string; index?: boolean }): Metadata {
 return {
  title, description,
  alternates: { canonical: path },
  ...(index ? {} : { robots: { index: false, follow: true } }),
  openGraph: { type: "website", siteName: "StarTap", url: path, title, description, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
 };
}

type Json = string | number | boolean | null | Json[] | { [key: string]: Json };

/**
 * Home page structured data: the site plus the game itself (VideoGame + WebApplication).
 * Only facts that are true for every visitor: no ratings, reviews, player counts or Premium prices
 * (Premium is sold in Nigeria only). The one Offer is the free daily game. Android is left out until the Play listing is live.
 */
export function homeJsonLd(origin: string, contactEmail: string | null): Json {
 const url = `${origin}/`;
 const publisher: Json = { "@type": "Organization", name: "StarTap", url, ...(contactEmail ? { email: contactEmail } : {}) };
 return {
  "@context": "https://schema.org",
  "@graph": [
   { "@type": "WebSite", "@id": `${url}#website`, url, name: "StarTap", description: SITE_DESCRIPTION, inLanguage: "en", publisher },
   {
    "@type": ["VideoGame", "WebApplication"],
    "@id": `${url}#game`,
    name: "StarTap",
    url,
    description: SITE_DESCRIPTION,
    applicationCategory: "GameApplication",
    genre: ["Geography", "Trivia"],
    gamePlatform: "Web browser",
    operatingSystem: "Any (web browser)",
    playMode: "SinglePlayer",
    inLanguage: "en",
    image: `${origin}${OG_IMAGE.url}`,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD", description: "Today's Five, the daily game, is free to play in the browser." },
    publisher,
   },
  ],
 };
}

/** FAQPage data built from the exact question/answer pairs a page shows, so the markup can never differ from the text. */
export function faqJsonLd(items: readonly (readonly [question: string, answer: string])[]): Json {
 return {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: items.map(([question, answer]) => ({ "@type": "Question", name: question, acceptedAnswer: { "@type": "Answer", text: answer } })),
 };
}

/** Serialise for a <script type="application/ld+json">: escapes "<" so the payload can never close the script tag. */
export function jsonLdString(data: Json): string {
 return JSON.stringify(data).replace(/</g, "\\u003c");
}
