import Link from "next/link";

type Props = { category: string; subcategory: string; title: string; href: string };

/** Android and any build that does not alias this file: the detail page's PLAY <TITLE> FIVE button, exactly as before. The website swaps in GenrePlayAction.web.tsx. */
export function GenrePlayAction({ category, subcategory, title, href }: Props) {
  void category;
  void subcategory;
  return <Link className="primary-button world-play" href={href}>PLAY {title.toUpperCase()} FIVE <span aria-hidden="true">→</span></Link>;
}
