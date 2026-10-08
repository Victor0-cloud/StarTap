import type { MetadataRoute } from "next";
import { PRODUCTION_URL } from "@/lib/site";

export const dynamic = "force-static";

// Public entry pages only (trailing slash, as exported). Game sub-screens are reached from these.
const ROUTES = ["/", "/play/", "/how-to-play/", "/category/music/", "/category/sports/", "/world-mix/", "/support/", "/privacy/", "/terms/"];

export default function sitemap(): MetadataRoute.Sitemap {
 return ROUTES.map(path => ({ url: PRODUCTION_URL + path, changeFrequency: path === "/play/" ? "daily" : "monthly", priority: path === "/" ? 1 : path === "/play/" ? 0.9 : 0.6 }));
}
