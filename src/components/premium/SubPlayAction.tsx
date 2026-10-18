import Link from "next/link";

type Props = { category: string; subcategory: string; label: string; href: string };

/** Android and any build that does not alias this file: the row's PLAY FIVE link, exactly as before. The website swaps in SubPlayAction.web.tsx. */
export function SubPlayAction({ category, subcategory, label, href }: Props) {
  void category;
  void subcategory;
  return <Link className="sub-play" href={href} aria-label={`Play ${label} Five`}>PLAY FIVE</Link>;
}
