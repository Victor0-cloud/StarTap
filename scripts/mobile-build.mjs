// Static export for the Android app → .next-mobile/ (Capacitor webDir). Run: npm run build:mobile
// After the build, internal project notes are removed and the output is scanned for development leftovers.
import { spawnSync } from "node:child_process";
import { stripInternal, scanForLeaks } from "./internal-files.mjs";

const OUT = ".next-mobile";
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit", env: { ...process.env, STARTAP_MOBILE: "1" } });
if (result.status !== 0) process.exit(result.status ?? 1);

const removed = stripInternal(OUT);
console.log(`internal notes excluded: ${removed.join(", ") || "none"}`);
const problems = scanForLeaks(OUT, ["supabase", "flutterwave"]);
if (problems.length) { console.error("Mobile output scan FAILED:\n " + problems.join("\n ")); process.exit(1); }
console.log("Mobile output scan passed: no internal notes, localhost URLs, local paths or development endpoints.");
