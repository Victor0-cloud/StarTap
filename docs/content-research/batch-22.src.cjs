// Batch 22 — Music expansion 2A-2: Electronic / DJ, Global Music Icons, African Music Legends, 80s/90s Soul Legends to 15 stars each.
// Source of src/content/batches/batch-22.json (run: node docs/content-research/batch-22.src.cjs).
// Every quote was copied from the fetched page text (18 October 2026). No lyrics or song excerpts are used.
// Authoritative: Government of Argentina (argentina.gob.ar), Ville de Paris (paris.fr), Songwriters Hall of Fame,
// South African History Online, SABC News. Reputable secondary: Variety, NPR, NME, Pollstar (AP), Red Bull Music Academy,
// Interview, Mixmag, The National, Stade de France, Kiss (Hellorayo), Scottish News, DJ Times, Qobuz, The Gentleman's Journal,
// Music In Africa, Mail & Guardian, Sound On Sound, Daily Sabah, Taiwan News, Google Doodles, Al Jazeera, Encyclopedia.com
// (Contemporary Musicians), Hürriyet Daily News (AFP), Brand South Africa, Rumba on the River (Gary Stewart), The Citizen (TZ),
// MyJoyOnline, Philadelphia magazine, CBS Chicago, NewsOne, American Songwriter, TheWrap, BK Reader, Biography.com,
// Manchester History. Britannica, AllMusic, BlackPast, the Scotsman and Tokyo Weekender block fetching, so no quote rests on them.
// Location choices: hometown or career locations replace disputed or myth-laden birthplaces — Kygo (born Singapore, raised Bergen),
// Lisa Stansfield (born Manchester or Heywood by different sources; raised in Rochdale), Édith Piaf (the rue de Belleville
// "street birth" is a myth; the answer is the Hôpital Tenon in Belleville), Ralf Hütter (Kraftwerk's Kling Klang studio,
// Düsseldorf), Chaka Khan (Chaka Khan Way beside her Kenwood Academy high school), Sezen Aksu (İzmir, where she grew up),
// Franco (birthplace Sona-Bata, documented by Music In Africa). Birth dates that sources disagree on are left out of stories
// (Mbilia Bel, E.T. Mensah, Umm Kulthum).
const AUTH = ["argentina.gob.ar", "paris.fr", "songhall.org", "sahistory.org.za", "sabcnews.com"];
const quality = url => { const host = new URL(url).hostname.replace(/^www\./, ""); const m = d => host === d || host.endsWith("." + d); return AUTH.some(m) ? "authoritative" : "reputable_secondary"; };
const entries = [];
const S = (sub, display, id, name, mono, cc, region, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.current ? { tags: ["current"] } : {}) },
 question: { id: q.qid, primaryCategory: "music", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: display, chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, geocode: q.geocode }, story: q.story,
  sources: q.quotes.map(([url, quote], i) => ({ url, role: i ? "extra" : "primary", quality: quality(url), quote })),
  ...(q.notes ? { notes: q.notes } : {}) },
});
const born = "Where the story began", home = "Growing up", studio = "The studio years", base = "City base";
const US = ["United States", "US"], GB = ["United Kingdom", "GB"], ZA = ["South Africa", "ZA"], CD = ["Democratic Republic of the Congo", "CD"];
const MIA = "https://musicinafrica.net/directory/";

// ── Electronic / DJ ─────────────────────────────────────────────
const E = (...a) => S("electronic", "Electronic", ...a);
E("ralf-hutter", "Ralf Hütter", "RH", "DE", "europe", { qid: "ralf-hutter-dusseldorf", type: "career_location", diff: "medium", chapter: studio,
 question: "Kraftwerk co-founder Ralf Hütter built the band's Kling Klang studio in which German city?", clue: "On the Rhine, capital of North Rhine-Westphalia.", hint: "Its old town is called 'the longest bar in the world'.",
 city: "Düsseldorf", country: "Germany", code: "DE", geocode: "Düsseldorf",
 story: "Ralf Hütter and Florian Schneider founded Kraftwerk's Kling Klang studio in downtown Düsseldorf, the band's native city.",
 quotes: [["https://www.thenationalnews.com/arts/trans-europe-finesse-1.548122", "They founded their own studio, Kling Klang, in downtown Düsseldorf."],
  ["https://www.thenationalnews.com/arts/trans-europe-finesse-1.548122", "Another key recent development has been Kraftwerk's relocation to the new Kling Klang studio complex, on an industrial estate close to the group's native Düsseldorf"]] });
E("ryuichi-sakamoto", "Ryuichi Sakamoto", "RS", "JP", "asia", { qid: "ryuichi-sakamoto-tokyo", type: "birthplace", diff: "easy", chapter: born,
 question: "Yellow Magic Orchestra's Ryuichi Sakamoto was born in which capital city?", clue: "The world's largest metropolitan area.", hint: "Japan's capital.",
 city: "Tokyo", country: "Japan", code: "JP", geocode: "Tokyo",
 story: "Ryuichi Sakamoto was born in Tokyo in 1952; as a teenager he studied the sounds of Japan's commuter trains, presaging his electronic work.",
 quotes: [["https://variety.com/2023/music/obituaries-people-news/ryuichi-sakamoto-dead-last-emperor-1235570971/", "Born in Tokyo on January 17, 1952, Sakamoto was something of a child prodigy"],
  ["https://rafu.com/2023/04/obituary-award-winning-musician-and-composer-ryuichi-sakamoto/", "A native of Tokyo and the son of Kazuki Sakamoto"]] });
E("frankie-knuckles", "Frankie Knuckles", "FK", "US", "north-america", { qid: "frankie-knuckles-bronx", type: "birthplace", diff: "hard", chapter: born,
 question: "Before he became Chicago's 'Godfather of House', Frankie Knuckles was born in which New York City borough?", clue: "The only NYC borough mostly on the US mainland.", hint: "Home of Yankee Stadium.",
 city: "The Bronx", country: US[0], code: US[1], geocode: "The Bronx, New York",
 story: "Born in the Bronx in 1955, Frankie Knuckles DJed in New York before moving to Chicago, where The Warehouse gave house music its name.",
 quotes: [["https://www.nme.com/news/music/frankie-knuckles-4-1238544", "Born in The Bronx in 1955, he began DJing in New York in the early ’70s while he was still a teenager, before he moved to Chicago."],
  ["https://news.pollstar.com/2014/04/02/house-music-legend-frankie-knuckles-dead-at-59/", "Knuckles was born Francis Nicholls on Jan. 18, 1955, in the Bronx."]] });
E("honey-dijon", "Honey Dijon", "HD", "US", "north-america", { qid: "honey-dijon-chicago", type: "hometown", diff: "medium", chapter: home, current: true,
 question: "DJ Honey Dijon grew up on the South Side of which city during house music's heyday?", clue: "On Lake Michigan; the birthplace of house music.", hint: "The Windy City.",
 city: "Chicago", country: US[0], code: US[1], geocode: "Chicago",
 story: "Honey Dijon grew up on Chicago's South Side during house music's heyday, and its classic rhythms still guide her sound.",
 quotes: [["https://daily.redbullmusicacademy.com/2016/09/honey-dijon-feature/", "Honey Redmond grew up on the South Side of Chicago during house music’s heyday"],
  ["https://www.npr.org/2022/12/28/1145779758/serving-house-music-history-with-honey-dijon", "You are from Chicago's South Side."]] });
E("david-guetta", "David Guetta", "DG", "FR", "europe", { qid: "david-guetta-paris", type: "birthplace", diff: "easy", chapter: born, current: true,
 question: "Superstar DJ David Guetta was born in which European capital, where he began in its clubs?", clue: "On the Seine.", hint: "The City of Light.",
 city: "Paris", country: "France", code: "FR", geocode: "Paris",
 story: "David Guetta was born in Paris in 1967 and began his career in Parisian clubs in the late 1980s.",
 quotes: [["https://www.stadefrance.com/en/stadium/david-guetta-stade-de-france", "born on 7 November 1967 in Paris, is undoubtedly one of the most influential DJs and producers on the global music scene."],
  ["https://www.hellorayo.co.uk/kiss/entertainment/music/david-guetta", "David Guetta started his career at a nightclub in Paris called Broad Club."]] });
E("calvin-harris", "Calvin Harris", "CH", "GB", "europe", { qid: "calvin-harris-dumfries", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Calvin Harris began making electronic music in his bedroom in which Scottish town, where he was born?", clue: "In south-west Scotland, on the River Nith.", hint: "It shares its name with its region, '... and Galloway'.",
 city: "Dumfries", country: GB[0], code: GB[1], geocode: "Dumfries",
 story: "Calvin Harris was born Adam Wiles in Dumfries in 1984 and began making electronic music in his bedroom there.",
 quotes: [["https://www.scottishnews.com/articles/calvin-harris-at-hampden-from-dumfries-bedroom-dj-to-global-fame", "Behind it all will be Adam Richard Wiles, born in Dumfries on January 17, 1984, before reinventing himself as Calvin Harris"]] });
E("avicii", "Avicii", "AV", "SE", "europe", { qid: "avicii-stockholm", type: "hometown", diff: "easy", chapter: home,
 question: "Avicii, the producer behind 'Levels', was a native of which Scandinavian capital?", clue: "Built on 14 islands.", hint: "Sweden's capital.",
 city: "Stockholm", country: "Sweden", code: "SE", geocode: "Stockholm",
 story: "Avicii (Tim Bergling) was a Stockholm native who crossed into the mainstream with his global hit 'Levels'.",
 quotes: [["https://www.djtimes.com/2018/04/swedish-dj-avicii-dead-at-28/", "the Stockholm native would later reach superstar status crossing into the mainstream following his global hit single"]] });
E("tiesto", "Tiësto", "TI", "NL", "europe", { qid: "tiesto-breda", type: "birthplace", diff: "hard", chapter: born, current: true,
 question: "Tiësto first DJed at the Sprock club in which Dutch city, where he was born?", clue: "In North Brabant, near the Belgian border.", hint: "It starts with 'Bre'.",
 city: "Breda", country: "Netherlands", code: "NL", geocode: "Breda",
 story: "Tiësto was born Tijs Verwest in Breda in 1969 and first DJed at a hometown club called the Sprock.",
 quotes: [["https://www.qobuz.com/ca-en/interpreter/tiesto/251453", "A native of Breda, the Netherlands, Tiësto was born Tijs Verwest on January 17, 1969, and first started DJ'ing at a hometown club called the Sprock."]] });
E("kygo", "Kygo", "KY", "NO", "europe", { qid: "kygo-bergen", type: "hometown", diff: "medium", chapter: home, current: true,
 question: "Born in Singapore, tropical-house star Kygo grew up in which rainy Norwegian city?", clue: "Norway's second city, on the west coast.", hint: "Gateway to the fjords.",
 city: "Bergen", country: "Norway", code: "NO", geocode: "Bergen",
 story: "Kygo was born in Singapore, but his family moved to Bergen when he was one, and he grew up there.",
 notes: ["Hometown question: Kygo was born in Singapore and raised in Bergen."],
 quotes: [["https://www.thegentlemansjournal.com/article/at-home-with-kygo-dj-interview/", "I grew up in Bergen. I was born in Singapore actually. But my family moved here when I was one, and I’ve been living here ever since."]] });
E("nina-kraviz", "Nina Kraviz", "NK", "RU", "europe", { qid: "nina-kraviz-irkutsk", type: "hometown", diff: "legend", chapter: home, current: true,
 question: "Techno DJ Nina Kraviz found her love of techno in which Siberian hometown?", clue: "On the Angara River, near Lake Baikal.", hint: "It starts with 'Irk'.",
 city: "Irkutsk", country: "Russia", code: "RU", geocode: "Irkutsk",
 story: "Nina Kraviz found techno in her hometown of Irkutsk, listening to late-night radio, before becoming a DJ and producer.",
 quotes: [["https://mixmag.net/artist/nina-kraviz", "Kraviz’s found her love of techno in her hometown of Irkutsk, Russia"],
  ["https://www.interviewmagazine.com/music/how-russian-dj-nina-kraviz-came-to-dominate-the-techno-scene-interview", "Hailing from the riverside city of Irkutsk, Russia"]] });

// ── Global Music Icons ──────────────────────────────────────────
const G = (...a) => S("global-icons", "Global Icons", ...a);
G("umm-kulthum", "Umm Kulthum", "UM", "EG", "africa", { qid: "umm-kulthum-tamay-ez-zahayra", type: "birthplace", diff: "legend", chapter: born,
 question: "Umm Kulthum, the voice of the Arab world, was born in which Nile Delta village?", clue: "In Dakahlia Governorate, near El Senbellawein.", hint: "Its name starts with 'Tamay'.",
 city: "Tamay ez-Zahayra", country: "Egypt", code: "EG", geocode: "طماي الزهايرة",
 story: "Umm Kulthum was born in Tamay ez-Zahayra in the Nile Delta, the daughter of an imam, and moved to Cairo in the early 1920s.",
 notes: ["Geocoded from the village's Arabic name (OSM: Tamay Ez-Zahayra, Dakahlia)."],
 quotes: [[MIA + "umm-kulthum-0/", "Place of Birth: Tamay ez-Zahayra, Senbellawein, Dakahlia, Egypt"]] });
G("khaled", "Khaled", "KH", "DZ", "africa", { qid: "khaled-oran", type: "birthplace", diff: "medium", chapter: born,
 question: "Khaled, the 'King of Raï', was born in which Algerian port city — raï's birthplace?", clue: "On the Mediterranean, close to Morocco.", hint: "Algeria's second city.",
 city: "Oran", country: "Algeria", code: "DZ", geocode: "Oran",
 story: "Khaled was born in 1960 in the Algerian seaport of Oran, where he grew up with the accordion and later organised a raï festival.",
 quotes: [["https://mg.co.za/friday/2004-11-19-i-was-spat-at-and-called-a-traitor/", "Oran is the Algerian seaport, close to the Moroccan frontier, where Khaled Hadj Brahim was born in 1960."],
  ["https://www.soundonsound.com/people/khaled-algerian-rai-music", "Khaled Hadj Brahim was born on February 29th, 1960, in Oran, an Algerian port"]] });
G("googoosh", "Googoosh", "GO", "IR", "middle-east", { qid: "googoosh-tehran", type: "birthplace", diff: "easy", chapter: born,
 question: "Iranian pop icon Googoosh was born in which capital city?", clue: "At the foot of the Alborz mountains.", hint: "Iran's capital.",
 city: "Tehran", country: "Iran", code: "IR", geocode: "Tehran",
 story: "Googoosh was born Faegheh Atashin in Tehran and was acting on stage by the age of three.",
 quotes: [["https://daily.redbullmusicacademy.com/2018/04/googoosh-profile/", "Born Faegheh Atashin to Azerbaijini parents in Tehran, she started acting onstage as early as three years old."]] });
G("sezen-aksu", "Sezen Aksu", "SA", "TR", "europe", { qid: "sezen-aksu-izmir", type: "hometown", diff: "medium", chapter: home,
 question: "Sezen Aksu, 'Queen of Turkish Pop', grew up in which Aegean port city?", clue: "Turkey's third-largest city.", hint: "Ancient Smyrna.",
 city: "İzmir", country: "Turkey", code: "TR", geocode: "İzmir",
 story: "Born in Sarayköy, Sezen Aksu moved to İzmir at three; she later took music lessons from artists of İzmir Radio.",
 notes: ["Hometown question: born in Sarayköy, Denizli; her family moved to İzmir when she was three."],
 quotes: [["https://www.dailysabah.com/portrait/2018/07/28/sezen-aksu-burn-me-burn-you-burn-everything-down/amp", "The Yıldırım family moved from Sarayköy to İzmir when Sezen was three years old."],
  ["https://www.dailysabah.com/portrait/2018/07/28/sezen-aksu-burn-me-burn-you-burn-everything-down/amp", "She left school in the second year and began taking music lessons from artists of İzmir Radio."]] });
G("teresa-teng", "Teresa Teng", "TT", "TW", "asia", { qid: "teresa-teng-baozhong", type: "birthplace", diff: "legend", chapter: born,
 question: "Teresa Teng was born in which rural township of Yunlin County, Taiwan?", clue: "In Yunlin County, on Taiwan's western plain.", hint: "It starts with 'Bao'.",
 city: "Baozhong", country: "Taiwan", code: "TW", geocode: "Baozhong Township, Yunlin",
 story: "Teresa Teng was born in Baozhong Township, Yunlin, whose county government held a concert in her memory in 2026.",
 quotes: [["https://www.taiwannews.com.tw/news/6280896", "At a press conference on Monday, Magistrate Chang Li-shan (張麗善) said Teng was born in the county’s Baozhong Township."]] });
G("kyu-sakamoto", "Kyu Sakamoto", "KS", "JP", "asia", { qid: "kyu-sakamoto-kawasaki", type: "birthplace", diff: "hard", chapter: born,
 question: "'Sukiyaki' singer Kyu Sakamoto was born in which city between Tokyo and Yokohama?", clue: "In Kanagawa Prefecture, on the Tama River.", hint: "It shares its name with a motorcycle maker.",
 city: "Kawasaki", country: "Japan", code: "JP", geocode: "Kawasaki, Kanagawa",
 story: "Kyu Sakamoto was born Hisashi Oshima in Kawasaki in 1941.",
 quotes: [["https://doodles.google/doodle/celebrating-kyu-sakamoto/", "Kyu Sakamoto was born Hisashi Oshima on December 10th, 1941 in Kawasaki, Japan."]] });
G("celia-cruz", "Celia Cruz", "CC", "CU", "caribbean", { qid: "celia-cruz-havana", type: "hometown", diff: "easy", chapter: home,
 question: "Celia Cruz, the 'Queen of Salsa', studied at the music conservatory of which hometown?", clue: "A Caribbean capital famous for its vintage cars.", hint: "Cuba's capital.",
 city: "Havana", country: "Cuba", code: "CU", geocode: "Havana",
 story: "Celia Cruz studied at the Conservatory of Music in her hometown of Havana before fronting the Sonora Matancera.",
 quotes: [["https://www.aljazeera.com/news/2003/7/17/salsa-legend-dies", "The diva of Latin song studied at the Conservatory of Music in her hometown of Havana, sang on Cuban radio programmes and became the lead singer of the legendary Sonora Matancera."]] });
G("mercedes-sosa", "Mercedes Sosa", "MS", "AR", "latin-america", { qid: "mercedes-sosa-tucuman", type: "birthplace", diff: "hard", chapter: born,
 question: "Mercedes Sosa, 'the Voice of Latin America', was born in which Argentine city?", clue: "Capital of Argentina's smallest province.", hint: "Where Argentina declared independence in 1816.",
 city: "San Miguel de Tucumán", country: "Argentina", code: "AR", geocode: "San Miguel de Tucumán",
 story: "Mercedes Sosa was born on 9 July 1935 — Argentina's Independence Day — in San Miguel de Tucumán.",
 quotes: [["https://www.argentina.gob.ar/node/340628", "Al igual que nuestra independencia Mercedes Haydeé Sosa nació un 9 de julio en San Miguel de Tucumán, pero en el año 1935."]] });
G("caetano-veloso", "Caetano Veloso", "CV", "BR", "latin-america", { qid: "caetano-veloso-santo-amaro", type: "birthplace", diff: "legend", chapter: born,
 question: "Tropicália founder Caetano Veloso was born in which town in Bahia?", clue: "In the Recôncavo, near Salvador.", hint: "Its full name ends 'da Purificação'.",
 city: "Santo Amaro", country: "Brazil", code: "BR", geocode: "Santo Amaro, Bahia",
 story: "Caetano Veloso was born in 1942 in Santo Amaro da Purificação, in the Bahia region of Brazil.",
 quotes: [["https://www.encyclopedia.com/people/literature-and-arts/music-popular-and-jazz-biographies/caetano-veloso", "Santo Amaro da Purificacao, Bahia, Brazil"],
  ["https://sites.usp.br/portalatinoamericano/en/espanol-veloso-caetano", "Santo Amaro da Purificação (Brasil), 1942"]] });
G("edith-piaf", "Édith Piaf", "EP", "FR", "europe", { qid: "edith-piaf-belleville", type: "birthplace", diff: "medium", chapter: born,
 question: "Édith Piaf was born in which working-class Paris neighbourhood — the one her famous plaque celebrates?", clue: "In the 20th arrondissement, in north-east Paris.", hint: "Its name means 'beautiful town'.",
 city: "Belleville, Paris", country: "France", code: "FR", geocode: "Hôpital Tenon, Paris",
 story: "A plaque on rue de Belleville claims Piaf was born on its steps — a myth. She was actually born nearby, at the Hôpital Tenon.",
 notes: ["Answer point is the Hôpital Tenon (her documented birthplace) in Belleville, not the rue de Belleville plaque."],
 quotes: [["https://www.hurriyetdailynews.com/memories-and-melodies-of-piaf-fill-the-paris-air-56035", "Belleville, the still down-at-heel Paris neighbourhood where she was born Edith Giovanna Gassain"],
  ["https://www.paris.fr/pages/une-balade-sur-les-pas-d-edith-piaf-18776", "Piaf est née plus précisément à l’hôpital Tenon, rue de la Chine"]] });

// ── African Music Legends ───────────────────────────────────────
const A = (...a) => S("african-legends", "African Legends", ...a);
A("hugh-masekela", "Hugh Masekela", "HM", "ZA", "africa", { qid: "hugh-masekela-witbank", type: "birthplace", diff: "hard", chapter: born,
 question: "Jazz trumpeter Hugh Masekela was born in which Mpumalanga coal town, now called eMalahleni?", clue: "East of Pretoria, in Mpumalanga.", hint: "Its old name starts with 'Wit'.",
 city: "Witbank (eMalahleni)", country: ZA[0], code: ZA[1], geocode: "eMalahleni, Mpumalanga",
 story: "Hugh Masekela was born on 4 April 1939 in Witbank, today's eMalahleni, in Mpumalanga.",
 quotes: [["https://sahistory.org.za/people/hugh-masekela", "Hugh Ramopolo Masekela was born on 4 April 1939 in Witbank, near Johannesburg ."]] });
A("brenda-fassie", "Brenda Fassie", "BF", "ZA", "africa", { qid: "brenda-fassie-langa", type: "birthplace", diff: "medium", chapter: born,
 question: "'Queen of African Pop' Brenda Fassie was born in which Cape Town township?", clue: "One of Cape Town's oldest townships, on the Cape Flats.", hint: "Its name means 'sun'.",
 city: "Langa", country: ZA[0], code: ZA[1], geocode: "Langa, Cape Town",
 story: "Brenda Fassie was born in Langa, near Cape Town, in 1964, and was buried there in 2004.",
 quotes: [["https://sahistory.org.za/dated-event/south-african-pop-queen-brenda-fassie-born", "Brenda Nokuzola Fassie, South African Pop Queen, was born in 1964 in Langa, a township near Cape Town."],
  ["https://www.brandsouthafrica.com/stay-updated/quick-facts/2004/brenda-township-madonna/", "Brenda Fassie, South Africa's undisputed queen of pop, was buried at her birthplace in Langa, Cape Town on Saturday 22 May 2004."]] });
A("franco-luambo", "Franco Luambo", "FL", "CD", "africa", { qid: "franco-luambo-sona-bata", type: "birthplace", diff: "legend", chapter: born,
 question: "Rumba giant Franco of TPOK Jazz was born in which town in Kongo Central, before growing up in Kinshasa?", clue: "South-west of Kinshasa, in Kongo Central.", hint: "Its name has two parts: 'Sona-...'.",
 city: "Sona-Bata", country: CD[0], code: CD[1], geocode: "Sona-Bata",
 story: "Franco was born in Sona-Bata, Kongo Central, and raised in Kinshasa, where his band became TPOK Jazz in 1971.",
 quotes: [["https://musicinafrica.net/node/385244", "Born in Sona-Bata, Kongo Central, and raised in Kinshasa"]] });
A("mbilia-bel", "Mbilia Bel", "MB", "CD", "africa", { qid: "mbilia-bel-kinshasa", type: "birthplace", diff: "medium", chapter: born,
 question: "Mbilia Bel, 'Queen of Congolese rumba', was born in which capital on the Congo River?", clue: "Africa's largest French-speaking city.", hint: "Facing Brazzaville across the river.",
 city: "Kinshasa", country: CD[0], code: CD[1], geocode: "Kinshasa",
 story: "Mbilia Bel was born in Kinshasa and sang with Tabu Ley's band Afrisa before leaving Kinshasa for Paris in 1988.",
 notes: ["Sources disagree on her birth date (10 January or 14 August 1959), so the story gives none."],
 quotes: [["https://rumbaontheriver.com/mbilia.html", "Congolese singer; born Kinshasa"],
  ["https://thecitizen.co.tz/tanzania/news/entertainment/mbilia-bel-what-tabu-ley-taught-me-about-the-business-of-music--3889428", "Mbilia left Kinshasa for Paris in 1988"]] });
A("salif-keita", "Salif Keita", "SK", "ML", "africa", { qid: "salif-keita-djoliba", type: "birthplace", diff: "legend", chapter: born,
 question: "Salif Keita, 'the Golden Voice of Africa', was born in which Malian village on the Niger?", clue: "Upriver from Bamako, on the Niger.", hint: "Its name starts with 'Djo'.",
 city: "Djoliba", country: "Mali", code: "ML", geocode: "Djoliba, Mali",
 story: "Salif Keita was born in the village of Djoliba and left for Bamako in 1967 to join the Super Rail Band.",
 quotes: [[MIA + "salif-keita/", "Keita was born in the village of Djoliba."],
  [MIA + "salif-keita/", "He left Djoliba for Bamako in 1967, where he joined the government-sponsored Super Rail Band de Bamako."]] });
A("manu-dibango", "Manu Dibango", "MD", "CM", "africa", { qid: "manu-dibango-douala", type: "birthplace", diff: "medium", chapter: born,
 question: "'Soul Makossa' saxophonist Manu Dibango was born in which Cameroonian port city?", clue: "Cameroon's largest city, on the Wouri estuary.", hint: "It shares its name with his mother's ethnic group.",
 city: "Douala", country: "Cameroon", code: "CM", geocode: "Douala",
 story: "Manu Dibango was born in 1933 in the port city of Douala; 'Kossa' means 'dance' in Douala, his mother's language.",
 quotes: [["https://www.npr.org/2020/03/24/820598340/afro-funk-saxophonist-manu-dibango-dies-of-covid-19", "Dibango was born December 12, 1933, in the port city of Douala, Cameroon; his father was a civil servant."]] });
A("oliver-mtukudzi", "Oliver Mtukudzi", "OM", "ZW", "africa", { qid: "oliver-mtukudzi-highfield", type: "birthplace", diff: "hard", chapter: born,
 question: "Zimbabwe's Oliver 'Tuku' Mtukudzi was born in which Harare township?", clue: "One of Harare's oldest high-density suburbs, south-west of the centre.", hint: "Its name means a high meadow.",
 city: "Highfield, Harare", country: "Zimbabwe", code: "ZW", geocode: "Highfield, Harare",
 story: "Oliver Mtukudzi was born in Highfield, Harare (then Salisbury), in 1952.",
 quotes: [["https://www.sabcnews.com/sabcnews/tributes-pour-in-for-mtukudzi/", "Oliver Mtukudzi was born in Highfield, formerly Salisbury in Harare in 1952."]] });
A("mulatu-astatke", "Mulatu Astatke", "MA", "ET", "africa", { qid: "mulatu-astatke-jimma", type: "birthplace", diff: "legend", chapter: born,
 question: "Mulatu Astatke, father of Ethio-jazz, was born in which south-western Ethiopian city?", clue: "In Oromia, in coffee country.", hint: "It starts with 'Ji'.",
 city: "Jimma", country: "Ethiopia", code: "ET", geocode: "Jimma",
 story: "Mulatu Astatke was born in Jimma in 1943; he fused jazz and Latin music with Ethiopian sounds to create Ethio-jazz.",
 quotes: [[MIA + "mulato-astakte/", "born 19 December 1943, Jimma, Ethiopia) is a pioneering Ethiopian musician and arranger widely regarded as the father of \"Ethio-jazz.\""]] });
A("e-t-mensah", "E.T. Mensah", "EM", "GH", "africa", { qid: "e-t-mensah-accra", type: "birthplace", diff: "medium", chapter: born,
 question: "E.T. Mensah, the 'King of Highlife', was born in which West African capital?", clue: "On the Gulf of Guinea.", hint: "Ghana's capital.",
 city: "Accra", country: "Ghana", code: "GH", geocode: "Accra",
 story: "E.T. Mensah was born in Accra in 1919 and formed the Accra Rhythmic Orchestra with his brother.",
 notes: ["Sources disagree on the day of his birth in May 1919, so the story gives only the year."],
 quotes: [["https://www.myjoyonline.com/legend-of-the-week-e-t-mensah/", "Mensah was born on the 19 th of May, 1919 in Accra, in the Gold Coast."],
  ["https://www.myjoyonline.com/legend-of-the-week-e-t-mensah/", "a group he formed with his brother, J.Y Mensah."]] });

// ── 80s / 90s Soul Legends ──────────────────────────────────────
const L = (...a) => S("soul-legends-80s-90s", "Soul Legends", ...a);
L("luther-vandross", "Luther Vandross", "LV", "US", "north-america", { qid: "luther-vandross-lower-east-side", type: "hometown", diff: "hard", chapter: home,
 question: "Luther Vandross grew up the youngest of four kids in which Manhattan neighbourhood?", clue: "Downtown Manhattan, east of the Bowery.", hint: "Its initials are LES.",
 city: "Lower East Side, New York", country: US[0], code: US[1], geocode: "Lower East Side, Manhattan",
 story: "Luther Vandross grew up the youngest of four on Manhattan's Lower East Side.",
 quotes: [["https://www.npr.org/2005/07/02/4727455/luther-vandross-r-b-legend-dies-at-54", "Luther Vandross grew up the youngest of four kids on the Lower East Side of Manhattan."]] });
L("chaka-khan", "Chaka Khan", "CK", "US", "north-america", { qid: "chaka-khan-chicago", type: "hometown", diff: "medium", chapter: "High-school years",
 question: "Chaka Khan Way runs beside her old high school, Kenwood Academy, in which city?", clue: "On Lake Michigan's south-west shore.", hint: "The Windy City.",
 city: "Chicago", country: US[0], code: US[1], geocode: "Kenwood Academy, Chicago",
 story: "Chicago honoured native Chaka Khan with Chaka Khan Way, beside Kenwood Academy, where she went to high school.",
 quotes: [["https://www.cbsnews.com/chicago/news/chicago-native-chaka-khan-honored-with-street-name/", "said she has come a long way since her high school days at Kenwood Academy, which is just steps from the newly named Chaka Khan Way."],
  ["https://newsone.com/2647907/chaka-khan-chicago-street/", "The newly named Chaka Khan Way is located on the west side of Kenwood Academy, where Khan attended high school."]] });
L("patti-labelle", "Patti LaBelle", "PL", "US", "north-america", { qid: "patti-labelle-southwest-philadelphia", type: "hometown", diff: "medium", chapter: home,
 question: "Patti LaBelle grew up in which part of Philadelphia, where she sang gospel at Beulah Baptist Church?", clue: "The quadrant of Philly by the airport.", hint: "Southwest ...",
 city: "Southwest Philadelphia", country: US[0], code: US[1], geocode: "Southwest Philadelphia",
 story: "Patti LaBelle grew up in Southwest Philadelphia and got her start singing gospel at Beulah Baptist Church.",
 quotes: [["https://www.phillymag.com/news/2014/06/30/one-of-us-patti-labelle/", "I grew up in … Southwest Philadelphia, at 5819 Washington Avenue."],
  ["https://www.inquirer.com/columnists/patti-labelle-visit-philly-black-history-month-20260209.html", "LaBelle got her start singing gospel at Southwest Philly’s Beulah Baptist Church."]] });
L("babyface", "Babyface", "BA", "US", "north-america", { qid: "babyface-indianapolis", type: "birthplace", diff: "medium", chapter: born,
 question: "Songwriter-producer Kenneth 'Babyface' Edmonds was born in which Midwestern state capital?", clue: "Home of the famous 500-mile race.", hint: "Indiana's capital.",
 city: "Indianapolis", country: US[0], code: US[1], geocode: "Indianapolis",
 story: "Kenneth 'Babyface' Edmonds was born in Indianapolis in 1959, the fifth of six brothers.",
 quotes: [["https://www.songhall.org/profiles/kenneth-babyface-edmonds", "Edmonds was born in Indianapolis on April 10, 1959, the fifth of six brothers"]] });
L("toni-braxton", "Toni Braxton", "TB", "US", "north-america", { qid: "toni-braxton-severn", type: "birthplace", diff: "legend", chapter: born,
 question: "90s soul star Toni Braxton was born in which Maryland community near Baltimore?", clue: "In Anne Arundel County, near BWI airport.", hint: "It sounds like a British river.",
 city: "Severn", country: US[0], code: US[1], geocode: "Severn, Maryland",
 story: "Toni Braxton was born in Severn, Maryland, in 1967, the eldest of six children.",
 quotes: [["https://americansongwriter.com/born-59-years-ago-today-in-maryland-the-7-time-grammy-winner-who-gave-the-90s-its-ultimate-heartbreak-anthem/", "On this day (October 7) in 1967, Toni Michele Braxton was born in Severn, Maryland."]] });
L("d-angelo", "D'Angelo", "DA", "US", "north-america", { qid: "d-angelo-richmond", type: "hometown", diff: "medium", chapter: home,
 question: "Neo-soul pioneer D'Angelo was raised in which Virginia state capital?", clue: "On the James River.", hint: "Virginia's capital.",
 city: "Richmond", country: US[0], code: US[1], geocode: "Richmond, Virginia",
 story: "D'Angelo, born Michael Eugene Archer, was raised in Richmond, Virginia.",
 quotes: [["https://www.thewrap.com/dangelo-soul-singer-dead-dies-obit/", "D’Angelo, born Michael Eugene Archer, was raised in Richmond, Virginia."]] });
L("maxwell", "Maxwell", "MX", "US", "north-america", { qid: "maxwell-brooklyn", type: "birthplace", diff: "easy", chapter: born,
 question: "Neo-soul singer Maxwell was born in which New York City borough?", clue: "NYC's most populous borough.", hint: "Across the bridge from Manhattan.",
 city: "Brooklyn", country: US[0], code: US[1], geocode: "Brooklyn",
 story: "Maxwell was born in Brooklyn in 1973 to a Puerto Rican father and a Haitian mother.",
 quotes: [["https://www.bkreader.com/black-history-month/feb-24-black-history-maker-maxwell-2-6544392", "Maxwell was born May 23, 1973, in Brooklyn."]] });
L("lauryn-hill", "Lauryn Hill", "LH", "US", "north-america", { qid: "lauryn-hill-south-orange", type: "hometown", diff: "hard", chapter: home,
 question: "Lauryn Hill grew up in which New Jersey town, home of the family house she showed journalists?", clue: "In Essex County, west of Newark.", hint: "Its name is a direction plus a fruit.",
 city: "South Orange", country: US[0], code: US[1], geocode: "South Orange, New Jersey",
 story: "Lauryn Hill grew up in South Orange, New Jersey, and still lived with her parents there after her 1990s success.",
 notes: ["Hometown question: sources differ on her birthplace (East Orange vs South Orange)."],
 quotes: [["https://www.encyclopedia.com/people/literature-and-arts/music-popular-and-jazz-biographies/lauryn-hill", "Hill was born in the mid-1970s and grew up in South Orange, New Jersey"]] });
L("sade", "Sade", "SD", "GB", "europe", { qid: "sade-ibadan", type: "birthplace", diff: "medium", chapter: born,
 question: "Sade was born in which south-western Nigerian city before moving to England as a child?", clue: "Capital of Oyo State.", hint: "One of Africa's largest cities by area.",
 city: "Ibadan", country: "Nigeria", code: "NG", geocode: "Ibadan",
 story: "Sade was born Helen Folasade Adu in Ibadan, Nigeria, to a Nigerian father and a British mother.",
 quotes: [["https://www.biography.com/musicians/sade", "Sade was born Helen Folasade Adu on January 16, 1959, in Ibadan, Nigeria."],
  ["https://www.encyclopedia.com/arts/culture-magazines/sade", "Sade was born Helen Folasade Adu in Ibadan , Nigeria , to a British mother and a Nigerian father."]] });
L("lisa-stansfield", "Lisa Stansfield", "LS", "GB", "europe", { qid: "lisa-stansfield-rochdale", type: "hometown", diff: "hard", chapter: home,
 question: "British soul singer Lisa Stansfield grew up in which Greater Manchester town?", clue: "North of Manchester, birthplace of the co-operative movement.", hint: "It starts with 'Roch'.",
 city: "Rochdale", country: GB[0], code: GB[1], geocode: "Rochdale",
 story: "Born in Manchester, Lisa Stansfield moved to Rochdale at 11 and is still known for her Rochdale accent.",
 notes: ["Hometown question: sources disagree on her birthplace (Manchester, Heywood or Rochdale); all agree she grew up in Rochdale."],
 quotes: [["https://manchesterhistory.net/rochdale/FOLK/stansfield.html", "and then when Lisa was 11 to Rochdale."],
  ["https://www.northernsoul.me.uk/interview-lisa-stansfield/", "not least her Rochdale accent."]] });

require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-22.json"),
 JSON.stringify({ batch: 22, researched: "2026-10-18", coordinateSource: "OpenStreetMap Nominatim", entries, memberships: [] }, null, 1) + "\n");
console.log(entries.length, "entries");
