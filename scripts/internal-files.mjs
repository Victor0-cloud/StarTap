// Internal project notes live in public/ beside the assets they describe (image/video/flag source logs, artwork notes),
// but must never ship in the Android app or on startap.fun. Both production builds call stripInternal() on their output.
// Licence files (licenses/, fonts/OFL.txt) are kept: font licences must travel with the fonts.
import { readdirSync, rmSync, statSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const INTERNAL = [/(^|[\\/])[^\\/]*SOURCES\.txt$/i, /\.md$/i, /(^|[\\/])(notes?|research|qa)[^\\/]*\.(txt|json)$/i];
const TEXT = /\.(html|txt|js|mjs|css|json|webmanifest|xml|geojson)$/i;

export const walkFiles = dir => readdirSync(dir).flatMap(name => {
 const p = join(dir, name);
 return statSync(p).isDirectory() ? walkFiles(p) : [p];
});

export function stripInternal(dir) {
 const removed = [];
 for (const file of walkFiles(dir)) {
  const rel = relative(dir, file);
  if (INTERNAL.some(rx => rx.test(rel))) { rmSync(file, { force: true }); removed.push(rel.replace(/\\/g, "/")); }
 }
 return removed;
}

// Fails on development leftovers in shipped text files: localhost URLs, local Windows/user paths, dev servers.
// extraDeny is for the Android build only (payment-provider and database vendor names must not ship in the app).
export function scanForLeaks(dir, extraDeny = []) {
 const problems = [];
 const extra = extraDeny.map(word => new RegExp(String(word).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"));
 const LEAK = [/https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, /[A-Z]:\\(Users|Projects)\\/, /\/Users\/[A-Za-z]+\//, /webpack-hmr|__nextjs_original-stack-frame|turbopack-hmr/, ...extra];
 for (const file of walkFiles(dir).filter(f => TEXT.test(f))) {
  // supabase-js ships this realtime default inside its client. It is not an app endpoint.
  const text = readFileSync(file, "utf8").replaceAll("http://localhost:9999", "");
  for (const rx of LEAK) if (rx.test(text)) problems.push(`${relative(dir, file)}: ${rx}`);
 }
 for (const file of walkFiles(dir)) if (INTERNAL.some(rx => rx.test(relative(dir, file)))) problems.push(`${relative(dir, file)}: internal note`);
 return problems;
}
