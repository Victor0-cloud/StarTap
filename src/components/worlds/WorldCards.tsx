import Link from "next/link";
import { catalog } from "@/lib/content/catalog";
import { categoryCounts, type CategoryCount } from "@/lib/content/counts";
import { CategoryIcon } from "./CategoryIcon";

const stars = (n: number) => `${n} ${n === 1 ? "star" : "stars"}`;

export function WorldCard({ category, href, title, detail }: { category: string; href: string | null; title: string; detail: string }) {
 const body = <><CategoryIcon category={category} /><strong>{title}</strong><span>{detail}</span></>;
 return href
  ? <Link className="world-card" href={href}>{body}</Link>
  : <div className="world-card world-card-soon" aria-disabled="true">{body}</div>;
}

const cardFor = (c: CategoryCount) =>
 <WorldCard key={c.key} category={c.key} title={c.label} href={c.stars > 0 ? `/category/${c.key}/` : null} detail={c.stars > 0 ? stars(c.stars) : "Coming soon"} />;

/** Home "Choose your world": the seven main categories in taxonomy order, then More. */
export function WorldsGrid() {
 const counts = categoryCounts(catalog.raw);
 const more = counts.filter(c => c.group === "more");
 const moreStars = more.reduce((n, c) => n + c.stars, 0);
 return <section className="worlds" aria-labelledby="worlds-title">
  <Link className="adventure-card" href="/adventure/">
   <span className="eyebrow">✦ NEW · ADVENTURE</span>
   <strong>ENTER THE ADVENTURE OF WONDERS</strong>
   <span className="adventure-card-lines">Tap the world. Meet the stars. Collect Wonder Stars.</span>
   <span className="adventure-card-cta">START <span aria-hidden="true">→</span></span>
  </Link>
  <h2 id="worlds-title" className="worlds-title">CHOOSE YOUR WORLD</h2>
  <div className="world-grid">
   {counts.filter(c => c.group === "main").map(cardFor)}
   <WorldCard category="more" title="More" href="/category/more/" detail={`${more.filter(c => c.stars > 0).length} worlds · ${stars(moreStars)}`} />
  </div>
  <Link className="passport-card" href="/passport/">
   <span aria-hidden="true" className="passport-card-icon">🛂</span>
   <span><strong>STAR PASSPORT</strong><small>Collect a stamp for every country you discover.</small></span>
   <span aria-hidden="true">→</span>
  </Link>
 </section>;
}

export function MoreGrid() {
 const more = categoryCounts(catalog.raw).filter(c => c.group === "more");
 return <div className="world-grid">{[...more.filter(c => c.stars > 0), ...more.filter(c => c.stars === 0)].map(cardFor)}</div>;
}
