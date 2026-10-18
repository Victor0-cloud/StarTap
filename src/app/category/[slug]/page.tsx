import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { catalog } from "@/lib/content/catalog";
import { categoryCounts } from "@/lib/content/counts";
import { CategoryIcon } from "@/components/worlds/CategoryIcon";
import { SubPremiumMark } from "@/components/premium/SubPremiumMark";
import { MoreGrid } from "@/components/worlds/WorldCards";
import { WorldIntro } from "@/components/cinematic/WorldIntro";
import Image from "next/image";
import { genreIntro, genrePreview, previewForSubcategory, WORLD_POSTERS } from "@/lib/game/cinematics";

const soulLegends = genrePreview("music", "soul-legends-80s-90s"); // 80s/90s Soul Legends: its own card (never a second row), Play Five at 5 stars
/** Music genre taps go straight to the game, playing that genre's intro first every time (the game page handles it). */
// Every way into a game (genre or sport name, PLAY FIVE, ▶ INTRO, Soul card, PLAY <WORLD> FIVE) plays an intro first — the
// genre's own clip, or the world's for sports and world-wide play — then deals a brand-new five from Round 1 (&intro=1).
const genreTap = (category: string, sub: string, playable: boolean) => playable ? `/category/${category}/play/?sub=${sub}&intro=1` : null;

type Params = { params: Promise<{ slug: string }> };
export const dynamicParams = false;
export function generateStaticParams() {
 return [...catalog.raw.taxonomy.categories.map(c => ({ slug: c.key })), { slug: "more" }];
}
const labelFor = (slug: string) => slug === "more" ? "More" : catalog.raw.taxonomy.categories.find(c => c.key === slug)?.label ?? "StarTap";
export async function generateMetadata({ params }: Params): Promise<Metadata> {
 return { title: `${labelFor((await params).slug)} | StarTap` };
}

export default async function CategoryPage({ params }: Params) {
 const { slug } = await params;
 if (slug === "more") return <main className="world-page">
  <Link className="world-back" href="/">← HOME</Link>
  <header className="world-head"><CategoryIcon category="more" size={40} /><h1>MORE</h1><p>More worlds to explore.</p></header>
  <MoreGrid />
 </main>;
 const category = categoryCounts(catalog.raw).find(c => c.key === slug);
 if (!category) notFound();
 const soulCount = category.subcategories.find(s => s.key === soulLegends?.subcategory);
 const poster = WORLD_POSTERS[category.key];
 const back = category.group === "more" ? { href: "/category/more/", label: "MORE" } : { href: "/", label: "HOME" };
 return <main className="world-page">
  <Link className="world-back" href={back.href}>← {back.label}</Link>
  <header className={poster ? "world-head world-head-poster" : "world-head"}>
   <span className="world-head-text">
    <CategoryIcon category={category.key} size={40} />
    <h1>{category.label.toUpperCase()}</h1>
    <p>{category.stars} {category.stars === 1 ? "star" : "stars"}</p>
   </span>
   {poster && <Image className="world-poster" src={poster.src} alt="" width={poster.size[0]} height={poster.size[1]} style={{ aspectRatio: `auto ${poster.size[0]}/${poster.size[1]}` }} unoptimized priority />}
  </header>
  <WorldIntro worldId={category.key} />
  {category.playable
   ? <Link className="primary-button world-play" href={`/category/${category.key}/play/?intro=1`}>PLAY {category.label.toUpperCase()} FIVE <span aria-hidden="true">→</span></Link>
   : <p className="world-soon">{category.stars ? `${category.stars} of 5 stars so far. More coming soon.` : "Coming soon."}</p>}
  {category.key === "music" && soulLegends && <section aria-labelledby="soul-title" className="soul-legends-section">
   <h2 id="soul-title" className="worlds-title">CLASSIC SOUL</h2>
   <Link className="soul-legends-card" href={genreTap("music", soulLegends.subcategory ?? "", Boolean(soulCount?.playable)) ?? `/category/music/genre/${soulLegends.key}/`} aria-label={`${soulLegends.title}: ${soulLegends.subtitle}`}>
    {soulLegends.artwork && <Image className="soul-legends-art" src={soulLegends.artwork} alt="" width={1122} height={1402} unoptimized />}
    <span className="soul-legends-text"><strong>{soulLegends.title}</strong><em>{soulLegends.subtitle}</em><small>{soulCount?.playable ? `${soulCount.stars} stars · Play Five` : "Preview · gameplay coming soon"}</small></span>
   </Link>
  </section>}
  {category.subcategories.length > 0 && <section aria-labelledby="sub-title">
   <h2 id="sub-title" className="worlds-title">{category.key === "music" ? "GENRES" : "EXPLORE"}</h2>
   <ul className="sub-list">
    {category.subcategories.filter(s => s.key !== soulLegends?.subcategory).map(s => { const detail = previewForSubcategory(category.key, s.key);
     const tap = genreTap(category.key, s.key, s.playable); // intro every time, then a new game
     return <li key={s.key} className="sub-row">
     {(category.key === "music" && tap) || detail // the name opens the genre's game (Music, via its intro) or the sport's hero page
      ? <Link className="sub-name" href={category.key === "music" && tap ? tap : `/category/${category.key}/genre/${detail!.key}/`}><strong>{s.label}</strong><small>{s.stars} {s.stars === 1 ? "star" : "stars"}</small></Link>
      : <span><strong>{s.label}</strong><small>{s.stars} {s.stars === 1 ? "star" : "stars"}</small></span>}
     {s.playable && <SubPremiumMark category={category.key} subcategory={s.key} />}
     {s.playable
      ? <Link className="sub-play" href={tap ?? `/category/${category.key}/play/?sub=${s.key}&intro=1`} aria-label={`Play ${s.label} Five`}>PLAY FIVE</Link>
      : detail
       ? <Link className="sub-play sub-preview" href={`/category/${category.key}/genre/${detail.key}/`} aria-label={`Preview ${s.label}`}>PREVIEW</Link>
       : <span className="sub-soon">Soon</span>}
     {tap && genreIntro(category.key, s.key) && <Link className="intro-replay" href={tap} aria-label={`${s.label} intro, then play`}>▶ INTRO</Link>}
    </li>; })}
   </ul>
  </section>}
 </main>;
}
