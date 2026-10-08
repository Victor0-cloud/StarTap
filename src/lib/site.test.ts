import test from "node:test";
import assert from "node:assert/strict";
import { PRODUCTION_URL, shareOrigin } from "./site.ts";
import { buildShareText } from "./game/share.ts";

const loc = (origin: string) => ({ origin, hostname: new URL(origin).hostname });

test("production sharing uses https://startap.fun", () => {
 assert.equal(PRODUCTION_URL, "https://startap.fun");
 assert.equal(shareOrigin({ native: false, location: loc("https://startap.fun"), env: undefined }), PRODUCTION_URL);
 assert.equal(shareOrigin({ native: false, location: loc("https://some-preview.example.app"), env: undefined }), PRODUCTION_URL);
 // Android's WebView origin is https://localhost; shared links must never point there.
 assert.equal(shareOrigin({ native: true, location: loc("https://localhost"), env: undefined }), PRODUCTION_URL);
});

test("local development keeps its own origin", () => {
 for (const origin of ["http://localhost:3001", "http://127.0.0.1:3000", "http://192.168.1.20:3001", "http://startap.local:3000"]) {
  assert.equal(shareOrigin({ native: false, location: loc(origin), env: undefined }), origin);
 }
});

test("NEXT_PUBLIC_SITE_URL overrides when valid", () => {
 assert.equal(shareOrigin({ native: true, env: "https://staging.startap.fun/" }), "https://staging.startap.fun");
 assert.equal(shareOrigin({ native: true, env: "not a url" }), PRODUCTION_URL);
 assert.equal(shareOrigin({ native: true, env: "http://evil.example" }), PRODUCTION_URL);
});

test("share text links to startap.fun with day and edition", () => {
 const text = buildShareText({ day: "2026-10-01", edition: "global-v5", practice: false, results: [{ score: 1000 }, { score: 550 }], origin: shareOrigin({ native: true, env: undefined }) });
 assert.ok(text.endsWith("https://startap.fun/play?day=2026-10-01&edition=global-v5"), text);
 assert.ok(!text.includes("localhost"));
});

test("COPY LINK is the same challenge link as the shared text", async () => {
 const { challengeLink } = await import("./game/share.ts");
 const link = challengeLink({ day: "2026-10-01", edition: "global-v5", origin: PRODUCTION_URL });
 assert.equal(link, "https://startap.fun/play?day=2026-10-01&edition=global-v5");
 assert.ok(buildShareText({ day: "2026-10-01", edition: "global-v5", practice: false, results: [{ score: 1 }], origin: PRODUCTION_URL }).endsWith(link));
});
