import type { Metadata, Viewport } from "next";
import "maplibre-gl/dist/maplibre-gl.css";
import "@fontsource-variable/dm-sans";
import "@fontsource/barlow-condensed/600.css";
import "@fontsource/barlow-condensed/700.css";
import "@fontsource/barlow-condensed/800.css";
import "@fontsource/barlow-condensed/900.css";
import "./globals.css";
import { AndroidBackButton } from "@/components/AndroidBackButton";
import { QualityInit } from "@/components/QualityInit";
import { PRODUCTION_URL } from "@/lib/site";
import { OG_IMAGE, SITE_DESCRIPTION, SITE_TITLE } from "@/lib/seo";

// Site-wide defaults. Canonical URLs are set per page (see pageMetadata), never here, or every page would inherit "/".
export const metadata: Metadata = {
  metadataBase: new URL(PRODUCTION_URL),
  title: SITE_TITLE,
  description: SITE_DESCRIPTION,
  applicationName: "StarTap",
  robots: { index: true, follow: true },
  openGraph: { type: "website", siteName: "StarTap", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE] },
  twitter: { card: "summary_large_image", title: SITE_TITLE, description: SITE_DESCRIPTION, images: [OG_IMAGE.url] },
  appleWebApp: { capable: true, title: "StarTap", statusBarStyle: "black-translucent" },
  formatDetection: { telephone: false, address: false, email: false },
};

// viewport-fit=cover makes env(safe-area-inset-*) report the notch / home-indicator insets the layout already pads for.
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#081224",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en">
      <body>{children}<AndroidBackButton /><QualityInit /></body>
    </html>
  );
}
