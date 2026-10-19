import { jsonLdString } from "@/lib/seo";

/** Structured data for search engines and assistants. Web only: the Android build renders nothing. */
export function JsonLd({ data }: { data: Parameters<typeof jsonLdString>[0] }) {
 if (process.env.NEXT_PUBLIC_STARTAP_TARGET === "android") return null;
 return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdString(data) }} />;
}
