// Batch 16 — Fashion & Beauty. Source of src/content/batches/batch-16.json (run: node docs/content-research/batch-16.src.cjs).
// People are sourced from Britannica, Forbes profiles and The Business of Fashion (BoF 500) profiles. Fashion houses are
// brand entities (kind "brand"); fashion capitals are fashion weeks (kind "event") and shopping streets (kind "landmark"),
// so the star card names the house, event or street and never the answer city. Forbes "Residence" is used only as "is based in".
const BR = "https://www.britannica.com/", FB = "https://www.forbes.com/profile/", BOF = "https://www.businessoffashion.com/community/people/";
const FW = BR + "topic/fashion-week";
const entries = [];
const P = (id, name, mono, cc, region, sub, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.kind ? { kind: q.kind } : {}), ...(q.originNote ? { originNote: q.originNote } : {}) },
 question: { id: q.qid, primaryCategory: "fashion", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: q.display ?? "Fashion", chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, ...(q.geocode ? { geocode: q.geocode } : {}) }, story: q.story,
  ...(q.secondary ? { secondary: q.secondary } : {}),
  sources: q.quotes.map((x, i) => { const [url, quote] = Array.isArray(x) ? x : [q.url, x]; return { url: /^https:/.test(url) ? url : BR + url, role: i ? "extra" : "primary", quality: "reputable_secondary", quote }; }) },
});
const US = ["United States", "US"], GB = ["United Kingdom", "GB"], IT = ["Italy", "IT"], FR = ["France", "FR"];
const H = { kind: "brand", display: "Fashion Houses", type: "company_origin" };

// ── Supermodels ─────────────────────────────────────────────────
P("naomi-campbell", "Naomi Campbell", "NC", "GB", "europe", "supermodels", { qid: "naomi-campbell-london", type: "birthplace", diff: "easy", chapter: "Where the story began",
 question: "Naomi Campbell, one of the elite supermodels of the 1980s and '90s, was born in which city?", clue: "A capital on the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "London, England", url: "biography/Naomi-Campbell",
 story: "Naomi Campbell was born in London in 1970 and grew up there and in Rome. One of the elite supermodels of the 1980s and '90s, she became the first Black model on the cover of many luxury fashion magazines, including British and French Vogue.",
 quotes: ["Naomi Campbell (born May 22, 1970, London, England) is a British fashion model and actress best known as one of the elite “supermodels” who dominated the fashion industry in the 1980s and ’90s.", "She was the first Black model to appear on the cover of many luxury fashion magazines."] });
P("kate-moss", "Kate Moss", "KM", "GB", "europe", "supermodels", { qid: "kate-moss-croydon", type: "hometown", diff: "hard", chapter: "The anti-supermodel",
 question: "Kate Moss, whose natural look defined 1990s fashion, grew up in which London borough?", clue: "South London, a large borough with its own tram network.", hint: "Its name starts with 'Croy'.",
 city: "Croydon", country: GB[0], code: GB[1], geocode: "Croydon, London", url: "biography/Kate-Moss",
 secondary: [{ category: "icons", subcategory: "fashion-icons" }],
 story: "Kate Moss grew up in the London borough of Croydon. Her waifish figure and seemingly effortless personal style challenged the polished glamour of earlier runway stars, and she became known as the 'anti-supermodel' of the minimalist 1990s.",
 quotes: ["Moss grew up in the London borough of Croydon.", "Kate Moss (born January 16, 1974, London, England) is a British fashion model whose waifish figure, understated beauty, and seemingly effortless personal style challenged the polished glamor associated with earlier runway stars and became closely identified with the more natural, minimalist look of the 1990s."] });
P("cindy-crawford", "Cindy Crawford", "CC", "US", "north-america", "supermodels", { qid: "cindy-crawford-dekalb", type: "hometown", diff: "hard", chapter: "Valedictorian to supermodel",
 question: "Cindy Crawford, among the first 'supermodels', grew up in which Illinois city near Chicago?", clue: "Northern Illinois, home of a state university.", hint: "Its name starts with 'De'.",
 city: "DeKalb", country: US[0], code: US[1], geocode: "DeKalb, DeKalb County, Illinois", url: "biography/Cindy-Crawford",
 story: "Cindy Crawford grew up in DeKalb, Illinois, where she graduated as class valedictorian in 1984 before turning to modelling. She became one of the first supermodels and is considered the first model to branch out into many industries.",
 quotes: ["Crawford grew up in DeKalb, Illinois, near Chicago, where her father worked as an electrician and her mother was employed as a bank teller.", "Cindy Crawford (born February 20, 1966, DeKalb, Illinois, U.S.) is an American fashion model and television personality who first gained fame in the 1980s and was among the first “supermodels.”"] });
P("tyra-banks", "Tyra Banks", "TB", "US", "north-america", "supermodels", { qid: "tyra-banks-inglewood", type: "hometown", diff: "medium", chapter: "The new Naomi",
 question: "Supermodel Tyra Banks was born and raised in which suburb of Los Angeles?", clue: "Next to LAX airport.", hint: "Its name starts with 'Ingle'.",
 city: "Inglewood", country: US[0], code: US[1], geocode: "Inglewood, California", url: "biography/Tyra-Banks",
 story: "Tyra Banks was born and raised in Inglewood, a suburb of Los Angeles. She walked a record 25 shows in her first season and became the first African American woman on the cover of GQ and the Sports Illustrated swimsuit issue.",
 quotes: ["Banks was raised in Inglewood, a suburb of Los Angeles, where she attended a local all-girls Catholic school.", "Banks walked a record 25 shows in her first season"] });
P("gisele-bundchen", "Gisele Bündchen", "GB", "BR", "latin-america", "supermodels", { qid: "gisele-bundchen-horizontina", type: "hometown", diff: "hard", chapter: "Small-town start",
 question: "Supermodel Gisele Bündchen was raised in which small rural town in southern Brazil?", clue: "Rio Grande do Sul, near the Argentine border.", hint: "Its name contains the word 'horizon'.",
 city: "Horizontina", country: "Brazil", code: "BR", geocode: "Horizontina, Rio Grande do Sul", url: "biography/Gisele-Bundchen",
 story: "Gisele Bündchen was born and raised in Horizontina, a small rural town in southern Brazil, with her five sisters. She moved to New York City to model, and her fame was heralded as the return of the 'supermodel'.",
 quotes: ["Bündchen was raised in the city of Horizontina—a small rural town in southern Brazil—with her five sisters, one of whom is her fraternal twin.", "Gisele Bündchen (born July 20, 1980, Horizontina, Rio Grande do Sul, Brazil) is a Brazilian model who first gained fame in the late 1990s and who later became a “supermodel,”"] });
P("heidi-klum", "Heidi Klum", "HK", "DE", "europe", "supermodels", { qid: "heidi-klum-bergisch-gladbach", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Supermodel and Project Runway host Heidi Klum was born in which German town near Cologne?", clue: "North Rhine-Westphalia, east of Cologne.", hint: "Its name starts with 'Bergisch'.",
 city: "Bergisch Gladbach", country: "Germany", code: "DE", geocode: "Bergisch Gladbach, Germany", url: "biography/Heidi-Klum",
 story: "Heidi Klum was born in Bergisch Gladbach, in North Rhine-Westphalia, in 1973. She launched her modelling career in New York City in 1993 and went on to host Germany's Next Topmodel and Project Runway.",
 quotes: ["Heidi Klum (born June 1, 1973, Bergisch Gladbach, North Rhine–Westphalia, West Germany) is a German American supermodel, television personality, and businesswoman who hosted Germany’s Next Topmodel and Project Runway."] });
P("linda-evangelista", "Linda Evangelista", "LE", "CA", "north-america", "supermodels", { qid: "linda-evangelista-st-catharines", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Supermodel Linda Evangelista was born in which Ontario city near Niagara Falls?", clue: "On Lake Ontario, in the Niagara region.", hint: "It's named after a saint.",
 city: "St. Catharines", country: "Canada", code: "CA", geocode: "St. Catharines, Ontario", url: "biography/Linda-Evangelista",
 story: "Linda Evangelista was born in St. Catharines, Ontario, to working-class Italian immigrants. She became one of the original supermodels, best known as a face of Revlon and the Versace fashion house.",
 quotes: ["Linda Evangelista (born May 10, 1965, St. Catharines, Ontario, Canada) is a Canadian fashion model perhaps best known as a face of the cosmetics company Revlon and of the Versace fashion house.", "Evangelista was born to working-class Italian immigrants."] });
P("christy-turlington", "Christy Turlington", "CT", "US", "north-america", "supermodels", { qid: "christy-turlington-walnut-creek", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Supermodel Christy Turlington, a face of Maybelline and Calvin Klein, was born in which East Bay city?", clue: "Contra Costa County, east of Oakland.", hint: "It's named after a nut tree.",
 city: "Walnut Creek", country: US[0], code: US[1], geocode: "Walnut Creek, California", url: "biography/Christy-Turlington",
 story: "Christy Turlington was born in Walnut Creek, California, and raised in nearby Danville. At 18 she moved to New York City to model, becoming a face of Maybelline and Calvin Klein, and she later founded Every Mother Counts.",
 quotes: ["Christy Turlington (born January 2, 1969, Walnut Creek, California, U.S.) is an American fashion model best known as a face of the cosmetics company Maybelline and the Calvin Klein fashion house.", "At age 18 she moved to New York City to pursue a professional modeling career."] });

// ── Designers ───────────────────────────────────────────────────
P("yves-saint-laurent", "Yves Saint Laurent", "YSL", "FR", "europe", "designers", { qid: "yves-saint-laurent-oran", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Yves Saint Laurent, creator of the women's tuxedo 'Le Smoking', was born in which North African port city?", clue: "On Algeria's Mediterranean coast, west of Algiers.", hint: "Albert Camus set The Plague there.",
 city: "Oran", country: "Algeria", code: "DZ", geocode: "Oran, Algeria", url: "biography/Yves-Saint-Laurent-French-designer",
 story: "Yves Saint Laurent was born in Oran, Algeria, in 1936. He rose to head designer of the House of Dior at a young age, then founded his own couture house, introducing the women's tuxedo suit 'Le Smoking'.",
 quotes: ["Yves Saint Laurent (born August 1, 1936, Oran, Algeria—died June 1, 2008, Paris, France) was a French fashion designer widely regarded as one of the most influential figures in 20th-century fashion."] });
P("christian-dior", "Christian Dior", "CD", "FR", "europe", "designers", { qid: "christian-dior-granville", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Christian Dior, whose 'New Look' ruled postwar fashion, was born in which Normandy seaside town?", clue: "On the Cotentin peninsula, facing Mont-Saint-Michel bay.", hint: "Its name starts with 'Gran'.",
 city: "Granville", country: FR[0], code: FR[1], geocode: "Granville, Manche", url: "biography/Christian-Dior-French-designer",
 story: "Christian Dior was born in Granville, Normandy, in 1905. Backed by textile magnate Marcel Boussac, he founded his own fashion house in 1946, and his New Look dominated fashion in the decade after World War II.",
 quotes: ["Christian Dior (born January 21, 1905, Granville, France—died October 24, 1957, Montecatini, Italy) was a French fashion designer whose New Look—characterized by ultrafeminine and highly sculptured clothing—dominated fashion in the decade following World War II.", "Backed by French entrepreneur and textile manufacturer Marcel Boussac, Dior founded his own fashion house in 1946."] });
P("giorgio-armani", "Giorgio Armani", "GA", "IT", "europe", "designers", { qid: "giorgio-armani-piacenza", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Giorgio Armani, master of relaxed luxury tailoring, was born in which northern Italian city on the Po?", clue: "Emilia-Romagna, near the border with Lombardy.", hint: "Its name starts with 'Pia'.",
 city: "Piacenza", country: IT[0], code: IT[1], geocode: "Piacenza, Italy", url: "biography/Giorgio-Armani",
 story: "Giorgio Armani was born in Piacenza in 1934. In 1975, with his partner Sergio Galeotti, he launched his own ready-to-wear label, and he said of his style: 'I was the first to soften the image of men, and harden the image of women.'",
 quotes: ["Giorgio Armani (born July 11, 1934, Piacenza, Italy—died September 4, 2025, Milan) was an Italian fashion designer", "In 1975, with the help of his friend and business partner Sergio Galeotti, Armani launched his own label of ready-to-wear for men and women."] });
P("karl-lagerfeld", "Karl Lagerfeld", "KL", "DE", "europe", "designers", { qid: "karl-lagerfeld-hamburg", type: "birthplace", diff: "medium", chapter: "Where the story began",
 question: "Karl Lagerfeld, the creative force behind Chanel's modern revival, was born in which German port city?", clue: "On the Elbe, Germany's second-largest city.", hint: "It shares its name with a famous sandwich.",
 city: "Hamburg", country: "Germany", code: "DE", geocode: "Hamburg, Germany", url: "biography/Karl-Lagerfeld",
 story: "Karl Lagerfeld was born in Hamburg and moved to Paris in 1952. From 1983 he led Chanel, reviving the house founded by Coco Chanel, and he launched his own label in 1984.",
 quotes: ["Karl Lagerfeld (born September 10, 1933?, Hamburg, Germany—died February 19, 2019, Paris, France) was a German fashion designer and photographer best known as the creative power behind the modern revival of Chanel", "Lagerfeld moved to Paris in 1952."] });
P("vivienne-westwood", "Vivienne Westwood", "VW", "GB", "europe", "designers", { qid: "vivienne-westwood-glossop", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Punk-era designer Vivienne Westwood was born in which Derbyshire town on the edge of the Peak District?", clue: "In the High Peak, east of Manchester.", hint: "Its name starts with 'Gloss'.",
 city: "Glossop", country: GB[0], code: GB[1], geocode: "Glossop, Derbyshire", url: "biography/Vivienne-Westwood",
 story: "Vivienne Westwood was born in Glossop, Derbyshire, in 1941. Known for provocative clothing, she staged her first ready-to-wear collection, Pirates, with Malcolm McLaren in 1981 and built her own fashion empire.",
 quotes: ["Vivienne Westwood (born April 8, 1941, Glossop, Derbyshire, England—died December 29, 2022, London) was a British fashion designer known for her provocative clothing."] });
P("issey-miyake", "Issey Miyake", "IM", "JP", "asia", "designers", { qid: "issey-miyake-hiroshima", type: "birthplace", diff: "medium", chapter: "Where the story began",
 question: "Issey Miyake, who blended Eastern and Western design, was born in which Japanese city?", clue: "On the delta of the Ōta River, in western Honshu.", hint: "It has a famous Peace Memorial Park.",
 city: "Hiroshima", country: "Japan", code: "JP", geocode: "Hiroshima, Japan", url: "biography/Issey-Miyake",
 story: "Issey Miyake was born in Hiroshima in 1938. After studying in Tokyo and Paris, he became known for combining Eastern and Western elements, and in 2006 was the first fashion designer to receive the Kyoto Prize.",
 quotes: ["Issey Miyake (born April 22, 1938, Hiroshima, Japan—died August 5, 2022, Tokyo) was a Japanese fashion designer who was known for combining Eastern and Western elements in his work."] });
P("oscar-de-la-renta", "Oscar de la Renta", "OR", "DO", "caribbean", "designers", { qid: "oscar-de-la-renta-santo-domingo", type: "birthplace", diff: "medium", chapter: "Where the story began",
 question: "Oscar de la Renta, designer to first ladies and red-carpet stars, was born in which Caribbean capital?", clue: "The oldest European-founded city in the Americas.", hint: "It's the capital of the Dominican Republic.",
 city: "Santo Domingo", country: "Dominican Republic", code: "DO", geocode: "Santo Domingo, Distrito Nacional", url: "biography/Oscar-de-la-Renta",
 story: "Oscar de la Renta was born in Santo Domingo in 1932. After working in Paris, he moved to New York and founded his own company in 1965, dressing first ladies from Jacqueline Kennedy Onassis to Michelle Obama.",
 quotes: ["Born: July 22, 1932, Santo Domingo, Dominican Republic", "In 1965 he established his own eponymous company in New York."] });
P("alexander-mcqueen", "Alexander McQueen", "AM", "GB", "europe", "designers", { qid: "alexander-mcqueen-london", type: "hometown", diff: "easy", chapter: "East End roots",
 question: "Alexander McQueen, famed for shocking catwalk shows and precise tailoring, grew up in which city's East End?", clue: "A capital on the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "London, England", url: "biography/Alexander-McQueen",
 story: "Alexander McQueen grew up in London's East End, the youngest of six children of a taxi driver. Known for precise tailoring and shocking shows, he was named British Designer of the Year in 1996 and became head designer at Givenchy.",
 quotes: ["McQueen grew up in London’s East End; he was the youngest of six children of a father who was a taxicab driver and a mother who was a social studies teacher and genealogist.", "In 1996 he was named British Designer of the Year"] });

// ── Beauty Entrepreneurs ────────────────────────────────────────
P("estee-lauder", "Estée Lauder", "EL", "US", "north-america", "beauty-entrepreneurs", { qid: "estee-lauder-new-york", type: "birthplace", diff: "easy", chapter: "Where the story began",
 question: "Estée Lauder, who cofounded a cosmetics giant in 1946, was born in which US city?", clue: "On the Hudson River, the largest US city.", hint: "The Big Apple.",
 city: "New York City", country: US[0], code: US[1], geocode: "Queens, New York", url: "money/Estee-Lauder",
 story: "Estée Lauder was born in New York and learned her first marketing lessons in her father's hardware store. In 1946 she and her husband founded Estée Lauder, Inc., which grew into a large fragrance and cosmetics company.",
 quotes: ["Estée Lauder (born July 1, 1908?, New York, New York, U.S.—died April 24, 2004, New York) was an American businesswoman who cofounded (1946) Estée Lauder, Inc., a large fragrance and cosmetics company."] });
P("helena-rubinstein", "Helena Rubinstein", "HR", "PL", "europe", "beauty-entrepreneurs", { qid: "helena-rubinstein-melbourne", type: "career_location", diff: "hard", chapter: "The first shop",
 question: "Cosmetics pioneer Helena Rubinstein opened her first small shop selling creams in which Australian city?", clue: "On Port Phillip Bay, capital of Victoria.", hint: "It's Australia's second-largest city.",
 city: "Melbourne", country: "Australia", code: "AU", geocode: "Melbourne, Victoria", url: "money/Helena-Rubinstein", originNote: "Born in Kraków, Poland.",
 story: "On a visit to relatives in Australia in the 1890s, Helena Rubinstein saw a lack of skin-care products and opened a small shop in Melbourne. She went on to open salons in London, Paris and New York and built Helena Rubinstein, Inc.",
 quotes: ["There, the lack of cosmetics, particularly skin-care products, prompted her to open a small shop in Melbourne to sell creams and the like, which at first she imported from Europe and later began manufacturing herself.", "She founded Helena Rubinstein, Inc., a leading manufacturer and distributor of women’s cosmetics."] });
P("elizabeth-arden", "Elizabeth Arden", "EA", "CA", "north-america", "beauty-entrepreneurs", { qid: "elizabeth-arden-woodbridge", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Elizabeth Arden, founder of a cosmetics line and salon chain, was born in which Ontario community north of Toronto?", clue: "Now part of the city of Vaughan.", hint: "Its name ends in 'bridge'.",
 city: "Woodbridge", country: "Canada", code: "CA", geocode: "Woodbridge, Vaughan, Ontario", url: "money/Elizabeth-Arden-American-businesswoman",
 story: "Born Florence Nightingale Graham in Woodbridge, Ontario, in 1884, Elizabeth Arden built a successful cosmetics line and a chain of beauty salons and spas, opening a Paris salon in 1922.",
 quotes: ["Born:Dec. 31, 1884, Woodbridge, Ont., Can.", "18, 1966, New York, N.Y., U.S.) was a Canadian-born American businesswoman who developed a successful line of cosmetics and a chain of beauty salons and spas."] });
P("madam-cj-walker", "Madam C. J. Walker", "CW", "US", "north-america", "beauty-entrepreneurs", { qid: "madam-cj-walker-pittsburgh", type: "career_location", diff: "hard", chapter: "Lelia College",
 question: "Haircare pioneer Madam C. J. Walker opened her Lelia College of Beauty Culture in 1908 in which city?", clue: "Where the Allegheny and Monongahela rivers meet.", hint: "The Steel City.",
 city: "Pittsburgh", country: US[0], code: US[1], geocode: "Pittsburgh, Pennsylvania", url: "money/Madam-C-J-Walker",
 story: "Madam C. J. Walker, one of the first African American female millionaires, trained agents across the US before settling in Pittsburgh in 1908, where she opened the Lelia College of Beauty Culture, named for her daughter.",
 quotes: ["In 1908, after two years of training Walker agents and “beauty culturists” throughout the southern and eastern United States, Walker and her husband settled in Pittsburgh, where she opened the Lelia College of Beauty Culture, a school named for her daughter.", "was an American businesswoman and philanthropist who was one of the first African American female millionaires in the United States."] });
P("charles-revson", "Charles Revson", "CR", "US", "north-america", "beauty-entrepreneurs", { qid: "charles-revson-boston", type: "birthplace", diff: "medium", chapter: "Where the story began",
 question: "Charles Revson, who started Revlon with $300, was born in which New England city?", clue: "Capital of Massachusetts.", hint: "Home of the 1773 Tea Party.",
 city: "Boston", country: US[0], code: US[1], geocode: "Boston, Massachusetts", url: "money/Charles-H-Revson",
 story: "Charles Revson was born in Boston in 1906. During the Great Depression he started Revlon with his brother Joseph and chemist Charles Lachman on $300 of capital, and he was the first to introduce matching lipsticks and nail polishes.",
 quotes: ["Charles H. Revson (born Oct. 11, 1906, Boston—died Aug. 24, 1975, New York City) was an American businessman", "Revson was also the first to introduce matching lipsticks and polishes."] });
P("huda-kattan", "Huda Kattan", "HK", "US", "north-america", "beauty-entrepreneurs", { qid: "huda-kattan-dubai", type: "career_location", diff: "medium", chapter: "Huda Beauty",
 question: "Makeup artist Huda Kattan built her Huda Beauty company in which Gulf city?", clue: "In the United Arab Emirates, home of the Burj Khalifa.", hint: "It isn't the UAE capital, but it is its biggest city.",
 city: "Dubai", country: "United Arab Emirates", code: "AE", geocode: "Dubai, United Arab Emirates", url: FB + "huda-kattan/", originNote: "Born and raised in Oklahoma.",
 story: "Huda Kattan, born and raised in Oklahoma, quit finance to become a makeup artist and started Huda Beauty with her sisters in 2013. Her Dubai-based company later launched the fragrance brand Kayali.",
 secondary: [{ category: "fashion", subcategory: "makeup-icons" }],
 quotes: ["Her Dubai-based startup launched its second brand, a fragrance company called Kayali (means \"my imagination\" in Arabic) in 2018.", "Kattan started Huda Beauty with her two sisters in 2013 when she couldn't find false eyelashes to buy.", "Kattan was born and raised in Oklahoma and is the daughter of immigrants from Iraq.", "Miserable in her finance job, Huda Kattan quit to become a makeup artist and then launched a blog in 2010."] });
P("anastasia-soare", "Anastasia Soare", "AS", "RO", "europe", "beauty-entrepreneurs", { qid: "anastasia-soare-beverly-hills", type: "company_origin", diff: "medium", chapter: "The brow queen",
 question: "Brow expert Anastasia Soare named her beauty brand after which Los Angeles-area city?", clue: "Home of 90210.", hint: "Famous for Rodeo Drive.",
 city: "Beverly Hills", country: US[0], code: US[1], geocode: "Beverly Hills, California", url: FB + "anastasia-soare/", originNote: "Born in Romania.",
 story: "Born in Romania, Anastasia Soare immigrated to Los Angeles in 1989 and worked in a beauty salon. In 2000 she launched a line of eyebrow products called Anastasia Beverly Hills, which grew into a billion-dollar business.",
 quotes: ["Three years later, she struck out on her own, and in 2000, she launched a line of eyebrow products under the name Anastasia Beverly Hills.", "Born in Romania, she immigrated to Los Angeles in 1989 and got a job in a beauty salon."] });

P("lisa-price", "Lisa Price", "LP", "US", "north-america", "beauty-entrepreneurs", { qid: "lisa-price-brooklyn", type: "company_origin", diff: "medium", chapter: "Kitchen start-up",
 question: "Lisa Price founded the Carol's Daughter beauty line in 1993 in her kitchen in which New York City borough?", clue: "Across the East River from Manhattan, reached by a famous bridge.", hint: "Its name starts with 'Brook'.",
 city: "Brooklyn", country: US[0], code: US[1], geocode: "Brooklyn, New York", url: FB + "lisa-price/",
 story: "Lisa Price founded Carol's Daughter, a line of beauty products named for her mother, Carol, in her kitchen in Brooklyn in 1993.",
 quotes: ["Price founded Carol's Daughter line of beauty products, named for her mother, Carol, in her kitchen in Brooklyn, NY, in 1993."] });
// ── Makeup Icons ────────────────────────────────────────────────
P("max-factor", "Max Factor", "MF", "PL", "europe", "makeup-icons", { qid: "max-factor-lodz", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Max Factor, 'the dean of Hollywood makeup experts', was born in which Polish textile city?", clue: "Central Poland, once called the 'Polish Manchester'.", hint: "Its name has a slashed L.",
 city: "Łódź", country: "Poland", code: "PL", geocode: "Łódź, Poland", url: "biography/Max-Factor",
 story: "Max Factor was born in Łódź, then in the Russian Empire, and emigrated to the United States in 1904. In 1910 he created the first makeup designed expressly for motion pictures, becoming the dean of Hollywood makeup.",
 quotes: ["Max Factor (born 1877, Łódź, Poland, Russian Empire—died August 30, 1938, Beverly Hills, California, U.S.) was the dean of Hollywood makeup experts.", "In 1910 Factor created the first makeup designed expressly for motion pictures."] });
P("bobbi-brown", "Bobbi Brown", "BB", "US", "north-america", "makeup-icons", { qid: "bobbi-brown-montclair", type: "hometown", diff: "hard", chapter: "Home town",
 question: "Makeup artist Bobbi Brown opened a boutique hotel, The George, in her hometown — which New Jersey town?", clue: "Essex County, a short train ride from Manhattan.", hint: "Its name starts with 'Mont'.",
 city: "Montclair", country: US[0], code: US[1], geocode: "Montclair, New Jersey", url: FB + "bobbi-brown/",
 story: "Makeup artist Bobbi Brown launched her eponymous cosmetics brand in 1991 and sold it to Estée Lauder. In 2018 she and her husband opened a boutique hotel, The George, in her hometown of Montclair, New Jersey.",
 quotes: ["In 2018, with her husband Steven Plofker, Brown opened a boutique hotel called The George in her hometown, Montclair, New Jersey.", "Makeup artist-entrepreneur Brown launched her eponymous cosmetics brand in 1991, which she sold to Estee Lauder in 1995 for a reported $74.5 million."] });

P("pat-mcgrath", "Pat McGrath", "PM", "GB", "europe", "makeup-icons", { qid: "pat-mcgrath-northampton", type: "hometown", diff: "hard", chapter: "Born and raised",
 question: "Makeup artist Pat McGrath, founder of Pat McGrath Labs, was born and raised in which English town?", clue: "In the East Midlands, historically famous for shoemaking.", hint: "Its name starts with 'North'.",
 city: "Northampton", country: GB[0], code: GB[1], geocode: "Northampton, England", url: "https://londondesignfestival.com/stories/in-conversation-with-pat-mcgrath-dbe/",
 story: "Pat McGrath was born and raised in Northampton and credits her late mother for her love of style. Called the most powerful person in fashion by Ebony, she founded Pat McGrath Labs in 2015, which grew to a $1 billion valuation.",
 quotes: ["Born and raised in Northampton, McGrath credits her late mother, a devout Jehovah's Witness, for her love and appreciation of style.", [FB + "pat-mcgrath/", "McGrath is the founder and namesake of the beauty products company Pat McGrath Labs, which launched in 2015 and quickly grew to become valued at $1 billion."]] });
P("charlotte-tilbury", "Charlotte Tilbury", "CT", "GB", "europe", "makeup-icons", { qid: "charlotte-tilbury-ibiza", type: "hometown", diff: "hard", chapter: "Island childhood",
 question: "Makeup artist Charlotte Tilbury spent her early childhood on which Mediterranean island before boarding school in England?", clue: "One of Spain's Balearic Islands, famous for clubbing.", hint: "Its name starts with 'I'.",
 city: "Ibiza", country: "Spain", code: "ES", geocode: "Ibiza, Balearic Islands", url: BOF + "charlotte-tilbury",
 story: "Charlotte Tilbury moved from Ibiza when she was 9 and discovered the power of cosmetics at boarding school in England. She trained in London and launched her own makeup line at Selfridges in 2013.",
 quotes: ["Having moved from Ibiza when she was 9 years old, Tilbury discovered the power of cosmetics while at boarding school in England.", "In summer 2013, Tilbury launched her own eponymous line of cosmetics at London's Selfridges."] });
P("isamaya-ffrench", "Isamaya Ffrench", "IF", "GB", "europe", "makeup-icons", { qid: "isamaya-ffrench-cambridge", type: "hometown", diff: "hard", chapter: "University town",
 question: "Avant-garde makeup artist Isamaya Ffrench grew up in which English university city?", clue: "On the River Cam.", hint: "Oxford's great rival.",
 city: "Cambridge", country: GB[0], code: GB[1], geocode: "Cambridge, Cambridgeshire", url: BOF + "isamaya-ffrench",
 story: "Isamaya Ffrench grew up in Cambridge and moved to London at 18 to study 3D design. She became one of fashion's most sought-after makeup artists and in 2019 was named Christian Louboutin Beauté's global makeup ambassador.",
 quotes: ["Ffrench grew up in Cambridge and relocated to London at age 18 to study 3D design at the Chelsea College of Arts"] });
P("peter-philips", "Peter Philips", "PP", "BE", "europe", "makeup-icons", { qid: "peter-philips-antwerp", type: "career_location", diff: "hard", chapter: "Art school",
 question: "Dior makeup director Peter Philips studied at the Royal Academy of Fine Arts in which Belgian city?", clue: "A Flemish port famous for diamonds.", hint: "Rubens lived there.",
 city: "Antwerp", country: "Belgium", code: "BE", geocode: "Antwerp, Belgium", url: BOF + "peter-philips",
 story: "Belgian makeup artist Peter Philips studied at the Royal Academy of Fine Arts in Antwerp. He was a makeup artist at Chanel before becoming Christian Dior's creative and image director for makeup in 2014.",
 quotes: ["Education Royal Academy of Fine Arts Antwerp", "Chanel Makeup Artist 2008 - 2013"] });
P("lucia-pieroni", "Lucia Pieroni", "LP", "GB", "europe", "makeup-icons", { qid: "lucia-pieroni-new-york", type: "career_location", diff: "medium", chapter: "The big break",
 question: "British makeup artist Lucia Pieroni moved in 1995 to which city, which she says 'gave me my big break'?", clue: "On the Hudson, home of Vogue's US office.", hint: "The Big Apple.",
 city: "New York City", country: US[0], code: US[1], geocode: "Manhattan, New York", url: BOF + "lucia-pieroni",
 story: "Lucia Pieroni moved to New York in 1995 to further her career, and says the city gave her her big break. She has created campaign makeup for Calvin Klein, Givenchy, Versace, Armani and others.",
 quotes: ["In 1995, Pieroni moved to New York to benefit her career, “New York really gave me my big break,"] });
P("shu-uemura", "Shu Uemura", "SU", "JP", "asia", "makeup-icons", { qid: "shu-uemura-hollywood", type: "career_location", diff: "hard", chapter: "Hollywood acclaim",
 question: "Japanese makeup artist Shu Uemura won acclaim in which film capital before building a global cosmetics brand?", clue: "A district of Los Angeles with a famous hillside sign.", hint: "America's film capital.",
 city: "Hollywood", country: US[0], code: US[1], geocode: "Hollywood, Los Angeles", url: "https://www.nysun.com/article/obituaries-shu-uemura-79-cosmetics-entrepreneur",
 story: "Shu Uemura was a Japanese makeup artist who won acclaim in Hollywood, then built an international cosmetics brand under his own name. He died in Tokyo in 2007, aged 79.",
 quotes: ["Shu Uemura, a Japanese makeup artist who won acclaim in Hollywood and built an international cosmetics brand under his name, died in Tokyo on December 29."] });
P("mario-dedivanovic", "Mario Dedivanovic", "MD", "US", "north-america", "makeup-icons", { qid: "mario-dedivanovic-bronx", type: "hometown", diff: "medium", chapter: "It all started",
 question: "Makeup artist Mario Dedivanovic, founder of Makeup by Mario, was born and raised in which New York City borough?", clue: "The only NYC borough on the mainland.", hint: "Home of Yankee Stadium.",
 city: "The Bronx", country: US[0], code: US[1], geocode: "The Bronx, New York", url: "https://www.makeupbymario.com/pages/story",
 story: "Mario Dedivanovic was born and raised in the Bronx by Albanian immigrant parents from Montenegro. He found his calling at a Sephora counter after high school, and later launched Makeup by Mario at Sephora in 2020.",
 quotes: ["The youngest of four, Mario was born and raised in the Bronx by his parents—Albanian immigrants from Montenegro.", ["https://www.whowhatwear.com/who-what-wear-podcast-mario-dedivanovic", "I was born and raised in the Bronx, a child of Albanian immigrant parents from Montenegro."]] });
P("val-garland", "Val Garland", "VG", "GB", "europe", "makeup-icons", { qid: "val-garland-bristol", type: "career_location", diff: "hard", chapter: "Punk beginnings",
 question: "Before makeup, Val Garland worked as a punk-styled teenage hairdresser in which English city?", clue: "In the West Country, famous for the Clifton Suspension Bridge.", hint: "Its name starts with 'Bris'.",
 city: "Bristol", country: GB[0], code: GB[1], geocode: "Bristol, England", url: "https://refinery29.com/2018/01/187043/val-garland-makeup-artist-interview",
 story: "As a teenager Val Garland worked as a hairdresser in Bristol with a punk style. After running a salon in Australia, she moved to London in 1994 to take up makeup and began a long partnership with Alexander McQueen.",
 quotes: ["Working as a hairdresser in Bristol, England in her teens, she had an idiosyncratic, punk-y style, vibrantly colored hair, and heavy makeup", "Garland sold the salon and moved to London in 1994"] });

// ── Stylists ────────────────────────────────────────────────────
P("law-roach", "Law Roach", "LR", "US", "north-america", "stylists", { qid: "law-roach-chicago", type: "career_location", diff: "medium", chapter: "Deliciously Vintage",
 question: "'Image architect' Law Roach began his career at his vintage boutique in the Pilsen neighbourhood of which city?", clue: "On Lake Michigan, the Windy City.", hint: "Home of the Bulls.",
 city: "Chicago", country: US[0], code: US[1], geocode: "Pilsen, Chicago", url: BOF + "law-roach",
 story: "Law Roach began at his Deliciously Vintage boutique in Chicago's Pilsen neighbourhood; a 2009 visit from Kanye West launched his styling career. He moved to Los Angeles, where Zendaya became his first major client.",
 quotes: ["Roach began his career at his now-defunct Deliciously Vintage boutique in Chicago’s Pilsen neighbourhood.", "In 2017, he became the first African American stylist to cover The Hollywood Reporter’s ‘Stylist & Stars’ issue."] });
P("carine-roitfeld", "Carine Roitfeld", "CR", "FR", "europe", "stylists", { qid: "carine-roitfeld-paris", type: "hometown", diff: "easy", chapter: "Paris-raised",
 question: "Stylist and editor Carine Roitfeld, who styled Tom Ford's landmark Gucci campaigns, was raised in which city?", clue: "On the Seine.", hint: "France's capital.",
 city: "Paris", country: FR[0], code: FR[1], geocode: "Paris, France", url: BOF + "carine-roitfeld",
 story: "Paris-raised Carine Roitfeld began as a model and spent 15 years as a writer and stylist at French Elle. With Mario Testino she helped Tom Ford revive Gucci, styling its landmark campaigns and runway shows.",
 quotes: ["The self-taught, Paris-raised daughter of a Russian film producer began her career as a model.", "She found her niche in publishing, and went on to work as a writer and stylist for French Elle where she spent 15 years."] });
P("grace-coddington", "Grace Coddington", "GC", "GB", "europe", "stylists", { qid: "grace-coddington-london", type: "career_location", diff: "medium", chapter: "Swinging sixties",
 question: "Before she became Vogue's legendary creative director, Grace Coddington began as a model in which city's swinging sixties?", clue: "A capital on the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "London, England", url: BOF + "grace-coddington",
 story: "Grace Coddington began as a model in London's swinging sixties after winning a Vogue modelling competition. She later became one of fashion's most influential stylists at British and American Vogue.",
 quotes: ["Coddington began her career as a model in London’s swinging sixties.", "Having won a Vogue modelling competition she was featured in the magazine’s “young ideas” section."] });
P("edward-enninful", "Edward Enninful", "EE", "GH", "africa", "stylists", { qid: "edward-enninful-london", type: "hometown", diff: "medium", chapter: "Scouted on the train",
 question: "Ghanaian-born stylist Edward Enninful moved as a child to which city, where he was scouted as a model at 16?", clue: "A capital on the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "London, England", url: BOF + "edward-enninful", originNote: "Born in Ghana.",
 story: "Born in Ghana, Edward Enninful moved to London with his family as a child. Scouted as a model at 16, he assisted stylists on shoots and became fashion director of i-D at 18 — the youngest ever at a major title.",
 quotes: ["After moving to London with his parents and six siblings at a young age, Enninful was scouted as a model on the train at 16 and briefly modelled for Arena and i-D magazines before assisting stylists Simon Foxton and Beth Summers on fashion shoots.", "Ghanaian-born Enninful began his career as fashion director of British youth culture magazine i-D at age 18"] });
P("alastair-mckimm", "Alastair McKimm", "AM", "GB", "europe", "stylists", { qid: "alastair-mckimm-belfast", type: "birthplace", diff: "hard", chapter: "Where the story began",
 question: "Stylist and former i-D editor-in-chief Alastair McKimm was born in which city?", clue: "Northern Ireland's capital, where the Titanic was built.", hint: "On the River Lagan.",
 city: "Belfast", country: GB[0], code: GB[1], geocode: "Belfast, Northern Ireland", url: BOF + "alastair-mckimm",
 story: "Alastair McKimm was born in Belfast, studied fashion design in Nottingham and moved to London, where he assisted Edward Enninful at i-D. Known for crafting clean, precise looks, he became i-D's global editor-in-chief.",
 quotes: ["Born in Belfast, McKimm studied fashion design at Nottingham Art School and moved to London after graduation."] });
P("isabella-blow", "Isabella Blow", "IB", "GB", "europe", "stylists", { qid: "isabella-blow-london", type: "birthplace", diff: "medium", chapter: "Where the story began",
 question: "Stylist Isabella Blow, who discovered Alexander McQueen, was born in 1958 in which city?", clue: "A capital on the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "London, England", url: "https://www.inquirer.com/philly/obituaries/20070510_Isabella_Blow___British_fashion_stylist__48.html",
 story: "Isabella Blow was born Isabella Delves Broughton in London in 1958. A stylist and muse, she bought Alexander McQueen's entire graduate collection and helped launch models Stella Tennant and Sophie Dahl.",
 quotes: ["Born Isabella Delves Broughton in London in 1958, she moved to New York in 1979 to study ancient Chinese art at Columbia University.", [BR + "biography/Alexander-McQueen", "Blow bought McQueen’s entire first collection."]] });
P("patricia-field", "Patricia Field", "PF", "US", "north-america", "stylists", { qid: "patricia-field-queens", type: "hometown", diff: "medium", chapter: "Queens kid",
 question: "Sex and the City costume designer and stylist Patricia Field grew up in which New York City borough, along with Manhattan?", clue: "NYC's largest borough by area, home of JFK airport.", hint: "It's named after a royal consort.",
 city: "Queens", country: US[0], code: US[1], geocode: "Queens, New York", url: "https://vmagazine.com/article/heroes-patricia-field/",
 story: "Patricia Field grew up in Queens and Manhattan, the daughter of immigrant dry-cleaners. A retailer, fashion stylist and costume designer, she became famous for dressing the women of Sex and the City.",
 quotes: ["Field’s book gives readers a front-row seat to her journey from a tomboyish Queens kid coveting designer duds to a rebellious fashionista and eventually a household name.", ["https://passportmagazine.com/fashion-arbiter-and-visionary-patricia-field/", "Growing up as a native New Yorker, in Queens and Manhattan, Field’s parents, who were Greek and Armenian immigrants, owned a dry cleaner."]] });
P("jason-bolden", "Jason Bolden", "JB", "US", "north-america", "stylists", { qid: "jason-bolden-st-louis", type: "hometown", diff: "hard", chapter: "Born and raised",
 question: "Celebrity stylist and interior designer Jason Bolden was born and raised in which Missouri city?", clue: "On the Mississippi, home of the Gateway Arch.", hint: "Named after a French king.",
 city: "St. Louis", country: US[0], code: US[1], geocode: "St. Louis, Missouri", url: BOF + "jason-bolden",
 story: "Jason Bolden was born and raised in St. Louis, Missouri, and began in luxury retail at houses like Chloé, Oscar de la Renta and Gucci before opening a vintage store in New York's SoHo and becoming a celebrity stylist.",
 quotes: ["Born and raised in St. Louis, Missouri, Jason began his career working in retail for luxury ready-to-wear houses including Chloe, Oscar de la Renta and Gucci."] });
P("mel-ottenberg", "Mel Ottenberg", "MO", "US", "north-america", "stylists", { qid: "mel-ottenberg-washington", type: "hometown", diff: "hard", chapter: "Rihanna's stylist",
 question: "Mel Ottenberg, Rihanna's stylist from 2011 to 2018 and later Interview's editor, grew up in which city?", clue: "On the Potomac River.", hint: "The US capital.",
 city: "Washington, D.C.", country: US[0], code: US[1], geocode: "Washington, District of Columbia", url: BOF + "mel-ottenberg",
 story: "Mel Ottenberg grew up in Washington, D.C., and has worked as a stylist for almost two decades, including as Rihanna's stylist. He later became editor-in-chief of Interview Magazine.",
 quotes: ["Having grown up in Washington, D.C., and now living in New York, Ottenberg has worked as a stylist for almost two decades — and as Rihanna’s stylist."] });
P("kate-young", "Kate Young", "KY", "US", "north-america", "stylists", { qid: "kate-young-new-york", type: "career_location", diff: "medium", chapter: "In demand",
 question: "Kate Young, stylist to Margot Robbie, Dakota Johnson and Selena Gomez, is based in which city?", clue: "Where she began as Anna Wintour's assistant at American Vogue.", hint: "The Big Apple.",
 city: "New York City", country: US[0], code: US[1], geocode: "Manhattan, New York", url: BOF + "kate-young",
 story: "New York-based Kate Young began as Anna Wintour's assistant at American Vogue in 1997 and rose through its styling department. She is now one of the most in-demand stylists in Hollywood and fashion.",
 quotes: ["New York-based Kate Young is one of the most in-demand stylists in Hollywood and fashion, with a roster filled with It girls and superstars alike who are beloved by the fashion industry, including Dakota Johnson, Sienna Miller, Margot Robbie and Selena Gomez .", "began her career as American Vogue editor-in-chief Anna Wintour ’s assistant in 1997."] });
P("harry-lambert", "Harry Lambert", "HL", "GB", "europe", "stylists", { qid: "harry-lambert-london", type: "career_location", diff: "medium", chapter: "Styling Harry Styles",
 question: "Harry Lambert, stylist to Harry Styles, Emma Corrin and Josh O'Connor, is based in which city?", clue: "A capital on the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "London, England", url: BOF + "harry-lambert",
 story: "Harry Lambert began styling Harry Styles in 2014, then dressed The Crown's Emma Corrin and Josh O'Connor. Now based in London, he contributes to Dazed, Interview and W.",
 quotes: ["Now based in London, Lambert has contributed to Dazed, Interview, W and Arena Homme +", "started working with pop-sensation Styles in 2014, then The Crown’s Emma Corrin in 2020 and her co-star Josh O’Connor in 2021."] });

// ── Fashion Houses ──────────────────────────────────────────────
P("gucci", "Gucci", "G", "IT", "europe", "fashion-houses", { ...H, qid: "gucci-florence", diff: "medium", chapter: "Leather and luggage",
 question: "The luxury house Gucci, founded in 1921 as a leather goods and luggage shop, is based in which Italian city?", clue: "Tuscany's capital, on the Arno.", hint: "Home of Michelangelo's David.",
 city: "Florence", country: IT[0], code: IT[1], geocode: "Florence, Italy", url: "topic/Gucci",
 story: "Guccio Gucci, who had worked as a bellboy at the Savoy Hotel in London, opened his first shop on Florence's Via della Vigna Nuova in 1921. Gucci is still a luxury fashion house based in Florence.",
 quotes: ["Gucci, luxury fashion house based in Florence.", "In 1921 Gucci opened his first retail location on Florence’s Via della Vigna Nuova, where he began selling his leather goods and luggage."] });
P("fendi", "Fendi", "F", "IT", "europe", "fashion-houses", { ...H, qid: "fendi-rome", diff: "medium", chapter: "Fur and leather",
 question: "The Italian luxury house Fendi, known for fur and leather goods, was founded in which city?", clue: "The Eternal City.", hint: "Italy's capital.",
 city: "Rome", country: IT[0], code: IT[1], geocode: "Rome, Italy", url: "topic/Fendi",
 story: "Fendi grew from a small fur and leather shop opened by Adele Casagrande in Rome in 1918, and the house was founded in Rome in 1925. In 1965 the Fendi sisters brought in Karl Lagerfeld as artistic director.",
 quotes: ["Fendi, Italian luxury fashion house founded in Rome in 1925 and known for its fur, leather goods, and fashion.", "In 1965 the Fendi sisters brought on Lagerfeld as Fendi’s first artistic director in order to modernize the fur line."] });
P("burberry", "Burberry", "B", "GB", "europe", "fashion-houses", { ...H, qid: "burberry-basingstoke", diff: "hard", chapter: "Weatherproof",
 question: "Thomas Burberry opened his first shop in 1856 in which then-rural English town southwest of London?", clue: "In Hampshire, on the M3 motorway.", hint: "Its name starts with 'Basing'.",
 city: "Basingstoke", country: GB[0], code: GB[1], geocode: "Basingstoke, Hampshire", url: "topic/Burberry",
 story: "Thomas Burberry, a cloth merchant's apprentice, opened his own shop in Basingstoke in 1856. The firm's weather-resistant clothing became popular with explorers and military personnel.",
 quotes: ["Thomas Burberry, a cloth merchant’s apprentice, established his own shop in 1856 in Basingstoke, England, then a rural town located southwest of London.", "Founded in 1856 by Thomas Burberry, the company initially specialized in weather-resistant clothing that became popular with explorers and military personnel."] });
P("dolce-gabbana", "Dolce & Gabbana", "DG", "IT", "europe", "fashion-houses", { ...H, qid: "dolce-gabbana-milan", diff: "medium", chapter: "Real Women",
 question: "Domenico Dolce and Stefano Gabbana founded their luxury fashion house in 1985 in which city?", clue: "Capital of Lombardy.", hint: "Home of La Scala.",
 city: "Milan", country: IT[0], code: IT[1], geocode: "Milan, Italy", url: "topic/Dolce-and-Gabbana",
 story: "Dolce & Gabbana was founded in Milan in 1985 by Sicilian-raised Domenico Dolce and Milan-born Stefano Gabbana. Its designs are known for figure-hugging silhouettes, vibrant prints and lavish embellishment.",
 quotes: ["Dolce & Gabbana, Italian luxury fashion house founded in 1985 in Milan by Domenico Dolce"] });
P("louis-vuitton", "Louis Vuitton", "LV", "FR", "europe", "fashion-houses", { ...H, qid: "louis-vuitton-paris", diff: "easy", chapter: "Trunk maker",
 question: "Box maker Louis Vuitton founded his luxury trunk and luggage brand in 1854 with a workshop in which city?", clue: "Near the Place Vendôme.", hint: "France's capital.",
 city: "Paris", country: FR[0], code: FR[1], geocode: "Place Vendôme, Paris", url: "biography/Louis-Vuitton-entrepreneur",
 story: "Louis Vuitton, born in the village of Anchay in eastern France, founded his brand of luxury trunks and luggage in 1854, opening his own workshop in Paris near the Place Vendôme.",
 quotes: ["was a French box maker and entrepreneur who founded his namesake brand of luxury trunks and luggage in 1854.", "He opened his own workshop in Paris near the Place Vendôme, where many fashion houses and jewelry firms were located."] });
P("balenciaga", "Balenciaga", "B", "ES", "europe", "fashion-houses", { ...H, qid: "balenciaga-san-sebastian", diff: "hard", chapter: "The first atelier",
 question: "Cristóbal Balenciaga had his own dressmaking house by age 20 in which fashionable Spanish resort?", clue: "In the Basque Country, on La Concha bay.", hint: "In Basque it's Donostia.",
 city: "San Sebastián", country: "Spain", code: "ES", geocode: "Donostia / San Sebastián, Gipuzkoa", url: "biography/Cristobal-Balenciaga",
 story: "Inspired by a trip to Paris at 15, Cristóbal Balenciaga had his own dressmaking establishment in the summer resort of San Sebastián by age 20. He moved to Paris in 1937 when the Spanish Civil War disrupted his business.",
 quotes: ["His first trip to Paris at 15 inspired him to become a couturier, and by age 20 he had his own dressmaking establishment at the fashionable summer resort of San Sebastián in Spain.", "In 1937, when the Spanish Civil War disrupted his business, he moved to Paris."] });
P("valentino", "Valentino", "V", "IT", "europe", "fashion-houses", { ...H, qid: "valentino-rome", diff: "medium", chapter: "Valentino red",
 question: "Valentino Garavani presented his first collection in 1959 in his own salon on Via Condotti — in which city?", clue: "Via Condotti runs from the Spanish Steps.", hint: "Italy's capital.",
 city: "Rome", country: IT[0], code: IT[1], geocode: "Via dei Condotti, Rome", url: "biography/Valentino",
 story: "Valentino Garavani studied fashion in Paris, then returned to Rome in 1959 and presented his first collection in his own salon on Via Condotti. His house became known for its signature 'Valentino red'.",
 quotes: ["In 1959 Valentino returned to Rome and, with the financial backing of his father, presented his first collection in his own salon on Via Condotti.", "was an Italian fashion designer known for garments in his trademark “Valentino red” (rosso Valentino) and whose style was described as jet-set chic."] });
P("versace", "Versace", "V", "IT", "europe", "fashion-houses", { ...H, qid: "versace-milan", diff: "medium", chapter: "Rock-concert runways",
 question: "Gianni Versace staged his rock-concert-style shows at his lavish design headquarters in which city?", clue: "Italy's fashion capital, in Lombardy.", hint: "Home of the Duomo cathedral.",
 city: "Milan", country: IT[0], code: IT[1], geocode: "Milan, Italy", url: "biography/Gianni-Versace",
 story: "Gianni Versace moved to Milan in 1972 and founded his own company, Gianni Versace SpA, in 1978. He staged his seasonal shows like rock concerts at his lavish design headquarters in Milan.",
 quotes: ["Versace staged his seasonal fashion shows like rock concerts at his lavish design headquarters in Milan", "In 1978 Versace established his own company, Gianni Versace SpA, with backing by the Italian fashion family Girombelli."] });

P("schiaparelli", "Schiaparelli", "S", "FR", "europe", "fashion-houses", { ...H, qid: "schiaparelli-paris", diff: "medium", chapter: "Surreal couture",
 question: "Italian-born Elsa Schiaparelli settled in the late 1920s in which city, where she opened her couture house?", clue: "The capital of haute couture, on the Seine.", hint: "France's capital.",
 city: "Paris", country: FR[0], code: FR[1], geocode: "Place Vendôme, Paris", url: "biography/Elsa-Schiaparelli",
 story: "Italian-born Elsa Schiaparelli settled in Paris in the late 1920s and opened her couture house there. It became one of the important couture houses of the era.",
 quotes: ["Then in the late 1920s she settled in Paris, where she opened her couture house.", "was an Italian-born fashion designer who established an important couture house in Paris."] });
P("comme-des-garcons", "Comme des Garçons", "CDG", "JP", "asia", "fashion-houses", { ...H, qid: "comme-des-garcons-tokyo", diff: "hard", chapter: "Avant-garde",
 question: "Comme des Garçons founder Rei Kawakubo was born in, and studied at Keio University in, which city?", clue: "Japan's capital.", hint: "Home of Shibuya Crossing.",
 city: "Tokyo", country: "Japan", code: "JP", geocode: "Tokyo, Japan", url: "biography/Rei-Kawakubo",
 story: "Rei Kawakubo was born in Tokyo and studied fine arts at Keio University there. A self-taught designer, she founded the avant-garde label Comme des Garçons in 1969.",
 quotes: ["Rei Kawakubo (born October 11, 1942, Tokyo, Japan) is a self-taught Japanese fashion designer known for her avant-garde clothing designs and her high-fashion label, Comme des Garçons (CDG), founded in 1969.", "Kawakubo studied fine arts and aesthetics at Keio University in Tokyo, graduating in 1964."] });
// ── Fashion Capitals ────────────────────────────────────────────
// Fashion weeks are named by their organising bodies; an event name like "London Fashion Week" would give away the answer.
const ORG = { kind: "group", type: "event_location", display: "Fashion Capitals" };
P("cfda", "Council of Fashion Designers of America", "CFDA", "US", "north-america", "fashion-capitals", { ...ORG, qid: "cfda-fashion-week-city", diff: "easy", chapter: "Big four",
 question: "The CFDA coordinates the fashion week that grew from a 1943 'Press Week'. In which city is it held?", clue: "The first shows were at the Pierre and Plaza hotels.", hint: "The Big Apple.",
 city: "New York City", country: US[0], code: US[1], geocode: "Manhattan, New York", url: FW,
 story: "In 1943, with Paris fashion cut off by the war, publicist Eleanor Lambert staged a Press Week in New York. It became New York Fashion Week, and the Council of Fashion Designers of America, which Lambert founded in 1962, coordinates it today.",
 quotes: ["Today the Council of Fashion Designers of America, a nonprofit trade association founded by Lambert in 1962, serves as the official scheduling and coordinating body for NYFW.", "The event, combined with American postwar prosperity, helped New York City become a fashion capital in its own right."] });
P("british-fashion-council", "British Fashion Council", "BFC", "GB", "europe", "fashion-capitals", { ...ORG, qid: "british-fashion-council-city", diff: "easy", chapter: "Big four",
 question: "In 1984 the new British Fashion Council launched the youngest of the 'big four' fashion weeks. In which city?", clue: "A capital on the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "London, England", url: FW,
 story: "London Fashion Week, the youngest of the big four, began under the newly formed British Fashion Council in 1984. It was the first to brand its event a 'Fashion Week', and its first lineup included Vivienne Westwood and John Galliano.",
 quotes: ["London Fashion Week, the youngest of the big four fashion weeks, began under the direction of the newly formed British Fashion Council in 1984.", "The best-known fashion weeks take place twice a year in the “big four” fashion capitals: New York City, London, Milan, and Paris (usually in that order)."] });
P("camera-nazionale-della-moda", "Camera Nazionale della Moda Italiana", "CNMI", "IT", "europe", "fashion-capitals", { ...ORG, qid: "camera-nazionale-della-moda-city", diff: "medium", chapter: "Big four",
 question: "Italy's National Chamber of Fashion was set up in 1958 to stage twice-yearly shows in which city?", clue: "Armani and Versace later set up their houses there.", hint: "Capital of Lombardy.",
 city: "Milan", country: IT[0], code: IT[1], geocode: "Milan, Italy", url: FW,
 story: "The National Chamber of Italian Fashion was established in Milan in 1958 to stage twice-yearly shows. As Vogue Italia, Giorgio Armani and Gianni Versace settled there, Milan became Italy's international fashion capital.",
 quotes: ["In 1958 the National Chamber of Italian Fashion (Camera Nazionale della Moda Italiana) was established in Milan and began staging biannual fashion shows", "gradually making Milan Italy’s international fashion capital."] });
P("federation-haute-couture", "Fédération de la Haute Couture et de la Mode", "FHCM", "FR", "europe", "fashion-capitals", { ...ORG, qid: "federation-haute-couture-city", diff: "easy", chapter: "Big four",
 question: "The Fédération de la Haute Couture et de la Mode runs Haute Couture Week and the fashion week of which city?", clue: "Home of the house of Worth, founded 1858.", hint: "France's capital.",
 city: "Paris", country: FR[0], code: FR[1], geocode: "Paris, France", url: FW,
 story: "The Federation of Haute Couture and Fashion represents leading French and international houses. It organizes Paris Fashion Week and Haute Couture Week, helping keep Paris a global fashion capital.",
 quotes: ["it now represents leading French and international fashion houses and organizes Paris Fashion Week and Haute Couture Week", "Paris After the war Paris was quick to reestablish itself as a fashion powerhouse."] });
P("omoyemi-akerele", "Omoyemi Akerele", "OA", "NG", "africa", "fashion-capitals", { ...ORG, kind: "person", qid: "omoyemi-akerele-fashion-week-city", diff: "medium", chapter: "Africa's runway",
 question: "Omoyemi Akerele founded Nigeria's flagship fashion week, launched in 2011, in which city?", clue: "Nigeria's biggest city, on a lagoon.", hint: "It was Nigeria's capital until 1991.",
 city: "Lagos", country: "Nigeria", code: "NG", geocode: "Lagos, Nigeria", url: "https://www.businessoffashion.com/articles/global-markets/africas-powerhouse-is-rewriting-the-fashion-week-playbook",
 story: "Omoyemi Akerele launched Lagos Fashion Week in 2011, first known as Lagos Fashion and Design Week. It has become Nigeria's flagship fashion event and a showcase for African designers.",
 quotes: ["As Lagos Fashion Week kicks off, founder Omoyemi Akerele looks back at ten years of shows and reveals how Nigeria’s flagship fashion event could adopt a pan-African strategy in the decade ahead.", "A few years before Lagos Fashion Week launched in 2011"] });
P("royal-academy-fashion-department", "Royal Academy of Fine Arts fashion department", "RA", "BE", "europe", "fashion-capitals", { kind: "landmark", type: "famous_place", display: "Fashion Capitals", qid: "royal-academy-fashion-department-city", diff: "hard", chapter: "The Six",
 question: "In 1986 six graduates of a Royal Academy of Fine Arts fashion department, including Dries Van Noten, put their city on the fashion map. Which city?", clue: "A Flemish port on the Scheldt, famous for diamonds.", hint: "Rubens lived there.",
 city: "Antwerp", country: "Belgium", code: "BE", geocode: "Antwerp, Belgium", url: "https://fashionexhibitionmaking.arts.ac.uk/the-antwerp-six/",
 story: "Dirk Bikkembergs, Ann Demeulemeester, Walter Van Beirendonck, Dries Van Noten, Dirk Van Saene and Marina Yee studied fashion at Antwerp's Royal Academy of Fine Arts. In 1986 they put Antwerp on the fashion map as the 'Antwerp Six'.",
 quotes: ["It began with their study at the fashion department at the Royal Academy of Fine Arts in Antwerp and resulted in six highly influential solo careers.", "In 1986, Dirk Bikkembergs, Ann Demeulemeester, Walter Van Beirendonck, Dries Van Noten, Dirk Van Saene and Marina Yee put Antwerp on the fashion map"] });
const LM = { kind: "landmark", type: "famous_place", display: "Fashion Capitals" };
P("avenue-montaigne", "Avenue Montaigne", "AM", "FR", "europe", "fashion-capitals", { ...LM, qid: "avenue-montaigne-paris", diff: "medium", chapter: "Haute couture",
 question: "Haute couture is concentrated on the Avenue Montaigne and the Rue du Faubourg Saint-Honoré — in which city?", clue: "Near the Champs-Élysées.", hint: "France's capital.",
 city: "Paris", country: FR[0], code: FR[1], geocode: "Avenue Montaigne, Paris", url: "place/Paris/The-Halles",
 story: "Paris is still home to many typically Parisian trades: haute couture on the Avenue Montaigne and the Rue du Faubourg Saint-Honoré, clothing in the Sentier quarter, and jewellery around the Place Vendôme.",
 quotes: ["haute couture, notably on the avenue Montaigne and the rue du Faubourg Saint-Honoré"] });
P("ginza", "Ginza", "G", "JP", "asia", "fashion-capitals", { ...LM, qid: "ginza-tokyo", diff: "medium", chapter: "Silver guild",
 question: "Ginza, named after a silver mint and one of the world's best-known shopping districts, is in which city?", clue: "Near the Imperial Palace grounds.", hint: "Japan's capital.",
 city: "Tokyo", country: "Japan", code: "JP", geocode: "Ginza, Chuo, Tokyo", url: "place/Ginza-Japan",
 story: "Ginza takes its name from a silver mint moved there in 1612. Today it is Tokyo's most glamorous shopping district and one of the best known in the world.",
 quotes: ["It is the most glamorous shopping district in Tokyo and one of the best-known in the world.", "The name comes from the words gin meaning “silver” and za meaning “guild”"] });
P("rodeo-drive", "Rodeo Drive", "RD", "US", "north-america", "fashion-capitals", { ...LM, qid: "rodeo-drive-beverly-hills", diff: "medium", chapter: "Most exclusive",
 question: "Rodeo Drive, home of the most exclusive boutiques in its city, runs through which California city?", clue: "Surrounded by Los Angeles, famous for its 90210 ZIP code.", hint: "The 'Hills' city.",
 city: "Beverly Hills", country: US[0], code: US[1], geocode: "Rodeo Drive, Beverly Hills", url: "place/Beverly-Hills",
 story: "Beverly Hills' flatlands hold many chic shops, boutiques and department stores, and the most exclusive are on Rodeo Drive and the newer Two Rodeo Drive.",
 quotes: ["The most exclusive of these are on the old Rodeo Drive and the newer Two Rodeo Drive, a multilevel shopping street in mock Mediterranean style."] });
P("savile-row", "Savile Row", "SR", "GB", "europe", "fashion-capitals", { ...LM, qid: "savile-row-london", diff: "medium", chapter: "Bespoke",
 question: "Savile Row, where eminent tailors make some of the world's finest men's clothing, is in which city?", clue: "In Mayfair, near Regent Street.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "Savile Row, London", url: "place/Mayfair-neighborhood-London",
 story: "Savile Row runs off London's Mayfair shopping district, where eminent tailors make some of the world's finest men's clothing.",
 quotes: ["northward branches extend along Sackville Street and Savile Row, where eminent tailors make some of the world’s finest men’s clothing."] });

const memberships = [
 ["twiggy-london", "fashion", "supermodels", "Britannica: widely considered one of the world's first supermodels"],
].map(([questionId, category, subcategory, reason]) => ({ questionId, category, subcategory, reason }));
require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-16.json"),
 JSON.stringify({ batch: 16, researched: "2026-10-07", coordinateSource: "OpenStreetMap Nominatim", entries, memberships }, null, 1) + "\n");
console.log(entries.length, "entries,", memberships.length, "memberships");
