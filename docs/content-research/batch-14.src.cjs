// Batch 14 — Business & Money. Source of src/content/batches/batch-14.json (run: node docs/content-research/batch-14.src.cjs).
// Every fact in a story comes from a quoted source sentence; clues and hints are general geography. Global Brands are
// companies (entity kind "company"), not people. Forbes "Residence" fields are used only for living business leaders.
const BR = "https://www.britannica.com/", FB = "https://www.forbes.com/profile/";
const entries = [];
const P = (id, name, mono, cc, region, sub, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.kind ? { kind: q.kind } : {}), ...(q.originNote ? { originNote: q.originNote } : {}) },
 question: { id: q.qid, primaryCategory: "business", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: q.display ?? "Business", chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, ...(q.geocode ? { geocode: q.geocode } : {}) }, story: q.story,
  sources: q.quotes.map((x, i) => { const [url, quote] = Array.isArray(x) ? x : [q.url, x]; return { url: /^https:/.test(url) ? url : BR + url, role: i ? "extra" : "primary", quality: "reputable_secondary", quote }; }) },
});
const US = ["United States", "US"];

// ── Entrepreneurs ───────────────────────────────────────────────
P("richard-branson", "Richard Branson", "RB", "GB", "europe", "entrepreneurs", { qid: "richard-branson-shamley-green", type: "birthplace", diff: "legend", chapter: "A Surrey village",
 question: "Virgin Group founder Richard Branson was born in 1950 in which Surrey village?", clue: "In the Surrey Hills, south-east of Guildford.", hint: "Its name pairs 'Shamley' with a village green.",
 city: "Shamley Green", country: "United Kingdom", code: "GB", geocode: "Shamley Green, Surrey", url: "money/Richard-Branson",
 story: "Richard Branson was born in Shamley Green, Surrey, in 1950. A school dropout, he started with the magazine Student as a teenager, then Virgin Mail Order Records, and in 1971 opened the first British discount record store.",
 quotes: ["Richard Branson (born July 18, 1950, Shamley Green, Surrey, England) is a British entrepreneur and adventurer, head of Virgin Group Ltd", "Branson, who was a school dropout, entered into his first successful business venture as a teenager with the magazine Student.", "in 1971 he opened the first British discount record store."] });
P("sara-blakely", "Sara Blakely", "SB", "US", "north-america", "entrepreneurs", { qid: "sara-blakely-clearwater", type: "birthplace", diff: "hard", chapter: "Spanx",
 question: "Spanx creator Sara Blakely, once the world's youngest self-made female billionaire, was born in 1971 in which Florida city?", clue: "On Florida's Gulf coast, west of Tampa.", hint: "Its name describes its beach water.",
 city: "Clearwater", country: US[0], code: US[1], geocode: "Clearwater, Florida", url: "money/Sara-Blakely",
 story: "Sara Blakely was born in Clearwater, Florida, in 1971. She created Spanx and, without advertising or outside investment, rapidly built an empire; in 2012 she became the world's youngest female self-made billionaire.",
 quotes: ["Sara Blakely (born February 21, 1971, Clearwater, Florida, U.S.) is an American inventor and entrepreneur who created Spanx", "the charismatic Blakely rapidly built an empire without advertising or outside investment."] });
P("li-ka-shing", "Li Ka-shing", "LKS", "CN", "asia", "entrepreneurs", { qid: "li-ka-shing-chaozhou", type: "birthplace", diff: "hard", originNote: "Hong Kong businessman", chapter: "Before Hong Kong",
 question: "Li Ka-shing, one of Asia's most influential businessmen, was born in 1928 in which city in Guangdong?", clue: "Eastern Guangdong, on the Han River near Shantou.", hint: "Its people and cuisine are known as Teochew.",
 city: "Chaozhou", country: "China", code: "CN", url: "money/Li-Ka-shing",
 story: "Li Ka-shing was born in Chaozhou, Guangdong, in 1928. In 1979 he became the first Chinese businessman to buy one of Hong Kong's large British-owned trading companies, taking control of Hutchison Whampoa.",
 quotes: ["Li Ka-shing (born June 13, 1928, Chaozhou, Guangdong province, China) is a Chinese entrepreneur and philanthropist, widely considered one of the most influential businessmen in Asia", "In 1979 Li became the first Chinese businessman to buy one of the large British-owned local trading companies when he purchased a controlling interest in Hutchison Whampoa."] });
P("mukesh-ambani", "Mukesh Ambani", "MA", "IN", "asia", "entrepreneurs", { qid: "mukesh-ambani-aden", type: "birthplace", diff: "hard", chapter: "Born abroad",
 question: "Reliance Industries chairman Mukesh Ambani was born in 1957 in which port city — where his father then worked?", clue: "On the Gulf of Aden, at the southern tip of the Arabian Peninsula.", hint: "The city gives its name to the gulf.",
 city: "Aden", country: "Yemen", code: "YE", url: "money/Mukesh-Ambani",
 story: "Mukesh Ambani was born in Aden, Yemen, in 1957, where his father, Dhirubhai, had worked as a gas-station attendant. In 1958 the family moved to Bombay (Mumbai); he now chairs Reliance Industries.",
 quotes: ["Mukesh Ambani (born April 19, 1957, Aden, Yemen) is an Indian business mogul who serves as chairman and managing director of the Indian conglomerate Reliance Industries Limited (RIL)", "Ambani is one of four children of renowned Indian industrialist Dhirubhai Ambani, who first worked as a gas station attendant in Aden, Yemen.", "the family relocated in 1958 to the Bhuleshwar neighborhood of Bombay (now Mumbai)"] });
P("amancio-ortega", "Amancio Ortega", "AO", "ES", "europe", "entrepreneurs", { qid: "amancio-ortega-a-coruna", type: "company_origin", diff: "hard", chapter: "The first Zara",
 question: "Amancio Ortega opened the very first Zara store in 1975 in which Spanish port city?", clue: "Galicia, on Spain's north-west Atlantic coast.", hint: "Its Roman lighthouse, the Tower of Hercules, is still in use.",
 city: "A Coruña", country: "Spain", code: "ES", url: "money/Amancio-Ortega",
 story: "Amancio Ortega founded the first Zara ready-to-wear store in A Coruña in 1975. It became an internationally famous chain and the flagship of Inditex, which he founded ten years later.",
 quotes: ["Ortega founded the first Zara ready-to-wear clothing store in A Coruña in 1975, and it became not only an internationally famous chain but also the flagship of holding company Inditex, which he founded 10 years later."] });
P("ray-kroc", "Ray Kroc", "RK", "US", "north-america", "entrepreneurs", { qid: "ray-kroc-des-plaines", type: "company_origin", diff: "hard", chapter: "The first franchise",
 question: "Ray Kroc opened the first of his McDonald's restaurants on 15 April 1955 in which Illinois town?", clue: "North-west of Chicago, near O'Hare Airport.", hint: "Its name is French for 'of the plains'.",
 city: "Des Plaines", country: US[0], code: US[1], geocode: "Des Plaines, Illinois", url: "money/Ray-Kroc",
 story: "Ray Kroc, born in Chicago in 1902, was a pioneer of the fast-food industry. The first of his McDonald's restaurants opened on 15 April 1955 in Des Plaines, Illinois.",
 quotes: ["The first of Kroc’s McDonald’s restaurants was opened April 15, 1955, in Des Plaines, Illinois.", "Ray Kroc (born October 5, 1902, Chicago, Illinois, U.S.—died January 14, 1984, San Diego, California) was an American restaurateur and a pioneer of the fast-food industry"] });
P("howard-schultz", "Howard Schultz", "HS", "US", "north-america", "entrepreneurs", { qid: "howard-schultz-milan", type: "event_location", diff: "medium", chapter: "The coffee idea",
 question: "A 1983 trip to which Italian city — with 1,500 coffeehouses — inspired Howard Schultz to turn Starbucks into a national chain?", clue: "Lombardy, northern Italy.", hint: "Italy's fashion and finance capital.",
 city: "Milan", country: "Italy", code: "IT", url: "money/Howard-Schultz",
 story: "Howard Schultz, born in Brooklyn in 1953, was inspired by a 1983 trip to Italy, where Milan alone had 1,500 coffeehouses. He founded Il Giornale in 1985, bought Starbucks in 1987, and helped make it a worldwide presence.",
 quotes: ["Inspired by a 1983 trip to Italy, where he discovered that Milan alone boasted 1,500 coffeehouses, Schultz envisioned turning a tiny regional operation into a national coffeehouse chain via rapid store expansion.", "In 1985 he founded Il Giornale, a coffee concern that in 1987 (with investor backing) purchased Starbucks."] });
P("arianna-huffington", "Arianna Huffington", "AH", "US", "north-america", "entrepreneurs", { qid: "arianna-huffington-athens", type: "birthplace", diff: "medium", originNote: "Greek American", chapter: "From Athens",
 question: "Arianna Huffington, creator of The Huffington Post, was born in 1950 in which European capital?", clue: "On the Saronic Gulf, beneath the Acropolis.", hint: "It's Greece's capital.",
 city: "Athens", country: "Greece", code: "GR", url: "biography/Arianna-Huffington",
 story: "Arianna Huffington was born in Athens in 1950. At Cambridge she became the first foreign-born president of the Cambridge Union debating society; she went on to create The Huffington Post.",
 quotes: ["Arianna Huffington (born July 15, 1950, Athens, Greece) is a Greek American author and commentator, best known for creating The Huffington Post", "While at Cambridge she served as president of the esteemed debate society the Cambridge Union; she was the first foreign-born student to do so."] });

// ── Founders ────────────────────────────────────────────────────
P("phil-knight", "Phil Knight", "PK", "US", "north-america", "founders", { qid: "phil-knight-portland", type: "hometown", diff: "medium", chapter: "Nike's founder",
 question: "Nike co-founder Phil Knight was raised in the Eastmoreland neighbourhood of which city?", clue: "North-western Oregon, on the Willamette River.", hint: "Oregon's largest city.",
 city: "Portland", country: US[0], code: US[1], geocode: "Eastmoreland, Portland, Oregon", url: "money/Phil-Knight",
 story: "Phil Knight was raised in the Eastmoreland neighbourhood of Portland, Oregon, where he attended Cleveland High School. He co-founded Nike.",
 quotes: ["Phil Knight was raised in the Eastmoreland neighborhood of Portland, where he went to Cleveland High School."] });
P("dhirubhai-ambani", "Dhirubhai Ambani", "DA", "IN", "asia", "founders", { qid: "dhirubhai-ambani-chorwad", type: "birthplace", diff: "legend", chapter: "A village schoolteacher's son",
 question: "Dhirubhai Ambani, founder of Reliance Industries, was born in 1932 in which Gujarat coastal village?", clue: "Saurashtra coast, Gujarat, near Junagadh.", hint: "Its beach was a summer retreat for the Nawabs of Junagadh.",
 city: "Chorwad", country: "India", code: "IN", geocode: "Chorwad, SH31, Malia Taluka, Gujarat", url: "money/Dhirubhai-Ambani",
 story: "Dhirubhai Ambani was born in Chorwad, Gujarat, in 1932, the son of a village schoolteacher. He settled in Bombay in 1958 and founded Reliance Industries, a giant conglomerate.",
 quotes: ["Dhirubhai Ambani (born December 28, 1932, Chorwad, Gujarat, India—died July 6, 2002, Mumbai, India) was an Indian industrialist who was the founder of Reliance Industries", "Ambani was the third of five children born to a village schoolteacher and his wife", "In 1958 Ambani returned to India and settled in Bombay (now Mumbai)."] });
P("milton-hershey", "Milton Hershey", "MH", "US", "north-america", "founders", { qid: "milton-hershey-hershey", type: "company_origin", diff: "easy", chapter: "Chocolate town",
 question: "Milton Hershey, founder of the Hershey Chocolate Corporation, died in 1945 in which Pennsylvania town that bears his name?", clue: "South-central Pennsylvania, east of Harrisburg.", hint: "It's nicknamed 'the sweetest place on Earth'.",
 city: "Hershey", country: US[0], code: US[1], geocode: "Hershey, Pennsylvania", url: "biography/Milton-Snavely-Hershey",
 story: "Milton Hershey founded the Hershey Chocolate Corporation and helped popularize chocolate candy. With his wife Catherine he founded a school for orphaned boys in 1909; he died in Hershey, Pennsylvania, in 1945.",
 quotes: ["Milton Snavely Hershey (born Sept. 13, 1857, near Hockersville, Pa., U.S.—died Oct. 13, 1945, Hershey, Pa.) was an American manufacturer and philanthropist who founded the Hershey Chocolate Corporation", "a private residential school he and his wife, Catherine, had founded in 1909 for orphaned boys."] });
P("levi-strauss", "Levi Strauss", "LS", "US", "north-america", "founders", { qid: "levi-strauss-san-francisco", type: "company_origin", diff: "easy", originNote: "Bavarian-born American", chapter: "Gold Rush denim",
 question: "Levi Strauss, founder of the world's biggest maker of blue jeans, arrived during the Gold Rush in 1853 in which city?", clue: "Northern California, at the mouth of a great bay.", hint: "The Golden Gate Bridge spans its strait.",
 city: "San Francisco", country: US[0], code: US[1], url: "biography/Levi-Strauss",
 story: "Levi Strauss was a Bavarian immigrant who arrived in San Francisco during the Gold Rush in 1853. He founded Levi Strauss & Co., which became the world's largest maker of blue denim jeans.",
 quotes: ["Levi Strauss was a Bavarian immigrant who arrived in San Francisco during the Gold Rush in 1853.", "He founded Levi Strauss & Co., which became the world's largest maker of blue denim jeans, known as Levi's."] });
P("wk-kellogg", "W. K. Kellogg", "WKK", "US", "north-america", "founders", { qid: "wk-kellogg-battle-creek", type: "hometown", diff: "hard", chapter: "Cereal city",
 question: "Cereal maker W. K. Kellogg was born and died in which Michigan city, home of its famous sanitarium?", clue: "South-central Michigan, west of Jackson.", hint: "It's nicknamed 'Cereal City'.",
 city: "Battle Creek", country: US[0], code: US[1], geocode: "Battle Creek, Michigan", url: "money/W-K-Kellogg",
 story: "W. K. Kellogg was born in Battle Creek, Michigan, in 1860 and died there in 1951. He founded his cereal company in 1906 after working with his brother John Harvey Kellogg at the Battle Creek Sanitarium.",
 quotes: ["W. K. Kellogg (born April 7, 1860, Battle Creek, Mich., U.S.—died Oct. 6, 1951, Battle Creek) was an American industrialist and philanthropist who founded (1906) the W", "Kellogg established the firm after working with his brother John Harvey Kellogg, a physician who directed the Battle Creek Sanitarium"] });
P("enzo-ferrari", "Enzo Ferrari", "EF", "IT", "europe", "founders", { qid: "enzo-ferrari-modena", type: "hometown", diff: "medium", chapter: "Born to race",
 question: "Enzo Ferrari, founder of the Ferrari car company, was born and died in which Italian city?", clue: "Emilia-Romagna, between Bologna and Parma.", hint: "It's also famous for balsamic vinegar.",
 city: "Modena", country: "Italy", code: "IT", url: "biography/Enzo-Ferrari",
 story: "Enzo Ferrari was born in Modena in 1898 and died there in 1988. An automobile manufacturer, designer and racing driver, his Ferrari cars often dominated world racing.",
 quotes: ["Enzo Ferrari (born February 18, 1898, Modena, Italy—died August 14, 1988, Modena) was an Italian automobile manufacturer, designer, and racing-car driver whose Ferrari cars often dominated world racing competition"] });

// ── African Business Leaders ────────────────────────────────────
P("patrice-motsepe", "Patrice Motsepe", "PM", "ZA", "africa", "african-business-leaders", { qid: "patrice-motsepe-soweto", type: "birthplace", diff: "medium", chapter: "South Africa's first",
 question: "Patrice Motsepe, South Africa's first Black billionaire, was born in 1962 in which township?", clue: "South-west of central Johannesburg, Gauteng.", hint: "Its name comes from 'South Western Townships'.",
 city: "Soweto", country: "South Africa", code: "ZA", geocode: "Soweto, Gauteng, South Africa", url: "money/Patrice-Tlhopane-Motsepe",
 story: "Patrice Motsepe was born in Soweto in 1962. In 1994 he founded a mine-services company, Future Mining, and became South Africa's first Black billionaire.",
 quotes: ["Patrice Tlhopane Motsepe (born Jan. 28, 1962, Soweto, S.Af.) is a South African businessman and the country’s first black billionaire", "In 1994 Motsepe founded a mine services company, Future Mining"] });
P("tony-elumelu", "Tony Elumelu", "TE", "NG", "africa", "african-business-leaders", { qid: "tony-elumelu-lagos", type: "career_location", diff: "medium", chapter: "The turnaround",
 question: "In 1997 Tony Elumelu led a small group of investors to take over a floundering commercial bank in which city?", clue: "On the Atlantic coast of south-western Nigeria.", hint: "Nigeria's largest city.",
 city: "Lagos", country: "Nigeria", code: "NG", url: FB + "tony-elumelu/",
 story: "Tony Elumelu came into the limelight in 1997, when he led a small group of investors to take over a small, floundering commercial bank in Lagos.",
 quotes: ["He came into the limelight in 1997 when he led a small group of investors to take over a small, floundering commercial bank in Lagos."] });
P("nassef-sawiris", "Nassef Sawiris", "NS", "EG", "africa", "african-business-leaders", { qid: "nassef-sawiris-cairo", type: "career_location", diff: "medium", chapter: "Orascom",
 question: "Orascom Construction, led by Nassef Sawiris, trades on the stock exchange of which capital — where he lives?", clue: "On the Nile, at the head of its delta.", hint: "It's Egypt's capital.",
 city: "Cairo", country: "Egypt", code: "EG", url: FB + "nassef-sawiris/",
 story: "Nassef Sawiris, who lives in Cairo, built his fortune in construction and investments; Orascom Construction trades on the Cairo exchange and Nasdaq Dubai.",
 quotes: ["Orascom Construction, an engineering and building firm, trades on the Cairo exchange and Nasdaq Dubai.", "Residence Cairo, Egypt"] });
P("mohammed-dewji", "Mohammed Dewji", "MD", "TZ", "africa", "african-business-leaders", { qid: "mohammed-dewji-dar-es-salaam", type: "career_location", diff: "medium", chapter: "METL",
 question: "Mohammed Dewji, CEO of the Tanzanian conglomerate METL, is based in which Indian Ocean port city?", clue: "On Tanzania's coast, opposite Zanzibar.", hint: "Its name means 'haven of peace'.",
 city: "Dar es Salaam", country: "Tanzania", code: "TZ", url: FB + "mohammed-dewji/",
 story: "Mohammed Dewji is CEO of METL, a Tanzanian conglomerate his father founded in the 1970s. He lives in Dar es Salaam.",
 quotes: ["Mohammed Dewji is the CEO of METL, a Tanzanian conglomerate founded by his father in the 1970s.", "Residence Dar es Salaam, Tanzania"] });
P("koos-bekker", "Koos Bekker", "KB", "ZA", "africa", "african-business-leaders", { qid: "koos-bekker-cape-town", type: "career_location", diff: "hard", chapter: "Naspers",
 question: "Koos Bekker, who turned Naspers into an e-commerce powerhouse and bought into Tencent, lives in which South African city?", clue: "At the foot of Table Mountain.", hint: "South Africa's legislative capital.",
 city: "Cape Town", country: "South Africa", code: "ZA", url: FB + "koos-bekker/",
 story: "Koos Bekker transformed the South African newspaper publisher Naspers into an e-commerce investor and cable-TV powerhouse; in 2001 he led it to buy a third of Tencent for a reported $34 million. He lives in Cape Town.",
 quotes: ["Koos Bekker is revered for transforming South African newspaper publisher Naspers into an e-commerce investor and cable TV powerhouse.", "He led Naspers to pay a reported $34 million for a third of Chinese Internet firm Tencent Holdings in 2001", "Residence Cape Town, South Africa"] });
P("othman-benjelloun", "Othman Benjelloun", "OB", "MA", "africa", "african-business-leaders", { qid: "othman-benjelloun-casablanca", type: "career_location", diff: "hard", chapter: "Bank of Africa",
 question: "Othman Benjelloun, CEO of BMCE Bank of Africa, is based in which Moroccan city?", clue: "On Morocco's Atlantic coast, south-west of Rabat.", hint: "Morocco's largest city and economic capital.",
 city: "Casablanca", country: "Morocco", code: "MA", url: FB + "othman-benjelloun/",
 story: "Othman Benjelloun is CEO of BMCE Bank of Africa, present across West, Central and East Africa, and built the insurer RMA into a leader. He lives in Casablanca.",
 quotes: ["Othman Benjelloun is CEO of BMCE Bank of Africa, which has assets of more than $12 billion and a presence across West, Central and East Africa.", "Benjelloun built it into a leading insurer.", "Residence Casablanca, Morocco"] });
P("mike-adenuga", "Mike Adenuga", "MA", "NG", "africa", "african-business-leaders", { qid: "mike-adenuga-lagos", type: "career_location", diff: "medium", chapter: "Globacom",
 question: "Mike Adenuga, whose Globacom is one of Nigeria's biggest mobile networks, is based in which city?", clue: "On the Atlantic coast of south-western Nigeria.", hint: "Nigeria's largest city.",
 city: "Lagos", country: "Nigeria", code: "NG", url: FB + "mike-adenuga/",
 story: "Mike Adenuga built his fortune in telecommunications and oil: his mobile network, Globacom, is Nigeria's third-largest operator. He lives in Lagos.",
 quotes: ["Mike Adenuga built his fortune in telecommunications and oil production. His mobile phone network, Globacom, is the third-largest operator in Nigeria", "Residence Lagos, Nigeria"] });
P("johann-rupert", "Johann Rupert", "JR", "ZA", "africa", "african-business-leaders", { qid: "johann-rupert-cape-town", type: "career_location", diff: "hard", chapter: "Remgro",
 question: "Luxury-goods billionaire Johann Rupert, chairman of Remgro, lives in which South African city?", clue: "On the Atlantic, beneath Table Mountain.", hint: "Its Waterfront and Robben Island are famous.",
 city: "Cape Town", country: "South Africa", code: "ZA", url: FB + "johann-rupert/",
 story: "Johann Rupert made his fortune in luxury goods and chairs the investment firm Remgro, in which he owns 7%. He lives in Cape Town.",
 quotes: ["He owns 7% of diversified investment firm Remgro, which he chairs", "Residence Cape Town, South Africa"] });

// ── Global Brands (companies) ───────────────────────────────────
const C = { kind: "company", display: "Brands" };
P("coca-cola", "Coca-Cola", "CC", "US", "north-america", "global-brands", { ...C, qid: "coca-cola-atlanta", type: "company_origin", diff: "easy", chapter: "A famous brand",
 question: "The Coca-Cola Company, one of the most successful brands in marketing history, has its headquarters in which US city?", clue: "In the US South, capital of Georgia.", hint: "It hosted the 1996 Summer Olympics.",
 city: "Atlanta", country: US[0], code: US[1], geocode: "Atlanta, Georgia", url: "money/The-Coca-Cola-Company",
 story: "The Coca-Cola Company is one of the largest US corporations and one of the most successful brands in marketing history. Its headquarters are in Atlanta, Georgia.",
 quotes: ["Its headquarters are in Atlanta, Georgia.", "one of the most successful brands in marketing history"] });
P("lego", "LEGO", "L", "DK", "europe", "global-brands", { ...C, qid: "lego-billund", type: "company_origin", diff: "medium", chapter: "The bricks",
 question: "The LEGO Group was founded in 1932 by Ole Kirk Christiansen in which Danish town?", clue: "Central Jutland, Denmark.", hint: "It's also home to the original Legoland park.",
 city: "Billund", country: "Denmark", code: "DK", url: "topic/The-Lego-Group",
 story: "The LEGO Group is a Danish company founded in 1932 by Ole Kirk Christiansen in Billund, Denmark; its first plastic building blocks were made in 1949.",
 quotes: ["The LEGO Group is a Danish company founded in 1932 by Ole Kirk Christiansen in Billund, Denmark.", "The first plastic building blocks were produced in 1949."] });
P("toyota", "Toyota", "T", "JP", "asia", "global-brands", { ...C, qid: "toyota-toyota-city", type: "company_origin", diff: "medium", chapter: "A company town",
 question: "Toyota Motor Corporation has its headquarters in which industrial city east of Nagoya — named after the company?", clue: "Aichi prefecture, central Japan.", hint: "The city shares the carmaker's name.",
 city: "Toyota", country: "Japan", code: "JP", geocode: "Toyota, Aichi", url: "money/Toyota-Motor-Corporation",
 story: "Toyota Motor Corporation began in 1933 as a division of the Toyoda Automatic Loom Works, founded by Toyoda Kiichiro. Its headquarters are in Toyota City, east of Nagoya; in 2008 it became the world's largest automobile maker for the first time.",
 quotes: ["Headquarters are in Toyota City, an industrial city east of Nagoya, Japan.", "In 1933 Toyoda Kiichiro founded what later became the Toyota Motor Corporation as a division of the Toyoda Automatic Loom Works", "It became the largest automobile brand and manufacturer in the world for the first time in 2008"] });
P("samsung", "Samsung", "S", "KR", "asia", "global-brands", { ...C, qid: "samsung-daegu", type: "company_origin", diff: "hard", chapter: "From a grocery store",
 question: "Samsung began in 1938 as a grocery trading store, founded by Lee Byung-Chull in which Korean city?", clue: "South-eastern South Korea, inland from Busan.", hint: "Once spelled Taegu, it's South Korea's fourth-largest city.",
 city: "Daegu", country: "South Korea", code: "KR", url: "money/Samsung-Electronics",
 story: "Samsung was founded as a grocery trading store on 1 March 1938 by Lee Byung-Chull, who started his business in Taegu (Daegu). Today Samsung Electronics is based in Suwon.",
 quotes: ["Samsung was founded as a grocery trading store on March 1, 1938, by Lee Byung-Chull.", "He started his business in Taegu, Korea", "Based in Suwon, South Korea"] });
P("nestle", "Nestlé", "N", "CH", "europe", "global-brands", { ...C, qid: "nestle-cham", type: "company_origin", diff: "legend", chapter: "Condensed milk",
 question: "One of the two 1866 businesses that formed Nestlé — the Anglo-Swiss Condensed Milk Company — was set up in which Swiss town?", clue: "Canton of Zug, central Switzerland, on Lake Zug.", hint: "Its name has just four letters.",
 city: "Cham", country: "Switzerland", code: "CH", geocode: "Cham, Zug, Switzerland", url: "money/Nestle-SA",
 story: "Nestlé dates to 1866, when two Swiss enterprises were founded; in August that year the American brothers Charles and George Page set up the Anglo-Swiss Condensed Milk Company in Cham.",
 quotes: ["Charles A. Page and George Page, brothers from the United States, established the Anglo-Swiss Condensed Milk Company in Cham, Switzerland.", "The company dates to 1866, when two separate Swiss enterprises were founded that would later form the core of Nestlé."] });
P("starbucks", "Starbucks", "S", "US", "north-america", "global-brands", { ...C, qid: "starbucks-seattle", type: "company_origin", diff: "easy", chapter: "Café culture",
 question: "Starbucks, the world's largest coffeehouse chain, is headquartered in which city?", clue: "Pacific Northwest, on Puget Sound.", hint: "Its Space Needle is famous.",
 city: "Seattle", country: US[0], code: US[1], url: "money/Starbucks",
 story: "Starbucks operates the largest coffeehouse chain and one of the most recognizable brands in the world. It is headquartered in Seattle, Washington.",
 quotes: ["Headquartered in Seattle, Washington, the company operates more than 35,000 stores across 80 countries (as of 2022).", "Starbucks is an American company that operates the largest coffeehouse chain and one of the most recognizable brands in the world."] });
P("rolex", "Rolex", "R", "CH", "europe", "global-brands", { ...C, qid: "rolex-geneva", type: "company_origin", diff: "medium", chapter: "Swiss watches",
 question: "Rolex, the Swiss maker of luxury watches, has its headquarters in which city?", clue: "At the south-western tip of Switzerland, on a large lake.", hint: "Its lakeside fountain, the Jet d'Eau, is famous.",
 city: "Geneva", country: "Switzerland", code: "CH", url: "money/Rolex",
 story: "Rolex is a Swiss manufacturer of rugged but luxurious watches, headquartered in Geneva. Its founder, Hans Wilsdorf, was born in Germany and moved to Switzerland as a young man.",
 quotes: ["Date:1905 - present Headquarters:Geneva", "Rolex, Swiss manufacturer of rugged but luxurious watches.", "Founder Hans Wilsdorf was born in Germany but moved to Switzerland when he was a young man."] });
P("nintendo", "Nintendo", "N", "JP", "asia", "global-brands", { ...C, qid: "nintendo-kyoto", type: "company_origin", diff: "medium", chapter: "Playing cards",
 question: "Nintendo began in 1889 making hanafuda playing cards, and has been headquartered ever since in which Japanese city?", clue: "Kansai region, the old imperial capital.", hint: "It's famous for temples and geisha districts.",
 city: "Kyoto", country: "Japan", code: "JP", url: "money/Nintendo-Company-Ltd",
 story: "Nintendo was founded in 1889 by Yamauchi Fusajiro to make handmade hanafuda playing cards. Since its founding, the company has been headquartered in Kyoto.",
 quotes: ["Since its founding, the company has been headquartered in Kyoto.", "Founded in 1889 by entrepreneur Yamauchi Fusajiro, Nintendo—then known as Nintendo Koppai—produced handmade playing cards, specifically for hanafuda"] });
P("volkswagen", "Volkswagen", "VW", "DE", "europe", "global-brands", { ...C, qid: "volkswagen-wolfsburg", type: "company_origin", diff: "medium", chapter: "The people's car",
 question: "The Volkswagen Group is headquartered in which German city, home of its giant car factory?", clue: "Lower Saxony, east of Hanover.", hint: "Its football club shares the city's name.",
 city: "Wolfsburg", country: "Germany", code: "DE", url: "money/Volkswagen-Group",
 story: "The Volkswagen Group is headquartered in Wolfsburg, Germany, where models such as the Tiguan are assembled.",
 quotes: ["Headquarters:Wolfsburg", "A Volkswagen Tiguan being assembled at a factory in Wolfsburg, Germany."] });
P("hyundai", "Hyundai", "H", "KR", "asia", "global-brands", { ...C, qid: "hyundai-seoul", type: "company_origin", diff: "medium", chapter: "From construction",
 question: "The Hyundai Group was founded in 1947 as a construction firm by Chung Ju-yung and is based in which city?", clue: "On the Han River, north-western South Korea.", hint: "It's South Korea's capital.",
 city: "Seoul", country: "South Korea", code: "KR", url: "money/Hyundai-Group",
 story: "The Hyundai Group was founded in 1947 as a construction firm by Chung Ju-yung and is based in Seoul.",
 quotes: ["It was founded in 1947 as a construction firm by Chung Ju-yung and is based in Seoul."] });

// ── Finance Icons ───────────────────────────────────────────────
P("warren-buffett", "Warren Buffett", "WB", "US", "north-america", "finance-icons", { qid: "warren-buffett-omaha", type: "birthplace", diff: "medium", chapter: "The Oracle",
 question: "Investor Warren Buffett was born in 1930 in which Nebraska city — giving him the nickname 'the Oracle of' there?", clue: "Eastern Nebraska, on the Missouri River.", hint: "Nebraska's largest city.",
 city: "Omaha", country: US[0], code: US[1], geocode: "Omaha, Nebraska", url: "money/Warren-Edward-Buffett",
 story: "Warren Buffett was born in Omaha, Nebraska, in 1930. He is widely considered one of the most successful investors of the 20th and early 21st centuries.",
 quotes: ["Warren Buffett (born August 30, 1930, Omaha, Nebraska) is an American businessman and philanthropist, widely considered one of the most successful investors of the 20th and early 21st centuries"] });
P("george-soros", "George Soros", "GS", "US", "north-america", "finance-icons", { qid: "george-soros-budapest", type: "birthplace", diff: "medium", originNote: "Hungarian-born American", chapter: "Before Wall Street",
 question: "Financier George Soros was born in 1930 in which European capital?", clue: "On the Danube, in central Europe.", hint: "It's Hungary's capital.",
 city: "Budapest", country: "Hungary", code: "HU", url: "money/George-Soros",
 story: "George Soros was born in Budapest in 1930. He moved to New York City in 1956 and in 1973 set up the Soros Fund, later the Quantum Endowment Fund.",
 quotes: ["George Soros (born August 12, 1930, Budapest, Hungary) is a Hungarian-born American financier", "In 1973 Soros established the Soros Fund (later Quantum Endowment Fund)"] });
P("jp-morgan", "J. P. Morgan", "JPM", "US", "north-america", "finance-icons", { qid: "jp-morgan-hartford", type: "birthplace", diff: "hard", chapter: "A Connecticut start",
 question: "J. P. Morgan, one of the world's foremost financiers, was born in 1837 in which Connecticut state capital?", clue: "Central Connecticut, on the Connecticut River.", hint: "It's called the 'Insurance Capital of the World'.",
 city: "Hartford", country: US[0], code: US[1], geocode: "Hartford, Connecticut", url: "money/J-P-Morgan",
 story: "J. P. Morgan was born in Hartford, Connecticut, in 1837. One of the foremost financial figures before World War I, in 1891 he arranged the merger that formed General Electric.",
 quotes: ["J.P. Morgan (born April 17, 1837, Hartford, Connecticut, U.S.—died March 31, 1913, Rome, Italy) was an American financier and industrial organizer", "His first venture, in 1891, was to arrange the merger of Edison General Electric and Thomson-Houston Electric Company to form General Electric"] });
P("christine-lagarde", "Christine Lagarde", "CL", "FR", "europe", "finance-icons", { qid: "christine-lagarde-paris", type: "birthplace", diff: "easy", chapter: "A first for France",
 question: "Christine Lagarde, France's first female finance minister and later head of the IMF, was born in 1956 in which city?", clue: "On the Seine.", hint: "It's France's capital.",
 city: "Paris", country: "France", code: "FR", url: "biography/Christine-Lagarde",
 story: "Christine Lagarde was born in Paris in 1956. She was the first woman to serve as France's finance minister (2007–11) and went on to lead the International Monetary Fund.",
 quotes: ["Christine Lagarde (born January 1, 1956, Paris, France) is a French lawyer and politician who was the first woman to serve as France’s finance minister (2007–11)"] });
P("janet-yellen", "Janet Yellen", "JY", "US", "north-america", "finance-icons", { qid: "janet-yellen-brooklyn", type: "birthplace", diff: "medium", chapter: "Fed, Treasury",
 question: "Janet Yellen, the first person to lead the Fed, the Council of Economic Advisers and the Treasury, was born in 1946 in which New York borough?", clue: "Western Long Island.", hint: "Its bridge to Manhattan is famous.",
 city: "New York City", country: US[0], code: US[1], geocode: "Brooklyn, New York", url: "money/Janet-Yellen",
 story: "Janet Yellen was born in Brooklyn, New York, in 1946. She chaired the Federal Reserve (2014–18) and became the first person in US history to lead the Fed, the Council of Economic Advisers and the Treasury Department.",
 quotes: ["Janet Yellen (born August 13, 1946, Brooklyn, New York, U.S.) is an American economist, who was the chair (2014–18) of the Board of Governors of the Federal Reserve System", "as well as the first person in U.S. history to lead the Federal Reserve, the Council of Economic Advisers, and the Treasury Department."] });
P("ngozi-okonjo-iweala", "Ngozi Okonjo-Iweala", "NOI", "NG", "africa", "finance-icons", { qid: "ngozi-okonjo-iweala-ogwashi-uku", type: "birthplace", diff: "legend", chapter: "Head of the WTO",
 question: "Ngozi Okonjo-Iweala, the first woman and first African to head the WTO, was born in 1954 in which Nigerian town?", clue: "Delta State, west of the Niger River near Asaba.", hint: "Its name begins 'Ogwashi'.",
 city: "Ogwashi-Uku", country: "Nigeria", code: "NG", geocode: "Ogwashi-Uku, Delta State, Nigeria", url: "money/Ngozi-Okonjo-Iweala",
 story: "Ngozi Okonjo-Iweala was born in Ogwashi-Uku, Delta State, in 1954. After two tenures at the World Bank she became director general of the WTO in 2021 — the first woman and first African to head it.",
 quotes: ["Ngozi Okonjo-Iweala (born June 13, 1954, Ogwashi-Uku, Delta State, Nigeria) is a Nigerian-American economist who served as the seventh director general of the World Trade Organization (WTO) from 2021", "She was the first woman and the first African to head the WTO."] });
P("mayer-amschel-rothschild", "Mayer Amschel Rothschild", "MAR", "DE", "europe", "finance-icons", { qid: "mayer-rothschild-frankfurt", type: "hometown", diff: "medium", chapter: "A banking dynasty",
 question: "Mayer Amschel Rothschild, founder of the Rothschild banking house, was born and died in which German city?", clue: "On the River Main, in Hesse.", hint: "Germany's banking capital, home of the European Central Bank.",
 city: "Frankfurt", country: "Germany", code: "DE", url: "biography/Mayer-Amschel-Rothschild",
 story: "The Rothschild banking house was founded by Mayer Amschel Rothschild (1744–1812) of Frankfurt; his five sons expanded it from Frankfurt to London, Paris, Vienna and Naples.",
 quotes: ["The house was founded by Mayer Amschel Rothschild (b. February 23, 1744, Frankfurt am Main—d. September 19, 1812, Frankfurt)", "His five sons expanded the family's banking house from Frankfurt to London, Paris, Vienna, and Naples"] });
P("john-bogle", "John Bogle", "JB", "US", "north-america", "finance-icons", { qid: "john-bogle-montclair", type: "birthplace", diff: "legend", chapter: "The index fund",
 question: "John Bogle, founder of Vanguard and pioneer of the index fund, was born in 1929 in which New Jersey township?", clue: "Essex County, New Jersey, about 12 miles west of Manhattan.", hint: "It sits on the slopes of the First Watchung Mountain.",
 city: "Montclair", country: US[0], code: US[1], geocode: "Montclair, New Jersey", url: "money/John-Bogle",
 story: "John Bogle was born in Montclair, New Jersey, in 1929. He founded Vanguard in 1974, and two years later it launched the first index mutual fund available to individual investors.",
 quotes: ["Born: May 8, 1929, Montclair, New Jersey", "In 1974, Bogle founded Vanguard Group", "Two years later, Vanguard launched the First Index Investment Trust, the first index mutual fund available to individual investors."] });
P("mario-draghi", "Mario Draghi", "MD", "IT", "europe", "finance-icons", { qid: "mario-draghi-rome", type: "birthplace", diff: "easy", chapter: "Central banker",
 question: "Mario Draghi, president of the European Central Bank from 2011 to 2019, was born in 1947 in which city?", clue: "On the Tiber, central Italy.", hint: "It's Italy's capital.",
 city: "Rome", country: "Italy", code: "IT", url: "biography/Mario-Draghi",
 story: "Mario Draghi was born in Rome in 1947 and raised there, where his father worked for the Bank of Italy. He was president of the European Central Bank from 2011 to 2019.",
 quotes: ["Mario Draghi (born September 3, 1947, Rome, Italy) is an Italian economist who served from 2011 to 2019 as president of the European Central Bank (ECB)", "Draghi was raised in Rome, where his father worked for the Bank of Italy"] });

// ── Business Innovators ─────────────────────────────────────────
P("sam-walton", "Sam Walton", "SW", "US", "north-america", "business-innovators", { qid: "sam-walton-bentonville", type: "company_origin", diff: "hard", chapter: "Five-and-dime",
 question: "Before founding Walmart, Sam Walton moved his variety store in 1950 to which Arkansas town — still Walmart's home?", clue: "North-western Arkansas, in the Ozarks.", hint: "Its name begins 'Benton'.",
 city: "Bentonville", country: US[0], code: US[1], geocode: "Bentonville, Arkansas", url: "money/Sam-Walton",
 story: "Sam Walton opened a Ben Franklin variety store in Newport, Arkansas, in 1945 and moved it to Bentonville five years later. He founded Walmart in 1962 and made it the largest US retail chain by 1990.",
 quotes: ["He opened his own Ben Franklin variety (five-and-dime) store in Newport, Arkansas, in 1945 and relocated the store to Bentonville, Arkansas, five years later.", "was an American retail magnate who founded Walmart in 1962"] });
P("fred-smith", "Fred Smith", "FS", "US", "north-america", "business-innovators", { qid: "fred-smith-marks", type: "birthplace", diff: "legend", chapter: "FedEx",
 question: "Frederick W. Smith, who founded Federal Express in 1971, was born in 1944 in which small Mississippi town?", clue: "North-western Mississippi, in the Delta, south of Memphis.", hint: "Its name is a common word for scores or grades.",
 city: "Marks", country: US[0], code: US[1], geocode: "Marks, Mississippi", url: "money/Frederick-W-Smith",
 story: "Frederick W. Smith was born in Marks, Mississippi, in 1944. In 1971 he founded Federal Express, later FedEx, one of the world's largest express-delivery companies.",
 quotes: ["Frederick W. Smith (born August 11, 1944, Marks, Mississippi, U.S.—died June 21, 2025) was an American business executive who founded (1971) Federal Express (later called FedEx), one of the largest express-delivery companies in the world."] });
P("thomas-j-watson", "Thomas J. Watson", "TJW", "US", "north-america", "business-innovators", { qid: "thomas-j-watson-campbell", type: "birthplace", diff: "legend", chapter: "IBM",
 question: "Thomas J. Watson Sr., who built IBM, was born in 1874 in which small town in upstate New York?", clue: "Southern Tier of New York State, near Corning.", hint: "It shares its name with a famous soup brand.",
 city: "Campbell", country: US[0], code: US[1], geocode: "Campbell, Steuben County, New York", url: "money/Thomas-J-Watson-Sr",
 story: "Thomas J. Watson Sr. was born in Campbell, New York, in 1874, the son of a lumber dealer. He built International Business Machines (IBM) into a giant of the industry.",
 quotes: ["Thomas J. Watson, Sr. (born February 17, 1874, Campbell, New York, U.S.—died June 19, 1956, New York, New York) was an American industrialist who built the International Business Machines Corporation (IBM)", "The son of a lumber dealer"] });
P("sakichi-toyoda", "Sakichi Toyoda", "ST", "JP", "asia", "business-innovators", { qid: "sakichi-toyoda-kariya", type: "company_origin", diff: "legend", chapter: "Looms before cars",
 question: "Sakichi Toyoda founded a loom factory in the 1930s — a precursor of Toyota — in which Japanese city?", clue: "Aichi prefecture, south-east of Nagoya.", hint: "Many Toyota Group companies, such as Denso, are based there.",
 city: "Kariya", country: "Japan", code: "JP", geocode: "Kariya, Aichi", url: "place/Kariya",
 story: "Kariya was the site of a loom-manufacturing factory founded by Toyoda Sakichi, a precursor to the Toyota Motor Corporation, now headquartered in nearby Toyota.",
 quotes: ["Kariya was the site of a loom-manufacturing factory, founded there by Toyoda Sakichi in the 1930s, that was a precursor to the Toyota Motor Corporation, which now has its headquarters in nearby Toyota."] });
P("masaru-ibuka", "Masaru Ibuka", "MI", "JP", "asia", "business-innovators", { qid: "masaru-ibuka-tokyo", type: "company_origin", diff: "medium", chapter: "Tokyo Telecommunications",
 question: "Masaru Ibuka and Akio Morita incorporated Sony in 1946 as 'Tokyo Tsushin Kogyo' — in which city?", clue: "On a great bay on Honshu's Pacific coast.", hint: "Japan's capital.",
 city: "Tokyo", country: "Japan", code: "JP", url: "money/Sony",
 story: "Sony was incorporated by Ibuka Masaru and Morita Akio in 1946 as Tokyo Tsushin Kogyo ('Tokyo Telecommunications Engineering Corporation'). Its first consumer product was an electric rice cooker; in 1950 it introduced the first Japanese-designed tape recorder.",
 quotes: ["The company was incorporated by Ibuka Masaru and Morita Akio in 1946 as Tokyo Tsushin Kogyo (“Tokyo Telecommunications Engineering Corporation”).", "The company’s first consumer product was an electric rice cooker.", "In 1950 Totsuko introduced the first Japanese-designed tape recorder."] });
P("clarence-birdseye", "Clarence Birdseye", "CB", "US", "north-america", "business-innovators", { qid: "clarence-birdseye-brooklyn", type: "hometown", diff: "medium", chapter: "Frozen food",
 question: "Clarence Birdseye, who developed packaged frozen food, was raised in which New York borough?", clue: "Western Long Island.", hint: "Its bridge to Manhattan is famous.",
 city: "New York City", country: US[0], code: US[1], geocode: "Brooklyn, New York", url: "biography/Clarence-Birdseye",
 story: "Clarence Birdseye was born in New York in 1886 and raised in Brooklyn. He developed an efficient process for freezing foods in small retail packages that preserved their original taste.",
 quotes: ["Birdseye was raised in Brooklyn, New York, and from a young age was interested in the natural sciences.", "was an American businessman and inventor best known for developing a process for freezing foods in small packages suitable for retailing"] });
P("king-gillette", "King C. Gillette", "KCG", "US", "north-america", "business-innovators", { qid: "king-gillette-fond-du-lac", type: "birthplace", diff: "legend", chapter: "Disposable blades",
 question: "King C. Gillette, first maker of a razor with disposable blades, was born in 1855 in which Wisconsin city?", clue: "At the southern tip of Lake Winnebago, Wisconsin.", hint: "Its name is French for 'bottom of the lake'.",
 city: "Fond du Lac", country: US[0], code: US[1], geocode: "Fond du Lac, Fond du Lac County, Wisconsin, United States", url: "biography/King-Camp-Gillette",
 story: "King Camp Gillette was born in Fond du Lac, Wisconsin, in 1855. The first manufacturer of a razor with disposable blades, his company made its first sale in 1903 and produced 90,000 razors by the end of 1904.",
 quotes: ["King Camp Gillette (born January 5, 1855, Fond du Lac, Wisconsin, U.S.—died July 9, 1932, Los Angeles, California) was an American inventor and the first manufacturer of a razor with disposable blades", "by the end of 1904, it had produced 90,000 razors and 12,400,000 blades."] });
P("taiichi-ohno", "Taiichi Ohno", "TO", "JP", "asia", "business-innovators", { qid: "taiichi-ohno-toyota-city", type: "historic_location", diff: "hard", chapter: "Production control",
 question: "Taiichi Ohno, the production-control expert of the Toyota Motor Co., died in 1990 in which Japanese city named after the company?", clue: "Aichi prefecture, east of Nagoya.", hint: "It shares the carmaker's name.",
 city: "Toyota", country: "Japan", code: "JP", geocode: "Toyota, Aichi", url: "money/Ohno-Taiichi",
 story: "Ohno Taiichi, born in Manchuria in 1912, was a production-control expert for the Toyota Motor Co. He died in Toyota City in 1990.",
 quotes: ["Ohno Taiichi (born 1912, Manchuria, China—died May 28, 1990, Toyota City, Japan) was a Japanese production-control expert for the Toyota Motor Co"] });
P("frederick-taylor", "Frederick Winslow Taylor", "FWT", "US", "north-america", "business-innovators", { qid: "frederick-taylor-philadelphia", type: "birthplace", diff: "medium", chapter: "Scientific management",
 question: "Frederick W. Taylor, 'father of scientific management', was born and died in which city?", clue: "South-eastern Pennsylvania, on the Delaware River.", hint: "The Liberty Bell is there.",
 city: "Philadelphia", country: US[0], code: US[1], url: "biography/Frederick-W-Taylor",
 story: "Frederick W. Taylor was born in Philadelphia in 1856 and died there in 1915. An inventor and engineer, he is known as the father of scientific management; the profession of time study grew from his work.",
 quotes: ["Frederick W. Taylor (born March 20, 1856, Philadelphia, Pennsylvania, U.S.—died March 21, 1915, Philadelphia) was an American inventor and engineer who is known as the father of scientific management", "The profession of time study was founded on the success of this project"] });

const memberships = [
 ["ingvar-kamprad-almhult", "founders", "founded IKEA"], ["soichiro-honda-hamamatsu", "founders", "founded Honda Motor Company"],
 ["henry-ford-detroit", "business-innovators", "revolutionized factory production with the assembly line"],
 ["muhammad-yunus-chittagong", "finance-icons", "founder of the microcredit Grameen Bank"],
].map(([questionId, subcategory, reason]) => ({ questionId, category: "business", subcategory, reason }));
require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-14.json"),
 JSON.stringify({ batch: 14, researched: "2026-10-07", coordinateSource: "OpenStreetMap Nominatim", entries, memberships }, null, 1) + "\n");
console.log(entries.length, "entries,", memberships.length, "memberships");
