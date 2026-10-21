import type { MetadataRoute } from "next";
import { PRODUCTION_URL } from "@/lib/site";
import { catalog } from "@/lib/content/catalog";
import { categoryCounts } from "@/lib/content/counts";
import { GENRE_PREVIEWS } from "@/lib/game/cinematics";
import { PAYMENTS_UI_ENABLED } from "@/lib/premium/flag";
import { sitemapPaths } from "@/lib/seo-pages";

export const dynamic = "force-static";

// Public, indexable entry pages only (trailing slash, as served): see sitemapPaths for what is left out and why.
// No lastmod: the content has no reliable per-page modification date, and a build timestamp would be misleading.
export default function sitemap(): MetadataRoute.Sitemap {
 const paths = sitemapPaths({ categories: categoryCounts(catalog.raw), previews: GENRE_PREVIEWS, premium: PAYMENTS_UI_ENABLED });
 return paths.map(path => ({ url: PRODUCTION_URL + path, changeFrequency: path === "/play/" ? "daily" : "monthly", priority: path === "/" ? 1 : path === "/play/" ? 0.9 : 0.6 }));
}
