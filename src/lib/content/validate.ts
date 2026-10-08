import {
 ACCESS_TIERS, CLASSIFICATION_STATUSES, DIFFICULTIES, ENTITY_KINDS, IMAGE_STATUSES, QUESTION_TYPES, REGIONS,
 REVIEW_STATUSES, SOURCE_QUALITIES, SOURCE_ROLES, TRIVIA_TYPES, type RawContent,
} from "../../content/schema.ts";
import { calculateDistanceKm, isValidCoordinates } from "../game/distance.ts";

// Domains that may never be rated above needs_review.
export const WEAK_SOURCE_DOMAINS = ["wikipedia.org", "imdb.com", "fandango.com", "masterworksbroadway.com"];
// Two active questions about the same entity must not share an answer.
export const DUPLICATE_ANSWER_KM = 25;
// Trivia cards are "wow" moments: at most two short sentences.
export const TRIVIA_MAX_CHARS = 180;
export const sentenceCount = (text: string) => (text.match(/[.!?](\s|$)/g) ?? []).length || 1;

const has = (list: readonly string[], value: unknown) => typeof value === "string" && list.includes(value);
const hostOf = (url: string) => { try { return new URL(url).hostname.replace(/^www\./, ""); } catch { return ""; } };
const isWeak = (url: string) => WEAK_SOURCE_DOMAINS.some(domain => hostOf(url) === domain || hostOf(url).endsWith("." + domain));
const httpsOnly = (url: unknown) => { try { const u = new URL(String(url)); return u.protocol === "https:" && !u.username && !u.password; } catch { return false; } };

export interface ValidationResult { errors: string[]; warnings: string[] }

export function validateContent(raw: RawContent, options: { flagExists?: (countryCode: string) => boolean } = {}): ValidationResult {
 const errors: string[] = [];
 const warnings: string[] = [];
 const categories = new Map(raw.taxonomy.categories.map(c => [c.key, new Set(c.subcategories.map(s => s.key))]));
 if (categories.size !== raw.taxonomy.categories.length) errors.push("taxonomy: duplicate category key");
 const packs = new Set(raw.packs.map(p => p.id));

 const entityIds = new Set<string>();
 const names = new Set<string>();
 for (const e of raw.entities) {
  const at = "entity " + e.id;
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(e.id)) errors.push(at + ": id must be a lowercase slug");
  if (entityIds.has(e.id)) errors.push(at + ": duplicate id");
  entityIds.add(e.id);
  const name = e.name?.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase().trim();
  if (!name || !e.monogram) errors.push(at + ": name and monogram are required");
  else if (names.has(name)) errors.push(at + ": duplicate entity name " + e.name);
  names.add(name);
  if (!has(ENTITY_KINDS, e.kind)) errors.push(at + ": unknown kind " + e.kind);
  if (!/^[A-Z]{2}$/.test(e.countryOfOrigin ?? "")) errors.push(at + ": countryOfOrigin must be ISO alpha-2");
  if (!has(REGIONS, e.region)) errors.push(at + ": unknown region " + e.region);
  if (!e.image || !has(IMAGE_STATUSES, e.image.status)) errors.push(at + ": image status required");
  else if (e.image.status === "licensed" && !(e.image.url && e.image.license && e.image.source && e.image.credit)) errors.push(at + ": licensed image needs url, license, source and credit");
  else if (e.image.status === "none" && e.image.url) errors.push(at + ": image url without licence status");
  for (const kind of ["listen", "watch", "discover"] as const) {
   const url = e.portal?.[`${kind}Url`];
   if (url !== undefined && !httpsOnly(url)) errors.push(at + `: portal ${kind}Url must be https`);
  }
 }

 const questionIds = new Set<string>();
 for (const q of raw.questions) {
  const at = "question " + q.id;
  if (questionIds.has(q.id)) errors.push(at + ": duplicate id");
  questionIds.add(q.id);
  if (!entityIds.has(q.entityId)) errors.push(at + ": unknown entity " + q.entityId);
  const subs = categories.get(q.primaryCategory);
  if (!subs) errors.push(at + ": unknown primaryCategory " + q.primaryCategory);
  else if (!subs.has(q.subcategory)) errors.push(at + `: subcategory ${q.subcategory} is not in ${q.primaryCategory}`);
  for (const s of q.secondary ?? []) if (!categories.get(s.category)?.has(s.subcategory)) errors.push(at + `: unknown secondary ${s.category}/${s.subcategory}`);
  // Additional memberships (another category, or another subcategory of the same one) must be distinct from the primary and each other.
  const memberships = [`${q.primaryCategory}/${q.subcategory}`, ...(q.secondary ?? []).map(s => `${s.category}/${s.subcategory}`)];
  if (new Set(memberships).size !== memberships.length) errors.push(at + ": secondary repeats a membership it already has");
  if (!has(QUESTION_TYPES, q.questionType)) errors.push(at + ": unknown questionType " + q.questionType);
  if (!has(DIFFICULTIES, q.difficulty)) errors.push(at + ": unknown difficulty " + q.difficulty);
  for (const field of ["question", "clue", "hint", "story", "displayCategory"] as const) if (!q[field]?.trim()) errors.push(at + ": " + field + " is required");
  const a = q.answer;
  if (!a || !a.city || !a.country || !isValidCoordinates({ latitude: a.latitude, longitude: a.longitude })) errors.push(at + ": answer needs city, country and valid coordinates");
  if (!/^[A-Z]{2}$/.test(a?.countryCode ?? "")) errors.push(at + ": answer.countryCode must be ISO alpha-2");
  else if (options.flagExists && !options.flagExists(a.countryCode)) errors.push(at + ": no flag for " + a.countryCode);
  // Sources
  const primaries = (q.sources ?? []).filter(s => s.role === "primary");
  if (primaries.length !== 1) errors.push(at + ": exactly one primary source required");
  for (const s of q.sources ?? []) {
   if (!httpsOnly(s.url)) errors.push(at + ": source must be https " + s.url);
   if (!has(SOURCE_ROLES, s.role)) errors.push(at + ": unknown source role " + s.role);
   if (!has(SOURCE_QUALITIES, s.quality)) errors.push(at + ": unknown source quality " + s.quality);
   if (isWeak(s.url) && s.quality !== "needs_review") errors.push(at + `: ${hostOf(s.url)} must be rated needs_review`);
  }
  if (primaries[0] && q.sourceQuality !== primaries[0].quality) errors.push(at + ": sourceQuality must equal the primary source quality");
  if (q.sourceQuality === "needs_review") warnings.push(at + ": primary source needs review (" + hostOf(primaries[0]?.url ?? "") + ")");
  if (q.triviaCard) {
   const t = q.triviaCard;
   if (!has(TRIVIA_TYPES, t.type)) errors.push(at + ": unknown trivia type " + t.type);
   if (!t.text?.trim() || t.text.length > TRIVIA_MAX_CHARS || sentenceCount(t.text) > 2) errors.push(at + ": trivia must be one or two short sentences");
   if (!httpsOnly(t.sourceUrl) || !t.sourceName?.trim() || (t.quote ?? "").length < 20) errors.push(at + ": trivia needs a source, a source name and a supporting quote");
   else if (!(q.sources ?? []).some(s => s.url === t.sourceUrl)) errors.push(at + ": trivia source must be one of the question's sources");
   if (isWeak(t.sourceUrl)) errors.push(at + ": trivia cannot rest on a weak source");
  }
  if (q.triviaStatus !== undefined && q.triviaStatus !== "needs_review") errors.push(at + ": unknown triviaStatus");
  if (q.triviaStatus === "needs_review" && q.triviaCard) errors.push(at + ": a needs_review trivia line cannot also have a card");
  if (q.disputed && (!q.disputed.nuance?.trim() || (q.sources ?? []).length < 2)) errors.push(at + ": disputed claims need a nuance note and at least two sources");
  // Access and review
  if (!q.access || !has(ACCESS_TIERS, q.access.tier)) errors.push(at + ": unknown access tier");
  else if (q.access.tier !== "free" && !(q.access.packId && packs.has(q.access.packId))) errors.push(at + ": paid content needs a known packId");
  if (typeof q.featured !== "boolean" || typeof q.active !== "boolean") errors.push(at + ": featured and active must be booleans");
  if (!q.review || !has(REVIEW_STATUSES, q.review.status) || !has(CLASSIFICATION_STATUSES, q.review.classification)) errors.push(at + ": review status and classification required");
  else if (q.active && q.review.status === "draft") errors.push(at + ": draft content cannot be active");
 }

 // Duplicate answers among active questions about the same entity.
 const active = raw.questions.filter(q => q.active);
 for (let i = 0; i < active.length; i++) for (let j = i + 1; j < active.length; j++) {
  const [a, b] = [active[i], active[j]];
  if (a.entityId !== b.entityId) continue;
  try {
   if (calculateDistanceKm(a.answer, b.answer) <= DUPLICATE_ANSWER_KM) errors.push(`question ${b.id}: same answer as ${a.id} for ${a.entityId}`);
  } catch { /* invalid coordinates already reported */ }
 }

 // Editions: frozen ID lists. Every question must exist, and Today's Five is always free.
 const byId = new Map(raw.questions.map(q => [q.id, q]));
 if (!raw.editions.editions[raw.editions.default]) errors.push("editions: default edition does not exist");
 for (const [name, edition] of Object.entries(raw.editions.editions)) {
  const ids = edition.questionIds;
  if (new Set(ids).size !== ids.length) errors.push(`edition ${name}: repeated question`);
  if (edition.scoring !== undefined && edition.scoring !== "distance-v1" && edition.scoring !== "country-v2") errors.push(`edition ${name}: unknown scoring ${edition.scoring}`);
  if (edition.selector === "blocks" ? ids.length < 5 || ids.length % 5 !== 0 : ids.length < 5) errors.push(`edition ${name}: invalid size ${ids.length} for ${edition.selector}`);
  for (const id of ids) {
   const q = byId.get(id);
   if (!q) errors.push(`edition ${name}: unknown question ${id}`);
   else if (q.access.tier !== "free") errors.push(`edition ${name}: ${id} is not free`);
  }
 }
 return { errors, warnings };
}

export function balanceReport(raw: RawContent, filter: (id: string) => boolean = () => true) {
 const questions = raw.questions.filter(q => q.active && filter(q.id));
 const entities = new Map(raw.entities.map(e => [e.id, e]));
 const tally = (key: (q: typeof questions[number]) => string) => {
  const counts: Record<string, number> = {};
  for (const q of questions) counts[key(q)] = (counts[key(q)] ?? 0) + 1;
  return Object.fromEntries(Object.entries(counts).sort((x, y) => y[1] - x[1]).map(([k, n]) => [k, { count: n, share: Math.round(n / questions.length * 1000) / 10 }]));
 };
 return {
  total: questions.length,
  byCategory: tally(q => q.primaryCategory),
  bySubcategory: tally(q => q.primaryCategory + "/" + q.subcategory),
  byRegion: tally(q => entities.get(q.entityId)?.region ?? "unknown"),
  byDifficulty: tally(q => q.difficulty),
  byQuestionType: tally(q => q.questionType),
  bySourceQuality: tally(q => q.sourceQuality),
 };
}
