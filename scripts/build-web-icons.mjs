// Generates the web app icons and social share image from the approved artwork. Run: npm run icons:web
// Source: assets/images/startap_app_icon.png (same artwork as the Android launcher; see build-android-icons.mjs).
// Output: public/icons/icon-192.png, icon-512.png, icon-maskable-512.png and public/og-image.jpg (1200×630).
// Uses sharp, which Next.js already installs; development-time only.
import sharp from "sharp";
import { mkdirSync } from "node:fs";

const root = new URL("../", import.meta.url);
const path = p => new URL(p, root).pathname.replace(/^\/([A-Z]:)/, "$1");
const source = path("assets/images/startap_app_icon.png");
const NAVY = "#031455", BG = "#081224", LIME = "#e9ff6b";
mkdirSync(path("public/icons"), { recursive: true });

await sharp(source).resize(192, 192).png().toFile(path("public/icons/icon-192.png"));
await sharp(source).resize(512, 512).png({ palette: true, quality: 95, effort: 10 }).toFile(path("public/icons/icon-512.png"));
// Maskable: artwork inside the central 80% safe zone so circle/squircle masks never clip the star.
const inner = await sharp(source).resize(410, 410).png().toBuffer();
await sharp({ create: { width: 512, height: 512, channels: 4, background: NAVY } }).composite([{ input: inner, gravity: "center" }]).png({ palette: true, quality: 95, effort: 10 }).toFile(path("public/icons/icon-maskable-512.png"));

// Social share card: icon on the left, the brand line on the right.
const icon = await sharp(source).resize(440, 440).png().toBuffer();
const text = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
 <defs><radialGradient id="g" cx="25%" cy="50%" r="70%"><stop offset="0" stop-color="#1b2f7a"/><stop offset="1" stop-color="${BG}"/></radialGradient></defs>
 <rect width="1200" height="630" fill="url(#g)"/>
 <g font-family="Impact, 'Arial Black', Arial, sans-serif" fill="#f7f8f2">
  <text x="560" y="150" font-size="84" font-weight="900" letter-spacing="2">STAR<tspan fill="${LIME}">TAP</tspan></text>
  <text x="560" y="250" font-size="54" font-weight="800">5 STARS</text>
  <text x="560" y="315" font-size="54" font-weight="800">5 QUESTIONS</text>
  <text x="560" y="380" font-size="54" font-weight="800">5 TAPS</text>
  <text x="560" y="455" font-size="62" font-weight="900" fill="${LIME}">ONE SCORE</text>
  <text x="560" y="535" font-family="Arial, sans-serif" font-size="30" fill="#b8c7dc">Tap the world. Find the star. · startap.fun</text>
 </g>
</svg>`);
await sharp(text).composite([{ input: icon, left: 70, top: 95 }]).jpeg({ quality: 86, mozjpeg: true }).toFile(path("public/og-image.jpg"));
console.log("Web icons and og-image.jpg written.");
