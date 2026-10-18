// Batch 21 — Music expansion 2A-1: Amapiano, Rock, Reggae / Dancehall, Country to 15 stars each.
// Source of src/content/batches/batch-21.json (run: node docs/content-research/batch-21.src.cjs).
// Every quote was copied from the fetched page text (18 October 2026). No lyrics or song excerpts are used.
// Authoritative: Country Music Hall of Fame, Rock & Roll Hall of Fame library, Recording Academy (grammy.com), Jamaica
// Information Service, Government of Argentina, Canada's Walk of Fame. Primary: santana.com, acdc.com, yoshiki.net.
// Reputable secondary: Billboard, Rolling Stone, ABC (Australia), Jamaica Gleaner, Jamaica Observer, Jeune Afrique,
// SA History Online, TimesLIVE, The Citizen, OkayAfrica, Pan African Music. News24 and IOL block fetching, so no quote rests on them.
// Location choices: hometown or career locations replace birthplaces that are disputed or only region-level (Tina Turner,
// Kabza De Small, Spice, Yoshiki, Chris Stapleton, Hank Williams); Jimmy Cliff's Somerton (St James) is not mapped, so
// his question uses the Montego Bay boulevard named for him; Shaggy's uses the Brooklyn scene where he made his name.
// Swapped during research: Daliwonga (no hometown source), Nkosazana Daughter (no fetchable source), Lady Du (only a
// blocked source), DBN Gogo (origin disputed) → Aymos, Boohle, JAZZWRLD; Babalwa M kept (Protea Glen, Soweto).
const AUTH = ["countrymusichalloffame.org", "rockhall.com", "grammy.com", "jis.gov.jm", "argentina.gob.ar", "canadaswalkoffame.com"];
const PRIMARY = ["santana.com", "acdc.com", "yoshiki.net"];
const quality = url => { const host = new URL(url).hostname.replace(/^www\./, ""); const m = d => host === d || host.endsWith("." + d); return PRIMARY.some(m) ? "primary" : AUTH.some(m) ? "authoritative" : "reputable_secondary"; };
const entries = [];
const S = (sub, display, id, name, mono, cc, region, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.kind ? { kind: q.kind } : {}), ...(q.current ? { tags: ["current"] } : {}) },
 question: { id: q.qid, primaryCategory: "music", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: display, chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, geocode: q.geocode }, story: q.story,
  sources: q.quotes.map(([url, quote], i) => ({ url, role: i ? "extra" : "primary", quality: quality(url), quote })),
  ...(q.notes ? { notes: q.notes } : {}) },
});
const born = "Where the story began", home = "Growing up", win = "The big moment", early = "Before the breakthrough";
const ZA = ["South Africa", "ZA"], US = ["United States", "US"], JM = ["Jamaica", "JM"], GB = ["United Kingdom", "GB"];
const CMHOF = "https://www.countrymusichalloffame.org/hall-of-fame/", OKA = "https://www.okayafrica.com/", TL = "https://www.timeslive.co.za/";

// ── Amapiano ────────────────────────────────────────────────────
const P = (...a) => S("amapiano", "Amapiano", ...a);
P("kabza-de-small", "Kabza De Small", "KS", "ZA", "africa", { qid: "kabza-de-small-pretoria", type: "hometown", diff: "medium", chapter: home, current: true,
 question: "Amapiano pioneer Kabza De Small hails from which South African city?", clue: "One of South Africa's capitals; locals call it 'Pitori'.", hint: "Famous for its jacaranda trees.",
 city: "Pretoria", country: ZA[0], code: ZA[1], geocode: "Pretoria",
 story: "Kabza De Small hails from Pretoria and is one of amapiano's pioneers, gaining attention around 2018.",
 quotes: [["https://pan-african-music.com/en/kabza-de-small-koa-ii-part1/", "hailing from Pretoria, he is one of the genre’s pioneers"]] });
P("kelvin-momo", "Kelvin Momo", "KM", "ZA", "africa", { qid: "kelvin-momo-soweto", type: "birthplace", diff: "medium", chapter: born, current: true,
 question: "Amapiano producer Kelvin Momo was born in which Johannesburg township?", clue: "South-west of central Johannesburg; its name is an abbreviation.", hint: "Home of Vilakazi Street.",
 city: "Soweto", country: ZA[0], code: ZA[1], geocode: "Soweto",
 story: "Kelvin Momo, known for his 'private school' amapiano sound, is Soweto-born.",
 quotes: [[TL + "tshisa-live/2025-12-29-kelvin-momo-misses-or-tambo-homage-concert-gig-issues-apology/", "The Soweto-born hitmaker confirmed his absence through an official statement"],
  ["https://www.citizen.co.za/lifestyle/entertainment/watch-kelvin-momo-on-private-school-amapiano-and-red-bull-symphonic-hype/", "The 31-year-old from Soweto was officially announced today as one of the headline acts for the Red Bull Symphonic"]] });
P("young-stunna", "Young Stunna", "YS", "ZA", "africa", { qid: "young-stunna-daveyton", type: "hometown", diff: "hard", chapter: home, current: true,
 question: "Amapiano vocalist Young Stunna comes from which township on Johannesburg's East Rand?", clue: "In Ekurhuleni, east of Johannesburg.", hint: "It starts with 'Davey'.",
 city: "Daveyton", country: ZA[0], code: ZA[1], geocode: "Daveyton, Ekurhuleni",
 story: "Daveyton, on the East Rand, has produced its own amapiano vocal lineage, from Gaba Cannal to Young Stunna.",
 quotes: [[OKA + "jazzwrld-and-thukuthela-made-3-step-the-sound-of-now/1431397", "Daveyton has also produced an Amapiano vocal lineage in its own right, from Gaba Cannal to Young Stunna and Scotts Maphuma"]] });
P("kamo-mphela", "Kamo Mphela", "KM", "ZA", "africa", { qid: "kamo-mphela-soweto", type: "event_location", diff: "medium", chapter: win, current: true,
 question: "Kamo Mphela gained many new fans when a video of her dancing in the streets of which township went viral?", clue: "Johannesburg's best-known township.", hint: "Home of Orlando Stadium.",
 city: "Soweto", country: ZA[0], code: ZA[1], geocode: "Soweto",
 story: "Dancer and singer Kamo Mphela won many new fans when a video of her dancing in the streets of Soweto went viral.",
 quotes: [[TL + "tshisa-live/tshisa-live/2019-11-15-listen--kamo-mphela-if-youre-doing-normal-things-people-wont-see-you-as-different/", "Kamo gained many new fans when a video of her dancing in the streets in Soweto went viral."]] });
P("aymos", "Aymos", "AY", "ZA", "africa", { qid: "aymos-tembisa", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Amapiano vocalist Aymos was born in which Johannesburg-area township?", clue: "A large township in Ekurhuleni, north of OR Tambo airport.", hint: "Also spelled Thembisa.",
 city: "Tembisa", country: ZA[0], code: ZA[1], geocode: "Tembisa",
 story: "Aymos (Amos Babili Shili) was born in the township of Thembisa, formerly spelled Tembisa.",
 notes: ["Nominatim's Tembisa point is the township's railway station, inside Thembisa."],
 quotes: [[OKA + "interview-aymos-brings-soulful-vocals-and-substance-to-amapiano/105825", "in the Joburg township of Thembisa (formerly Tembisa), the 24-year-old musician has been trying to break into the music industry for years"]] });
P("vigro-deep", "Vigro Deep", "VD", "ZA", "africa", { qid: "vigro-deep-atteridgeville", type: "hometown", diff: "hard", chapter: home, current: true,
 question: "Amapiano producer Vigro Deep is from which Pretoria township?", clue: "West of central Pretoria.", hint: "It starts with 'Atteridge'.",
 city: "Atteridgeville", country: ZA[0], code: ZA[1], geocode: "Atteridgeville, Pretoria",
 story: "Vigro Deep, the amapiano producer who took his sound to New York, is from Atteridgeville in Pretoria.",
 quotes: [[TL + "sunday-times-daily/lifestyle/2025-04-22-amapiano-star-vigro-deep-takes-over-the-big-apple/", "the 23-year-old star from Atteridgeville, Pretoria, said"]] });
P("babalwa-m", "Babalwa M", "BM", "ZA", "africa", { qid: "babalwa-m-protea-glen", type: "hometown", diff: "hard", chapter: home, current: true,
 question: "Amapiano singer Babalwa M was raised in Protea Glen, part of which township?", clue: "Johannesburg's famous south-western township.", hint: "Its name stands for South Western Townships.",
 city: "Soweto (Protea Glen)", country: ZA[0], code: ZA[1], geocode: "Protea Glen, Soweto",
 story: "Babalwa M was raised in Protea Glen, Soweto, and sang in church before becoming an amapiano star.",
 quotes: [[TL + "news/south-africa/2026-07-17-from-journalism-student-to-sama-history-maker-5-things-to-know-about-babalwa-m/", "Raised in Protea Glen, Soweto, Babalwa had never planned to become a recording artist, despite singing in church and at community events growing up."]] });
P("boohle", "Boohle", "BO", "ZA", "africa", { qid: "boohle-vosloorus", type: "hometown", diff: "legend", chapter: home, current: true,
 question: "Amapiano vocalist Boohle's story begins in which township east of Johannesburg?", clue: "In Ekurhuleni, near Boksburg.", hint: "It starts with 'Voslo'.",
 city: "Vosloorus", country: ZA[0], code: ZA[1], geocode: "Vosloorus, Ekurhuleni",
 story: "Boohle's story begins in Vosloorus, east of Johannesburg, where gospel harmonies shaped her first understanding of music.",
 quotes: [[OKA + "best-female-amapiano-artists-vocalists-in-2025/1413686", "story begins in Vosloorus, east of Johannesburg, where gospel harmonies and Sunday devotion shaped her first understanding of music"]] });
P("jazzwrld", "JAZZWRLD", "JW", "LS", "africa", { qid: "jazzwrld-carletonville", type: "hometown", diff: "legend", chapter: home, current: true,
 question: "Lesotho-born producer JAZZWRLD grew up in which gold-mining town on South Africa's West Rand?", clue: "At the western end of the Witwatersrand gold reef.", hint: "It starts with 'Carleton'.",
 city: "Carletonville", country: ZA[0], code: ZA[1], geocode: "Carletonville, Gauteng",
 story: "Lesotho-born, South Africa-raised JAZZWRLD came up in Carletonville, at the western end of the gold reef, and helped make 3-Step the sound of South Africa.",
 quotes: [[OKA + "jazzwrld-and-thukuthela-made-3-step-the-sound-of-now/1431397", "His path from Lesotho to Carletonville traces a well-worn route for Basotho families before him."],
  [OKA + "jazzwrld-and-thukuthela-made-3-step-the-sound-of-now/1431397", "The Lesotho-born, South Africa-raised JAZZWRLD is one of the most exciting producers right now."]] });
P("sha-sha", "Sha Sha", "SS", "ZW", "africa", { qid: "sha-sha-mutare", type: "career_location", diff: "hard", chapter: early,
 question: "Zimbabwean amapiano singer Sha Sha named a song after the city where her artistic path became clear. Which city?", clue: "In eastern Zimbabwe, near the Mozambique border.", hint: "Capital of Manicaland province.",
 city: "Mutare", country: "Zimbabwe", code: "ZW", geocode: "Mutare",
 story: "Sha Sha lived with her aunt in Mutare, the Zimbabwean city where her artistic path became clear — and later named a song after it.",
 quotes: [[OKA + "sha-sha-interview-recent-projects/", "\"Mutare,\" named from the Zimbabwean city where she lived when her artistic path became clear, is the sharpest look at Sha Sha as an artist on the EP."],
  [OKA + "sha-sha-interview-recent-projects/", "From that point I remember I moved and I stayed with my aunt in Mutare for a while."]] });

// ── Rock ────────────────────────────────────────────────────────
const K = (...a) => S("rock", "Rock", ...a);
K("chuck-berry", "Chuck Berry", "CB", "US", "north-america", { qid: "chuck-berry-st-louis", type: "hometown", diff: "medium", chapter: home,
 question: "Rock and roll pioneer Chuck Berry was a native of which Missouri city?", clue: "On the Mississippi, home of the Gateway Arch.", hint: "Named after a French king.",
 city: "St. Louis", country: US[0], code: US[1], geocode: "St. Louis, Missouri",
 story: "The St. Louis native blended country, blues and R&B into a singular guitar style.",
 quotes: [["https://library.rockhall.com/chuck_berry", "The St. Louis native internalized country, blues and R&B influences to create a singular guitar technique."]] });
K("jimi-hendrix", "Jimi Hendrix", "JH", "US", "north-america", { qid: "jimi-hendrix-seattle", type: "birthplace", diff: "easy", chapter: born,
 question: "Jimi Hendrix was born in which Pacific Northwest city?", clue: "Home of the Space Needle.", hint: "Washington State's largest city.",
 city: "Seattle", country: US[0], code: US[1], geocode: "Seattle, Washington",
 story: "The Seattle-born guitarist paired awe-inspiring tone and feel with songs that balanced experimentation and tradition.",
 quotes: [["https://library.rockhall.com/c.php?g=87201", "The Seattle-born musician always paired awe-inspiring tone and feel with incomparable songs which struck a balance between experimentation and tradition."]] });
K("tina-turner", "Tina Turner", "TT", "US", "north-america", { qid: "tina-turner-nutbush", type: "hometown", diff: "medium", chapter: home,
 question: "Tina Turner's journey began in which small Tennessee community — later the title of one of her hits?", clue: "A rural community in Haywood County, west Tennessee.", hint: "Its 'City Limits' became a 1973 song.",
 city: "Nutbush", country: US[0], code: US[1], geocode: "Nutbush, Tennessee",
 story: "Tina Turner's journey began in Nutbush, Tennessee — the place she later celebrated in 'Nutbush City Limits' (1973).",
 notes: ["Hometown used: sources differ on Brownsville vs Nutbush as her exact birthplace; Nutbush as her childhood home is uncontested."],
 quotes: [["https://www.billboard.com/music/music-news/tina-turner-dead-obituary-7318783/", "Turner’s journey began in Nutbush, Tenn."],
  ["https://www.billboard.com/music/music-news/tina-turner-dead-obituary-7318783/", "The pair’s last major hit together was the Tina-penned “Nutbush City Limits” in 1973."]] });
K("ozzy-osbourne", "Ozzy Osbourne", "OO", "GB", "europe", { qid: "ozzy-osbourne-aston", type: "birthplace", diff: "medium", chapter: born,
 question: "Black Sabbath's Ozzy Osbourne was born in the Aston area of which English city?", clue: "England's second-largest city, in the West Midlands.", hint: "Locals are called 'Brummies'.",
 city: "Birmingham (Aston)", country: GB[0], code: GB[1], geocode: "Aston, Birmingham",
 story: "John Michael 'Ozzy' Osbourne was born on 3 December 1948 in the Aston area of Birmingham, England.",
 quotes: [["https://www.billboard.com/music/rock/ozzy-osbourne-death-black-sabbath-7325247/", "John Michael Osbourne was born on Dec. 3, 1948, in the Aston area of Birmingham, England."]] });
K("carlos-santana", "Carlos Santana", "CS", "MX", "latin-america", { qid: "carlos-santana-autlan", type: "birthplace", diff: "hard", chapter: born,
 question: "Carlos Santana was born in which town in Jalisco, Mexico, that named him its 'Favorite Son'?", clue: "In western Jalisco, inland from the Pacific coast.", hint: "Autlán de ___.",
 city: "Autlán de Navarro", country: "Mexico", code: "MX", geocode: "Autlán de Navarro, Jalisco",
 story: "In 2001 Carlos Santana returned to Autlán, his place of birth, where he received the keys to the city and was named its 'Favorite Son'.",
 quotes: [["https://santana.com/news/autlans-favorite-son/", "The day started with Carlos & his family traveling back to Autlan, his place of birth, where he was presented the “Keys to the City” and named the “Favorite Son of Autlan”."]] });
K("gustavo-cerati", "Gustavo Cerati", "GC", "AR", "latin-america", { qid: "gustavo-cerati-buenos-aires", type: "birthplace", diff: "medium", chapter: born,
 question: "Soda Stereo frontman Gustavo Cerati was born in which South American capital?", clue: "On the Río de la Plata.", hint: "Argentina's capital.",
 city: "Buenos Aires", country: "Argentina", code: "AR", geocode: "Buenos Aires",
 story: "Gustavo Cerati, who led Soda Stereo to international recognition, was born in the City of Buenos Aires on 11 August 1959.",
 quotes: [["https://www.argentina.gob.ar/noticias/gustavo-cerati-una-fuerza-natural", "El 11 de agosto de 1959 nació en la Ciudad de Buenos Aires Gustavo Cerati"],
  ["https://www.argentina.gob.ar/noticias/cerati-infinito", "Se cumplen 64 del nacimiento del músico argentino Gustavo Cerati, quien consiguió reconocimiento internacional por liderar Soda Stereo"]] });
K("rita-lee", "Rita Lee", "RL", "BR", "latin-america", { qid: "rita-lee-sao-paulo", type: "birthplace", diff: "medium", chapter: born,
 question: "Rita Lee, the 'Queen of Brazilian Rock', was born in which city?", clue: "Brazil's largest city.", hint: "Its name honours Saint Paul.",
 city: "São Paulo", country: "Brazil", code: "BR", geocode: "São Paulo, São Paulo",
 story: "Rita Lee was born in São Paulo on 31 December 1947, grew up there, and began her career with the band Os Mutantes.",
 quotes: [["https://www.rollingstone.com/music/music-news/rita-lee-os-mutantes-dead-obituary-1234732216/", "Rita Lee Jones was born Dec. 31, 1947 in São Paulo, where she grew up."],
  ["https://www.billboard.com/music/latin/rita-lee-dead-queen-of-brazilian-rock-dies-1235325256/", "Born on December 31, 1947 in São Paulo, Lee began her career with the band Os Mutantes"]] });
K("angus-young", "Angus Young", "AY", "AU", "oceania", { qid: "angus-young-glasgow", type: "birthplace", diff: "hard", chapter: "Born abroad",
 question: "AC/DC guitarist Angus Young was born in which Scottish city?", clue: "Scotland's largest city, on the River Clyde.", hint: "Not the capital — the other big one.",
 city: "Glasgow", country: GB[0], code: GB[1], geocode: "Glasgow",
 story: "Angus Young, AC/DC's lead guitarist, was born in Glasgow on 31 March 1955.",
 quotes: [["https://www.acdc.com/otd-1955-angus-young/", "OTD 31 Mar. 1955: Angus Young born in Glasgow."]] });
K("yoshiki", "Yoshiki", "YO", "JP", "asia", { qid: "yoshiki-tateyama", type: "hometown", diff: "legend", chapter: home,
 question: "X Japan founder Yoshiki's hometown is which beach city on Tokyo Bay in Chiba Prefecture?", clue: "At the southern tip of the Bōsō Peninsula.", hint: "It starts with 'Tate'.",
 city: "Tateyama", country: "Japan", code: "JP", geocode: "Tateyama, Chiba",
 story: "X Japan's Yoshiki grew up in Tateyama, Chiba, where his ballad 'Forever Love' plays on the local disaster-prevention radio system.",
 notes: ["Hometown used: sources give only Chiba Prefecture as his birthplace."],
 quotes: [["https://www.yoshiki.net/news/forever-love-music-video", "The song is also deeply rooted in YOSHIKI's hometown of Tateyama City, Chiba Prefecture, where it plays on the local disaster-prevention radio system"],
  ["https://www.rollingstone.com/music/music-news/x-japans-incredible-ride-meet-rocks-most-flamboyant-survivors-58969/", "dates back to their founder’s childhood in the Tokyo Bay beach town of Tateyama, Chiba"]] });
K("damiano-david", "Damiano David", "DD", "IT", "europe", { qid: "damiano-david-rotterdam", type: "event_location", diff: "medium", chapter: win, current: true,
 question: "Damiano David's band Måneskin won Eurovision 2021 with a rock song in which city?", clue: "Europe's biggest port, in the Netherlands.", hint: "The final was held at its Ahoy arena.",
 city: "Rotterdam", country: "Netherlands", code: "NL", geocode: "Rotterdam",
 story: "Måneskin, fronted by Damiano David, won the 2021 Eurovision Song Contest at the Ahoy in Rotterdam with rock.",
 quotes: [["https://www.billboard.com/music/music-news/maneskin-eurovision-winners-interview-9579875/", "Italy's Måneskin pose for pictures on stage with the trophy after winning the final of the 65th edition of the Eurovision Song Contest 2021, at the Ahoy convention centre in Rotterdam, on May 22, 2021."],
  ["https://www.billboard.com/music/music-news/maneskin-eurovision-winners-interview-9579875/", "We love rock arrangements but also like to match them with Damiano’s melodic, pop-oriented lines, or with hip-hop elements."]] });

// ── Reggae / Dancehall ──────────────────────────────────────────
const R = (...a) => S("reggae-dancehall", "Reggae", ...a);
R("jimmy-cliff", "Jimmy Cliff", "JC", "JM", "caribbean", { qid: "jimmy-cliff-montego-bay", type: "famous_place", diff: "hard", chapter: "Honoured at home",
 question: "In 2019, which Jamaican city renamed its Gloucester Avenue 'Jimmy Cliff Boulevard'?", clue: "The capital of St James, Jimmy Cliff's home parish.", hint: "Jamaica's tourist 'MoBay'.",
 city: "Montego Bay", country: JM[0], code: JM[1], geocode: "Montego Bay",
 story: "Born in Somerton, St James, Jimmy Cliff helped carry reggae to the world; in 2019 Montego Bay renamed Gloucester Avenue in his honour.",
 notes: ["Somerton (St James) is not in OpenStreetMap; the documented boulevard in his home parish is used instead."],
 quotes: [["https://jis.gov.jm/govt-accords-official-funeral-for-musical-icon-jimmy-cliff/", "In March 2019, he was further honoured when Gloucester Avenue in Montego Bay was renamed Jimmy Cliff Boulevard."],
  ["https://jis.gov.jm/govt-accords-official-funeral-for-musical-icon-jimmy-cliff/", "Born in Somerton, St. James, on July 30, 1944, Jimmy Cliff rose from modest beginnings to become a central figure in Reggae’s rise to international prominence."]] });
R("toots-hibbert", "Toots Hibbert", "TH", "JM", "caribbean", { qid: "toots-hibbert-may-pen", type: "birthplace", diff: "hard", chapter: born,
 question: "Toots Hibbert of Toots and the Maytals was born in which Jamaican town?", clue: "Capital of Clarendon parish, west of Kingston.", hint: "Named after a month and a writing tool.",
 city: "May Pen", country: JM[0], code: JM[1], geocode: "May Pen, Clarendon",
 story: "Toots Hibbert was born on 8 December 1942 in May Pen, about 30 miles west of Kingston.",
 quotes: [["https://www.rollingstone.com/music/music-news/toots-hibbert-maytals-dead-1053716/", "Hibbert was born December 8th, 1942, in May Pen, Jamaica, a town about 30 miles west of Kingston."]] });
R("burning-spear", "Burning Spear", "BS", "JM", "caribbean", { qid: "burning-spear-st-anns-bay", type: "birthplace", diff: "hard", chapter: born,
 question: "Roots reggae artist Burning Spear was born in which Jamaican town — also Marcus Garvey's birthplace?", clue: "On Jamaica's north coast, in St Ann parish.", hint: "Saint ___'s Bay.",
 city: "St Ann's Bay", country: JM[0], code: JM[1], geocode: "St. Ann's Bay, Saint Ann",
 story: "Burning Spear, born Winston Rodney in St Ann's Bay, has devoted his career to Marcus Garvey's legacy — Garvey was born in the same town.",
 quotes: [["https://jamaica-gleaner.com/article/entertainment/20250817/burning-spears-marcus-garvey-resounds-50-years-later", "Burning Spear, born Winston Rodney in St Ann’s Bay, has dedicated his career to preserving Marcus Garvey’s legacy through reggae’s roots tradition."],
  ["https://jamaica-gleaner.com/article/entertainment/20250817/burning-spears-marcus-garvey-resounds-50-years-later", "Garvey was born in St Ann's Bay on August 17, 1887, 138 years ago today."]] });
R("marcia-griffiths", "Marcia Griffiths", "MG", "JM", "caribbean", { qid: "marcia-griffiths-kingston", type: "birthplace", diff: "medium", chapter: born,
 question: "Reggae singer Marcia Griffiths was born in which city?", clue: "Jamaica's capital.", hint: "Its harbour is one of the world's largest natural harbours.",
 city: "Kingston", country: JM[0], code: JM[1], geocode: "Kingston, Jamaica",
 story: "Marcia Griffiths was born in West Kingston and began performing in 1964 with Byron Lee and the Dragonaires.",
 quotes: [["https://www.jamaicaobserver.com/2024/11/01/royal-celebration-marcia/", "Born in West Kingston, Jamaica, Griffiths started her career in 1964 performing on stage with Byron Lee and the Dragonaires"]] });
R("shaggy", "Shaggy", "SH", "JM", "caribbean", { qid: "shaggy-brooklyn", type: "career_location", diff: "medium", chapter: early,
 question: "Kingston-born Shaggy first made his name as a deejay on the dancehall circuit of which New York borough?", clue: "Across the East River from Manhattan.", hint: "Home of Flatbush and Coney Island.",
 city: "Brooklyn", country: US[0], code: US[1], geocode: "Brooklyn, New York",
 story: "Born in Kingston, Shaggy first made his name as a deejay on the Brooklyn dancehall circuit before 'Boombastic' carried dancehall into the mainstream.",
 quotes: [["https://www.grammy.com/news/shaggy-boombastic-brought-dancehall-mainstream-anniversary-interview/", "Shaggy initially made his name as a deejay (an emcee who chants or \"toasts\" lyrics in Jamaican patois) on the Brooklyn dancehall circuit."],
  ["https://jamaica-gleaner.com/article/entertainment/20201022/happy-birthday-shaggy-reggae-artiste-living-his-purpose", "Shaggy, who was born in Kingston, Jamaica, on October 22, 1968"]] });
R("beenie-man", "Beenie Man", "BM", "JM", "caribbean", { qid: "beenie-man-waterhouse", type: "birthplace", diff: "hard", chapter: born,
 question: "Dancehall star Beenie Man was born in the musically fertile Waterhouse area of which city?", clue: "Also home of King Tubby and King Jammy.", hint: "Jamaica's capital.",
 city: "Kingston (Waterhouse)", country: JM[0], code: JM[1], geocode: "Kingston, Jamaica",
 story: "Beenie Man was born in Waterhouse, Kingston — home to dub creator King Tubby, King Jammy and Black Uhuru.",
 notes: ["Waterhouse is not mapped as a place in OpenStreetMap; Kingston's coordinates are used."],
 quotes: [["https://www.grammy.com/news/beenie-man-interview-dancehall-king-visa-status-tour/", "Beenie Man was born Moses Davis on Aug. 22, 1973 in the musically fertile Waterhouse area of Kingston, home to the late dub creator King Tubby, digital riddim innovator King Jammy and winners of the inaugural Best Reggae Album GRAMMY, vocal trio Black Uhuru"]] });
R("spice", "Spice", "SP", "JM", "caribbean", { qid: "spice-portmore", type: "hometown", diff: "medium", chapter: home, current: true,
 question: "Dancehall star Spice grew up in Old Braeton, in which Jamaican city?", clue: "A city across the harbour from Kingston, in St Catherine.", hint: "It starts with 'Port'.",
 city: "Portmore", country: JM[0], code: JM[1], geocode: "Portmore, Saint Catherine",
 story: "Spice grew up in Old Braeton, Portmore, where her mother sold fish at her restaurant by the water.",
 notes: ["Hometown used: published birthplaces differ (Spanish Town vs Portmore)."],
 quotes: [["https://jamaica-gleaner.com/article/entertainment/20211023/grace-spice-hamilton-flows-spicy-digital-marketing-presentation", "although she grew up in poverty in Old Braeton in Portmore, her entrepreneurial spirit was ignited by her mother, who used to catch fish and sell it at her restaurant by the water"]] });
R("chronixx", "Chronixx", "CX", "JM", "caribbean", { qid: "chronixx-spanish-town", type: "hometown", diff: "hard", chapter: home, current: true,
 question: "Reggae singer Chronixx is originally from which Jamaican town?", clue: "Jamaica's former capital, in St Catherine.", hint: "Named after a European country.",
 city: "Spanish Town", country: JM[0], code: JM[1], geocode: "Spanish Town, Jamaica",
 story: "Chronixx, born Jamar McNaughton, is originally from Spanish Town and attended St Catherine High School.",
 quotes: [["https://www.jamaicaobserver.com/2024/09/20/chronixx-collaboration-free-nationals-goes-gold-america/", "Born Jamar McNaughton, Chronixx is originally from Spanish Town."]] });
R("alpha-blondy", "Alpha Blondy", "AB", "CI", "africa", { qid: "alpha-blondy-dimbokro", type: "birthplace", diff: "legend", chapter: born,
 question: "Ivorian reggae star Alpha Blondy was born in which town east of Yamoussoukro?", clue: "In central Côte d'Ivoire, about 80 km east of the capital.", hint: "It starts with 'Dimbo'.",
 city: "Dimbokro", country: "Côte d'Ivoire", code: "CI", geocode: "Dimbokro",
 story: "Alpha Blondy, born Seydou Koné, is a child of Dimbokro, about 80 km east of Yamoussoukro, and was raised by his grandmother.",
 quotes: [["https://www.jeuneafrique.com/mag/602995/culture/musique-le-reconciliateur-cote-divoire/", "l’enfant de Dimbokro (ville située à 80 km à l’est de Yamoussoukro) élevé par sa grand-mère"],
  ["https://business.abidjan.net/qui/40-musique/16-blondy-alpha", "Alpha Blondy, de son vrai nom Seydou Koné, est né le 1er janvier 1953 à Dimbrokro en Côte"]] });
R("lucky-dube", "Lucky Dube", "LD", "ZA", "africa", { qid: "lucky-dube-ermelo", type: "birthplace", diff: "hard", chapter: born,
 question: "South African reggae star Lucky Dube was born on a farm near which Mpumalanga town?", clue: "In the eastern Highveld of Mpumalanga.", hint: "It starts with 'Erm'.",
 city: "Ermelo", country: ZA[0], code: ZA[1], geocode: "Ermelo, Mpumalanga",
 story: "Lucky Dube was born on a small farm near Ermelo in the eastern Transvaal, now Mpumalanga.",
 quotes: [["https://sahistory.org.za/people/lucky-philip-dube", "Lucky Dube was born on a small farm near Ermelo in the eastern Transvaal (now Mpumalanga)."]] });

// ── Country ─────────────────────────────────────────────────────
const C = (...a) => S("country", "Country", ...a);
C("hank-williams", "Hank Williams", "HW", "US", "north-america", { qid: "hank-williams-montgomery", type: "career_location", diff: "medium", chapter: early,
 question: "After the war, Hank Williams became the biggest hillbilly music star in which Alabama city?", clue: "Alabama's state capital.", hint: "It starts with 'Mont'.",
 city: "Montgomery", country: US[0], code: US[1], geocode: "Montgomery, Alabama",
 story: "Hank Williams' mother moved the family to Montgomery in 1937; after the war he re-formed the Drifting Cowboys and became the city's biggest hillbilly star.",
 quotes: [[CMHOF + "hank-williams", "In December 1944, he married Audrey Mae Sheppard, and, after the war, he reformed the Drifting Cowboys and became the biggest hillbilly music star in Montgomery."],
  [CMHOF + "hank-williams", "Hank’s mother, Lillie, moved the family to Greenville and then, in 1937, to Montgomery, Alabama."]] });
C("patsy-cline", "Patsy Cline", "PC", "US", "north-america", { qid: "patsy-cline-winchester", type: "birthplace", diff: "hard", chapter: born,
 question: "Patsy Cline was born in which Virginia city?", clue: "In the Shenandoah Valley, famous for apples.", hint: "It shares its name with an English cathedral city.",
 city: "Winchester", country: US[0], code: US[1], geocode: "Winchester, Virginia",
 story: "Patsy Cline was born Virginia Patterson Hensley in Winchester, Virginia, during the Great Depression.",
 quotes: [[CMHOF + "patsy-cline", "Born Virginia Patterson Hensley in Winchester, Virginia, during the Great Depression, “Ginny,” as she was known in her youth, demonstrated musical proclivity at an early age"]] });
C("loretta-lynn", "Loretta Lynn", "LL", "US", "north-america", { qid: "loretta-lynn-butcher-hollow", type: "hometown", diff: "hard", chapter: home,
 question: "'Coal Miner's Daughter' Loretta Lynn grew up in which rural Kentucky coal town?", clue: "In Johnson County, in Kentucky's eastern coalfields.", hint: "Locals say 'Holler'.",
 city: "Butcher Hollow", country: US[0], code: US[1], geocode: "Butcher Hollow, Kentucky",
 story: "Loretta Lynn was born in a one-room log cabin; her father was a coal miner in the rural coal town of Butcher Holler, Kentucky.",
 quotes: [[CMHOF + "loretta-lynn", "Her father was a coal miner in the rural coal town of Butcher Holler."],
  [CMHOF + "loretta-lynn", "She was born Loretta Webb in a one-room log cabin and was the second of eight children."]] });
C("willie-nelson", "Willie Nelson", "WN", "US", "north-america", { qid: "willie-nelson-abbott", type: "birthplace", diff: "legend", chapter: born,
 question: "Willie Nelson was born in which small Texas town?", clue: "In Hill County, between Waco and Dallas.", hint: "It shares its name with a comedy duo partner.",
 city: "Abbott", country: US[0], code: US[1], geocode: "Abbott, Texas",
 story: "Willie Nelson was born on 29 April 1933 in Abbott, Texas.",
 quotes: [[CMHOF + "willie-nelson", "Birthplace: Abbott, Texas"]] });
C("charley-pride", "Charley Pride", "CP", "US", "north-america", { qid: "charley-pride-sledge", type: "birthplace", diff: "legend", chapter: born,
 question: "Charley Pride was born on a cotton farm in which Mississippi town?", clue: "In the Mississippi Delta, fifty miles south of Memphis.", hint: "A winter vehicle.",
 city: "Sledge", country: US[0], code: US[1], geocode: "Sledge, Mississippi",
 story: "Charley Pride, son of a sharecropper, was born on a forty-acre cotton farm in Sledge, Mississippi.",
 quotes: [[CMHOF + "charley-pride", "Raised in the segregated South as the son of a sharecropper, Charley Frank Pride was born on a forty-acre cotton farm in Sledge, Mississippi, fifty miles south of Memphis."]] });
C("shania-twain", "Shania Twain", "ST", "CA", "north-america", { qid: "shania-twain-timmins", type: "hometown", diff: "medium", chapter: home,
 question: "Shania Twain grew up in which northern Ontario mining city — her mother's hometown?", clue: "A gold-mining city in Northeastern Ontario.", hint: "It starts with 'Tim'.",
 city: "Timmins", country: "Canada", code: "CA", geocode: "Timmins, Ontario",
 story: "Born in Windsor, Ontario, Shania Twain moved as a child to her mother's hometown of Timmins and later returned there to raise her siblings.",
 quotes: [["https://www.canadaswalkoffame.com/inductees/shania-twain/", "Born Eilleen Regina Edwards in Windsor, Ontario, in 1965, she moved to her mom’s hometown of Timmins as a child after her parents divorced."]] });
C("slim-dusty", "Slim Dusty", "SD", "AU", "oceania", { qid: "slim-dusty-kempsey", type: "birthplace", diff: "hard", chapter: born,
 question: "Australian country legend Slim Dusty was born at Nulla Nulla Creek, near which NSW town?", clue: "On the Macleay River, on the NSW mid-north coast.", hint: "It starts with 'Kemp'.",
 city: "Kempsey", country: "Australia", code: "AU", geocode: "Kempsey, NSW 2440",
 story: "Slim Dusty was born at Nulla Nulla Creek, near Kempsey on the NSW mid-north coast, in 1927.",
 quotes: [["https://www.abc.net.au/news/2013-06-13/slim-dusty-day-campaign-gathers-momentum/4750932", "in support of the man who was born at Nulla Nulla Creek near Kempsey in 1927."]] });
C("chris-stapleton", "Chris Stapleton", "CS", "US", "north-america", { qid: "chris-stapleton-johnson-county", type: "hometown", diff: "legend", chapter: home, current: true,
 question: "Chris Stapleton was raised in which rural, mountainous county in eastern Kentucky?", clue: "Coal country, also home of Loretta Lynn's Butcher Holler.", hint: "It shares its name with a US president.",
 city: "Johnson County", country: US[0], code: US[1], geocode: "Johnson County, Kentucky",
 story: "Chris Stapleton was born in 1978 and raised in rural, mountainous Johnson County, in eastern Kentucky.",
 quotes: [["https://www.countrymusichalloffame.org/press/releases/country-music-hall-of-fame-and-museum-to-open-new-exhibition-chris-stapleton-since-1978-presented-by-ram-trucks", "Stapleton was born April 15, 1978, and raised in rural, mountainous Johnson County, in eastern Kentucky."]] });
C("kacey-musgraves", "Kacey Musgraves", "KM", "US", "north-america", { qid: "kacey-musgraves-golden", type: "birthplace", diff: "legend", chapter: born, current: true,
 question: "Kacey Musgraves was born in which tiny East Texas town?", clue: "In Wood County, East Texas.", hint: "A precious metal.",
 city: "Golden", country: US[0], code: US[1], geocode: "Golden, Texas",
 story: "Kacey Musgraves was born on 21 August 1988 in Golden, Texas.",
 quotes: [["https://www.grammy.com/artists/kacey-musgraves/18025/", "Born Kacey Lee Musgraves on Aug. 21, 1988 in Golden, Texas"]] });
C("lainey-wilson", "Lainey Wilson", "LW", "US", "north-america", { qid: "lainey-wilson-baskin", type: "hometown", diff: "legend", chapter: home, current: true,
 question: "Lainey Wilson's hometown is which small farming town in northeastern Louisiana?", clue: "In Franklin Parish, a town of a few hundred people.", hint: "It starts with 'Bask'.",
 city: "Baskin", country: US[0], code: US[1], geocode: "Baskin, Louisiana",
 story: "Lainey Wilson's hometown is Baskin, Louisiana; she arrived in Nashville in 2011.",
 quotes: [["https://www.grammy.com/news/country-artists-rising-stars-nashville-ten-year-town-walker-hayes-lainey-wilson-hardy-ernest/", "Lainey Wilson Hometown: Baskin, LA"]] });

require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-21.json"),
 JSON.stringify({ batch: 21, researched: "2026-10-18", coordinateSource: "OpenStreetMap Nominatim", entries, memberships: [] }, null, 1) + "\n");
console.log(entries.length, "entries");
