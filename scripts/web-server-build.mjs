// Server build for Vercel (Next.js, not a static export). Run: npm run build:web:server
// Keeps the same leak scan as the static fallback: no localhost URLs, local disk paths or dev endpoints.
// API routes and *.web.ts pages are part of this build. The static `build:web` script is unchanged.
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { scanForLeaks } from "./internal-files.mjs";

const env = { ...process.env };
delete env.STARTAP_WEB;
delete env.STARTAP_MOBILE;
const result = spawnSync(process.execPath, ["node_modules/next/dist/bin/next", "build"], { stdio: "inherit", env });
if (result.status !== 0) process.exit(result.status ?? 1);

const roots = [".next/static", ".next/server"].filter(dir => existsSync(dir));
const problems = roots.flatMap(dir => scanForLeaks(dir));
const expected = [
  "api/flutterwave/webhook",
  "api/flutterwave/create-checkout",
  "api/flutterwave/verify-payment",
  "api/subscription/status",
  "api/pricing",
  "premium",
  "login",
  "account",
  "payment/success",
  "payment/cancel",
];
const found = new Set();
const walk = dir => {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const rel = p.replaceAll("\\", "/");
    for (const route of expected) if (rel.includes(route)) found.add(route);
    if (statSync(p).isDirectory()) walk(p);
  }
};
if (existsSync(".next/server")) walk(".next/server");
for (const route of expected) if (!found.has(route)) problems.push(`missing server route ${route}`);
if (problems.length) { console.error("Web server output scan FAILED:\n " + problems.join("\n ")); process.exit(1); }
console.log("Web server output scan passed: no localhost URLs, local paths or development endpoints; payment routes present.");
