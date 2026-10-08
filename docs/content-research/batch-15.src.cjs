// Batch 15 — Creators & Internet. Source of src/content/batches/batch-15.json (run: node docs/content-research/batch-15.src.cjs).
// Encyclopedias rarely cover creators, so sources here are TIME100 Creators profiles, Forbes Top Creators profiles,
// Britannica where it exists, and established news outlets. Forbes "Residence" is used only as "is based in".
const BR = "https://www.britannica.com/", FB = "https://www.forbes.com/profile/", TM = "https://time.com/collections/time100-creators-2025/";
const entries = [];
const P = (id, name, mono, cc, region, sub, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.originNote ? { originNote: q.originNote } : {}) },
 question: { id: q.qid, primaryCategory: "creators", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: q.display ?? "Creators", chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, ...(q.geocode ? { geocode: q.geocode } : {}) }, story: q.story,
  ...(q.secondary ? { secondary: q.secondary } : {}),
  sources: q.quotes.map((x, i) => { const [url, quote] = Array.isArray(x) ? x : [q.url, x]; return { url: /^https:/.test(url) ? url : BR + url, role: i ? "extra" : "primary", quality: "reputable_secondary", quote }; }) },
});
const US = ["United States", "US"], GB = ["United Kingdom", "GB"];

// ── YouTubers ───────────────────────────────────────────────────
P("nick-digiovanni", "Nick DiGiovanni", "ND", "US", "north-america", "youtubers", { qid: "nick-digiovanni-providence", type: "hometown", diff: "medium", chapter: "MasterChef to YouTube",
 question: "Food creator Nick DiGiovanni, once the youngest MasterChef finalist, is a native of which New England capital?", clue: "At the head of Narragansett Bay.", hint: "It's Rhode Island's capital.",
 city: "Providence", country: US[0], code: US[1], geocode: "Providence, Rhode Island", url: TM + "7299158/nick-digiovanni/",
 story: "As a Harvard student in 2019, Nick DiGiovanni became the youngest MasterChef finalist at the time. After graduation the Providence, Rhode Island, native began posting cooking videos to YouTube, where he now has about 27 million subscribers.",
 quotes: ["After graduation, the Providence, R.I. native began uploading videos of cooking tips and tricks to YouTube", "as a student at Harvard University, DiGiovanni became the youngest MasterChef finalist at the time, finishing in third place."] });
P("mark-rober", "Mark Rober", "MR", "US", "north-america", "youtubers", { qid: "mark-rober-sunnyvale", type: "career_location", diff: "hard", chapter: "The mad scientist",
 question: "Mark Rober, YouTube's 'mad scientist' of educational stunts, is based in which Silicon Valley city?", clue: "Santa Clara County, between Mountain View and San Jose.", hint: "Its name promises plenty of sunshine.",
 city: "Sunnyvale", country: US[0], code: US[1], geocode: "Sunnyvale, California", url: FB + "mark-rober/",
 story: "Mark Rober is social media's 'mad scientist', drawing more than 57 million YouTube subscribers to high-production educational stunts. He lives in Sunnyvale, California.",
 quotes: ["Social media's mad scientist attracts more than 57 million YouTube subscribers with his high-production, educational stunts.", "Residence Sunnyvale, California"] });
P("alan-chikin-chow", "Alan Chikin Chow", "AC", "US", "north-america", "youtubers", { qid: "alan-chikin-chow-dallas", type: "hometown", diff: "medium", chapter: "Alan's Universe",
 question: "Alan Chikin Chow, whose Alan's Universe channel has more than 94 million subscribers, is a native of which Texas city?", clue: "North Texas, on the Trinity River.", hint: "Its NFL team is the Cowboys.",
 city: "Dallas", country: US[0], code: US[1], geocode: "Dallas, Texas", url: TM + "7299090/alan-chikin-chow/",
 story: "Alan Chikin Chow's Alan's Universe channel has more than 94 million subscribers. In 2025 the Dallas native signed a deal with HYBE America to develop a new pop group.",
 quotes: ["the Dallas native signed a deal with HYBE America", "Universe channel boasting more than 94 million subscribers."] });

// ── TikTok Creators ─────────────────────────────────────────────
P("charli-damelio", "Charli D’Amelio", "CD", "US", "north-america", "tiktok-creators", { qid: "charli-damelio-norwalk", type: "hometown", diff: "hard", chapter: "TikTok's dancer",
 question: "TikTok dance star Charli D'Amelio is based in which Connecticut city?", clue: "Fairfield County, on Long Island Sound.", hint: "Its maritime aquarium sits on the Norwalk River.",
 city: "Norwalk", country: US[0], code: US[1], geocode: "Norwalk, Connecticut", url: FB + "charli-damelio/",
 story: "Charli D'Amelio became a social media superstar posting dance videos on TikTok, and went on to a Broadway run in & Juliet. She lives in Norwalk, Connecticut.",
 quotes: ["Residence Norwalk, Connecticut", "Fresh off her Broadway run in & Juliet, the social media superstar is back to posting the same kinds of danc"] });
P("alix-earle", "Alix Earle", "AE", "US", "north-america", "tiktok-creators", { qid: "alix-earle-miami", type: "career_location", diff: "medium", chapter: "Get Ready With Me",
 question: "TikTok lifestyle creator Alix Earle is based in which Florida city?", clue: "On Biscayne Bay, south-east Florida.", hint: "Its South Beach is famous.",
 city: "Miami", country: US[0], code: US[1], geocode: "Miami, Florida", url: FB + "alix-earle/",
 story: "Alix Earle built one of social media's most influential lifestyle brands — her 'Get Ready With Me' videos are a Harvard Business School case study. She lives in Miami.",
 quotes: ["Residence Miami, Florida", "There's a reason Earle is literally a Harvard Business School case study."] });
P("mikayla-nogueira", "Mikayla Nogueira", "MN", "US", "north-america", "tiktok-creators", { qid: "mikayla-nogueira-boston", type: "hometown", diff: "medium", chapter: "Makeup millions",
 question: "Beauty TikToker Mikayla Nogueira, a Massachusetts native, is based in which city?", clue: "On Massachusetts Bay.", hint: "It's the state capital.",
 city: "Boston", country: US[0], code: US[1], url: FB + "mikayla-nogueira/",
 story: "Massachusetts native Mikayla Nogueira has turned makeup into millions, posting beauty tutorials and reviews for more than 20 million fans on TikTok and Instagram. She lives in Boston.",
 quotes: ["The Massachusetts native has turned makeup into millions of dollars.", "Residence Boston, Massachusetts"] });
P("dylan-mulvaney", "Dylan Mulvaney", "DM", "US", "north-america", "tiktok-creators", { qid: "dylan-mulvaney-san-diego", type: "hometown", diff: "medium", chapter: "Days of Girlhood",
 question: "Dylan Mulvaney, whose 'Days of Girlhood' TikTok series drew over a billion views, is based in which Californian city?", clue: "Southern California, by the Mexican border.", hint: "Its zoo and Balboa Park are famous.",
 city: "San Diego", country: US[0], code: US[1], geocode: "San Diego, California", url: FB + "dylan-mulvaney/",
 story: "Actress and LGBTQ+ activist Dylan Mulvaney gained viral fame with her 'Days of Girlhood' TikTok series, which drew more than 1 billion views. She lives in San Diego.",
 quotes: ["The actress and LGBTQ+ activist gained viral fame with her \"Days of Girlhood\" TikTok series", "Residence San Diego, California"] });
P("reece-feldman", "Reece Feldman", "RF", "US", "north-america", "tiktok-creators", { qid: "reece-feldman-queens", type: "hometown", diff: "hard", chapter: "Red carpets",
 question: "Entertainment creator Reece Feldman, who covers the Oscars and the Met Gala, is a native of which New York borough?", clue: "On western Long Island, east of Manhattan.", hint: "It's home to both of New York's big airports.",
 city: "New York City", country: US[0], code: US[1], geocode: "Queens, New York", url: TM + "7299166/reece-feldman/",
 story: "Reece Feldman covers the Oscars, Emmys, Golden Globes and Met Gala. In 2025 the Queens, New York, native wrote and directed a short film that premiered at Cannes.",
 quotes: ["the Queens, N.Y. native picked up a camera himself, writing and directing a short film titled Wait, Your Car?, which premiered at Cannes"] });
P("devon-rodriguez", "Devon Rodriguez", "DR", "US", "north-america", "tiktok-creators", { qid: "devon-rodriguez-bronx", type: "hometown", diff: "medium", chapter: "Subway portraits",
 question: "Artist Devon Rodriguez, famous online for drawing strangers on the subway, grew up in which part of New York?", clue: "The only New York borough on the mainland.", hint: "It's home to Yankee Stadium.",
 city: "New York City", country: US[0], code: US[1], geocode: "South Bronx, New York", url: TM + "7299114/devon-rodriguez/",
 story: "Growing up in New York's South Bronx, Devon Rodriguez used art to escape a tumultuous home life — and his drawings became a hit with audiences online.",
 quotes: ["Growing up in New York’s South Bronx, Devon Rodriguez used art to escape a tumultuous home life."] });
P("addison-rae", "Addison Rae", "AR", "US", "north-america", "tiktok-creators", { qid: "addison-rae-los-angeles", type: "career_location", diff: "easy", chapter: "From TikTok to Spotify",
 question: "Addison Rae, who went from TikTok views to a debut album in 2025, is based in which city?", clue: "Southern California.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: FB + "addison-rae/",
 story: "Addison Rae evolved from millions of TikTok views to millions of Spotify streams, releasing her debut album, Addison, in 2025. She lives in Los Angeles.",
 quotes: ["Addison Rae has evolved from millions of views on TikTok to millions of streams on Spotify.", "Residence Los Angeles, California"] });
P("zach-king", "Zach King", "ZK", "US", "north-america", "tiktok-creators", { qid: "zach-king-los-angeles", type: "career_location", diff: "easy", chapter: "Editing magic",
 question: "Zach King, known for 'magic' video edits on TikTok and YouTube, is based in which city?", clue: "Southern California.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: FB + "zach-king/",
 story: "Zach King started by posting video-editing tutorials on YouTube; his slick editing now stars across YouTube, TikTok and Instagram. He lives in Los Angeles.",
 quotes: ["Zach King started on social media by posting video-editing tutorials on YouTube.", "Residence Los Angeles, California"] });
P("bella-poarch", "Bella Poarch", "BP", "US", "north-america", "tiktok-creators", { qid: "bella-poarch-los-angeles", type: "career_location", diff: "medium", originNote: "Philippines-born American", chapter: "From the Navy",
 question: "Bella Poarch, a former US Navy helicopter mechanic with 90 million-plus TikTok followers, is based in which city?", clue: "Southern California.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: FB + "bella-poarch/",
 story: "Bella Poarch, a former Navy helicopter mechanic, attracted more than 90 million TikTok followers and became a crossover music star. She lives in Los Angeles.",
 quotes: ["The former Navy helicopter mechanic has continued to be a true crossover star.", "Residence Los Angeles, California"] });

// ── Streamers ───────────────────────────────────────────────────
P("kai-cenat", "Kai Cenat", "KC", "US", "north-america", "streamers", { qid: "kai-cenat-brooklyn", type: "birthplace", diff: "medium", chapter: "Super streamer",
 question: "Super-streamer Kai Cenat, who started on YouTube and Twitch in 2018, is a native of which New York borough?", clue: "Western Long Island.", hint: "Its bridge to Manhattan is famous.",
 city: "New York City", country: US[0], code: US[1], geocode: "Brooklyn, New York", url: FB + "kai-cenat/",
 story: "Kai Cenat is a Brooklyn native who got his start on YouTube and Twitch in 2018 and topped TIME's first Creators list in 2025.",
 quotes: ["The Brooklyn native got his start on YouTube and Twitch in 2018", [TM + "7299142/kai-cenat/", "As a child in the Bronx and later Atlanta, Cenat and his family bounced in and out of shelters"]] });
P("ishowspeed", "IShowSpeed", "IS", "US", "north-america", "streamers", { qid: "ishowspeed-cincinnati", type: "hometown", diff: "medium", chapter: "Most influential",
 question: "IShowSpeed, Rolling Stone's most influential creator of 2025, is a native of which Ohio city?", clue: "South-western Ohio, on the Ohio River.", hint: "Its NFL team is the Bengals.",
 city: "Cincinnati", country: US[0], code: US[1], geocode: "Cincinnati, Ohio", url: "https://www.fox19.com/2025/08/28/cincinnati-streamer-tops-rolling-stones-influential-creators-list/",
 story: "IShowSpeed — Darren Jason Watkins Jr. — is a Cincinnati native who was named Rolling Stone's most influential creator of 2025.",
 quotes: ["Popular streamer and Cincinnati native IShowSpeed, whose real name is Darren Jason Watkins Jr., is among Rolling Stone’s Most"] });
P("xqc", "xQc", "XQ", "CA", "north-america", "streamers", { qid: "xqc-laval", type: "birthplace", diff: "hard", chapter: "From Overwatch",
 question: "Streamer xQc, a former pro Overwatch player, was born in 1995 in which city beside Montreal?", clue: "On Île Jésus, just north of Montreal, Quebec.", hint: "The 'QC' in his name stands for Quebec.",
 city: "Laval", country: "Canada", code: "CA", geocode: "Laval, Quebec", url: "https://esports.gg/news/streamers/xqc-streamer-profile/",
 story: "Félix Lengyel, known as xQc, was born in Laval, Quebec, in 1995. He first made his name as a top-tier Overwatch player before becoming one of Twitch's most-watched streamers.",
 quotes: ["Born on November 12, 1995, in Laval, Quebec, xQc first gained prominence in the eSports scene as a top-tier Ov"] });
P("ibai-llanos", "Ibai Llanos", "IL", "ES", "europe", "streamers", { qid: "ibai-llanos-bilbao", type: "hometown", diff: "medium", chapter: "La Velada",
 question: "Spanish streamer Ibai Llanos, creator of La Velada del Año, comes from which Basque city?", clue: "Northern Spain, on the Nervión estuary near the Bay of Biscay.", hint: "It's home to the Guggenheim Museum.",
 city: "Bilbao", country: "Spain", code: "ES", url: "https://www.meganoticias.cl/tendencias/441574-ibai-llanos-edad-donde-nacio-la-velada-del-ano-seo.html",
 story: "Ibai Llanos was born in 1995 and comes from Bilbao, though he now lives in the province of Barcelona. He first became known for his League of Legends broadcasts.",
 quotes: ["El streamer es originario de Bilbao, aunque en la actualidad reside en la provincia de Barcelona.", "Ibai Llanos nació el 26 de marzo de 1995"] });

// ── Podcasters ──────────────────────────────────────────────────
P("joe-rogan", "Joe Rogan", "JR", "US", "north-america", "podcasters", { qid: "joe-rogan-newark", type: "birthplace", diff: "medium", chapter: "The Experience",
 question: "Podcaster and UFC commentator Joe Rogan was born in 1967 in which New Jersey city?", clue: "On the Passaic River, across from Manhattan.", hint: "New Jersey's largest city, with a major airport.",
 city: "Newark", country: US[0], code: US[1], geocode: "Newark, New Jersey", url: "biography/Joe-Rogan",
 story: "Joe Rogan was born in Newark, New Jersey, in 1967. A comedian, actor and podcaster, he is also an announcer for the UFC; his family later settled in Newton Upper Falls, Massachusetts.",
 quotes: ["Joe Rogan (born August 11, 1967, Newark, New Jersey, U.S.) is an American comedian, actor, television host, podcaster, and announcer", "Rogan and his family eventually settled in Newton Upper Falls, Massachusetts"] });
P("ira-glass", "Ira Glass", "IG", "US", "north-america", "podcasters", { qid: "ira-glass-chicago", type: "career_location", diff: "medium", chapter: "This American Life",
 question: "Ira Glass's show This American Life first aired in 1995 on the public radio station of which city?", clue: "On the south-western shore of Lake Michigan.", hint: "Illinois's largest city.",
 city: "Chicago", country: US[0], code: US[1], url: "biography/Ira-Glass",
 story: "Ira Glass, born in Baltimore in 1959, moved to Chicago in 1989 for NPR. His show, first called Your Radio Playhouse, premiered on Chicago's WBEZ in November 1995 and became This American Life.",
 quotes: ["Originally titled Your Radio Playhouse, Glass’s show first aired on Chicago’s public radio station, WBEZ, in November 1995", "Glass moved to Chicago in 1989 to become a reporter for NPR’s Chicago bureau."] });
P("conan-obrien", "Conan O’Brien", "CO", "US", "north-america", "podcasters", { qid: "conan-obrien-brookline", type: "birthplace", diff: "hard", chapter: "Late night",
 question: "Talk-show host and podcaster Conan O'Brien was born in 1963 in which Massachusetts town?", clue: "Just west of Boston, almost surrounded by it.", hint: "JFK was also born there.",
 city: "Brookline", country: US[0], code: US[1], geocode: "Brookline, Massachusetts", url: "biography/Conan-OBrien",
 story: "Conan O'Brien was born in Brookline, Massachusetts, in 1963. After graduating from Harvard he wrote for TV in Los Angeles, then hosted Late Night and The Tonight Show.",
 quotes: ["Conan O’Brien (born April 18, 1963, Brookline, Massachusetts, U.S.) is an American late-night talk-show personality and comedian", "After graduating magna cum laude from Harvard in 1985, O’Brien moved to Los Angeles"] });
P("malcolm-gladwell", "Malcolm Gladwell", "MG", "CA", "north-america", "podcasters", { qid: "malcolm-gladwell-london", type: "birthplace", diff: "medium", chapter: "The Tipping Point",
 question: "Author and podcaster Malcolm Gladwell, a Canadian journalist, was born in 1963 in which city?", clue: "On the Thames in south-east England.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], url: "biography/Malcolm-Gladwell",
 story: "Malcolm Gladwell was born in London in 1963. A Canadian journalist known for his take on popular culture, he published his first book, The Tipping Point, in 2000.",
 quotes: ["Malcolm Gladwell (born September 3, 1963, London, England) is a Canadian journalist and writer best known for his unique perspective on popular culture", "In 2000 Gladwell released his first book, The Tipping Point"] });
P("marc-maron", "Marc Maron", "MM", "US", "north-america", "podcasters", { qid: "marc-maron-albuquerque", type: "hometown", diff: "hard", chapter: "WTF",
 question: "Marc Maron, host of the podcast WTF, grew up in which New Mexico city?", clue: "On the Rio Grande, central New Mexico.", hint: "It hosts a famous hot-air-balloon fiesta.",
 city: "Albuquerque", country: US[0], code: US[1], geocode: "Albuquerque, New Mexico", url: "biography/Marc-Maron",
 story: "Marc Maron was born in Jersey City in 1963; his family moved to Alaska and then settled in Albuquerque, where he grew up. He is best known for the podcast WTF with Marc Maron (2009–25).",
 quotes: ["took his New Jersey-bred family to Alaska before settling in Albuquerque, New Mexico, where Maron grew up.", "was perhaps best known for the podcast WTF with Marc Maron (2009–25)"] });
P("alex-cooper", "Alex Cooper", "AC", "US", "north-america", "podcasters", { qid: "alex-cooper-newtown", type: "hometown", diff: "legend", chapter: "Call Her Daddy",
 question: "Call Her Daddy host Alex Cooper was born and raised in which Pennsylvania town?", clue: "Bucks County, north-east of Philadelphia.", hint: "Its name means 'new town'.",
 city: "Newtown", country: US[0], code: US[1], geocode: "Newtown, Bucks County, Pennsylvania", url: "topic/Call-Her-Daddy",
 story: "Alex Cooper was born and raised in Newtown, Pennsylvania. Her Call Her Daddy podcast has roughly 10 million listeners and built a $125 million media empire.",
 quotes: ["Cooper was born and raised in Newtown, Pennsylvania", "Cooper has built a circle of roughly 10 million best friends, according to listener data for her hugely popular Call Her Daddy podcast"] });
P("jay-shetty", "Jay Shetty", "JS", "GB", "europe", "podcasters", { qid: "jay-shetty-london", type: "hometown", diff: "easy", chapter: "On Purpose",
 question: "Podcaster and author Jay Shetty, who talks with guests like Oprah and Tom Holland, is a native of which city?", clue: "On the Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], url: TM + "7299134/jay-shetty/",
 story: "Jay Shetty, a London native, interviews guests from Oprah to Tom Holland to help people navigate life's challenges; he has more than 22 million followers on Instagram and TikTok.",
 quotes: ["The London native’s message has resonated broadly—he has more than 22 million followers on Instagram and TikTok"] });
P("steven-bartlett", "Steven Bartlett", "SB", "GB", "europe", "podcasters", { qid: "steven-bartlett-manchester", type: "career_location", diff: "medium", chapter: "The Diary of a CEO",
 question: "Steven Bartlett, host of The Diary of a CEO, is based in which English city?", clue: "North-west England.", hint: "Home of United and City.",
 city: "Manchester", country: GB[0], code: GB[1], url: FB + "steven-bartlett/",
 story: "Steven Bartlett turned The Diary of a CEO, an interview show he started at his kitchen table, into a $425 million holding company. He lives in Manchester.",
 quotes: ["The Diary of a CEO host has turned the interview show he started at his kitchen table into a $425 million holding company", "Residence Manchester, United Kingdom"] });

// ── Gaming Creators ─────────────────────────────────────────────
P("dantdm", "DanTDM", "DT", "GB", "europe", "gaming-creators", { qid: "dantdm-wellingborough", type: "career_location", diff: "hard", chapter: "The Diamond Minecart",
 question: "Minecraft YouTuber DanTDM is based in which Northamptonshire town?", clue: "English East Midlands, between Northampton and Kettering.", hint: "Its name begins 'Welling'.",
 city: "Wellingborough", country: GB[0], code: GB[1], url: FB + "dantdm/",
 story: "Daniel Middleton — DanTDM, or The Diamond Minecart — is a professional gamer known for his mastery of Minecraft. He lives in Wellingborough.",
 quotes: ["Born Daniel Middleton, the professional gamer is known online as DanTDM or The Diamond Minecraft thanks to his mastery of popular family-friendly game Minecraft.", "Residence Wellingborough, United Kingdom"] });
P("preston-arsement", "Preston", "P", "US", "north-america", "gaming-creators", { qid: "preston-dallas", type: "career_location", diff: "medium", chapter: "PrestonPlayz",
 question: "Gaming YouTuber Preston (PrestonPlayz), who mostly plays Minecraft, is based in which Texas city?", clue: "North Texas, on the Trinity River.", hint: "Its NFL team is the Cowboys.",
 city: "Dallas", country: US[0], code: US[1], geocode: "Dallas, Texas", url: FB + "preston-arsement/",
 story: "Preston runs several YouTube channels; his most popular, PrestonPlayz, is mostly Minecraft. He lives in Dallas.",
 quotes: ["Preston runs several YouTube channels, but the name of his most popular one, PrestonPlayz, says all you really need to know about him", "Residence Dallas, Texas"] });
P("markiplier", "Markiplier", "M", "US", "north-america", "gaming-creators", { qid: "markiplier-los-angeles", type: "career_location", diff: "easy", chapter: "Iron Lung",
 question: "Gaming streamer Markiplier, whose self-funded film Iron Lung played 3,000 theatres, is based in which city?", clue: "Southern California.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: FB + "markiplier/",
 story: "Markiplier is bridging content and Hollywood: the gaming streamer's self-funded, self-produced film Iron Lung played 3,000 theatres. He lives in Los Angeles.",
 quotes: ["The gaming streamer's self-funded and self-produced feature film, Iron Lung, aired at 3,000 theaters around North America", "Residence Los Angeles, California"] });
P("ksi", "KSI", "KSI", "GB", "europe", "gaming-creators", { qid: "ksi-london", type: "career_location", diff: "easy", chapter: "FIFA videos",
 question: "KSI, who started in 2009 with YouTube videos about FIFA games, is based in which city?", clue: "On the Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], url: FB + "olajide-olatunji/",
 story: "Olajide Olatunji — KSI — began in 2009 posting YouTube videos about FIFA video games, then co-founded the Sidemen group's ventures and became a rapper and boxer. He lives in London.",
 quotes: ["Olatunji got his start in 2009 when he started posting YouTube videos commenting on FIFA video games.", "Residence London, United Kingdom"] });

// ── Digital Entrepreneurs ───────────────────────────────────────
P("kylie-jenner", "Kylie Jenner", "KJ", "US", "north-america", "digital-entrepreneurs", { qid: "kylie-jenner-los-angeles", type: "birthplace", diff: "easy", chapter: "Lip kits",
 secondary: [{ category: "fashion", subcategory: "beauty-entrepreneurs" }],
 question: "Kylie Jenner, whose first lip kits sold out in under a minute, was born in 1997 in which city?", clue: "Southern California.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: "biography/Kylie-Jenner",
 story: "Kylie Jenner was born in Los Angeles in 1997. A television personality and entrepreneur, she launched lip kits in November 2015 that sold out in less than a minute.",
 quotes: ["Kylie Jenner (born August 10, 1997, Los Angeles, California, U.S.) is an American television personality and entrepreneur", "When the lip kits first went on sale in November 2015, they sold out in less than a minute."] });
P("michelle-phan", "Michelle Phan", "MP", "US", "north-america", "digital-entrepreneurs", { qid: "michelle-phan-los-angeles", type: "career_location", diff: "medium", chapter: "Ipsy",
 secondary: [{ category: "fashion", subcategory: "beauty-entrepreneurs" }],
 question: "YouTube beauty pioneer Michelle Phan, co-founder of Ipsy, is based in which city?", clue: "Southern California.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: FB + "michelle-phan/",
 story: "A decade after her first YouTube video, Michelle Phan's name became a byword for influencer-turned-entrepreneur: she co-founded the subscription cosmetics box Ipsy. She lives in Los Angeles.",
 quotes: ["Phan's name is a byword for influencer-turned-entrepreneur. She's the cofounder of subscription cosmetics box Ipsy", "Residence Los Angeles, California"] });
P("dhar-mann", "Dhar Mann", "DM", "US", "north-america", "digital-entrepreneurs", { qid: "dhar-mann-los-angeles", type: "company_origin", diff: "medium", chapter: "A creator studio",
 question: "Dhar Mann Studios, one of the largest creator-led studios, is based in which city?", clue: "Southern California.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: TM + "7299115/dhar-mann/",
 story: "Dhar Mann Studios — one of the largest creator-led studios in Los Angeles — was named Studio of the Year at the Shorty Awards.",
 quotes: ["Dhar Mann Studios—one of the largest creator-led studios in Los Angeles—nabbed the Studio of the Year designation at this year’s Shorty Awards."] });
P("gary-vaynerchuk", "Gary Vaynerchuk", "GV", "US", "north-america", "digital-entrepreneurs", { qid: "gary-vaynerchuk-new-york", type: "career_location", diff: "medium", originNote: "Born in present-day Belarus", chapter: "Early adopter",
 question: "Gary Vaynerchuk, one of the internet's earliest social-media entrepreneurs, is based in which city?", clue: "At the mouth of the Hudson River.", hint: "The 'Big Apple'.",
 city: "New York City", country: US[0], code: US[1], geocode: "New York City", url: FB + "gary-vaynerchuk/",
 story: "Born in what is now Belarus, Gary Vaynerchuk was one of the internet's earliest adopters of social media, building a lucrative, influential following. He lives in New York.",
 quotes: ["Born in the former Soviet Union in what is now Belarus, Vaynerchuk was one of the internet's earliest adopters of social media to build a following", "Residence New York, New York"] });
P("kim-kardashian", "Kim Kardashian", "KK", "US", "north-america", "digital-entrepreneurs", { qid: "kim-kardashian-calabasas", type: "company_origin", diff: "hard", chapter: "DASH",
 question: "Kim Kardashian and her sisters opened their boutique DASH in which Los Angeles-area city?", clue: "In the Santa Monica Mountains foothills, north-west of Los Angeles.", hint: "Its name is often linked with the Kardashians' reality show.",
 city: "Calabasas", country: US[0], code: US[1], geocode: "Calabasas, California", url: "biography/Kim-Kardashian",
 story: "Kim Kardashian, born in Los Angeles in 1980, is a television personality and entrepreneur. With Kourtney and Khloé she opened DASH, a boutique in Calabasas, California.",
 quotes: ["Kim, along with Kourtney and Khloé, opened DASH, a boutique in Calabasas, California", "Kim Kardashian (born October 21, 1980, Los Angeles, California, U.S.) is an American television personality and entrepreneur"] });

// ── Viral Personalities ─────────────────────────────────────────
P("nusret-gokce", "Salt Bae", "SB", "TR", "europe", "viral-personalities", { qid: "salt-bae-erzurum", type: "birthplace", diff: "hard", originNote: "Nusret Gökçe", chapter: "Before the meme",
 question: "'Salt Bae' Nusret Gökçe was born in a small village in which Turkish province, before moving to Istanbul aged 3?", clue: "Eastern Anatolia, high on the plateau.", hint: "Its provincial capital shares the province's name and is a ski centre.",
 city: "Erzurum", country: "Turkey", code: "TR", geocode: "Erzurum, Turkey", url: "https://nusr-et.com.tr/en/meet-nusret-gokce",
 story: "Nusret Gökçe — 'Salt Bae' — was born in a small village in Erzurum, the son of a mining worker. After moving to Istanbul aged 3 he left school and became a butcher's apprentice.",
 quotes: ["Nusret Gökçe was born in a small village in Erzurum as the child of a mining worker father and a housewife mother.", "After moving to Istanbul at the age of 3, due to financial difficulties, he left school in the sixth grade and began working as an apprentice in a butcher shop"] });
P("mr-macaroni", "Mr Macaroni", "MM", "NG", "africa", "viral-personalities", { qid: "mr-macaroni-lagos", type: "birthplace", diff: "medium", chapter: "Skit maker",
 question: "Nigerian skit maker Mr Macaroni was born in Ogudu and grew up in Magodo — areas of which city?", clue: "On the Atlantic coast of south-western Nigeria.", hint: "Nigeria's largest city.",
 city: "Lagos", country: "Nigeria", code: "NG", geocode: "Ogudu, Lagos", url: "https://guardian.ng/saturday-magazine/celebrity/mr-macaroni-skits-is-a-new-form-of-theatre-we-have-adapted/",
 story: "Adebowale Adedayo — Mr Macaroni — is a comic skit maker, actor and activist. He was born in Ogudu, Lagos, and grew up in the Magodo area of the city.",
 quotes: ["Adedayo was born in Ogudu, Lagos. He grew up in Magodo area of Lagos", "Adebowale Adedayo, popularly known as Mr. Macaroni, is comic skit maker, actor and activist."] });
P("druski", "Druski", "D", "US", "north-america", "viral-personalities", { qid: "druski-atlanta", type: "career_location", diff: "medium", chapter: "Everywhere",
 question: "Sketch comic Druski, who is 'everywhere' from TikTok to national TV ads, is based in which city?", clue: "In the US South, capital of Georgia.", hint: "It hosted the 1996 Olympics.",
 city: "Atlanta", country: US[0], code: US[1], geocode: "Atlanta, Georgia", url: FB + "druski/",
 story: "Born Drew Desbordes, Druski is a sketch comic who appears everywhere from YouTube, TikTok and Instagram to national TV commercials. He lives in Atlanta.",
 quotes: ["The sketch comic these days is everywhere: YouTube, TikTok, Instagram and on national TV starring in commercials for T-Mobile and Dunkin'.", "Residence Atlanta, Georgia"] });
P("brittany-broski", "Brittany Broski", "BB", "US", "north-america", "viral-personalities", { qid: "brittany-broski-dallas", type: "hometown", diff: "medium", chapter: "Kombucha girl",
 question: "Brittany Broski, whose reaction to kombucha became a viral meme, is a native of which Texas city?", clue: "North Texas, on the Trinity River.", hint: "Its NFL team is the Cowboys.",
 city: "Dallas", country: US[0], code: US[1], geocode: "Dallas, Texas", url: TM + "7299101/brittany-broski/",
 story: "Brittany Broski's reaction to tasting kombucha went viral as a meme, with 27 million views, and propelled the Dallas native's rise to social media stardom.",
 quotes: ["The clip, which has received 27 million views to date, also propelled the Dallas native’s rise to social media stardom."] });

const memberships = [
 ["ninja-hometown", "gaming-creators", "Fortnite streamer and gaming creator"],
 ["mrbeast-hometown", "digital-entrepreneurs", "built businesses from his channel, such as Feastables"],
 ["emma-chamberlain-hometown", "digital-entrepreneurs", "founded Chamberlain Coffee from her online following"],
 ["khaby-lame-hometown", "viral-personalities", "his wordless reaction videos went viral worldwide"],
].map(([questionId, subcategory, reason]) => ({ questionId, category: "creators", subcategory, reason }));
require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-15.json"),
 JSON.stringify({ batch: 15, researched: "2026-10-07", coordinateSource: "OpenStreetMap Nominatim", entries, memberships }, null, 1) + "\n");
console.log(entries.length, "entries,", memberships.length, "memberships");
