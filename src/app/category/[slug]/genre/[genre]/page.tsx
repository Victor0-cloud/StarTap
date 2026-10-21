import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/content/catalog";
import { categoryCounts } from "@/lib/content/counts";
import { GENRE_PREVIEWS, genrePreview } from "@/lib/game/cinematics";
import { GenrePreviewView } from "@/components/cinematic/GenrePreview";
import { pageMetadata } from "@/lib/seo";
import { genreCopy } from "@/lib/seo-pages";

type Params = { params: Promise<{ slug: string; genre: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
 return GENRE_PREVIEWS.map(g => ({ slug: g.category, genre: g.key }));
}
export async function generateMetadata({ params }: Params): Promise<Metadata> {
 const { slug, genre } = await params;
 const preview = genrePreview(slug, genre);
 if (!preview) return { title: "StarTap" };
 const sub = preview.subcategory ? categoryCounts(catalog.raw).find(c => c.key === slug)?.subcategories.find(s => s.key === preview.subcategory) : undefined;
 return pageMetadata({ ...genreCopy(preview, sub?.stars ?? 0), path: `/category/${slug}/genre/${genre}/` });
}

/** A genre's own screen: its intro on first visit, Replay Intro, and PLAY FIVE once it has enough verified stars. */
export default async function GenrePage({ params }: Params) {
 const { slug, genre } = await params;
 const preview = genrePreview(slug, genre);
 if (!preview) notFound();
 const category = categoryCounts(catalog.raw).find(c => c.key === slug);
 const sub = preview.subcategory ? category?.subcategories.find(s => s.key === preview.subcategory) : undefined;
 return <GenrePreviewView previewKey={preview.key} category={slug} categoryLabel={category?.label ?? slug} stars={sub?.stars ?? 0} playable={Boolean(sub?.playable)} />;
}
