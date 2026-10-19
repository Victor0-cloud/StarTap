import type { Metadata } from "next";
import { Suspense } from "react";
import { catalog } from "@/lib/content/catalog";
import { CategoryPlay } from "@/components/worlds/CategoryPlay";
import { pageMetadata } from "@/lib/seo";
import { categoryPlayCopy } from "@/lib/seo-pages";

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
 return catalog.raw.taxonomy.categories.map(c => ({ slug: c.key }));
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
 const { slug } = await params;
 // Canonical drops ?sub= and &intro=: every play state of a world shares one URL.
 return pageMetadata({ ...categoryPlayCopy(catalog.raw.taxonomy.categories.find(c => c.key === slug)?.label ?? "StarTap"), path: `/category/${slug}/play/` });
}
export default async function CategoryPlayPage({ params }: Params) {
 const { slug } = await params;
 return <Suspense fallback={<main className="empty-state">Preparing your five stars…</main>}><CategoryPlay category={slug} /></Suspense>;
}
