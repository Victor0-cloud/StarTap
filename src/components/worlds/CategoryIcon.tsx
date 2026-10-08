import type { ReactNode } from "react";
// Simple line motifs per category, drawn in currentColor so they follow the StarTap palette.
const PATHS: Record<string, ReactNode> = {
 music: <><path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" /></>,
 sports: <><path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0z" /><path d="M17 6h3a3 3 0 0 1-3 3M7 6H4a3 3 0 0 0 3 3" /></>,
 screen: <><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M3 8l3-5h4l-3 5M10 3h4l-3 5M14 3h4l-3 5" /></>,
 geography: <><circle cx="12" cy="12" r="9" /><ellipse cx="12" cy="12" rx="4" ry="9" /><path d="M3 12h18" /></>,
 culture: <><path d="M4 5c5 2 11 2 16 0v6a8 8 0 0 1-16 0z" /><path d="M8.5 10h2M13.5 10h2M9 15c2 1.5 4 1.5 6 0" /></>,
 icons: <path d="M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z" />,
 tech: <><rect x="7" y="7" width="10" height="10" rx="1.5" /><path d="M9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4" /></>,
 more: <><rect x="4" y="4" width="6" height="6" rx="1.5" /><rect x="14" y="4" width="6" height="6" rx="1.5" /><rect x="4" y="14" width="6" height="6" rx="1.5" /><rect x="14" y="14" width="6" height="6" rx="1.5" /></>,
 creators: <><rect x="3" y="5" width="18" height="14" rx="3" /><path d="M10 9l5 3-5 3z" /></>,
 business: <path d="M4 20V11M10 20V4M16 20v-7M2 20h20" />,
 fashion: <path d="M12 7.5a2 2 0 1 1 2-2c0 1-1 1.5-2 2.2V9L3 16h18l-9-7" />,
 royalty: <path d="M3 18h18l-2-10-5 4-2-6-2 6-5-4z" />,
 history: <path d="M4 21h16M6 18V9M10 18V9M14 18V9M18 18V9M3 9h18L12 3z" />,
 food: <path d="M3 11h18a9 9 0 0 1-18 0zM8 7c0-2 2-2 2-4M13 7c0-2 2-2 2-4" />,
 science: <><circle cx="12" cy="12" r="1.5" /><ellipse cx="12" cy="12" rx="10" ry="4" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(60 12 12)" /><ellipse cx="12" cy="12" rx="10" ry="4" transform="rotate(120 12 12)" /></>,
 legends: <><circle cx="12" cy="9" r="5" /><path d="M9 13l-2 8 5-3 5 3-2-8" /></>,
};

export function CategoryIcon({ category, size = 28 }: { category: string; size?: number }) {
 return <svg className="category-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  {PATHS[category] ?? PATHS.icons}
 </svg>;
}
