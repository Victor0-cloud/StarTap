import type { NextConfig } from "next";
import path from "node:path";
import { paymentsLive } from "./src/lib/payments/env";

// STARTAP_MOBILE=1 → static export to .next-mobile (Capacitor). Unchanged shape: no server routes.
// STARTAP_WEB=1    → static export to out/ (fallback if a host cannot run Next server routes).
// Neither flag     → normal Next.js server build for Vercel, including *.web.ts routes.
// trailingSlash writes /play/ and keeps the existing public URLs.
const mobile = process.env.STARTAP_MOBILE === "1";
const web = process.env.STARTAP_WEB === "1";
const serverBuild = !mobile && !web;
const exported = { output: "export" as const, trailingSlash: true, images: { unoptimized: true } };
const webAlias = (spec: string) => path.join(process.cwd(), spec);
const WEB_MODULES: Record<string, string> = {
  "@/components/site/PaymentsDisclosure": "src/components/site/PaymentsDisclosure.web.tsx",
  "@/components/site/ContactLine": "src/components/site/ContactLine.web.tsx",
  "@/components/site/SiteChrome": "src/components/site/SiteChrome.web.tsx",
  "@/components/game/ModeGame": "src/components/game/ModeGame.web.tsx",
  "@/components/game/FinishSummary": "src/components/game/FinishSummary.web.tsx",
  "@/components/game/PlayGame": "src/components/game/PlayGame.web.tsx",
  "@/components/game/StreakBadge": "src/components/game/StreakBadge.web.tsx",
  "@/components/adventure/AdventureMap": "src/components/adventure/AdventureMap.web.tsx",
  "@/components/adventure/AdventurePlay": "src/components/adventure/AdventurePlay.web.tsx",
  "@/components/passport/PassportView": "src/components/passport/PassportView.web.tsx",
  "@/components/worlds/CategoryPlay": "src/components/worlds/CategoryPlay.web.tsx",
  "@/components/worlds/WorldCards": "src/components/worlds/WorldCards.web.tsx",
};

const nextConfig: NextConfig = {
  trailingSlash: true,
  env: {
    NEXT_PUBLIC_STARTAP_TARGET: mobile ? "android" : "web",
    // Baked into the client. Static targets stay "0" so Premium UI cannot appear there.
    // The server build is "1" only when the flag is on and every required variable is set.
    NEXT_PUBLIC_STARTAP_PAYMENTS_ENABLED: serverBuild && paymentsLive() ? "1" : "0",
  },
  ...(serverBuild ? {
    pageExtensions: ["tsx", "ts", "jsx", "js", "web.tsx", "web.ts"],
    turbopack: {
      resolveAlias: Object.fromEntries(Object.entries(WEB_MODULES).map(([key, file]) => [key, `./${file}`])),
    },
    webpack: (config) => {
      const absolute = Object.fromEntries(Object.entries(WEB_MODULES).map(([key, file]) => [key, webAlias(file)]));
      config.resolve.alias = { ...(config.resolve.alias ?? {}), ...absolute };
      return config;
    },
  } : {}),
  ...(mobile ? { ...exported, distDir: ".next-mobile" } : web ? { ...exported, distDir: "out" } : {}),
};

export default nextConfig;
