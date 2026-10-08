import type { StarMedia } from "@/types/game";
import { portalLinks } from "@/lib/game/media";
export function StarPortal({media,starName}:{media?:StarMedia;starName:string}) {
 const links=portalLinks(media);
 if(!links.length) return null;
 return <aside className="star-portal" aria-label={"Star Portal for "+starName}>
  <span className="eyebrow">STAR PORTAL</span>
  <p>Curious about {starName}? Explore a little further.</p>
  <div className="portal-links">{links.map(link=><a key={link.kind} href={link.href} target="_blank" rel="noopener noreferrer" aria-label={link.label+" — opens in a new tab"}>
   <strong>{link.kind.toUpperCase()} ↗</strong><span>{link.label}</span>
  </a>)}</div>
  <small>Source: {media?.sourceName || "Official / reputable external destination"} · Opens in a new tab.</small>
 </aside>;
}
