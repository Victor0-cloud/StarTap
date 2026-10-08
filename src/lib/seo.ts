import type { Metadata } from "next";

export const SITE_TITLE = "StarTap — 5 stars. 5 questions. 5 taps. One score.";
export const SITE_DESCRIPTION = "A daily geography game about the world's biggest stars. Read the clue, spin the globe, tap where their story happened and see how close you get. Free in your browser, no sign-up.";
export const OG_IMAGE = { url: "/og-image.jpg", width: 1200, height: 630, alt: "StarTap: 5 stars, 5 questions, 5 taps, one score" };

/**
 * Full metadata for a public page: canonical URL, Open Graph and Twitter card. Next merges metadata shallowly, so a
 * page that sets openGraph must restate all of it — this keeps every page's share card complete.
 * `path` is the canonical route with its trailing slash (the site is exported with trailingSlash).
 */
export function pageMetadata({ title, description = SITE_DESCRIPTION, path }: { title: string; description?: string; path: string }): Metadata {
 return {
  title, description,
  alternates: { canonical: path },
  openGraph: { type: "website", siteName: "StarTap", url: path, title, description, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title, description, images: [OG_IMAGE.url] },
 };
}
