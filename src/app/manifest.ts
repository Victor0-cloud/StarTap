import type { MetadataRoute } from "next";

export const dynamic = "force-static";

// Installable web app (Add to Home Screen). Deliberately no service worker: daily content and game data always
// come fresh from the network, so a cached copy can never serve a stale Today's Five.
export default function manifest(): MetadataRoute.Manifest {
 return {
  id: "/",
  name: "StarTap",
  short_name: "StarTap",
  description: "5 stars. 5 questions. 5 taps. One score. A daily geography game about the world's biggest stars.",
  start_url: "/",
  scope: "/",
  display: "standalone",
  orientation: "any",
  background_color: "#081224",
  theme_color: "#081224",
  categories: ["games", "education", "entertainment"],
  icons: [
   { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
   { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
   { src: "/icons/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
 };
}
