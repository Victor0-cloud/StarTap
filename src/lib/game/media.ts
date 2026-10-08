import type { StarMedia } from "../../types/game";
export function portalLinks(media?: StarMedia) {
 const kinds = ["listen", "watch", "discover"] as const;
 return kinds.flatMap(kind => {
  const value=media?.[`${kind}Url`]?.trim();
  if(!value) return [];
  try {
   const url=new URL(value);
   if(url.protocol!=="https:" || url.username || url.password) return [];
   return [{kind,href:url.href,label:media?.[`${kind}Label`]?.trim() || kind.toUpperCase()}];
  } catch { return []; }
 });
}
