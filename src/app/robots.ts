import type { MetadataRoute } from "next";
import { PRODUCTION_URL } from "@/lib/site";

export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
 return { rules: { userAgent: "*", allow: "/" }, sitemap: `${PRODUCTION_URL}/sitemap.xml`, host: PRODUCTION_URL };
}
