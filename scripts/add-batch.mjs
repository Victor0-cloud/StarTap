// Adds a researched content batch to the V2 catalog. Run: node scripts/add-batch.mjs 1
// Each entry is activated only if it passes every gate; otherwise it is added inactive with status needs_review.
// Gates: https sources with a non-weak primary; geocoded country matches the stated answer country; the
// coordinates fall in that country on the StarTap country lookup; a flag exists; no duplicate entity or question.
// Legacy content is never modified: existing IDs are refused, except entries from this same batch (re-runs).
import { readFileSync, writeFileSync, existsSync, readdirSync } from "node:fs";
import { countryAt, isSameCountry } from "../src/lib/geo/countries.ts";
import { validateContent, WEAK_SOURCE_DOMAINS } from "../src/lib/content/validate.ts";
import { loadRawContent } from "../src/lib/content/node-content.ts";

const n = process.argv[2];
const root = new URL("../", import.meta.url);
const read = p => JSON.parse(readFileSync(new URL(p, root), "utf8"));
const write = (p, v) => writeFileSync(new URL(p, root), JSON.stringify(v, null, 1) + "\n");
const batch = read(`src/content/batches/batch-${n}.json`);
const geocode = read(`docs/content-research/batch-${n}-geocode.json`);
const lookup = read("public/country-lookup.json");
const entities = read("src/content/entities.json");
// reverify entries add a newly sourced question for an EXISTING entity (e.g. a legacy star); the entity record is left untouched.
const batchIds = new Set(batch.entries.flatMap(e => e.reverify ? [e.question.id] : [e.entity.id, e.question.id]));
const norm = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().replace(/[^a-z0-9]/g, "");
const legacyEntities = entities.filter(e => !batchIds.has(e.id));
const files = {};
const questionsFor = cat => (files[cat] ??= existsSync(new URL(`src/content/questions/${cat}.json`, root)) ? read(`src/content/questions/${cat}.json`) : []);
const report = [];
// answer.geocode (optional) is only the Nominatim query used for this batch; it is not stored.
const answerOf = q => { const { geocode: _query, ...answer } = q.answer; return answer; };

for (const { entity, question, reverify } of batch.entries) {
 const problems = [];
 if (reverify && !legacyEntities.some(e => e.id === entity.id)) problems.push("reverify target is not an existing entity");
 const g = geocode[entity.id]?.results?.[0];
 if (!g) problems.push("no geocode result");
 else if (g.cc !== question.answer.countryCode) problems.push(`geocoded country ${g.cc} ≠ ${question.answer.countryCode}`);
 const latitude = g ? Math.round(g.lat * 1e4) / 1e4 : NaN, longitude = g ? Math.round(g.lon * 1e4) / 1e4 : NaN;
 if (g && !isSameCountry(countryAt(lookup, { latitude, longitude }), question.answer.countryCode)) problems.push("coordinates fall outside the answer country");
 if (!existsSync(new URL(`public/flags/${question.answer.countryCode.toLowerCase()}.svg`, root))) problems.push("no flag");
 const primary = question.sources.filter(s => s.role === "primary");
 if (primary.length !== 1) problems.push("needs exactly one primary source");
 for (const s of question.sources) {
  if (!/^https:\/\//.test(s.url)) problems.push("non-https source");
  const host = new URL(s.url).hostname.replace(/^www\./, "");
  if (WEAK_SOURCE_DOMAINS.some(d => host === d || host.endsWith("." + d))) s.quality = "needs_review";
  if (!s.quote) problems.push("source without supporting quote");
 }
 if (primary[0]?.quality === "needs_review") problems.push("weak primary source");
 if (!reverify && legacyEntities.some(e => e.id === entity.id || norm(e.name) === norm(entity.name))) problems.push("duplicate of an existing entity");
 const active = problems.length === 0;
 const { notes, ...q } = question;
 const record = {
  ...q, entityId: entity.id,
  answer: { ...answerOf(question), latitude, longitude, coordinateSource: "OpenStreetMap Nominatim", osm: g?.osm },
  sourceQuality: primary[0]?.quality ?? "needs_review",
  access: { tier: "free" }, featured: false, active,
  review: { status: active ? "verified" : "needs_review", classification: "provisional", checkedAt: batch.researched, notes: [`Batch ${n}.`, ...(reverify ? ["Re-verifies an existing entity with new sources; earlier questions are unchanged."] : []), ...(notes ?? []), ...problems] },
 };
 const list = questionsFor(q.primaryCategory);
 const at = list.findIndex(x => x.id === q.id);
 if (at >= 0) list[at] = record; else list.push(record);
 if (!reverify) {
  const e = { ...entity, kind: entity.kind ?? "person", image: { status: "none" } };
  const ei = entities.findIndex(x => x.id === entity.id);
  if (ei >= 0) entities[ei] = e; else entities.push(e);
 }
 report.push({ id: q.id, active, problems });
}
// Secondary memberships for existing people (reuse): classification only — question facts are never touched.
for (const m of batch.memberships ?? []) {
 const file = existsSync(new URL("src/content/questions/", root)) && readdirSync(new URL("src/content/questions/", root)).map(f => f.replace(/\.json$/, "")).find(cat => questionsFor(cat).some(q => q.id === m.questionId));
 const q = file && questionsFor(file).find(q => q.id === m.questionId);
 if (!q || !m.reason) { report.push({ id: `membership ${m.questionId} → ${m.category}/${m.subcategory}`, active: false, problems: [q ? "no reason given" : "unknown question"] }); continue; }
 const already = q.primaryCategory === m.category && q.subcategory === m.subcategory || (q.secondary ?? []).some(s => s.category === m.category && s.subcategory === m.subcategory);
 if (!already) {
  q.secondary = [...(q.secondary ?? []), { category: m.category, subcategory: m.subcategory }];
  q.review = { ...q.review, notes: [...(q.review.notes ?? []), `Batch ${n}: also in ${m.category}/${m.subcategory} — ${m.reason}`] };
 }
 report.push({ id: `membership ${m.questionId} → ${m.category}/${m.subcategory}`, active: true, problems: [] });
}
write("src/content/entities.json", entities);
for (const [cat, list] of Object.entries(files)) write(`src/content/questions/${cat}.json`, list);

const { errors, warnings } = validateContent(loadRawContent(), { flagExists: c => existsSync(new URL(`public/flags/${c.toLowerCase()}.svg`, root)) });
for (const r of report) console.log(`${r.active ? "PASS" : "HOLD"}  ${r.id}${r.problems.length ? "  — " + r.problems.join("; ") : ""}`);
console.log(`\n${report.filter(r => r.active).length}/${report.length} activated · validation: ${errors.length} errors, ${warnings.length} warnings`);
errors.forEach(e => console.log("ERROR " + e));
if (errors.length) process.exitCode = 1;
