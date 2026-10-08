// Builds the mascot "character portal" images used inside the game world (sources are never modified).
// Run: node scripts/build-mascot-cutouts.mjs
//
// Why not true cutouts: each portrait's background is a glowing violet sky with light trails, sparkles and a lit ground
// ring as bright as the mascot's own glow outline, and several mascots have navy limbs matching the sky. Automatic
// background removal tested on these files kept large patches of sky and cut into the characters, so it is not used.
// Clean transparent art needs an artist-supplied export (drop them in assets/images/mascots/cutout/ later).
//
// Portal treatment instead: a tight oval around the character with a long soft alpha fade, so the baked sky reads as the
// mascot's own aura and melts into each landing world (no circle or square edge). The game adds glow and a shadow.
// Output: assets/images/mascots/portal/<id>-portal.png (master, 512 px) and public/mascots/<id>-portal.webp (app, 220 px).
import sharp from "sharp";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";

const images = fileURLToPath(new URL("../../assets/images/", import.meta.url));
const master = images + "mascots/portal/";
const pub = fileURLToPath(new URL("../public/mascots/", import.meta.url));
mkdirSync(master, { recursive: true });

// Character centre and oval radii in each 1122x1402 portrait (above the baked-in name).
export const PORTALS = {
 sparkle: { file: "ChatGPT Image Oct 2, 2026, 03_45_47 AM-1.png", cx: 590, cy: 540, rx: 330, ry: 390 },
 orbit: { file: "ChatGPT Image Oct 2, 2026, 03_45_48 AM-2.png", cx: 615, cy: 510, rx: 360, ry: 360 },
 nova: { file: "ChatGPT Image Oct 2, 2026, 03_45_49 AM-3.png", cx: 600, cy: 530, rx: 330, ry: 400 },
 dash: { file: "ChatGPT Image Oct 2, 2026, 03_45_50 AM-4.png", cx: 660, cy: 530, rx: 340, ry: 360 },
 aura: { file: "ChatGPT Image Oct 2, 2026, 03_45_52 AM-5.png", cx: 610, cy: 520, rx: 320, ry: 380 },
 pixel: { file: "ChatGPT Image Oct 2, 2026, 03_45_53 AM-6.png", cx: 590, cy: 520, rx: 320, ry: 370 },
};

export async function portal(id) {
 const { file, cx, cy, rx, ry } = PORTALS[id];
 const w = 2 * rx, h = 2 * ry;
 // Alpha: fully opaque in the middle, a long smooth fade to transparent at the oval edge.
 const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><defs><radialGradient id="g" cx="50%" cy="50%" r="50%">
  <stop offset="0.58" stop-color="#fff" stop-opacity="1"/><stop offset="0.8" stop-color="#fff" stop-opacity="0.55"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
  <ellipse cx="${rx}" cy="${ry}" rx="${rx}" ry="${ry}" fill="url(#g)"/></svg>`);
 const crop = await sharp(images + file).extract({ left: cx - rx, top: cy - ry, width: w, height: h }).ensureAlpha().toBuffer();
 const faded = await sharp(crop).composite([{ input: mask, blend: "dest-in" }]).png().toBuffer();
 // Square canvas with the character centred, so every mascot has the same footprint in the world.
 const side = Math.max(w, h);
 const out = await sharp({ create: { width: side, height: side, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
  .composite([{ input: faded, left: Math.floor((side - w) / 2), top: Math.floor((side - h) / 2) }]).png().toBuffer();
 await sharp(out).resize(512, 512).png({ compressionLevel: 9 }).toFile(`${master}${id}-portal.png`);
 await sharp(out).resize(220, 220).webp({ quality: 84, alphaQuality: 90 }).toFile(`${pub}${id}-portal.webp`);
 return id;
}

for (const id of Object.keys(PORTALS)) console.log("portal:", await portal(id));
