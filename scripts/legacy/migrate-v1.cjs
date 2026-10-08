// One-off StarTap V1 → V2 content migration (Phase 1).
// Reads the ORIGINAL pre-V2 code compiled to CommonJS and writes src/content/*.
// It also freezes the compatibility lock from the original code's real output.
//
// Reproduce: compile C:\Users\USER\StarTap-backups\before-v2-phase1-20260930 with
//   tsc src/data/*.ts src/lib/game/{daily,progress,scoring,distance}.ts --module commonjs
//       --resolveJsonModule --allowImportingTsExtensions --rewriteRelativeImportExtensions --outDir <dir>
// then run: node scripts/legacy/migrate-v1.cjs <dir>
// Classifications below are PROVISIONAL (see docs/V2_BLUEPRINT.md §11). Answers and wording are never changed.
const fs = require("fs");
const path = require("path");

const legacy = path.resolve(process.argv[2] || "");
const need = file => require(path.join(legacy, file));
const out = path.resolve(__dirname, "../../src/content");
const { questionBank } = need("src/data/challenges.js");
const { storyQuestions } = need("src/data/storyChallenge.js");
const { globalQuestions } = need("src/data/globalChallenge.js");
const { expandedQuestions } = need("src/data/expandedChallenge.js");
const { starMedia } = need("src/data/starMedia.js");
const daily = need("src/lib/game/daily.js");
const { resultsFor } = need("src/lib/game/progress.js");

const EDITIONS = {
 "origins-v1": { selector: "rolling", bank: questionBank },
 "stories-v2": { selector: "rolling", bank: storyQuestions },
 "global-v3": { selector: "blocks", bank: globalQuestions },
 "global-v4": { selector: "blocks", bank: expandedQuestions },
};

// starName → [countryOfOrigin, region, primaryCategory, subcategory, originNote?]
const ENTITIES = {
 "Adele": ["GB", "europe", "music", "pop"],
 "Dua Lipa": ["GB", "europe", "music", "pop"],
 "PSY": ["KR", "asia", "music", "k-pop"],
 "Rebeca Andrade": ["BR", "latin-america", "sports", "gymnastics"],
 "Naomi Osaka": ["JP", "asia", "sports", "tennis"],
 "Freddie Mercury": ["GB", "europe", "music", "rock", "Born in Stone Town, Zanzibar (now Tanzania), as the question states; origin/region provisional."],
 "Lisa": ["TH", "asia", "music", "k-pop"],
 "Didier Drogba": ["CI", "africa", "sports", "football"],
 "Burna Boy": ["NG", "africa", "music", "afrobeats"],
 "Bob Marley": ["JM", "caribbean", "music", "reggae-dancehall"],
 "A. R. Rahman": ["IN", "asia", "music", "global-icons"],
 "Anggun": ["ID", "asia", "music", "pop"],
 "Hugh Jackman": ["AU", "oceania", "screen", "hollywood"],
 "Björk": ["IS", "europe", "music", "electronic"],
 "Priyanka Chopra": ["IN", "asia", "screen", "bollywood"],
 "Omar Sy": ["FR", "europe", "screen", "streaming-stars"],
 "Lionel Messi": ["AR", "latin-america", "sports", "football"],
 "Lorde": ["NZ", "oceania", "music", "pop"],
 "Deepika Padukone": ["IN", "asia", "screen", "bollywood"],
 "Tarkan": ["TR", "europe", "music", "pop", "Turkish singer born in Alzey, Germany, as the question states; Türkiye spans Europe and Asia, so region is provisional."],
 "Jackie Chan": ["HK", "asia", "screen", "action"],
 "Taika Waititi": ["NZ", "oceania", "screen", "directors"],
 "Michelle Yeoh": ["MY", "asia", "screen", "action"],
 "Nadia Comăneci": ["RO", "europe", "sports", "gymnastics"],
 "Rihanna": ["BB", "caribbean", "music", "rnb"],
 "Kylie Minogue": ["AU", "oceania", "music", "pop"],
 "P. V. Sindhu": ["IN", "asia", "sports", "racket-sports"],
 "Miriam Makeba": ["ZA", "africa", "music", "african-legends"],
 "Serena Williams": ["US", "north-america", "sports", "tennis"],
 "Salma Hayek": ["MX", "latin-america", "screen", "hollywood"],
 "Ons Jabeur": ["TN", "africa", "sports", "tennis"],
 "Angélique Kidjo": ["BJ", "africa", "music", "african-legends"],
 "Shah Rukh Khan": ["IN", "asia", "screen", "bollywood"],
 "Penélope Cruz": ["ES", "europe", "screen", "drama"],
 "Jung Kook": ["KR", "asia", "music", "k-pop"],
 "Youssou N'Dour": ["SN", "africa", "music", "african-legends"],
 "Shakira": ["CO", "latin-america", "music", "latin"],
 "Cristiano Ronaldo": ["PT", "europe", "sports", "football"],
 "Aitana": ["ES", "europe", "music", "pop"],
 "Manny Pacquiao": ["PH", "asia", "sports", "boxing"],
 "Céline Dion": ["CA", "north-america", "music", "pop"],
 "Mohamed Salah": ["EG", "africa", "sports", "football"],
 "Diljit Dosanjh": ["IN", "asia", "music", "global-icons"],
 "Sachin Tendulkar": ["IN", "asia", "sports", "cricket"],
 "Bad Bunny": ["PR", "caribbean", "music", "latin"],
 "Pelé": ["BR", "latin-america", "sports", "football"],
 "Bong Joon-ho": ["KR", "asia", "screen", "korean-film"],
 "Yuzuru Hanyu": ["JP", "asia", "sports", "winter-sports"],
 "Taylor Swift": ["US", "north-america", "music", "pop"],
 "Sadio Mané": ["SN", "africa", "sports", "football"],
 "Hayao Miyazaki": ["JP", "asia", "screen", "directors"],
 "Roger Federer": ["CH", "europe", "sports", "tennis"],
 "Beyoncé": ["US", "north-america", "music", "rnb"],
 "David Rudisha": ["KE", "africa", "sports", "track-field"],
 "Lupita Nyong'o": ["KE", "africa", "screen", "hollywood", "The question describes her as Kenyan-Mexican (born in Mexico City); origin/region provisional."],
 "Rafael Nadal": ["ES", "europe", "sports", "tennis"],
 "Usain Bolt": ["JM", "caribbean", "sports", "track-field"],
 "Agnetha Fältskog": ["SE", "europe", "music", "pop"],
 "Charlize Theron": ["ZA", "africa", "screen", "hollywood"],
 "Novak Djokovic": ["RS", "europe", "sports", "tennis"],
 "Eliud Kipchoge": ["KE", "africa", "sports", "track-field"],
 "Tyla": ["ZA", "africa", "music", "amapiano", "Amapiano vs pop classification is provisional."],
 "Trevor Noah": ["ZA", "africa", "screen", "comedy"],
 "Li Na": ["CN", "asia", "sports", "tennis"],
 "Simone Biles": ["US", "north-america", "sports", "gymnastics"],
};

// questionId → [questionType, difficulty] (provisional)
const QUESTIONS = {
 "adele-birthplace": ["birthplace", "easy"], "naomi-osaka-birthplace": ["birthplace", "easy"],
 "burna-boy-birthplace": ["birthplace", "medium"], "hugh-jackman-birthplace": ["birthplace", "easy"],
 "messi-birthplace": ["birthplace", "medium"], "jackie-chan-birthplace": ["birthplace", "easy"],
 "rihanna-birthplace": ["birthplace", "medium"], "serena-williams-birthplace": ["birthplace", "hard"],
 "shah-rukh-khan-birthplace": ["birthplace", "easy"], "shakira-birthplace": ["birthplace", "easy"],
 "adele-brit-school": ["career_location", "easy"], "dua-lipa-global": ["career_location", "easy"],
 "psy-global": ["famous_place", "easy"], "rebeca-andrade-expanded": ["event_location", "medium"],
 "naomi-osaka-first-title": ["event_location", "hard"], "freddie-mercury-global": ["birthplace", "hard"],
 "lisa-global": ["famous_place", "medium"], "didier-drogba-expanded": ["event_location", "medium"],
 "burna-boy-stadium": ["event_location", "easy"], "bob-marley-global": ["birthplace", "medium"],
 "a-r-rahman-global": ["career_location", "medium"], "anggun-expanded": ["birthplace", "medium"],
 "hugh-jackman-drama-school": ["career_location", "medium"], "bjork-global": ["birthplace", "easy"],
 "priyanka-chopra-global": ["event_location", "medium"], "omar-sy-expanded": ["birthplace", "hard"],
 "messi-youth-club": ["career_location", "easy"], "lorde-global": ["birthplace", "medium"],
 "deepika-padukone-global": ["birthplace", "hard"], "tarkan-expanded": ["birthplace", "legend"],
 "jackie-chan-opera-training": ["career_location", "easy"], "taika-waititi-global": ["career_location", "medium"],
 "michelle-yeoh-global": ["birthplace", "hard"], "nadia-comaneci-global": ["event_location", "medium"],
 "rihanna-island-origins": ["birthplace", "medium"], "kylie-minogue-global": ["birthplace", "medium"],
 "p-v-sindhu-expanded": ["event_location", "hard"], "miriam-makeba-global": ["birthplace", "medium"],
 "serena-first-slam": ["event_location", "easy"], "salma-hayek-global": ["birthplace", "hard"],
 "ons-jabeur-expanded": ["event_location", "hard"], "angelique-kidjo-global": ["birthplace", "hard"],
 "shah-rukh-khan-theatre": ["career_location", "easy"], "penelope-cruz-global": ["birthplace", "medium"],
 "jung-kook-expanded": ["birthplace", "medium"], "youssou-n-dour-global": ["famous_place", "easy"],
 "shakira-origins-giving-back": ["birthplace", "easy"], "cristiano-ronaldo-global": ["birthplace", "medium"],
 "aitana-expanded": ["hometown", "hard"], "manny-pacquiao-global": ["event_location", "legend"],
 "celine-dion-global": ["hometown", "hard"], "mohamed-salah-global": ["career_location", "easy"],
 "diljit-dosanjh-expanded": ["event_location", "hard"], "sachin-tendulkar-global": ["event_location", "easy"],
 "bad-bunny-global": ["hometown", "hard"], "pele-expanded": ["career_location", "medium"],
 "bong-joon-ho-global": ["event_location", "medium"], "yuzuru-hanyu-global": ["event_location", "medium"],
 "taylor-swift-global": ["career_location", "easy"], "sadio-mane-expanded": ["event_location", "hard"],
 "hayao-miyazaki-global": ["landmark", "hard"], "roger-federer-global": ["event_location", "easy"],
 "beyonce-global": ["birthplace", "easy"], "david-rudisha-expanded": ["event_location", "medium"],
 "lupita-nyong-o-global": ["birthplace", "medium"], "rafael-nadal-global": ["event_location", "easy"],
 "usain-bolt-global": ["event_location", "easy"], "agnetha-faltskog-expanded": ["birthplace", "hard"],
 "charlize-theron-global": ["birthplace", "hard"], "novak-djokovic-global": ["event_location", "medium"],
 "eliud-kipchoge-global": ["event_location", "medium"], "tyla-expanded": ["hometown", "medium"],
 "trevor-noah-global": ["hometown", "easy"], "li-na-global": ["event_location", "medium"],
 "simone-biles-global": ["event_location", "medium"],
};

// Source quality by domain. Every domain in use must be listed, or the migration fails.
const QUALITY = {
 primary: ["abbasite.com", "bjas.in", "bluebirdcafe.com", "bobmarley.com", "brit.croydon.sch.uk", "celinedion.com", "chelseafc.com",
  "festival-cannes.com", "freddiemercury.com", "ghibli-museum.jp", "ineos159challenge.com", "london-stadium.com",
  "members.liverpoolfc.com", "missworld.com", "realmadrid.com", "usopen.org"],
 authoritative: ["annualreport.bwfbadminton.com", "atptour.com", "australian.museum", "bcci.tv", "cob.org.br", "english.seoul.go.kr",
  "eoimadrid.gov.in", "filmarchive.gov.hk", "grammy.com", "inside.fifa.com", "members.usagym.org", "olympic.ca", "olympics.com.au",
  "oscars.org", "portrait.gov.au", "premierleague.com", "thailand.prd.go.th", "umusicpub.com", "unicef.org", "unisa.ac.za",
  "universalmusic.fr", "usagym.org", "wbcboxing.com", "wgtn.ac.nz", "worldathletics.org", "wtatennis.com"],
 reputable_secondary: ["africanfilmny.org", "allmusic.com", "apnews.com", "axios.com", "biography.com", "disneylatino.com",
  "freddiemercurymuseum.com", "indianexpress.com", "musicweek.com", "timesofindia.indiatimes.com", "vogue.com", "womenshistory.org"],
 needs_review: ["en.wikipedia.org", "imdb.com", "fandango.com", "masterworksbroadway.com"],
};
const WEAK_REASON = { "en.wikipedia.org": "Wikipedia", "imdb.com": "IMDb", "fandango.com": "Fandango", "masterworksbroadway.com": "weak profile page" };
const RANK = { primary: 0, authoritative: 1, reputable_secondary: 2, needs_review: 3 };
const qualityOf = url => {
 const host = new URL(url).hostname.replace(/^www\./, "");
 const found = Object.entries(QUALITY).find(([, hosts]) => hosts.includes(host));
 if (!found) throw new Error("Unrated source domain: " + host);
 return { quality: found[0], host };
};

const COUNTRY = { "United Kingdom": "GB", "South Korea": "KR", France: "FR", "United States": "US", Tanzania: "TZ", Thailand: "TH",
 Germany: "DE", Jamaica: "JM", India: "IN", Indonesia: "ID", Australia: "AU", Iceland: "IS", Argentina: "AR", "New Zealand": "NZ",
 Denmark: "DK", China: "CN", Malaysia: "MY", Canada: "CA", Barbados: "BB", Switzerland: "CH", "South Africa": "ZA", Mexico: "MX",
 Spain: "ES", Benin: "BJ", Senegal: "SN", Colombia: "CO", Portugal: "PT", Egypt: "EG", "Puerto Rico": "PR", Brazil: "BR",
 Russia: "RU", Japan: "JP", Sweden: "SE", Austria: "AT", Belgium: "BE", Nigeria: "NG" };

const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const km = (a, b) => { const r = d => d * Math.PI / 180; const h = Math.sin(r(b.latitude - a.latitude) / 2) ** 2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(r(b.longitude - a.longitude) / 2) ** 2; return 12742.0176 * Math.asin(Math.sqrt(Math.min(1, h))); };
const normal = value => JSON.parse(JSON.stringify(value));

// Every distinct legacy question, in first-appearance order (live edition first).
const all = new Map();
for (const q of [...expandedQuestions, ...globalQuestions, ...storyQuestions, ...questionBank]) {
 if (all.has(q.id) && JSON.stringify(all.get(q.id)) !== JSON.stringify(q)) throw new Error("Conflicting question " + q.id);
 if (!all.has(q.id)) all.set(q.id, q);
}
const live = new Set(expandedQuestions.map(q => q.id));

const entities = new Map();
for (const q of all.values()) {
 const meta = ENTITIES[q.starName];
 if (!meta) throw new Error("No entity mapping for " + q.starName);
 const [countryOfOrigin, region, , , originNote] = meta;
 const entity = {
  id: slug(q.starName), name: q.starName, monogram: q.monogram, kind: "person", countryOfOrigin, region,
  ...(originNote ? { originNote } : {}),
  image: q.imageUrl ? { status: "licensed", url: q.imageUrl, license: q.imageCredit.license, source: q.imageCredit.sourceUrl, credit: q.imageCredit } : { status: "none" },
  ...(starMedia[q.starName] ? { portal: starMedia[q.starName] } : {}),
 };
 const seen = entities.get(entity.id);
 if (seen && JSON.stringify(seen) !== JSON.stringify(entity)) throw new Error("Inconsistent entity fields for " + q.starName);
 entities.set(entity.id, entity);
}
if (entities.size !== Object.keys(ENTITIES).length) throw new Error("Unused entity mapping rows");

const questions = [...all.values()].map(q => {
 const [, , primaryCategory, subcategory] = ENTITIES[q.starName];
 const [questionType, difficulty] = QUESTIONS[q.id] ?? (() => { throw new Error("No question mapping for " + q.id); })();
 const notes = [];
 const sources = [{ url: q.sourceUrl, role: "primary", ...qualityOf(q.sourceUrl) }];
 if (q.extraSource) sources.push({ url: q.extraSource, role: "extra", ...qualityOf(q.extraSource) });
 for (const s of sources) if (s.quality === "needs_review") { s.note = WEAK_REASON[s.host] + " source; replace with a stronger source"; }
 if (sources[0].quality === "needs_review") {
  const stronger = sources.slice(1).find(s => RANK[s.quality] < RANK.needs_review);
  notes.push(stronger ? `Primary source is ${WEAK_REASON[sources[0].host]}; the extra source (${stronger.host}) may support the claim, so verify and promote it.`
   : `Primary source is ${WEAK_REASON[sources[0].host]}-only; needs a stronger source.`);
 }
 const code = COUNTRY[q.answerCountry];
 if (!code) throw new Error("No country code for " + q.answerCountry);
 let active = true;
 if (!live.has(q.id)) {
  const twin = [...all.values()].find(o => live.has(o.id) && o.starName === q.starName && km(o.answerCoordinates, q.answerCoordinates) <= 25);
  if (twin) { active = false; notes.push(`Legacy origins-v1 question; same answer as ${twin.id}. Kept for old editions, excluded from future pools.`); }
 }
 return {
  id: q.id, entityId: slug(q.starName), primaryCategory, subcategory, questionType, difficulty, displayCategory: q.category,
  question: q.question, clue: q.clue, hint: q.hint,
  answer: { city: q.answerCity, country: q.answerCountry, countryCode: code, latitude: q.answerCoordinates.latitude, longitude: q.answerCoordinates.longitude },
  story: q.story,
  ...(q.storyTitle ? { storyTitle: q.storyTitle } : {}), ...(q.trivia ? { trivia: q.trivia } : {}), ...(q.chapter ? { chapter: q.chapter } : {}),
  sources: sources.map(({ host, ...s }) => s), sourceQuality: sources[0].quality,
  access: { tier: "free" }, featured: false, active,
  review: { status: "legacy", classification: "provisional", ...(notes.length ? { notes } : {}) },
 };
});

const write = (file, value) => { fs.mkdirSync(path.dirname(path.join(out, file)), { recursive: true }); fs.writeFileSync(path.join(out, file), JSON.stringify(value, null, 1) + "\n"); };
write("entities.json", [...entities.values()]);
for (const category of [...new Set(questions.map(q => q.primaryCategory))]) write(`questions/${category}.json`, questions.filter(q => q.primaryCategory === category));
write("editions.json", { default: daily.EDITION, editions: Object.fromEntries(Object.entries(EDITIONS).map(([k, e]) => [k, { selector: e.selector, questionIds: e.bank.map(q => q.id) }])) });

// ---------- Compatibility lock, from the original code's real behaviour ----------
const dates = [];
for (let t = Date.UTC(2026, 8, 1); t <= Date.UTC(2026, 10, 30); t += 86400000) dates.push(new Date(t).toISOString().slice(0, 10));
dates.push("2000-02-29", "2025-01-01", "2027-12-31", "2030-06-15");
// Original DailyGame edition resolution, verbatim.
const resolve = r => r === "origins-v1" ? "origins-v1" : r === "stories-v2" ? "stories-v2" : r === "global-v3" ? "global-v3" : daily.EDITION;
const pick = (edition, day) => { const bank = EDITIONS[edition].bank; return (edition.startsWith("global-") ? daily.globalDailyIndices : daily.dailyIndices)(day, bank.length).map(i => ({ ...bank[i], media: starMedia[bank[i].starName] })); };
// Original SharePreview text, verbatim apart from injected origin/native.
function legacyShare({ day, edition, results, practice, native, origin }) {
 const score = results.reduce((sum, r) => sum + r.score, 0);
 const url = new URL("/play", origin);
 url.searchParams.set("day", day); url.searchParams.set("edition", edition);
 const squares = results.map(r => r.score >= 900 ? "🟩" : r.score >= 600 ? "🟨" : r.score >= 200 ? "🟧" : "⬜").join("");
 return ["StarTap · " + day + (practice ? " · Practice" : ""), squares, score.toLocaleString() + " / 5,000", "Five stars. How close can you get?", ...(native ? [] : [url.toString()])].join("\n");
}
const GUESSES = [{ latitude: 0, longitude: 0 }, { latitude: 51.5, longitude: -0.12 }, { latitude: -33.9, longitude: 151.2 }, { latitude: 40.7, longitude: -74 }, { latitude: 6.5, longitude: 3.4 }];
const HINTS = [false, true, false, true, false];
const answers = GUESSES.map((coordinates, i) => ({ coordinates, hintUsed: HINTS[i] }));
const lock = {
 note: "Frozen from the original pre-V2 code. Never regenerate from V2 code. Protects saved scores and shared links.",
 defaultEdition: daily.EDITION,
 resolution: Object.fromEntries(["", "origins-v1", "stories-v2", "global-v3", "global-v4", "global-v5", "ORIGINS-V1", "bogus"].map(r => [r, resolve(r)])),
 editions: {}, days: {}, scoring: { guesses: answers, results: {} }, share: [],
};
const snapshot = { note: "Full playable question objects per edition (as DailyGame passed them to PlayGame) from the original code. Regenerate only for a deliberate content edit.", editions: {} };
for (const [edition, e] of Object.entries(EDITIONS)) {
 lock.editions[edition] = { selector: e.selector, questions: e.bank.map(q => ({ id: q.id, latitude: q.answerCoordinates.latitude, longitude: q.answerCoordinates.longitude })) };
 snapshot.editions[edition] = normal(e.bank.map(q => ({ ...q, media: starMedia[q.starName] })));
 lock.days[edition] = Object.fromEntries(dates.map(d => [d, pick(edition, d).map(q => q.id)]));
 lock.scoring.results[edition] = {};
 dates.filter((_, i) => i % 9 === 0).forEach((day, i) => {
  const results = resultsFor(answers, pick(edition, day)).map(r => ({ ...r, distanceKm: Math.round(r.distanceKm * 1e6) / 1e6 }));
  lock.scoring.results[edition][day] = results;
  if (i < 2) for (const practice of [false, true]) for (const native of [false, true]) {
   const input = { day, edition, practice, native, origin: "http://localhost:3001" };
   lock.share.push({ ...input, scores: results.map(r => r.score), text: legacyShare({ ...input, results }) });
  }
 });
}
write("legacy/gameplay.lock.json", lock);
write("legacy/content.snapshot.json", snapshot);

const count = (key) => questions.filter(q => live.has(q.id)).reduce((m, q) => (m[q[key]] = (m[q[key]] || 0) + 1, m), {});
console.log(`entities ${entities.size}, questions ${questions.length} (${questions.filter(q => q.active).length} active), live ${live.size}`);
console.log("live by category", count("primaryCategory"));
console.log("weak primary sources", questions.filter(q => q.sourceQuality === "needs_review").map(q => q.id).join(", "));
console.log("inactive", questions.filter(q => !q.active).map(q => q.id).join(", "));
