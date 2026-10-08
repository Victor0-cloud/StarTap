// Batch 18 — Creators & Internet gaps + World Icons cleanup. Source of src/content/batches/batch-18.json (run: node docs/content-research/batch-18.src.cjs).
// Sources: Guinness World Records record pages (WHO/WHERE), Forbes creator profiles ("Residence" used only as "is based in"), TIME100 Creators
// 2025, Britannica, The Brazilian Report, Semana, Milenio, Infobae, N+ (nmas.com.mx), Expansión, the Irish Times and the Irish Examiner.
const BR = "https://www.britannica.com/biography/", FB = "https://www.forbes.com/profile/", TM = "https://time.com/collections/time100-creators-2025/";
const GWR = "https://www.guinnessworldrecords.com/world-records/";
const entries = [];
const P = (cat, id, name, mono, cc, region, sub, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.originNote ? { originNote: q.originNote } : {}) },
 question: { id: q.qid, primaryCategory: cat, subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: q.display ?? (cat === "icons" ? "World Icons" : "Creators"), chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, ...(q.geocode ? { geocode: q.geocode } : {}) }, story: q.story,
  ...(q.secondary ? { secondary: q.secondary } : {}),
  sources: q.quotes.map((x, i) => { const [url, quote] = Array.isArray(x) ? x : [q.url, x]; return { url, role: i ? "extra" : "primary", quality: "reputable_secondary", quote }; }) },
});
const C = (...a) => P("creators", ...a);
const US = ["United States", "US"], MX = ["Mexico", "MX"];
const sec = sub => [{ category: "creators", subcategory: sub }];

// ── Streamers ───────────────────────────────────────────────────
C("thegrefg", "TheGrefg", "TG", "ES", "europe", "streamers", { qid: "thegrefg-alhama-de-murcia", type: "event_location", diff: "hard", chapter: "Record stream",
 question: "TheGrefg set the Guinness record for most concurrent viewers on an individual's Twitch stream from which Spanish town?", clue: "In the Region of Murcia, southeast Spain.", hint: "Its name starts with 'Alhama'.",
 city: "Alhama de Murcia", country: "Spain", code: "ES", geocode: "Alhama de Murcia, Murcia", url: GWR + "461561-most-concurrent-viewers-for-a-twitch-stream-by-an-individual",
 secondary: sec("gaming-creators"),
 story: "On 11 January 2021 David 'TheGrefg' Cánovas drew 2,468,668 concurrent viewers to his Twitch stream from Alhama de Murcia, Spain — a Guinness record — to reveal his own Fortnite skin.",
 quotes: ["was achieved by David \"TheGrefg\" Cánovas Martínez (Spain) in Alhama de Murcia, Spain, on 11 January 2021.", "The live stream was a means to promote TheGrefg's new Fortnite skins"] });
C("casimiro", "Casimiro", "CM", "BR", "latin-america", "streamers", { qid: "casimiro-rio-de-janeiro", type: "hometown", diff: "medium", chapter: "CazéTV",
 question: "Casimiro Miguel, the streamer whose CazéTV channel shows live Brazilian football, is from which city?", clue: "Home of Sugarloaf Mountain.", hint: "Brazil's former capital.",
 city: "Rio de Janeiro", country: "Brazil", code: "BR", geocode: "Rio de Janeiro, Brazil", url: "https://newsletters.brazilian.report/p/casimiro-miguel-cazetv",
 secondary: sec("digital-entrepreneurs"),
 story: "Casimiro Miguel, a streamer from Rio de Janeiro, went from viral reaction videos to building CazéTV, a YouTube channel with its own production team that broadcasts live football and has reshaped Brazilian sports broadcasting.",
 quotes: ["will be shown live on CazéTV, the YouTube channel of Casimiro Miguel, a 31-year-old streamer from Rio de Janeiro.", "Casimiro and CazéTV redefine sports broadcasting in Brazil"] });
C("rivers", "Rivers", "R", "MX", "latin-america", "streamers", { qid: "rivers-monterrey", type: "birthplace", diff: "medium", chapter: "Streamer of the Year",
 question: "Samy 'Rivers' Rivera, twice Esports Awards Streamer of the Year, was born in which Mexican city?", clue: "Capital of Nuevo León, beneath Cerro de la Silla.", hint: "Mexico's industrial northern hub.",
 city: "Monterrey", country: MX[0], code: MX[1], geocode: "Monterrey, Nuevo León", url: "https://www.nmas.com.mx/entretenimiento/espectaculos/quien-es-samy-rivers-edad-donde-nacio-datos-streamer-mexicana-velada-ano-6/",
 secondary: [...sec("digital-entrepreneurs")],
 story: "Samantha 'Rivers' Rivera was born in Monterrey in 1998. She began streaming her video games on Twitch in 2020, became the most-watched female streamer in the world, and owns the Kings League team Pio FC.",
 quotes: ["La mexicana nació en Monterrey el 20 de agosto de 1998.", "Samantha Rivera Treviño es dueña del equipo Pio FC, que participa en la Kings League y la Queens League.", ["https://expansion.mx/tecnologia/2023/07/03/rivers-gg-velada-entre-streamers-rompen-el-molde-en-twitch", "La streamer de Monterrey fue la creadora mujer con más espectadores durante junio en toda Latinoamérica y la número cinco a nivel mundial."]] });
C("westcol", "Westcol", "W", "CO", "latin-america", "streamers", { qid: "westcol-medellin", type: "hometown", diff: "medium", chapter: "Paisa streamer",
 question: "Colombian streamer Westcol began uploading reaction and gameplay videos as a teenager in which city?", clue: "Capital of Antioquia, the 'City of Eternal Spring'.", hint: "Colombia's second-largest city.",
 city: "Medellín", country: "Colombia", code: "CO", geocode: "Medellín, Antioquia", url: "https://www.semana.com/gente/articulo/westcol-el-streamer-paisa-que-entrevisto-a-petro-logro-ser-tendencia-en-colombia/202659/",
 story: "Luis Fernando 'Westcol' Villa began posting reaction and gameplay videos to YouTube more than a decade ago as a teenager in Medellín, and became one of Latin America's most influential streamers on Twitch and Kick.",
 quotes: ["comenzó a subir videos de reacciones y gameplays a YouTube hace más de 10 años, cuando era un adolescente en busca de diversión en Medellín.", ["https://www.semana.com/gente/articulo/el-es-westcol-el-streamer-mas-reconocido-de-colombia-que-se-reunio-con-gustavo-petro-en-entrevista/202651/", "El joven se ha convertido en una de las figuras más influyentes del entretenimiento digital en Latinoamérica"]] });
C("alana-flores", "Alana Flores", "AF", "MX", "latin-america", "streamers", { qid: "alana-flores-monterrey", type: "birthplace", diff: "medium", chapter: "La Rana",
 question: "Streamer Alana Flores, a fighter at Ibai's La Velada del Año, was born in which Mexican city?", clue: "Capital of Nuevo León.", hint: "Its people are called regiomontanos.",
 city: "Monterrey", country: MX[0], code: MX[1], geocode: "Monterrey, Nuevo León", url: "https://www.infobae.com/mexico/2025/05/28/quien-es-alana-flores-la-influencer-regiomontana-victima-de-deepfake/",
 secondary: sec("gaming-creators"),
 story: "Alana Flores was born in Monterrey in 2000. She streams herself playing video games and training, fought at La Velada del Año, and leads the Kings League team Raniza FC.",
 quotes: ["Alana Flores es una influencer mexicana originaria de Monterrey, Nuevo León", ["https://amp.milenio.com/tecnologia/alana-flores-streamer-peleara-velada-ano", "Alana Flores es una streamer e influencer de tan solo 23 años, nació en Monterrey, Nuevo León, el 15 de diciembre del 2000."], ["https://amp.milenio.com/tecnologia/alana-flores-streamer-peleara-velada-ano", "Suele hacer transmisiones en vivo jugando videojuegos o IRL"]] });

// ── Podcasters ──────────────────────────────────────────────────
C("theo-von", "Theo Von", "TV", "US", "north-america", "podcasters", { qid: "theo-von-covington", type: "birthplace", diff: "hard", chapter: "This Past Weekend",
 question: "Comedian and This Past Weekend podcast host Theo Von was born in which Louisiana city north of Lake Pontchartrain?", clue: "In St. Tammany Parish, across the lake from New Orleans.", hint: "It shares its name with a Kentucky city.",
 city: "Covington", country: US[0], code: US[1], geocode: "Covington, Louisiana", url: BR + "Theo-Von",
 story: "Theo Von was born in Covington, Louisiana, in 1980. A comedian and former reality TV star, he hosts the popular podcast This Past Weekend, where guests have included Donald Trump.",
 quotes: ["Theo Von (born March 19, 1980, Covington, Louisiana, U.S.) is an American comedian, reality television star, and podcast ho", [TM + "7299180/theo-von/", "Von’s ability to be a good hang—whether interviewing President Donald Trump or socialist streamer Hasan Piker on his popular podcast, This Past Weekend"]] });
C("mel-robbins", "Mel Robbins", "MR", "US", "north-america", "podcasters", { qid: "mel-robbins-dorset", type: "career_location", diff: "hard", chapter: "Let Them",
 question: "Podcast host Mel Robbins is based in which small Vermont town?", clue: "In Bennington County, southern Vermont, home of the oldest US marble quarry.", hint: "Shares its name with an English county.",
 city: "Dorset", country: US[0], code: US[1], geocode: "Dorset, Vermont", url: FB + "mel-robbins/",
 story: "Mel Robbins launched The Mel Robbins Podcast in 2022; it averaged 1.5 million weekly downloads in its first months. The former lawyer and author of The Let Them Theory lives in Dorset, Vermont.",
 quotes: ["Residence Dorset, Vermont", "Podcast host, author, and motivational speaker Mel Robbins launched her eponymous show", [TM + "7299152/mel-robbins/", "Through her chart-topping podcast, The Mel Robbins Podcast"]] });

// ── Gaming Creators ─────────────────────────────────────────────
C("ihascupquake", "iHasCupquake", "IC", "US", "north-america", "gaming-creators", { qid: "ihascupquake-los-angeles", type: "hometown", diff: "medium", chapter: "Record holder",
 question: "iHasCupquake, once YouTube's most-subscribed female games broadcaster, is from which city?", clue: "Home of Hollywood.", hint: "The City of Angels.",
 city: "Los Angeles", country: US[0], code: US[1], geocode: "Los Angeles, California", url: GWR + "397619-most-popular-female-videogames-broadcaster-on-youtube",
 story: "Tiffany Herrera, aka iHasCupquake, from Los Angeles, held the Guinness record for most subscribers for a female games broadcaster on YouTube, with 5,461,793 in 2017.",
 quotes: ["“iHasCupquake” – aka Tiffany Herrera from Los Angeles, USA – had 5,461,793 subscribers to her games channel as of 29 March 2017."] });
C("jacksepticeye", "Jacksepticeye", "JS", "IE", "europe", "gaming-creators", { qid: "jacksepticeye-cloghan", type: "hometown", diff: "hard", chapter: "Top of the mornin'",
 question: "Irish gaming YouTuber Jacksepticeye (Sean McLoughlin) is from which village in County Offaly?", clue: "In the Irish midlands, near the River Shannon.", hint: "Its name starts with 'Clog'.",
 city: "Cloghan", country: "Ireland", code: "IE", geocode: "Cloghan, County Offaly", url: "https://www.irishexaminer.com/lifestyle/artsandculture/arid-40356542.html",
 story: "Sean McLoughlin, the gaming YouTuber Jacksepticeye, is from Cloghan, County Offaly. He didn't have internet growing up, and now has tens of millions of YouTube subscribers.",
 quotes: ["He wanted McLoughlin, from Cloghan, Co Offaly, to play himself in a cameo.", ["https://www.irishtimes.com/culture/tv-radio-web/jacksepticeye-the-millionaire-youtuber-from-offaly-1.4796818", "Sean McLoughlin didn’t have internet growing up. Now he has 28m YouTube subscribers"]] });

// ── Viral Personalities ─────────────────────────────────────────
C("keith-lee", "Keith Lee", "KL", "US", "north-america", "viral-personalities", { qid: "keith-lee-las-vegas", type: "career_location", diff: "medium", chapter: "Food critic",
 question: "Keith Lee, whose viral food reviews boost local restaurants, is based in which city?", clue: "In the Mojave Desert, famous for its Strip.", hint: "Sin City.",
 city: "Las Vegas", country: US[0], code: US[1], geocode: "Las Vegas, Nevada", url: FB + "keith-lee/",
 story: "Former professional fighter Keith Lee is based in Las Vegas. His viral food reviews have helped hundreds of local restaurants around the US increase sales and fame.",
 quotes: ["PROFILE Keith Lee Creator Las Vegas, Nevada", "Keith Lee's viral food reviews have helped hundreds of local restaurants around the country increase sales and social media fame."] });
C("kris-collins", "Kris Collins", "KC", "CA", "north-america", "viral-personalities", { qid: "kris-collins-vancouver", type: "career_location", diff: "medium", chapter: "Pandemic fame",
 question: "Before TikTok fame, sketch comic Kris Collins was a hairdresser in which Canadian city?", clue: "On the Pacific coast of British Columbia.", hint: "It hosted the 2010 Winter Olympics.",
 city: "Vancouver", country: "Canada", code: "CA", geocode: "Vancouver, British Columbia", url: FB + "kris-collins/",
 story: "Kris Collins was a hairdresser in Vancouver before the pandemic. When Covid stopped work she downloaded TikTok and built a huge following with sketches based on her family.",
 quotes: ["Before the pandemic, Collins was a hairdresser in Vancouver.", "Collins is another example of how fast someone can accumulate fame and money off TikTok."] });
C("amelia-dimoldenberg", "Amelia Dimoldenberg", "AD", "GB", "europe", "viral-personalities", { qid: "amelia-dimoldenberg-london", type: "career_location", diff: "easy", chapter: "Chicken Shop Date",
 question: "Chicken Shop Date host Amelia Dimoldenberg, whose awkward celebrity interviews went viral, is based in which city?", clue: "On the River Thames.", hint: "The UK's capital.",
 city: "London", country: "United Kingdom", code: "GB", geocode: "London, England", url: TM + "7299096/amelia-dimoldenberg/",
 story: "London-based comedian Amelia Dimoldenberg launched Chicken Shop Date on YouTube in 2014. It found a wide audience years later through viral episodes with Jack Harlow and Jennifer Lawrence.",
 quotes: ["“Everyone said no,” the 31-year-old, London-based comedian tells TIME.", "It took another eight years for the show to find a wide audience, which it did thanks to viral episodes with rapper Jack Harlow, actor Jennifer Lawrence"] });
C("jake-shane", "Jake Shane", "JS", "US", "north-america", "viral-personalities", { qid: "jake-shane-los-angeles", type: "career_location", diff: "medium", chapter: "Octopus critic",
 question: "Jake Shane, who went viral as an octopus-only food critic, is based in which city?", clue: "Home of Hollywood.", hint: "The City of Angels.",
 city: "Los Angeles", country: US[0], code: US[1], geocode: "Los Angeles, California", url: FB + "jake-shane/",
 story: "Jake Shane started as an Instagram food critic who only reviewed octopus, then went viral with improv-style reenactments of pop culture moments. He is based in Los Angeles.",
 quotes: ["Residence Los Angeles, California", [TM + "7299132/jake-shane/", "Shane gained traction in 2023 for his viral, improv-style reenactments of pop culture moments and historical events"]] });
C("haley-kalil", "Haley Kalil", "HK", "US", "north-america", "viral-personalities", { qid: "haley-kalil-st-cloud", type: "career_location", diff: "hard", chapter: "Fashion and satire",
 question: "Satirical creator Haley Kalil graduated from the state university in which city in her native Minnesota?", clue: "On the Mississippi, northwest of Minneapolis.", hint: "Saint ... ?",
 city: "St. Cloud", country: US[0], code: US[1], geocode: "St. Cloud, Minnesota", url: TM + "7299123/haley-kalil/",
 story: "Haley Kalil graduated summa cum laude from St. Cloud State University in her native Minnesota, and built a following of 23 million by blending fashion and satire.",
 quotes: ["who graduated summa cum laude with a degree in biomedical sciences and psychology from St. Cloud State University in her native Minnesota, has built a following of 23 million across TikTok and Instagram by blending fashion and satire."] });

// ── World Icons: Cultural Icons ─────────────────────────────────
P("icons", "andy-warhol", "Andy Warhol", "AW", "US", "north-america", "cultural-icons", { qid: "andy-warhol-pittsburgh", type: "birthplace", diff: "medium", chapter: "Where the story began",
 question: "Pop art pioneer Andy Warhol was born in which Pennsylvania city?", clue: "Where three rivers meet.", hint: "The Steel City.",
 city: "Pittsburgh", country: US[0], code: US[1], geocode: "Pittsburgh, Pennsylvania", url: BR + "Andy-Warhol",
 story: "Andy Warhol was born in Pittsburgh in 1928. An artist and filmmaker, he led the Pop art movement of the 1960s.",
 quotes: ["Andy Warhol (born August 6, 1928, Pittsburgh, Pennsylvania, U.S.—died February 22, 1987, New York, New York) was an American artist and filmmaker, an initiator and leading exponent of the Pop art movement of the 1960s"] });
P("icons", "john-lennon", "John Lennon", "JL", "GB", "europe", "cultural-icons", { qid: "john-lennon-liverpool", type: "birthplace", diff: "easy", chapter: "Where the story began",
 question: "John Lennon, coleader of the Beatles, was born in which English port city?", clue: "On the River Mersey.", hint: "Home of the Cavern Club.",
 city: "Liverpool", country: "United Kingdom", code: "GB", geocode: "Liverpool, England", url: BR + "John-Lennon",
 story: "John Lennon was born in Liverpool in 1940 and became a coleader of the revolutionary rock group the Beatles.",
 quotes: ["John Lennon (born October 9, 1940, Liverpool, England—died December 8, 1980, New York, New York, U.S.) was a coleader of the revolutionary British rock group the Beatles"] });

const memberships = [
 ["xqc-laval", "creators", "gaming-creators", "first gained prominence in esports as a top-tier Overwatch player"],
 ["huda-kattan-dubai", "creators", "digital-entrepreneurs", "Forbes: launched a beauty blog in 2010, then built Huda Beauty and Kayali from her online following"],
].map(([questionId, category, subcategory, reason]) => ({ questionId, category, subcategory, reason }));
require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-18.json"),
 JSON.stringify({ batch: 18, researched: "2026-10-07", coordinateSource: "OpenStreetMap Nominatim", entries, memberships }, null, 1) + "\n");
console.log(entries.length, "entries,", memberships.length, "memberships");
