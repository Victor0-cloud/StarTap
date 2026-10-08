import type { NextConfig } from "next";
// Both shipped targets are fully static exports of the same app:
//   STARTAP_MOBILE=1 → .next-mobile (Capacitor webDir, Android)
//   STARTAP_WEB=1    → out          (https://startap.fun, uploaded to static hosting)
// trailingSlash writes every route as <route>/index.html, so a refresh or deep link works on any static host.
const mobile=process.env.STARTAP_MOBILE==="1";
const web=process.env.STARTAP_WEB==="1";
const exported={output:"export",trailingSlash:true,images:{unoptimized:true}} as const;
const nextConfig:NextConfig={
 env:{NEXT_PUBLIC_STARTAP_TARGET:mobile?"android":"web"},
 ...(mobile?{...exported,distDir:".next-mobile"}:web?{...exported,distDir:"out"}:{}),
};
export default nextConfig;
