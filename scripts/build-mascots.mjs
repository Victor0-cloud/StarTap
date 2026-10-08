// Builds the in-app mascot images from the approved artwork. Run: node scripts/build-mascots.mjs
// Sources (never modified) live in ../assets/images with their original export names; this file is the mapping layer.
// Output: public/mascots/<id>-card.webp (portrait without the baked-in name text) and <id>-token.webp (round map token),
// plus public/mascots/onboarding-*.webp scenery crops (no text, no characters) from the two onboarding references.
// Uses sharp, which Next.js already installs; development-time only.
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const images = fileURLToPath(new URL("../../assets/images/", import.meta.url));
const out = fileURLToPath(new URL("../public/mascots/", import.meta.url));
mkdirSync(out, { recursive: true });

// Each portrait is 1122x1402: the character sits in the top ~1000 px, its name and tagline below.
// cx/cy: centre of the character, used for the round token.
export const MASCOT_SOURCES = {
 sparkle: { file: "ChatGPT Image Oct 2, 2026, 03_45_47 AM-1.png", cx: 600, cy: 560 },
 orbit: { file: "ChatGPT Image Oct 2, 2026, 03_45_48 AM-2.png", cx: 610, cy: 520 },
 nova: { file: "ChatGPT Image Oct 2, 2026, 03_45_49 AM-3.png", cx: 600, cy: 560 },
 dash: { file: "ChatGPT Image Oct 2, 2026, 03_45_50 AM-4.png", cx: 640, cy: 560 },
 aura: { file: "ChatGPT Image Oct 2, 2026, 03_45_52 AM-5.png", cx: 610, cy: 540 },
 pixel: { file: "ChatGPT Image Oct 2, 2026, 03_45_53 AM-6.png", cx: 600, cy: 530 },
};
export const ONBOARDING_SOURCES = {
 // Choose Your Mascot reference (941x1672): the island strip along the bottom edge, below the Continue button.
 "onboarding-islands": { file: "ChatGPT Image Oct 2, 2026, 04_35_40 AM-1.png", region: { left: 0, top: 1440, width: 941, height: 232 } },
 // Country First / City Next reference (941x1672): the starry sky corner left of the "2/2" pill.
 "onboarding-sky": { file: "ChatGPT Image Oct 2, 2026, 04_35_41 AM-2.png", region: { left: 0, top: 0, width: 380, height: 100 } },
};

const R = 420;
for (const [id, { file, cx, cy }] of Object.entries(MASCOT_SOURCES)) {
 const src = images + file;
 await sharp(src).extract({ left: 61, top: 20, width: 1000, height: 1000 }).resize(360, 360).webp({ quality: 80 }).toFile(`${out}${id}-card.webp`);
 const size = 192, mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${size / 2}" fill="#fff"/></svg>`);
 const square = await sharp(src).extract({ left: cx - R, top: cy - R, width: 2 * R, height: 2 * R }).resize(size, size).ensureAlpha().toBuffer();
 await sharp(square).composite([{ input: mask, blend: "dest-in" }]).webp({ quality: 82 }).toFile(`${out}${id}-token.webp`);
}
for (const [id, { file, region }] of Object.entries(ONBOARDING_SOURCES)) {
 await sharp(images + file).extract(region).webp({ quality: 78 }).toFile(`${out}${id}.webp`);
}
console.log("mascot images written to public/mascots/");
