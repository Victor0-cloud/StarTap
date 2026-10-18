// Batch 19 — Sports expansion 1A: Boxing, Tennis, Track & Field, Formula 1, Cricket to 15 stars each.
// Source of src/content/batches/batch-19.json (run: node docs/content-research/batch-19.src.cjs).
// Every quote was copied from the fetched page text (18 October 2026). Structured profile fields are quoted as "Label: value".
// Governing bodies and official tours/federations (ITHF, WTA, ATP, RFET, Formula1.com, WBC, USA Boxing, Team GB, Team USA,
// World Athletics, ICC, Cricket Australia, ECB, Cricket West Indies, Government of India PIB) are rated authoritative;
// Honda (Tsunoda's own programme) primary; Ring Magazine, Wisden, RTÉ, Vanguard, GhanaWeb and the University of São Paulo
// Latin American portal reputable_secondary. No Wikipedia, IMDb or ticketing source is used.
// Location choices: an event or career location replaces the birthplace where the birthplace is disputed, politically
// sensitive, only province-level, or not stated by a strong source (Usyk, Fury, Nelson, Fraser-Pryce, Hassan, Farah,
// Kipyegon, Owens, Schumacher, Muralitharan). Gauff was dropped: the WTA birthplace (Delray Beach) conflicts with other sources.
const AUTH = ["tennisfame.com", "wtatennis.com", "atptour.com", "rfet.es", "formula1.com", "wbcboxing.com", "usaboxing.org", "teamgb.com", "teamusa.com",
 "worldathletics.org", "icc-cricket.com", "cricket.com.au", "ecb.co.uk", "windiescricket.com", "pib.gov.in"];
const PRIMARY = ["global.honda"];
const quality = url => { const host = new URL(url).hostname.replace(/^www\./, ""); return PRIMARY.includes(host) ? "primary" : AUTH.some(d => host === d || host.endsWith("." + d)) ? "authoritative" : "reputable_secondary"; };
const entries = [];
const S = (sub, display, id, name, mono, cc, region, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.current ? { tags: ["current"] } : {}) },
 question: { id: q.qid, primaryCategory: "sports", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: display, chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, geocode: q.geocode }, story: q.story,
  sources: q.quotes.map(([url, quote], i) => ({ url, role: i ? "extra" : "primary", quality: quality(url), quote })),
  ...(q.notes ? { notes: q.notes } : {}) },
});
const born = "Where the story began", home = "Growing up", win = "The championship city", early = "Before the breakthrough";
const US = ["United States", "US"], GB = ["United Kingdom", "GB"], JP = ["Japan", "JP"], MX = ["Mexico", "MX"], ES = ["Spain", "ES"], IT = ["Italy", "IT"],
 AU = ["Australia", "AU"], DE = ["Germany", "DE"], FR = ["France", "FR"], ZA = ["South Africa", "ZA"], LK = ["Sri Lanka", "LK"];
const ITHF = "https://www.tennisfame.com/hall-of-famers/inductees/", F1 = "https://www.formula1.com/en/information/drivers-hall-of-fame-", F1D = "https://www.formula1.com/en/drivers/";
const WA = "https://worldathletics.org/news/", CWI = "https://www.windiescricket.com/players/";

// ── Boxing ──────────────────────────────────────────────────────
const B = (...a) => S("boxing", "Boxing", ...a);
B("anthony-joshua", "Anthony Joshua", "AJ", "GB", "europe", { qid: "anthony-joshua-watford", type: "hometown", diff: "medium", chapter: home, current: true,
 question: "Heavyweight Anthony Joshua is from which English town just northwest of London?", clue: "It sits in Hertfordshire, on the edge of Greater London.", hint: "Its football club is nicknamed the Hornets.",
 city: "Watford", country: GB[0], code: GB[1], geocode: "Watford, Hertfordshire",
 story: "Anthony Joshua is from Watford. Team GB notes that his early sporting focus was on football and athletics before boxing took over.",
 quotes: [["https://www.teamgb.com/athlete/anthony-joshua/6MtpXhVOvZaEYoYSrhNca9", "Anthony Joshua is from Watford, his early sporting focus was on football and athletics"]] });
B("tyson-fury", "Tyson Fury", "TF", "GB", "europe", { qid: "tyson-fury-dusseldorf", type: "event_location", diff: "hard", chapter: win,
 question: "In which German city did Tyson Fury dethrone Wladimir Klitschko in 2015?", clue: "A Rhine city in North Rhine-Westphalia.", hint: "Germany's fashion and trade-fair city, not far from Cologne.",
 city: "Düsseldorf", country: DE[0], code: DE[1], geocode: "Düsseldorf",
 story: "In 2015 Tyson Fury beat Wladimir Klitschko on a decision in Düsseldorf — a win Ring Magazine ranks among the greatest in British boxing history.",
 quotes: [["https://www.ringmagazine.com/news/declan-taylor-ranking-britain-s-top-10-greatest-heavyweights-4bPJqvaKLBfUvp4JFXIW8D", "Despite those losses, Fury was the man to dethrone Wladimir Klitschko in 2015 and his decision win in Dusseldorf has to go down as one of the greatest victories in British boxing history."]] });
B("oleksandr-usyk", "Oleksandr Usyk", "OU", "UA", "europe", { qid: "oleksandr-usyk-riyadh", type: "event_location", diff: "medium", chapter: win, current: true,
 question: "In which city did Oleksandr Usyk beat Tyson Fury to become undisputed heavyweight champion?", clue: "A Middle Eastern capital that now hosts mega-fights.", hint: "The capital of Saudi Arabia.",
 city: "Riyadh", country: "Saudi Arabia", code: "SA", geocode: "Riyadh",
 story: "Oleksandr Usyk beat Tyson Fury by split decision at Kingdom Arena in Riyadh, Saudi Arabia, to capture the undisputed heavyweight championship.",
 notes: ["Event question used instead of birthplace: Usyk's birthplace is in Crimea (politically disputed)."],
 quotes: [["https://wbcboxing.com/en/usyk-became-heavyweight-undisputed-champion-in-riyadh/", "Oleksandr Usyk (22-0, 14 KOs) defeated Tyson Fury(34-1-1, 24 KOs) by split decision in a dramatic, seesaw battle to capture the undisputed championship Saturday evening at Kingdom Arena in Riyadh, Saudi Arabia as part of #RiyadhSeason."]] });
B("floyd-mayweather-jr", "Floyd Mayweather Jr.", "FM", "US", "north-america", { qid: "floyd-mayweather-grand-rapids", type: "hometown", diff: "medium", chapter: home,
 question: "Floyd Mayweather Jr.'s hometown is which Michigan city?", clue: "On the Grand River in western Michigan.", hint: "Its name starts with 'Grand'.",
 city: "Grand Rapids", country: US[0], code: US[1], geocode: "Grand Rapids, Michigan",
 story: "Floyd Mayweather Jr.'s hometown is Grand Rapids, Michigan — not far from Detroit.",
 quotes: [["https://www.ringmagazine.com/news/patrick-connor-floyd-mayweather-s-heel-turn-began-vs-diego-corrales-and-he-cashed-in-11z4scbH4LGi0kkOoHncoj", "He looked rusty in Detroit, not far from his Grand Rapids hometown, and suddenly the idea of putting Mayweather in with Corrales seemed far more dangerous."]] });
B("claressa-shields", "Claressa Shields", "CS", "US", "north-america", { qid: "claressa-shields-flint", type: "hometown", diff: "medium", chapter: home, current: true,
 question: "Boxing champion Claressa Shields is originally from which Michigan city?", clue: "An industrial city in Genesee County, birthplace of General Motors.", hint: "A firestarter — and a spark-making stone.",
 city: "Flint", country: US[0], code: US[1], geocode: "Flint, Michigan",
 story: "Claressa Shields is originally from Flint, Michigan, where she found boxing, inspired by Muhammad Ali.",
 quotes: [["https://wbcboxing.com/en/profile-of-claressa-shields-a-great-champion/", "Originally from Flint, Michigan, Claressa discovered her passion for the sport of gloves thanks to the King of Boxing Muhammad Ali, whom she deeply admires"]] });
B("katie-taylor", "Katie Taylor", "KT", "IE", "europe", { qid: "katie-taylor-bray", type: "birthplace", diff: "hard", chapter: born,
 question: "Irish boxing great Katie Taylor was born in which seaside town in County Wicklow?", clue: "On the coast just south of Dublin.", hint: "Its name is a single short syllable.",
 city: "Bray", country: "Ireland", code: "IE", geocode: "Bray, County Wicklow",
 story: "Katie Taylor was born in Bray, County Wicklow, in 1986. She became a world champion boxer and also played international football for Ireland.",
 quotes: [["https://www.rte.ie/archives/profiles/taylor-katie/", "Born in Bray, County Wicklow, in 1986, Katie Taylor is a professional boxer, world super lightweight champion and former Republic of Ireland football international."],
  ["https://wbcboxing.com/en/wbc-woman-katie-taylor/", "Considered one of the best fighters of the moment, WBC champion in two divisions, Katie was born on July 2, 1986 in Bray Ireland."]] });
B("naoya-inoue", "Naoya Inoue", "NI", "JP", "asia", { qid: "naoya-inoue-zama", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Japanese boxer Naoya Inoue was born in which city in Kanagawa Prefecture?", clue: "West of Tokyo, near Sagamihara.", hint: "A short name: Z-A-M-A.",
 city: "Zama", country: JP[0], code: JP[1], geocode: "Zama, Kanagawa",
 story: "Naoya Inoue was born in Zama, Kanagawa, which the WBC also lists as his residence.",
 quotes: [["https://wbcboxing.com/en/wbc-special-preview-inoue-vs-tapales/", "Residence, birthplace: Zama, Kanagawa, Japan"]] });
B("azumah-nelson", "Azumah Nelson", "AN", "GH", "africa", { qid: "azumah-nelson-san-juan", type: "event_location", diff: "legend", chapter: win,
 question: "Ghana's Azumah Nelson won the WBC featherweight title in 1984 in which Caribbean city?", clue: "The capital of a Caribbean island territory.", hint: "Puerto Rico's capital.",
 city: "San Juan", country: "Puerto Rico", code: "PR", geocode: "San Juan, Puerto Rico",
 story: "On 8 December 1984 Azumah Nelson defeated Wilfredo Gómez at the Hiram Bithorn Stadium in San Juan, Puerto Rico, to win Ghana's second world boxing title.",
 notes: ["Nominatim reports Puerto Rico as country_code us; its ISO 3166-2 code US-PR maps to alpha-2 PR (see batch-19-geocode.json ccNote)."],
 quotes: [["https://www.ghanaweb.com/GhanaHomePage/SportsArchive/Today-in-History-Azumah-Nelson-beats-Wilfredo-Gomez-to-win-Ghana-s-second-world-title-607730", "December 8, 1984, Ghana’s Azumah Nelson won Ghana’s second world title in boxing after defeating Wilfredo Gomez to win the WBC featherweight strap at the Hiram Bithorn Stadium in San Juan, Puerto Rico."]] });
B("julio-cesar-chavez", "Julio César Chávez", "JC", "MX", "latin-america", { qid: "julio-cesar-chavez-ciudad-obregon", type: "birthplace", diff: "hard", chapter: born,
 question: "Mexican legend Julio César Chávez was born in which city in Sonora?", clue: "In the Yaqui Valley of northwest Mexico.", hint: "'Ciudad' plus a president's surname.",
 city: "Ciudad Obregón", country: MX[0], code: MX[1], geocode: "Ciudad Obregón, Sonora",
 story: "Julio César Chávez was born in Ciudad Obregón, Sonora, in 1962.",
 quotes: [["https://wbcboxing.com/en/a-day-like-today-julio-cesar-chavez-was-born/", "The stars aligned and shone down, as Julio Cesar Chavez Gonzales was born In Obregon City, Sonora."]] });
B("dick-tiger", "Dick Tiger", "DT", "NG", "africa", { qid: "dick-tiger-amaigbo", type: "hometown", diff: "legend", chapter: home,
 question: "Nigerian boxing great Dick Tiger came from which town in Imo State?", clue: "An Igbo town in southeastern Nigeria.", hint: "It starts with 'Amai'.",
 city: "Amaigbo", country: "Nigeria", code: "NG", geocode: "Amaigbo, Imo",
 story: "Dick Tiger (Richard Ihetu) came from Amaigbo in Imo State. He lived in Liverpool and reigned as Commonwealth champion before winning world titles.",
 quotes: [["https://www.vanguardngr.com/2021/09/ihekweazu-dick-tiger-and-jaja/", "It is the same Amaigbo of Dick Tiger Ihetu and King Jaja of Opobo."],
  ["https://www.vanguardngr.com/2021/09/ihekweazu-dick-tiger-and-jaja/", "The doctor apparently remembered that an Amaigbo man had lived in Liverpool and reigned as Commonwealth boxing champion."]] });

// ── Tennis ──────────────────────────────────────────────────────
const T = (...a) => S("tennis", "Tennis", ...a);
T("carlos-alcaraz", "Carlos Alcaraz", "CA", "ES", "europe", { qid: "carlos-alcaraz-el-palmar", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Carlos Alcaraz was born in which district of the city of Murcia?", clue: "In the Region of Murcia, southeast Spain.", hint: "'The palm grove' in Spanish.",
 city: "El Palmar", country: ES[0], code: ES[1], geocode: "El Palmar, Murcia",
 story: "The Spanish Tennis Federation lists Carlos Alcaraz's birthplace and residence as El Palmar, Murcia; he was born on 5 May 2003.",
 quotes: [["https://www.rfet.es/es/selecciones-espanolas.html?Id=22&Cat=masculino", "Fecha de nacimiento: 05/05/2003 Lugar: El Palmar, Murcia"]] });
T("iga-swiatek", "Iga Świątek", "IS", "PL", "europe", { qid: "iga-swiatek-warsaw", type: "birthplace", diff: "easy", chapter: born, current: true,
 question: "Iga Świątek was born in which capital city?", clue: "On the Vistula River.", hint: "Poland's capital.",
 city: "Warsaw", country: "Poland", code: "PL", geocode: "Warsaw",
 story: "Iga Świątek was born in Warsaw, Poland.",
 quotes: [["https://www.wtatennis.com/players/326408/iga-swiatek", "Birthplace: Warsaw, Poland"]] });
T("jannik-sinner", "Jannik Sinner", "JS", "IT", "europe", { qid: "jannik-sinner-sesto", type: "hometown", diff: "hard", chapter: home, current: true,
 question: "Jannik Sinner is from which village in the German-speaking Dolomites of northern Italy?", clue: "In the Puster Valley of South Tyrol, near the Austrian border.", hint: "Its Italian name means 'sixth'.",
 city: "Sesto (Sexten)", country: IT[0], code: IT[1], geocode: "Sexten, South Tyrol",
 story: "The ATP describes Jannik Sinner as from Sesto (Sexten), in the German-speaking South Tyrol region of northern Italy.",
 quotes: [["https://www.atptour.com/en/players/jannik-sinner/s0ag/bio", "From Sesto in the German-speaking region of Italy."]] });
T("billie-jean-king", "Billie Jean King", "BK", "US", "north-america", { qid: "billie-jean-king-long-beach", type: "birthplace", diff: "medium", chapter: born,
 question: "Billie Jean King was born in which Southern California port city?", clue: "In Los Angeles County, home of the Queen Mary.", hint: "A long stretch of sand gave it its name.",
 city: "Long Beach", country: US[0], code: US[1], geocode: "Long Beach, California",
 story: "Billie Jean King was born on 22 November 1943 in Long Beach, California.",
 quotes: [[ITHF + "billie-jean-king", "Born November 22, 1943 in Long Beach, California"]] });
T("arthur-ashe", "Arthur Ashe", "AA", "US", "north-america", { qid: "arthur-ashe-richmond", type: "birthplace", diff: "medium", chapter: born,
 question: "Arthur Ashe was born in which Virginia city?", clue: "On the James River.", hint: "Virginia's capital.",
 city: "Richmond", country: US[0], code: US[1], geocode: "Richmond, Virginia",
 story: "Arthur Ashe was born in Richmond, Virginia, and began playing at age 7 at Brookfield Park, a segregated playground next to his home.",
 quotes: [[ITHF + "arthur-ashe", "Born in Richmond, Virginia, Ashe began playing tennis at age 7 on courts at Brookfield Park, a segregated playground adjacent to his home."]] });
T("martina-navratilova", "Martina Navratilova", "MN", "CZ", "europe", { qid: "martina-navratilova-prague", type: "birthplace", diff: "medium", chapter: born,
 question: "Martina Navratilova was born in which central European capital?", clue: "On the Vltava River.", hint: "The 'city of a hundred spires'.",
 city: "Prague", country: "Czech Republic", code: "CZ", geocode: "Prague",
 story: "Martina Navratilova was born on 18 October 1956 in Prague, then Czechoslovakia.",
 quotes: [[ITHF + "martina-navratilova", "Born October 18, 1956 in Prague, Czechoslovakia"]] });
T("gustavo-kuerten", "Gustavo Kuerten", "GK", "BR", "latin-america", { qid: "gustavo-kuerten-florianopolis", type: "birthplace", diff: "hard", chapter: born,
 question: "Gustavo 'Guga' Kuerten was born in which Brazilian island city?", clue: "Capital of Santa Catarina state, in southern Brazil.", hint: "Locals call it 'Floripa'.",
 city: "Florianópolis", country: "Brazil", code: "BR", geocode: "Florianópolis, Santa Catarina",
 story: "Gustavo Kuerten was born in Florianópolis in 1976.",
 quotes: [["https://sites.usp.br/portalatinoamericano/en/kuerten-gustavo", "Florianópolis (Brasil), 1976"]] });
T("rod-laver", "Rod Laver", "RL", "AU", "oceania", { qid: "rod-laver-rockhampton", type: "birthplace", diff: "hard", chapter: born,
 question: "Rod Laver was born in which Queensland city on the Tropic of Capricorn?", clue: "Known as Australia's beef capital.", hint: "Its nickname is 'Rocky'.",
 city: "Rockhampton", country: AU[0], code: AU[1], geocode: "Rockhampton, Queensland",
 story: "Rod Laver was born in rural Rockhampton, Queensland, in 1938; his father was a cattle rancher.",
 quotes: [[ITHF + "rod-laver", "Laver was born in rural Rockhampton, Australia."], [ITHF + "rod-laver", "Born August 9, 1938 in Rockhampton, Queensland, Australia"]] });

// ── Track & Field ───────────────────────────────────────────────
const A = (...a) => S("track-field", "Athletics", ...a);
A("jesse-owens", "Jesse Owens", "JO", "US", "north-america", { qid: "jesse-owens-berlin", type: "event_location", diff: "easy", chapter: win,
 question: "In which city did Jesse Owens win four Olympic gold medals in 1936?", clue: "The host city of the 1936 Summer Olympics.", hint: "Germany's capital.",
 city: "Berlin", country: DE[0], code: DE[1], geocode: "Berlin",
 story: "At the 1936 Olympic Games in Berlin, Jesse Owens won the 100m, 200m, long jump and 4x100m relay — a record four golds at one Games.",
 quotes: [[WA + "news/hall-of-fame-profile-jesse-owens-usa", "Jesse Owens will always be remembered for his symbolic four gold medals at the 1936 Olympic Games in Berlin."]] });
A("carl-lewis", "Carl Lewis", "CL", "US", "north-america", { qid: "carl-lewis-birmingham", type: "birthplace", diff: "hard", chapter: born,
 question: "Carl Lewis was born in which Alabama city?", clue: "Alabama's largest city, once a steel centre.", hint: "It shares its name with a big English city.",
 city: "Birmingham", country: US[0], code: US[1], geocode: "Birmingham, Alabama",
 story: "Carl Lewis was born in Birmingham, Alabama, and became one of the greatest track and field athletes of all time.",
 quotes: [["https://www.teamusa.com/hall-of-fame/hall-of-fame-members/carl-lewis", "Lewis was born in Birmingham, Alabama, and is considered one of the greatest track and field athletes of all time."]] });
A("shelly-ann-fraser-pryce", "Shelly-Ann Fraser-Pryce", "SF", "JM", "caribbean", { qid: "shelly-ann-fraser-pryce-beijing", type: "event_location", diff: "medium", chapter: win,
 question: "In which city did Shelly-Ann Fraser-Pryce become the first Jamaican woman to win Olympic 100m gold?", clue: "Host of the 2008 Summer Olympics.", hint: "China's capital.",
 city: "Beijing", country: "China", code: "CN", geocode: "Beijing",
 story: "At the 2008 Beijing Olympics, Shelly-Ann Fraser became the first Jamaican woman to win Olympic 100m gold, leading a Jamaican medal sweep.",
 quotes: [[WA + "news/olympic-medallists-fraser-kogo-stuczynski-and", "Fraser became the first Jamaican woman in history to win an Olympic gold medal in the 100m dash when she led a medal sweep with her fellow country women at the 2008 Beijing Olympics."]] });
A("haile-gebrselassie", "Haile Gebrselassie", "HG", "ET", "africa", { qid: "haile-gebrselassie-asella", type: "hometown", diff: "legend", chapter: home,
 question: "Haile Gebrselassie founded a school in his home town — which Ethiopian highland town in the Arsi Zone?", clue: "In Oromia, south of Addis Ababa.", hint: "Also spelled Assela.",
 city: "Asella", country: "Ethiopia", code: "ET", geocode: "Asella, Oromia",
 story: "Haile Gebrselassie founded two schools, one in his home town of Asella (Assela) in Ethiopia's Arsi highlands.",
 quotes: [[WA + "news/at-home-and-at-work-with-gebrselassie-in-addi", "Gebrselassie has founded two schools, one in his home town of Assela and a second in Bahir Dar in the beautiful setting of Lake Tana."]] });
A("armand-duplantis", "Armand Duplantis", "AD", "SE", "europe", { qid: "armand-duplantis-lafayette", type: "hometown", diff: "hard", chapter: home, current: true,
 question: "Swedish pole vault star Mondo Duplantis grew up in which Louisiana city?", clue: "The heart of Cajun country.", hint: "Named after a French general of the American Revolution.",
 city: "Lafayette", country: US[0], code: US[1], geocode: "Lafayette, Louisiana",
 story: "Armand 'Mondo' Duplantis grew up in Lafayette, Louisiana, starting at the family home, but chose to represent his mother's country, Sweden.",
 quotes: [["https://worldathletics.org/spikes/news/armand-mondo-duplantis-sweden-pole-vault", "Despite growing up in Lafayette in the US, Duplantis chose to represent his mother's nation, Sweden, a country he has always felt a strong connection to."],
  [WA + "feature/mondo-duplantis-pole-vault-legend-in-making", "That path started at the family home in Lafayette, Louisiana, where his eldest brother Andreas was his main inspiration."]] });
A("sifan-hassan", "Sifan Hassan", "SH", "NL", "europe", { qid: "sifan-hassan-paris", type: "event_location", diff: "medium", chapter: win, current: true,
 question: "Ethiopian-born Dutch runner Sifan Hassan won Olympic marathon gold in which city in 2024?", clue: "Host of the 2024 Summer Olympics.", hint: "France's capital.",
 city: "Paris", country: FR[0], code: FR[1], geocode: "Paris",
 story: "Born and raised in Ethiopia, Sifan Hassan moved to the Netherlands at 15 and completed an Olympic medal treble with marathon gold in Paris.",
 notes: ["Event question used: strong sources state only that she was born in Ethiopia."],
 quotes: [[WA + "report/paris-2024-olympics-report-women-marathon", "Hassan completes magnificent Olympic medal treble with marathon gold in Paris"],
  [WA + "feature/sifan-hassan-yomif-kejelcha", "Born and raised in Ethiopia before leaving for the Netherlands aged 15, Hassan proved an athletics natural."]] });
A("mo-farah", "Mo Farah", "MF", "GB", "europe", { qid: "mo-farah-rio-de-janeiro", type: "event_location", diff: "medium", chapter: win,
 question: "In which city did Mo Farah complete his 'double double' of Olympic 5000m and 10,000m titles?", clue: "Host of the 2016 Summer Olympics.", hint: "Home of Copacabana Beach.",
 city: "Rio de Janeiro", country: "Brazil", code: "BR", geocode: "Rio de Janeiro",
 story: "At Rio 2016 Mo Farah defended his 5000m title to complete a second consecutive Olympic double, a feat previously achieved only by Lasse Viren.",
 notes: ["Event question used instead of birthplace: published accounts of Farah's birthplace differ."],
 quotes: [["https://www.teamgb.com/article/mo-farah-does-the-double-adding-5-000m-gold-to-10-000m-title/2ad2EDvKwPveXcU531mJpc", "The 33-year-old was always in control, easing to the front with five laps to go and holding off a last-lap challenge from Ethiopia's Gebrhiwet to storm home and take GB's 27th gold of the Rio 2016 Olympic Games."],
  [WA + "report/rio-2016-men-5000m-final", "Mo Farah completed his second consecutive Olympic double by successfully defending his 5000m gold on Saturday, winning in 13:03.30."]] });
A("yulimar-rojas", "Yulimar Rojas", "YR", "VE", "latin-america", { qid: "yulimar-rojas-caracas", type: "birthplace", diff: "medium", chapter: born, current: true,
 question: "Venezuelan triple jumper Yulimar Rojas was born in which capital city?", clue: "In a valley near Venezuela's Caribbean coast.", hint: "Venezuela's capital.",
 city: "Caracas", country: "Venezuela", code: "VE", geocode: "Caracas",
 story: "Yulimar Rojas was born in Caracas and raised in the eastern state of Anzoátegui.",
 quotes: [[WA + "feature/portland-2016-rojas-triple-jump", "Born in the Venezuelan capital Caracas but raised in the eastern state of Anzoategui"]] });
A("neeraj-chopra", "Neeraj Chopra", "NC", "IN", "asia", { qid: "neeraj-chopra-khandra", type: "birthplace", diff: "legend", chapter: born, current: true,
 question: "Javelin star Neeraj Chopra was born in which village in Haryana's Panipat district?", clue: "A village near the historic city of Panipat, north of Delhi.", hint: "It starts with 'Khan'.",
 city: "Khandra", country: "India", code: "IN", geocode: "Khandra, Panipat, Haryana",
 story: "Neeraj Chopra was born in Khandra village, Panipat district, Haryana, and grew up there in an extended family of 17.",
 quotes: [["https://www.pib.gov.in/PressReleseDetailm.aspx?PRID=2181457&reg=48&lang=2", "Born on 24 December 1997 in Khandra village, Panipat district, Haryana, he has brought immense pride to the Nation and the Armed Forces through his remarkable accomplishments in international athletics."],
  [WA + "series/neeraj-chopra-loves-javelin", "I had grown up in the village of Khandra with my extended family of 17 people"]] });
A("faith-kipyegon", "Faith Kipyegon", "FK", "KE", "africa", { qid: "faith-kipyegon-florence", type: "event_location", diff: "hard", chapter: win, current: true,
 question: "In which Italian city did Faith Kipyegon break the 1500m world record in 2023?", clue: "The Tuscan home of the Golden Gala that year.", hint: "Birthplace of the Renaissance.",
 city: "Florence", country: IT[0], code: IT[1], geocode: "Florence, Tuscany",
 story: "Faith Kipyegon broke the world 1500m record with 3:49.11 at the Golden Gala in Florence in June 2023.",
 quotes: [[WA + "report/florence-golden-gala-2023-faith-kipyegon-world-record-1500m", "Kipyegon breaks world 1500m record with 3:49.11 in Florence"]] });

// ── Formula 1 ───────────────────────────────────────────────────
const F = (...a) => S("formula-1", "Formula 1", ...a);
F("michael-schumacher", "Michael Schumacher", "MS", "DE", "europe", { qid: "michael-schumacher-kerpen", type: "career_location", diff: "medium", chapter: early,
 question: "Michael Schumacher's father ran the local kart track in which German town?", clue: "West of Cologne, in North Rhine-Westphalia.", hint: "It starts with 'Ker'.",
 city: "Kerpen", country: DE[0], code: DE[1], geocode: "Kerpen, North Rhine-Westphalia",
 story: "Michael Schumacher's father, a bricklayer, ran the local kart track at Kerpen, where his mother ran the canteen — the start of a seven-time champion.",
 notes: ["Formula1.com gives only 'near Cologne' for his birthplace, so the documented Kerpen kart track is used."],
 quotes: [[F1 + "michael-schumacher.7KdX5nJlTG55vR5JQSbZ21", "Their father, a bricklayer, ran the local kart track, at Kerpen, where Mrs Schumacher operated the canteen."]] });
F("fernando-alonso", "Fernando Alonso", "FA", "ES", "europe", { qid: "fernando-alonso-oviedo", type: "birthplace", diff: "medium", chapter: born, current: true,
 question: "Fernando Alonso was born in which city in northern Spain?", clue: "Capital of the Principality of Asturias.", hint: "Its name starts with 'Ovi'.",
 city: "Oviedo", country: ES[0], code: ES[1], geocode: "Oviedo, Asturias",
 story: "Fernando Alonso was born in Oviedo, Spain.",
 quotes: [[F1D + "fernando-alonso", "Place of Birth: Oviedo, Spain"]] });
F("juan-manuel-fangio", "Juan Manuel Fangio", "JF", "AR", "latin-america", { qid: "juan-manuel-fangio-balcarce", type: "hometown", diff: "legend", chapter: home,
 question: "Juan Manuel Fangio came from which dusty frontier town in Argentina?", clue: "In Buenos Aires Province, inland from Mar del Plata.", hint: "It starts with 'Bal'.",
 city: "Balcarce", country: "Argentina", code: "AR", geocode: "Balcarce, Buenos Aires",
 story: "Juan Manuel Fangio's humble origins lay in Balcarce, a dusty frontier town in a remote corner of Argentina, far from his privileged rivals.",
 quotes: [[F1 + "juan-manuel-fangio.6SSng3B5E6j6pxPNbyqQIv", "Most of his challengers were young enough to be his sons, and nearly all of them came from privileged backgrounds far removed from Fangio's humble origins in a remote corner of Argentina, in the dusty frontier town of Balcarce."]] });
F("niki-lauda", "Niki Lauda", "NL", "AT", "europe", { qid: "niki-lauda-vienna", type: "birthplace", diff: "easy", chapter: born,
 question: "Niki Lauda was born in which European capital?", clue: "On the Danube.", hint: "Austria's capital.",
 city: "Vienna", country: "Austria", code: "AT", geocode: "Vienna",
 story: "Niki Lauda was born in Vienna on 22 February 1949 into a prominent Austrian business and banking family.",
 quotes: [[F1 + "niki-lauda.2Ye7VYWdXwhb97ZqLyxvX", "On February 22, 1949, Nicholas Andreas Lauda was born in Vienna into a prominent Austrian business and banking dynasty."]] });
F("alain-prost", "Alain Prost", "AP", "FR", "europe", { qid: "alain-prost-saint-chamond", type: "birthplace", diff: "legend", chapter: born,
 question: "Alain Prost was born near which town in France's Loire region?", clue: "Between Lyon and Saint-Étienne.", hint: "It starts with 'Saint-'.",
 city: "Saint-Chamond", country: FR[0], code: FR[1], geocode: "Saint-Chamond, Loire",
 story: "Alain Prost was born in 1955 near Saint-Chamond in the Loire region of central France, where his father made kitchen furniture.",
 quotes: [[F1 + "alain-prost.6xkomcqkRL5K0HgmPX4zAH", "Alain Prost was born on February 24, 1955, near Saint Chamond in the Loire region of central France, where his father Andre manufactured kitchen furnishings."]] });
F("kimi-raikkonen", "Kimi Räikkönen", "KR", "FI", "europe", { qid: "kimi-raikkonen-espoo", type: "hometown", diff: "hard", chapter: home,
 question: "Kimi Räikkönen spent his childhood in which city next to Helsinki?", clue: "Finland's second-largest city, west of the capital.", hint: "Home of Nokia's headquarters.",
 city: "Espoo", country: "Finland", code: "FI", geocode: "Espoo",
 story: "Kimi Räikkönen spent his childhood in a house his great-grandfather built in Espoo, next to Helsinki.",
 quotes: [[F1 + "kimi-raikkonen.4Ykdt9U76gWO40cNbjaMXf", "Kimi Matias Raikkonen spent his childhood in a house built by his great grandfather in Espoo, a suburb of the Finnish capital, Helsinki."]] });
F("sergio-perez", "Sergio Pérez", "SP", "MX", "latin-america", { qid: "sergio-perez-guadalajara", type: "birthplace", diff: "medium", chapter: born, current: true,
 question: "Sergio 'Checo' Pérez was born in which Mexican city?", clue: "Capital of Jalisco state.", hint: "Mexico's second city, home of mariachi.",
 city: "Guadalajara", country: MX[0], code: MX[1], geocode: "Guadalajara, Jalisco",
 story: "Sergio Pérez was born in Guadalajara, Mexico.",
 quotes: [[F1D + "sergio-perez", "Place of Birth: Guadalajara, Mexico"]] });
F("yuki-tsunoda", "Yuki Tsunoda", "YT", "JP", "asia", { qid: "yuki-tsunoda-sagamihara", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Yuki Tsunoda was born in which city in Kanagawa Prefecture?", clue: "A city in the hills west of Tokyo.", hint: "It starts with 'Sagami'.",
 city: "Sagamihara", country: JP[0], code: JP[1], geocode: "Sagamihara, Kanagawa",
 story: "Honda's driver profile gives Yuki Tsunoda's birthplace as Sagamihara, Kanagawa.",
 quotes: [["https://global.honda/en/newsroom/news/2020/c201216eng.html", "Birthplace: Sagamihara, Kanagawa, Japan"]] });
F("jody-scheckter", "Jody Scheckter", "JS", "ZA", "africa", { qid: "jody-scheckter-east-london", type: "birthplace", diff: "legend", chapter: born,
 question: "1979 champion Jody Scheckter was born in which South African port city?", clue: "On the Eastern Cape coast, at the mouth of the Buffalo River.", hint: "It shares its name with part of England's capital.",
 city: "East London", country: ZA[0], code: ZA[1], geocode: "East London, Eastern Cape",
 story: "Jody Scheckter was born in East London, South Africa, in 1950, where his father owned a Renault dealership. He won the 1979 world title.",
 notes: ["OpenStreetMap names the city KuGompo City (renamed); the source and question use East London."],
 quotes: [[F1 + "jody-scheckter.xGrSCopMMf1mkdIUX1119", "Jody Scheckter was born on January 29, 1950, in East London, South Africa, where his father owned a Renault dealership."],
  [F1 + "jody-scheckter.xGrSCopMMf1mkdIUX1119", "The South African countered the French Canadian's superior all-out speed with a more conservative points-collecting strategy that paid off and made him the 1979 World Champion."]] });
F("lando-norris", "Lando Norris", "LN", "GB", "europe", { qid: "lando-norris-bristol", type: "birthplace", diff: "medium", chapter: born, current: true,
 question: "Lando Norris was born in which English city?", clue: "In the West Country, on the River Avon.", hint: "Famous for the Clifton Suspension Bridge.",
 city: "Bristol", country: GB[0], code: GB[1], geocode: "Bristol, England",
 story: "Lando Norris was born in Bristol, England.",
 quotes: [[F1D + "lando-norris", "Place of Birth: Bristol, England"]] });

// ── Cricket ─────────────────────────────────────────────────────
const C = (...a) => S("cricket", "Cricket", ...a);
C("babar-azam", "Babar Azam", "BA", "PK", "asia", { qid: "babar-azam-lahore", type: "hometown", diff: "medium", chapter: home, current: true,
 question: "Babar Azam learned cricket on the streets around his family home in which city?", clue: "Capital of Punjab province.", hint: "Home of the Gaddafi Stadium.",
 city: "Lahore", country: "Pakistan", code: "PK", geocode: "Lahore",
 story: "Babar Azam's journey started with street cricket around his family home in Lahore.",
 quotes: [["https://www.icc-cricket.com/news/from-tape-ball-cricket-to-the-top-of-the-world-babar-azams-incredible-rise", "Playing on the streets around his family home in Lahore."],
  ["https://www.cricket.com.au/players/CA:568/babar-azam", "Birthplace: Lahore, Punjab"]] });
C("kumar-sangakkara", "Kumar Sangakkara", "KS", "LK", "asia", { qid: "kumar-sangakkara-matale", type: "birthplace", diff: "hard", chapter: born,
 question: "Kumar Sangakkara was born in which town in Sri Lanka's Central Province?", clue: "North of Kandy, in the hill country.", hint: "It starts with 'Mat'.",
 city: "Matale", country: LK[0], code: LK[1], geocode: "Matale city, Matale District",
 story: "Kumar Sangakkara was born in Matale on 27 October 1977.",
 quotes: [["https://www.wisden.com/wisden-cricketers-almanack/kumar-sangakkara-the-cricketer-who-challenged-the-sri-lankan-political-establishment-almanack", "That forthright Lord’s address provided an impressive adjunct to what Kumar Chokshanada Sangakkara, born in Matale on October 27, 1977, expected to be his last Tests in England."]] });
C("muttiah-muralitharan", "Muttiah Muralitharan", "MM", "LK", "asia", { qid: "muttiah-muralitharan-kandy", type: "career_location", diff: "medium", chapter: early,
 question: "Muttiah Muralitharan took up off-spin at St Anthony's College in which Sri Lankan city?", clue: "The hill capital, home of the Temple of the Tooth.", hint: "Sri Lanka's last royal capital.",
 city: "Kandy", country: LK[0], code: LK[1], geocode: "Kandy",
 story: "Muttiah Muralitharan switched to off-spin at St Anthony's College in Kandy on the advice of his coach, Sunil Fernando.",
 notes: ["School location used: sources reviewed did not state his birthplace."],
 quotes: [["https://www.wisden.com/cricket-features/muttiah-muralitharan-top-ten-moments-in-his-own-words", "I took up off-spin at the suggestion of my coach Sunil Fernando while I was at St Anthony’s College in Kandy, and it quickly became obvious I was much better at spinning the ball than trying to bowl fast!"]] });
C("rashid-khan", "Rashid Khan", "RK", "AF", "asia", { qid: "rashid-khan-jalalabad", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Afghan spin star Rashid Khan was born in which city in eastern Afghanistan?", clue: "Capital of Nangarhar province, east of Kabul.", hint: "It starts with 'Jalal'.",
 city: "Jalalabad", country: "Afghanistan", code: "AF", geocode: "Jalalabad, Nangarhar",
 story: "Rashid Khan was born in Jalalabad in eastern Afghanistan, some 130km from Kabul.",
 notes: ["Other profiles give the province (Nangarhar); Jalalabad is its capital, so the sources agree."],
 quotes: [["https://www.cricket.com.au/news/3309049", "He was born in Jalalabad in Afghanistan's east, some 130km from Kabul."]] });
C("ben-stokes", "Ben Stokes", "BS", "GB", "europe", { qid: "ben-stokes-christchurch", type: "birthplace", diff: "hard", chapter: "Born abroad", current: true,
 question: "England all-rounder Ben Stokes was born in which New Zealand city?", clue: "The largest city on New Zealand's South Island.", hint: "Its name honours an Oxford college.",
 city: "Christchurch", country: "New Zealand", code: "NZ", geocode: "Christchurch",
 story: "Ben Stokes was born in Christchurch, New Zealand, and raised in Cumbria, England.",
 quotes: [["https://www.ecb.co.uk/news/4527979/ben-stokes-announces-he-will-retire-at-the-end-of-the-trent-bridge-test", "Born in Christchurch, New Zealand, and raised in Cumbria, Stokes has overcome a number of injury setbacks to produce a host of match-winning performances."]] });
C("ab-de-villiers", "AB de Villiers", "AV", "ZA", "africa", { qid: "ab-de-villiers-pretoria", type: "birthplace", diff: "medium", chapter: born,
 question: "AB de Villiers was born in which South African city?", clue: "One of South Africa's capitals, in Gauteng.", hint: "Famous for its jacaranda trees.",
 city: "Pretoria", country: ZA[0], code: ZA[1], geocode: "Pretoria",
 story: "AB de Villiers was born in Pretoria, Gauteng, on 17 February 1984.",
 quotes: [["https://www.cricket.com.au/players/CA:792/ab-de-villiers", "Birthplace: Pretoria, Gauteng Province"]] });
C("ellyse-perry", "Ellyse Perry", "EP", "AU", "oceania", { qid: "ellyse-perry-wahroonga", type: "birthplace", diff: "legend", chapter: born, current: true,
 question: "Ellyse Perry was born in which suburb on Sydney's Upper North Shore?", clue: "A leafy suburb north of Sydney's centre.", hint: "An Aboriginal name meaning 'our home'.",
 city: "Wahroonga", country: AU[0], code: AU[1], geocode: "Wahroonga, New South Wales",
 story: "Ellyse Perry was born in Wahroonga, Sydney, on 3 November 1990.",
 quotes: [["https://www.wisden.com/wisden-cricketers-almanack/ellyse-perry-wisden-cricketer-of-the-year-almanack", "Ellyse Alexandra Perry was born in Wahroonga, Sydney, on November 3, 1990."]] });
C("stafanie-taylor", "Stafanie Taylor", "ST", "JM", "caribbean", { qid: "stafanie-taylor-spanish-town", type: "birthplace", diff: "hard", chapter: born,
 question: "West Indies star Stafanie Taylor was born in which Jamaican town?", clue: "Jamaica's former capital, west of Kingston.", hint: "Named after a European country.",
 city: "Spanish Town", country: "Jamaica", code: "JM", geocode: "Spanish Town, Jamaica",
 story: "Stafanie Taylor was born in Spanish Town, Jamaica, on 11 June 1991.",
 quotes: [[CWI + "stafanie-taylor-2091/", "Born: 1991-06-11, Spanish Town"]] });
C("viv-richards", "Viv Richards", "VR", "AG", "caribbean", { qid: "viv-richards-st-johns", type: "birthplace", diff: "medium", chapter: born,
 question: "Sir Viv Richards was born in which Caribbean capital?", clue: "Capital of Antigua and Barbuda.", hint: "It shares its name with the capital of Newfoundland.",
 city: "St John's", country: "Antigua and Barbuda", code: "AG", geocode: "St. John's, Antigua",
 story: "Sir Viv Richards was born in St John's, Antigua, on 7 March 1952.",
 quotes: [[CWI + "viv-richards-4326/", "Born: 1952-03-07, St John's, Antigua"]] });
C("don-bradman", "Don Bradman", "DB", "AU", "oceania", { qid: "don-bradman-cootamundra", type: "birthplace", diff: "hard", chapter: born,
 question: "Sir Donald Bradman was born in which New South Wales town?", clue: "A Riverina town, a long drive southwest of Sydney.", hint: "It starts with 'Coota'.",
 city: "Cootamundra", country: AU[0], code: AU[1], geocode: "Cootamundra, New South Wales",
 story: "Sir Donald Bradman was born in Cootamundra, NSW, on 27 August 1908.",
 quotes: [["https://www.cricket.com.au/news/3262086", "Born: August 27, 1908, Cootamundra, NSW"]] });

require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-19.json"),
 JSON.stringify({ batch: 19, researched: "2026-10-18", coordinateSource: "OpenStreetMap Nominatim", entries, memberships: [] }, null, 1) + "\n");
console.log(entries.length, "entries");
