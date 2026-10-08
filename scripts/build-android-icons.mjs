// Generates StarTap launcher, store and web icons from the approved artwork. Run: node scripts/build-android-icons.mjs
// Source: assets/images/startap_app_icon.png (approved globe + star icon, 1254x1254, opaque).
// Adaptive icon = navy background colour + a transparent foreground whose soft-edged artwork circle fills the
// 66dp safe zone of the 108dp layer, so circle, squircle and rounded-square launcher masks never clip it.
// Uses sharp, which Next.js already installs; development-time only.
import sharp from "sharp";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";

const root = new URL("../", import.meta.url);
const res = new URL("android/app/src/main/res/", root);
const source = new URL("assets/images/startap_app_icon.png", root).pathname.replace(/^\/([A-Z]:)/, "$1");
const NAVY = "#031455"; // sampled from the artwork around the globe
const CIRCLE = { cx: 627, cy: 640, r: 500 }; // globe, star and orbit ring
const DENSITIES = { mdpi: 1, hdpi: 1.5, xhdpi: 2, xxhdpi: 3, xxxhdpi: 4 };

const out = async (image, relative, base = res) => {
 const file = new URL(relative, base);
 mkdirSync(dirname(file.pathname.replace(/^\/([A-Z]:)/, "$1")), { recursive: true });
 await image.png({ compressionLevel: 9 }).toFile(file.pathname.replace(/^\/([A-Z]:)/, "$1"));
};
const square = size => sharp(source).resize(size, size, { kernel: "lanczos3" });
async function circle(diameter, feather) {
 const art = await sharp(source).extract({ left: CIRCLE.cx - CIRCLE.r, top: CIRCLE.cy - CIRCLE.r, width: 2 * CIRCLE.r, height: 2 * CIRCLE.r })
  .resize(diameter, diameter, { kernel: "lanczos3" }).ensureAlpha().toBuffer();
 const h = diameter / 2;
 const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${diameter}" height="${diameter}"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%"><stop offset="${1 - feather}" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><circle cx="${h}" cy="${h}" r="${h}" fill="url(#g)"/></svg>`);
 return sharp(art).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
}
const onCanvas = async (inner, innerSize, canvas) => sharp({ create: { width: canvas, height: canvas, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
 .composite([{ input: inner, left: Math.round((canvas - innerSize) / 2), top: Math.round((canvas - innerSize) / 2) }]);

for (const [density, k] of Object.entries(DENSITIES)) {
 const layer = Math.round(108 * k), safe = Math.round(66 * k), legacy = Math.round(48 * k);
 await out(await onCanvas(await circle(safe, 0.06), safe, layer), `mipmap-${density}/ic_launcher_foreground.png`);
 await out(square(legacy), `mipmap-${density}/ic_launcher.png`);
 await out(sharp(await circle(legacy, 0.04)), `mipmap-${density}/ic_launcher_round.png`);
}
await out(square(512), "assets/images/generated/play-store-icon-512.png", root);
await out(square(192), "src/app/icon.png", root);
await out(square(180), "src/app/apple-icon.png", root);

const adaptive = `<?xml version="1.0" encoding="utf-8"?>\n<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android"><background android:drawable="@color/ic_launcher_background"/><foreground android:drawable="@mipmap/ic_launcher_foreground"/></adaptive-icon>\n`;
// Adaptive icons need API 26+; API 24-25 use the density PNGs above.
for (const dir of ["mipmap-anydpi-v26"]) for (const name of ["ic_launcher.xml", "ic_launcher_round.xml"]) writeFileSync(new URL(`${dir}/${name}`, res), adaptive);
writeFileSync(new URL("values/ic_launcher_background.xml", res), `<?xml version="1.0" encoding="utf-8"?>\n<resources><color name="ic_launcher_background">${NAVY}</color></resources>\n`);
console.log("StarTap icons generated.");
