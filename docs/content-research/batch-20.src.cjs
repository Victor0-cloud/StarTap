// Batch 20 — Sports expansion 1B: MMA, Gymnastics, Racket Sports, Winter Sports to 15 stars each.
// Source of src/content/batches/batch-20.json (run: node docs/content-research/batch-20.src.cjs).
// Every quote was copied from the fetched page text (18 October 2026). Structured profile fields are quoted as "Label: value";
// Olympedia "Born" rows are quoted as rendered ("Born <date> in <place> (<NOC>)").
// UFC.com and the PSA are rated authoritative (the promotion and the professional tour); Olympedia (the Olympic historians'
// database), Harvard Athletics, Dawn and SquashInfo reputable_secondary. No Wikipedia, IMDb or ticketing source is used.
// Location choices: an event location replaces the birthplace where the strong source gives only a region or country
// (Khabib: "Dagestan Republic"; Zhang Weili: "Hebei"), where the event is the defining fact (El Sherbini, Farag), or both.
// Swapped before research: Gretzky (ice hockey stretches "Winter Sports") → Fourcade. Swapped after research:
// Katarina Witt (Olympedia Falkensee vs widely reported Staaken) → Kamil Stoch; Plushenko (village-level birthplace,
// variant spellings) and Shizuka Arakawa (Olympedia Kamakura vs widely reported Tokyo) → Lee Sang-hwa.
const AUTH = ["ufc.com", "psaworldtour.com", "psasquashtour.com"];
const quality = url => { const host = new URL(url).hostname.replace(/^www\./, ""); return AUTH.some(d => host === d || host.endsWith("." + d)) ? "authoritative" : "reputable_secondary"; };
const entries = [];
const S = (sub, display, id, name, mono, cc, region, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.current ? { tags: ["current"] } : {}) },
 question: { id: q.qid, primaryCategory: "sports", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: display, chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, geocode: q.geocode }, story: q.story,
  sources: q.quotes.map(([url, quote], i) => ({ url, role: i ? "extra" : "primary", quality: quality(url), quote })),
  ...(q.notes ? { notes: q.notes } : {}) },
});
const born = "Where the story began", home = "Growing up", win = "The championship city", abroad = "Born abroad";
const OL = "https://www.olympedia.org/athletes/", UFC = "https://www.ufc.com/athlete/", UFCN = "https://www.ufc.com/news/";
const US = ["United States", "US"], BR = ["Brazil", "BR"], CN = ["China", "CN"], AU = ["Australia", "AU"], FR = ["France", "FR"];

// ── MMA ─────────────────────────────────────────────────────────
const M = (...a) => S("mma", "MMA", ...a);
M("khabib-nurmagomedov", "Khabib Nurmagomedov", "KN", "RU", "europe", { qid: "khabib-nurmagomedov-abu-dhabi", type: "event_location", diff: "medium", chapter: win,
 question: "In which city did Khabib Nurmagomedov win his final fight to go 29-0, then announce his retirement?", clue: "UFC 'Fight Island' was staged here in the Gulf.", hint: "Capital of the United Arab Emirates.",
 city: "Abu Dhabi", country: "United Arab Emirates", code: "AE", geocode: "Abu Dhabi",
 story: "Khabib Nurmagomedov won the UFC 254 main event on Fight Island in Abu Dhabi to move to 29-0, then announced his retirement at 32.",
 notes: ["Event question used: the UFC profile gives only 'Dagestan Republic, Russia' as his place of birth."],
 quotes: [[UFCN + "ufc-254-khabib-vs-gaethje-live-results-fight-island", "But his victory in the UFC 254 main event on Fight Island in Abu Dhabi, one which lifted his perfect record to 29-0, was followed by a shocking announcement, as he announced his retirement at the age of 32."]] });
M("amanda-nunes", "Amanda Nunes", "AN", "BR", "latin-america", { qid: "amanda-nunes-pojuca", type: "hometown", diff: "legend", chapter: home,
 question: "UFC Hall of Famer Amanda Nunes is a native of which town in Bahia, Brazil?", clue: "Inland from Salvador, in northeastern Brazil.", hint: "It starts with 'Po'.",
 city: "Pojuca", country: BR[0], code: BR[1], geocode: "Pojuca, Bahia",
 story: "Amanda Nunes is a native of Pojuca, Bahia, Brazil, and began competing in karate, boxing and capoeira at the age of seven.",
 quotes: [[UFCN + "amanda-nunes-named-ufc-hall-fame-class-2025", "A native of Pojuca, Bahia, Brazil, Nunes began competing in karate, boxing, and capoeira at the age of seven."]] });
M("kamaru-usman", "Kamaru Usman", "KU", "NG", "africa", { qid: "kamaru-usman-auchi", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "MMA fighter Kamaru Usman was born in which town in Edo State, Nigeria?", clue: "In southern Nigeria, north of Benin City.", hint: "It starts with 'Au'.",
 city: "Auchi", country: "Nigeria", code: "NG", geocode: "Auchi, Edo",
 story: "Kamaru Usman was born in Auchi, Nigeria.",
 quotes: [[UFC + "kamaru-usman", "Place of Birth: Auchi, Nigeria"]] });
M("jon-jones", "Jon Jones", "JJ", "US", "north-america", { qid: "jon-jones-rochester", type: "birthplace", diff: "medium", chapter: born,
 question: "Jon Jones was born in which city in upstate New York?", clue: "On Lake Ontario, once home of Kodak.", hint: "It shares its name with a Kent cathedral city.",
 city: "Rochester", country: US[0], code: US[1], geocode: "Rochester, New York",
 story: "Jon Jones was born in Rochester, New York, and later fought out of Albuquerque by way of Endicott, New York.",
 quotes: [[UFCN + "jon-jones-career-highlights-title-wins-best-knockouts", "Jones was born in Rochester, NY but fights out of Albuquerque, NM by way of Endicott, NY."]] });
M("georges-st-pierre", "Georges St-Pierre", "GS", "CA", "north-america", { qid: "georges-st-pierre-montreal", type: "birthplace", diff: "easy", chapter: born,
 question: "Georges St-Pierre was born in which Canadian city?", clue: "Quebec's largest city, on an island in the St Lawrence.", hint: "Host of the 1976 Olympics.",
 city: "Montreal", country: "Canada", code: "CA", geocode: "Montreal, Quebec",
 story: "Georges St-Pierre was born in Montreal, Canada.",
 quotes: [[UFC + "georges-st-pierre", "Place of Birth: Montreal, Canada"]] });
M("anderson-silva", "Anderson Silva", "AS", "BR", "latin-america", { qid: "anderson-silva-curitiba", type: "hometown", diff: "medium", chapter: home,
 question: "Anderson 'The Spider' Silva is from which Brazilian city?", clue: "Capital of Paraná state, in southern Brazil.", hint: "Famous for its 'Wire Opera House'.",
 city: "Curitiba", country: BR[0], code: BR[1], geocode: "Curitiba, Paraná",
 story: "The UFC describes Anderson 'The Spider' Silva as a Curitiba, Brazil native.",
 quotes: [[UFCN + "anderson-silva-steps-fight-cormier", "“If I was worried, I wouldn’t be here tonight,” the Curitiba, Brazil native said."],
  [UFCN + "silva-vs-okami-headlines-ufc-134-brazil", "Live from the HSBC Arena in Rio de Janeiro, Curitiba’s Anderson “The Spider” Silva puts the middleweight title on the line when he meets Japanese star Yushin Okami"]] });
M("ronda-rousey", "Ronda Rousey", "RR", "US", "north-america", { qid: "ronda-rousey-riverside", type: "birthplace", diff: "medium", chapter: born,
 question: "Ronda Rousey was born in which Southern California city?", clue: "In the Inland Empire, east of Los Angeles.", hint: "Its name means it sits beside a river.",
 city: "Riverside", country: US[0], code: US[1], geocode: "Riverside, California",
 story: "Ronda Rousey was born in Riverside, California.",
 quotes: [[UFC + "ronda-rousey", "Place of Birth: Riverside, United States"]] });
M("zhang-weili", "Zhang Weili", "ZW", "CN", "asia", { qid: "zhang-weili-shenzhen", type: "event_location", diff: "hard", chapter: win, current: true,
 question: "In which Chinese city did Zhang Weili win the UFC strawweight title to become China's first UFC champion?", clue: "A southern tech megacity across the border from Hong Kong.", hint: "It starts with 'Shen'.",
 city: "Shenzhen", country: CN[0], code: CN[1], geocode: "Shenzhen, Guangdong",
 story: "On 31 August 2019 Zhang Weili knocked out Jessica Andrade at the Shenzhen Universiade Sports Centre to become China's first UFC champion.",
 notes: ["Event question used: the UFC profile gives only 'Hebei, China' as her place of birth."],
 quotes: [[UFCN + "zhang-weili-becomes-chinas-first-champion-breaking-barriers", "Zhang Weili of China celebrates after her knockout victory over Jessica Andrade of Brazil in their UFC strawweight championship bout during the UFC Fight Night event at Shenzhen Universiade Sports Centre on August 31, 2019 in Shenzhen, China."],
  [UFCN + "zhang-weili-becomes-chinas-first-champion-breaking-barriers", "Zhang Weili Becomes China's First Champion"]] });
M("alexander-volkanovski", "Alexander Volkanovski", "AV", "AU", "oceania", { qid: "alexander-volkanovski-wollongong", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Alexander Volkanovski was born in which coastal city in New South Wales?", clue: "South of Sydney, in the Illawarra.", hint: "Its name starts with 'Wollon'.",
 city: "Wollongong", country: AU[0], code: AU[1], geocode: "Wollongong, New South Wales",
 story: "Alexander Volkanovski was born in Wollongong, Australia.",
 quotes: [[UFC + "alexander-volkanovski", "Place of Birth: Wollongong, Australia"]] });
M("dricus-du-plessis", "Dricus du Plessis", "DP", "ZA", "africa", { qid: "dricus-du-plessis-welkom", type: "birthplace", diff: "legend", chapter: born, current: true,
 question: "Dricus du Plessis was born in which gold-mining city in South Africa's Free State?", clue: "In the Free State goldfields.", hint: "Afrikaans for 'welcome'.",
 city: "Welkom", country: "South Africa", code: "ZA", geocode: "Welkom, Free State",
 story: "Dricus du Plessis was born in Welkom, South Africa.",
 quotes: [[UFC + "dricus-du-plessis", "Place of Birth: Welkom, South Africa"]] });

// ── Gymnastics ──────────────────────────────────────────────────
const G = (...a) => S("gymnastics", "Gymnastics", ...a);
G("larisa-latynina", "Larisa Latynina", "LL", "UA", "europe", { qid: "larisa-latynina-kherson", type: "birthplace", diff: "hard", chapter: born,
 question: "Gymnastics legend Larisa Latynina was born in which Ukrainian city?", clue: "A port on the Dnipro River, near the Black Sea.", hint: "It starts with 'Kher'.",
 city: "Kherson", country: "Ukraine", code: "UA", geocode: "Kherson city, Kherson Oblast",
 story: "Larisa Latynina was born in Kherson, Ukraine, on 27 December 1934.",
 quotes: [[OL + "29198", "Born 27 December 1934 in Kherson, Kherson (UKR)"]] });
G("vera-caslavska", "Věra Čáslavská", "VC", "CZ", "europe", { qid: "vera-caslavska-prague", type: "birthplace", diff: "medium", chapter: born,
 question: "Věra Čáslavská was born in which capital city?", clue: "On the Vltava River.", hint: "Czech capital.",
 city: "Prague", country: "Czech Republic", code: "CZ", geocode: "Prague",
 story: "Věra Čáslavská was born in Prague on 3 May 1942.",
 quotes: [[OL + "29115", "Born 3 May 1942 in Praha (Prague), Hlavní město Praha (CZE)"]] });
G("nastia-liukin", "Nastia Liukin", "NL", "US", "north-america", { qid: "nastia-liukin-moscow", type: "birthplace", diff: "medium", chapter: abroad,
 question: "American gymnast Nastia Liukin was born in which European capital?", clue: "Home of Red Square.", hint: "Russia's capital.",
 city: "Moscow", country: "Russia", code: "RU", geocode: "Moscow",
 story: "Nastia Liukin was born in Moscow on 30 October 1989 and competed for the United States.",
 quotes: [[OL + "117649", "Born 30 October 1989 in Moskva (Moscow), Moskva (RUS)"]] });
G("max-whitlock", "Max Whitlock", "MW", "GB", "europe", { qid: "max-whitlock-hemel-hempstead", type: "birthplace", diff: "hard", chapter: born,
 question: "Max Whitlock was born in which Hertfordshire town?", clue: "A post-war new town northwest of London.", hint: "Its name has two words beginning 'H'.",
 city: "Hemel Hempstead", country: "United Kingdom", code: "GB", geocode: "Hemel Hempstead, Hertfordshire",
 story: "British gymnast Max Whitlock was born in Hemel Hempstead on 13 January 1993.",
 quotes: [[OL + "123039", "Born 13 January 1993 in Hemel Hempstead, England (GBR)"]] });
G("sunisa-lee", "Sunisa Lee", "SL", "US", "north-america", { qid: "sunisa-lee-south-st-paul", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Suni Lee was born in which Minnesota city just south of the state capital?", clue: "On the Mississippi, beside St Paul.", hint: "Add a compass point to the capital's name.",
 city: "South St. Paul", country: US[0], code: US[1], geocode: "South St. Paul, Minnesota",
 story: "Sunisa 'Suni' Lee was born in South St. Paul, Minnesota, on 9 March 2003.",
 quotes: [[OL + "147194", "Born 9 March 2003 in South St. Paul, Minnesota (USA)"]] });
G("daiki-hashimoto", "Daiki Hashimoto", "DH", "JP", "asia", { qid: "daiki-hashimoto-narita", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Daiki Hashimoto was born in which city in Chiba Prefecture?", clue: "Home of Tokyo's main international airport.", hint: "It starts with 'Nari'.",
 city: "Narita", country: "Japan", code: "JP", geocode: "Narita, Chiba",
 story: "Japanese gymnast Daiki Hashimoto was born in Narita, Chiba, on 7 August 2001.",
 quotes: [[OL + "144639", "Born 7 August 2001 in Narita, Chiba (JPN)"]] });
G("li-ning", "Li Ning", "LN", "CN", "asia", { qid: "li-ning-laibin", type: "birthplace", diff: "legend", chapter: born,
 question: "Gymnast Li Ning was born in which city in Guangxi?", clue: "In southern China's Guangxi region.", hint: "It starts with 'Lai'.",
 city: "Laibin", country: CN[0], code: CN[1], geocode: "Laibin, Guangxi",
 story: "Chinese gymnast Li Ning was born in Laibin, Guangxi, on 10 March 1963.",
 quotes: [[OL + "29566", "Born 10 March 1963 in Laibin, Guangxi (CHN)"]] });
G("dipa-karmakar", "Dipa Karmakar", "DK", "IN", "asia", { qid: "dipa-karmakar-agartala", type: "birthplace", diff: "hard", chapter: born,
 question: "Dipa Karmakar was born in which city in northeast India?", clue: "Capital of Tripura, near the Bangladesh border.", hint: "It starts with 'Agar'.",
 city: "Agartala", country: "India", code: "IN", geocode: "Agartala, Tripura",
 story: "Indian gymnast Dipa Karmakar was born in Agartala, Tripura, on 9 August 1993.",
 quotes: [[OL + "130552", "Born 9 August 1993 in Agartala, Tripura (IND)"]] });
G("kaylia-nemour", "Kaylia Nemour", "KN", "DZ", "africa", { qid: "kaylia-nemour-paris", type: "birthplace", diff: "medium", chapter: abroad, current: true,
 question: "Algerian gymnast Kaylia Nemour was born in which European capital?", clue: "Host of the 2024 Summer Olympics.", hint: "France's capital.",
 city: "Paris", country: FR[0], code: FR[1], geocode: "Paris",
 story: "Kaylia Nemour was born in Paris on 30 December 2006 and competes for Algeria.",
 quotes: [[OL + "152536", "Born 30 December 2006 in Paris, Paris (FRA)"]] });
G("arthur-zanetti", "Arthur Zanetti", "AZ", "BR", "latin-america", { qid: "arthur-zanetti-sao-caetano-do-sul", type: "birthplace", diff: "legend", chapter: born,
 question: "Rings specialist Arthur Zanetti was born in which city in Greater São Paulo?", clue: "A small city in the ABC region of São Paulo state.", hint: "'São Caetano' plus 'of the South'.",
 city: "São Caetano do Sul", country: BR[0], code: BR[1], geocode: "São Caetano do Sul, São Paulo",
 story: "Brazilian gymnast Arthur Zanetti was born in São Caetano do Sul, São Paulo, on 16 April 1990.",
 quotes: [[OL + "122272", "Born 16 April 1990 in São Caetano do Sul, São Paulo (BRA)"]] });

// ── Racket Sports ───────────────────────────────────────────────
const R = (display, ...a) => S("racket-sports", display, ...a);
R("Badminton", "lin-dan", "Lin Dan", "LD", "CN", "asia", { qid: "lin-dan-shanghang", type: "birthplace", diff: "legend", chapter: born,
 question: "Badminton great Lin Dan was born in which county in Fujian province?", clue: "In western Fujian, part of Longyan.", hint: "It starts with 'Shang'.",
 city: "Shanghang County", country: CN[0], code: CN[1], geocode: "Shanghang County, Longyan, Fujian",
 story: "Lin Dan was born in Shanghang County, Fujian, on 14 October 1983.",
 quotes: [[OL + "105835", "Born 14 October 1983 in Shanghang County, Fujian (CHN)"]] });
R("Badminton", "lee-chong-wei", "Lee Chong Wei", "LC", "MY", "asia", { qid: "lee-chong-wei-bagan-serai", type: "birthplace", diff: "legend", chapter: born,
 question: "Lee Chong Wei was born in which town in Perak, Malaysia?", clue: "In the Kerian district of northern Perak.", hint: "'Bagan' plus a word for 'lemongrass'.",
 city: "Bagan Serai", country: "Malaysia", code: "MY", geocode: "Bagan Serai, Kerian",
 story: "Malaysian badminton star Lee Chong Wei was born in Bagan Serai, Perak, on 21 October 1982.",
 quotes: [[OL + "105855", "Born 21 October 1982 in Bagan Serai, Perak (MAS)"]] });
R("Badminton", "taufik-hidayat", "Taufik Hidayat", "TH", "ID", "asia", { qid: "taufik-hidayat-bandung", type: "birthplace", diff: "hard", chapter: born,
 question: "Taufik Hidayat was born in which Indonesian city?", clue: "Capital of West Java, in the highlands.", hint: "It starts with 'Band'.",
 city: "Bandung", country: "Indonesia", code: "ID", geocode: "Bandung, West Java",
 story: "Indonesian badminton player Taufik Hidayat was born in Bandung, West Java, on 10 August 1981.",
 quotes: [[OL + "82734", "Born 10 August 1981 in Bandung, Jawa Barat (INA)"]] });
R("Table tennis", "ma-long", "Ma Long", "ML", "CN", "asia", { qid: "ma-long-anshan", type: "birthplace", diff: "hard", chapter: born,
 question: "Table tennis star Ma Long was born in which city in Liaoning?", clue: "A steel city in northeast China.", hint: "It starts with 'An'.",
 city: "Anshan", country: CN[0], code: CN[1], geocode: "Anshan, Liaoning",
 story: "Ma Long was born in Anshan, Liaoning, on 20 October 1988.",
 quotes: [[OL + "121929", "Born 20 October 1988 in Anshan, Liaoning (CHN)"]] });
R("Table tennis", "jan-ove-waldner", "Jan-Ove Waldner", "JW", "SE", "europe", { qid: "jan-ove-waldner-stockholm", type: "birthplace", diff: "medium", chapter: born,
 question: "Table tennis legend Jan-Ove Waldner was born in which Scandinavian capital?", clue: "Built across 14 islands.", hint: "Sweden's capital.",
 city: "Stockholm", country: "Sweden", code: "SE", geocode: "Stockholm",
 story: "Jan-Ove Waldner was born in Stockholm on 3 October 1965.",
 quotes: [[OL + "2637", "Born 3 October 1965 in Stockholm, Stockholm (SWE)"]] });
R("Badminton", "tai-tzu-ying", "Tai Tzu-ying", "TT", "TW", "asia", { qid: "tai-tzu-ying-kaohsiung", type: "birthplace", diff: "hard", chapter: born,
 question: "Tai Tzu-ying was born in which port city in southern Taiwan?", clue: "Taiwan's largest port.", hint: "It starts with 'Kaoh'.",
 city: "Kaohsiung", country: "Taiwan", code: "TW", geocode: "Kaohsiung",
 story: "Badminton player Tai Tzu-ying was born in Kaohsiung City on 20 June 1994.",
 quotes: [[OL + "125109", "Born 20 June 1994 in Kaohsiung City, Kaohsiung (TPE)"]] });
R("Table tennis", "hugo-calderano", "Hugo Calderano", "HC", "BR", "latin-america", { qid: "hugo-calderano-rio-de-janeiro", type: "birthplace", diff: "medium", chapter: born, current: true,
 question: "Brazilian table tennis star Hugo Calderano was born in which city?", clue: "Home of Christ the Redeemer.", hint: "Brazil's former capital.",
 city: "Rio de Janeiro", country: BR[0], code: BR[1], geocode: "Rio de Janeiro",
 story: "Hugo Calderano was born in Rio de Janeiro on 22 June 1996.",
 quotes: [[OL + "132927", "Born 22 June 1996 in Rio de Janeiro, Rio de Janeiro (BRA)"]] });
R("Squash", "nour-el-sherbini", "Nour El Sherbini", "NE", "EG", "africa", { qid: "nour-el-sherbini-kuala-lumpur", type: "event_location", diff: "hard", chapter: win, current: true,
 question: "In which city did Nour El Sherbini become the youngest ever women's squash world champion?", clue: "A Southeast Asian capital famous for twin towers.", hint: "Malaysia's capital.",
 city: "Kuala Lumpur", country: "Malaysia", code: "MY", geocode: "Kuala Lumpur",
 story: "In the 2016 final in Kuala Lumpur, Nour El Sherbini came back from two games down to become the youngest ever women's world champion, at 20.",
 quotes: [["https://psaworldtour.com/news/view/4648/psa-women-s-world-championship-tournament-history", "But El Sherbini got her revenge in last year’s final in Kuala Lumpur as she battled back from two games down to become the youngest ever Women’s World Champion at the age of 20"],
  ["https://www.squashinfo.com/events/6191-womens-world-championship-2016", "$185,000 Women's Naza PSA World Championship 2016, Bukit Jalil National Squash Centre, Kuala Lumpur, Malaysia"]] });
R("Squash", "jahangir-khan", "Jahangir Khan", "JK", "PK", "asia", { qid: "jahangir-khan-karachi", type: "birthplace", diff: "medium", chapter: born,
 question: "Squash legend Jahangir Khan was born in which Pakistani city?", clue: "Pakistan's largest city, on the Arabian Sea.", hint: "Sindh's capital.",
 city: "Karachi", country: "Pakistan", code: "PK", geocode: "Karachi, Sindh, Pakistan",
 story: "Jahangir Khan was born in Karachi in 1963 into a family of squash champions.",
 notes: ["Dawn blocks scripted fetches; the quote was copied via a web fetch of the page."],
 quotes: [["https://www.dawn.com/news/1055297", "Born in Karachi in 1963 in a family of squash champions"]] });
R("Squash", "ali-farag", "Ali Farag", "AF", "EG", "africa", { qid: "ali-farag-chicago", type: "event_location", diff: "hard", chapter: win,
 question: "In which American city was Ali Farag first crowned squash world champion, at its grand railway station?", clue: "The Windy City.", hint: "Its Union Station hosted the 2018-19 Worlds.",
 city: "Chicago", country: US[0], code: US[1], geocode: "Chicago, Illinois",
 story: "Ali Farag was crowned world champion at the 2018-19 PSA World Championships in Chicago's Union Station, the day after reaching world No. 1.",
 quotes: [["https://gocrimson.com/news/2019/3/12/3_12_2019_7550", "Farag, the next day, was crowned a world champion in the 2018-19 PSA World Championships in Chicago's Union Station."]] });

// ── Winter Sports ───────────────────────────────────────────────
const W = (display, ...a) => S("winter-sports", display, ...a);
W("Alpine skiing", "mikaela-shiffrin", "Mikaela Shiffrin", "MS", "US", "north-america", { qid: "mikaela-shiffrin-vail", type: "birthplace", diff: "medium", chapter: born, current: true,
 question: "Mikaela Shiffrin was born in which Colorado ski town?", clue: "A Rocky Mountain resort off Interstate 70.", hint: "A four-letter name.",
 city: "Vail", country: US[0], code: US[1], geocode: "Vail, Colorado",
 story: "Alpine skier Mikaela Shiffrin was born in Vail, Colorado, on 13 March 1995.",
 quotes: [[OL + "128669", "Born 13 March 1995 in Vail, Colorado (USA)"]] });
W("Alpine skiing", "marcel-hirscher", "Marcel Hirscher", "MH", "AT", "europe", { qid: "marcel-hirscher-hallein", type: "birthplace", diff: "hard", chapter: born,
 question: "Marcel Hirscher was born in which town in the Austrian state of Salzburg?", clue: "On the Salzach, known for its salt mine.", hint: "It starts with 'Hall'.",
 city: "Hallein", country: "Austria", code: "AT", geocode: "Hallein, Salzburg",
 story: "Alpine skier Marcel Hirscher was born in Hallein, Salzburg, on 2 March 1989.",
 quotes: [[OL + "118416", "Born 2 March 1989 in Hallein, Salzburg (AUT)"]] });
W("Biathlon", "ole-einar-bjorndalen", "Ole Einar Bjørndalen", "OB", "NO", "europe", { qid: "ole-einar-bjorndalen-drammen", type: "birthplace", diff: "hard", chapter: born,
 question: "Biathlon great Ole Einar Bjørndalen was born in which Norwegian city?", clue: "On a river mouth southwest of Oslo.", hint: "It starts with 'Dram'.",
 city: "Drammen", country: "Norway", code: "NO", geocode: "Drammen",
 story: "Ole Einar Bjørndalen was born in Drammen, Norway, on 27 January 1974.",
 quotes: [[OL + "84154", "Born 27 January 1974 in Drammen, Viken (NOR)"]] });
W("Freestyle skiing", "eileen-gu", "Eileen Gu", "EG", "CN", "asia", { qid: "eileen-gu-san-francisco", type: "birthplace", diff: "medium", chapter: abroad, current: true,
 question: "Freestyle skier Eileen Gu, who competes for China, was born in which US city?", clue: "Home of the Golden Gate Bridge.", hint: "It is named after Saint Francis.",
 city: "San Francisco", country: US[0], code: US[1], geocode: "San Francisco, California",
 story: "Eileen Gu was born in San Francisco, California, on 3 September 2003 and competes for China.",
 quotes: [[OL + "139214", "Born 3 September 2003 in San Francisco, California (USA)"]] });
W("Speed skating", "ireen-wust", "Ireen Wüst", "IW", "NL", "europe", { qid: "ireen-wust-goirle", type: "birthplace", diff: "legend", chapter: born,
 question: "Speed skater Ireen Wüst was born in which village in North Brabant?", clue: "Just south of Tilburg, near the Belgian border.", hint: "It starts with 'Goir'.",
 city: "Goirle", country: "Netherlands", code: "NL", geocode: "Goirle, North Brabant",
 story: "Dutch speed skater Ireen Wüst was born in Goirle, North Brabant, on 1 April 1986.",
 quotes: [[OL + "109767", "Born 1 April 1986 in Goirle, Noord-Brabant (NED)"]] });
W("Biathlon", "martin-fourcade", "Martin Fourcade", "MF", "FR", "europe", { qid: "martin-fourcade-ceret", type: "birthplace", diff: "legend", chapter: born,
 question: "Biathlete Martin Fourcade was born in which town in French Catalonia?", clue: "In the Pyrénées-Orientales, near the Spanish border.", hint: "A cherry town whose name starts with 'C'.",
 city: "Céret", country: FR[0], code: FR[1], geocode: "Céret, Pyrénées-Orientales",
 story: "French biathlete Martin Fourcade was born in Céret, Pyrénées-Orientales, on 14 September 1988.",
 quotes: [[OL + "118554", "Born 14 September 1988 in Céret, Pyrénées-Orientales (FRA)"]] });
W("Alpine skiing", "alberto-tomba", "Alberto Tomba", "AT", "IT", "europe", { qid: "alberto-tomba-bologna", type: "birthplace", diff: "medium", chapter: born,
 question: "Alpine skier Alberto Tomba was born in which Italian city?", clue: "Capital of Emilia-Romagna, famous for its porticoes.", hint: "Home of a famous meat sauce.",
 city: "Bologna", country: "Italy", code: "IT", geocode: "Bologna",
 story: "Alpine skier Alberto Tomba was born in Bologna on 19 December 1966.",
 quotes: [[OL + "98310", "Born 19 December 1966 in Bologna, Bologna (ITA)"]] });
W("Snowboarding", "torah-bright", "Torah Bright", "TB", "AU", "oceania", { qid: "torah-bright-cooma", type: "birthplace", diff: "legend", chapter: born,
 question: "Snowboarder Torah Bright was born in which town in the Snowy Mountains region?", clue: "A New South Wales gateway town to the Snowy Mountains.", hint: "It starts with 'Coo'.",
 city: "Cooma", country: AU[0], code: AU[1], geocode: "Cooma, New South Wales",
 story: "Australian snowboarder Torah Bright was born in Cooma, New South Wales, on 27 December 1986.",
 quotes: [[OL + "109992", "Born 27 December 1986 in Cooma, New South Wales (AUS)"]] });
W("Ski jumping", "kamil-stoch", "Kamil Stoch", "KS", "PL", "europe", { qid: "kamil-stoch-zakopane", type: "birthplace", diff: "medium", chapter: born,
 question: "Ski jumper Kamil Stoch was born in which Polish mountain town?", clue: "Poland's winter capital, at the foot of the Tatras.", hint: "It starts with 'Zako'.",
 city: "Zakopane", country: "Poland", code: "PL", geocode: "Zakopane",
 story: "Polish ski jumper Kamil Stoch was born in Zakopane on 25 May 1987.",
 quotes: [[OL + "109725", "Born 25 May 1987 in Zakopane, Małopolskie (POL)"]] });
W("Speed skating", "lee-sang-hwa", "Lee Sang-hwa", "LS", "KR", "asia", { qid: "lee-sang-hwa-seoul", type: "birthplace", diff: "easy", chapter: born,
 question: "Speed skater Lee Sang-hwa was born in which capital city?", clue: "On the Han River.", hint: "South Korea's capital.",
 city: "Seoul", country: "South Korea", code: "KR", geocode: "Seoul",
 story: "South Korean speed skater Lee Sang-hwa was born in Seoul on 25 February 1989.",
 quotes: [[OL + "110124", "Born 25 February 1989 in Seoul, Seoul (KOR)"]] });

require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-20.json"),
 JSON.stringify({ batch: 20, researched: "2026-10-18", coordinateSource: "OpenStreetMap Nominatim", entries, memberships: [] }, null, 1) + "\n");
console.log(entries.length, "entries");
