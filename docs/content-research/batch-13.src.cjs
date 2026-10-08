// Batch 13 — Tech & Innovation. Source of src/content/batches/batch-13.json (run: node docs/content-research/batch-13.src.cjs).
// Every fact in a story comes from a quoted source sentence; clues and hints are general geography. Where a source names an
// institution rather than a town (MIT, Stanford, Waseda, Xerox PARC…), the answer is that institution's location.
const BR = "https://www.britannica.com/";
const entries = [];
const P = (id, name, mono, cc, region, sub, q) => entries.push({
 entity: { id, name, monogram: mono, countryOfOrigin: cc, region, ...(q.originNote ? { originNote: q.originNote } : {}) },
 question: { id: q.qid, primaryCategory: "tech", subcategory: sub, questionType: q.type, difficulty: q.diff, displayCategory: q.display ?? "Tech", chapter: q.chapter,
  question: q.question, clue: q.clue, hint: q.hint, answer: { city: q.city, country: q.country, countryCode: q.code, ...(q.geocode ? { geocode: q.geocode } : {}) }, story: q.story,
  sources: q.quotes.map((x, i) => { const [url, quote, quality] = Array.isArray(x) ? x : [q.url, x]; return { url: /^https:/.test(url) ? url : BR + url, role: i ? "extra" : "primary", quality: quality ?? q.quality ?? "reputable_secondary", quote }; }) },
});
const US = ["United States", "US"], GB = ["United Kingdom", "GB"], JP = ["Japan", "JP"];

// ── Tech Founders ───────────────────────────────────────────────
P("jeff-bezos", "Jeff Bezos", "JB", "US", "north-america", "tech-founders", { qid: "jeff-bezos-seattle", type: "company_origin", diff: "easy", chapter: "A virtual bookstore",
 question: "In 1994 Jeff Bezos quit his Wall Street job and moved to which city to open a 'virtual bookstore' — Amazon?", clue: "Pacific Northwest, on Puget Sound.", hint: "Its skyline is topped by the Space Needle.",
 city: "Seattle", country: US[0], code: US[1], url: "money/Jeff-Bezos",
 story: "In 1994 Jeff Bezos and his wife, Mackenzie Scott Tuttle, quit the investment firm D.E. Shaw and moved to Seattle to open a virtual bookstore. Named after the South American river, Amazon sold its first book in July 1995.",
 quotes: ["In 1994 he and his wife, Mackenzie Scott Tuttle, quit D.E. Shaw and moved to Seattle, Washington, to open a virtual bookstore.", "Named after the South American river, Amazon sold its first book in July 1995."] });
P("larry-page", "Larry Page", "LP", "US", "north-america", "tech-founders", { qid: "larry-page-east-lansing", type: "birthplace", diff: "hard", chapter: "A Michigan childhood",
 question: "Google co-founder Larry Page was born in 1973 in which Michigan college city?", clue: "Central Michigan, beside the state capital, Lansing.", hint: "It's home to Michigan State University.",
 city: "East Lansing", country: US[0], code: US[1], geocode: "East Lansing, Michigan", url: "money/Larry-Page",
 story: "Larry Page was born in East Lansing, Michigan, in 1973. With Sergey Brin he created the search engine Google; by September 1998 the two had founded Google Inc., with Page as CEO.",
 quotes: ["Larry Page (born March 26, 1973, East Lansing, Michigan, U.S.) is an American computer scientist and entrepreneur who, with Sergey Brin, created the online search engine Google", "By September 1998 the two had founded Google Inc., with Page as chief executive officer (CEO)"] });
P("sergey-brin", "Sergey Brin", "SB", "US", "north-america", "tech-founders", { qid: "sergey-brin-moscow", type: "birthplace", diff: "medium", originNote: "Russian-born American", chapter: "Born in the USSR",
 question: "Google co-founder Sergey Brin was born in 1973 in which city?", clue: "On the Moskva River in western Russia.", hint: "It's Russia's capital.",
 city: "Moscow", country: "Russia", code: "RU", url: "money/Sergey-Brin",
 story: "Sergey Brin was born in Moscow in 1973. With Larry Page he created Google; by mid-1999, as company president of technology, he saw the search engine processing 500,000 queries a day.",
 quotes: ["Sergey Brin (born August 21, 1973, Moscow, Russia, U.S.S.R.) is an American computer scientist and entrepreneur who created, along with Larry Page, the online search engine Google", "the search engine was processing 500,000 queries per day."] });
P("mark-zuckerberg", "Mark Zuckerberg", "MZ", "US", "north-america", "tech-founders", { qid: "mark-zuckerberg-white-plains", type: "birthplace", diff: "hard", chapter: "Westchester roots",
 question: "Facebook co-founder Mark Zuckerberg was born in 1984 in which city just north of New York City?", clue: "Westchester County, New York.", hint: "It's the county seat of Westchester County.",
 city: "White Plains", country: US[0], code: US[1], geocode: "White Plains, New York", url: "money/Mark-Zuckerberg",
 story: "Mark Zuckerberg was born in White Plains, New York, in 1984 and grew up in nearby Dobbs Ferry. He co-founded Facebook in 2004 while a student at Harvard.",
 quotes: ["Born: May 14, 1984, White Plains, New York", "He grew up in nearby Dobbs Ferry with three sisters", "Cofounded Facebook in 2004"] });
P("akio-morita", "Akio Morita", "AM", "JP", "asia", "tech-founders", { qid: "akio-morita-nagoya", type: "birthplace", diff: "hard", chapter: "Before Sony",
 question: "Sony co-founder Akio Morita was born in 1921 in which Japanese city?", clue: "Aichi prefecture, between Tokyo and Osaka.", hint: "It's Japan's fourth-largest city, home of Toyota's region.",
 city: "Nagoya", country: JP[0], code: JP[1], url: "money/Morita-Akio",
 story: "Morita Akio was born in Nagoya in 1921. After the war he and Ibuka Masaru set up a communications laboratory in Tokyo; he co-founded Sony and was its CEO from 1971.",
 quotes: ["Morita Akio (born Jan. 26, 1921, Nagoya, Japan—died Oct. 3, 1999, Tokyo) was a Japanese businessman who was cofounder, chief executive officer (from 1971)", "After the war Morita worked with Ibuka to establish a communications laboratory in Tokyo."] });

// ── AI Pioneers ─────────────────────────────────────────────────
P("geoffrey-hinton", "Geoffrey Hinton", "GH", "CA", "north-america", "ai-pioneers", { qid: "geoffrey-hinton-london", type: "birthplace", diff: "easy", originNote: "British-Canadian", chapter: "The godfather of AI",
 question: "Geoffrey Hinton, the 'godfather of AI', was born in 1947 in which city?", clue: "On the Thames in south-east England.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], url: "biography/Geoffrey-Hinton",
 story: "Geoffrey Hinton, born in London in 1947, is a British-Canadian cognitive psychologist and computer scientist known as the 'godfather of AI'.",
 quotes: ["Geoffrey Hinton (born December 6, 1947, London, England) is a British-Canadian cognitive psychologist and computer scientist known as the “godfather of AI"] });
P("john-mccarthy", "John McCarthy", "JM", "US", "north-america", "ai-pioneers", { qid: "john-mccarthy-boston", type: "birthplace", diff: "medium", chapter: "An AI founder",
 question: "AI pioneer John McCarthy was born in 1927 in which New England city?", clue: "On Massachusetts Bay.", hint: "It's the capital of Massachusetts.",
 city: "Boston", country: US[0], code: US[1], url: "biography/John-McCarthy",
 story: "John McCarthy was born in Boston in 1927. A mathematician and computer scientist, he was a pioneer in the field of artificial intelligence.",
 quotes: ["John McCarthy (born September 4, 1927, Boston, Massachusetts, U.S.—died October 24, 2011, Stanford, California) was an American mathematician and computer scientist who was a pioneer in the field of artificial intelligence (AI)"] });
P("marvin-minsky", "Marvin Minsky", "MM", "US", "north-america", "ai-pioneers", { qid: "marvin-minsky-mit", type: "career_location", diff: "medium", chapter: "Modelling thought",
 question: "In 1957 AI pioneer Marvin Minsky moved to MIT to model human thought with computers. Tap MIT's city.", clue: "Across the Charles River from Boston.", hint: "Harvard is in the same city.",
 city: "Cambridge", country: US[0], code: US[1], geocode: "Massachusetts Institute of Technology", url: "biography/Marvin-Minsky",
 story: "Marvin Minsky, born in New York in 1927, built the first neural network simulator in 1951 and in 1957 moved to the Massachusetts Institute of Technology to pursue using computers to model human thought.",
 quotes: ["In 1957 Minsky moved to the Massachusetts Institute of Technology (MIT) to pursue his interest in using computers to model and understand human thought.", "In 1951 he entered Princeton University, and in that same year he built the first neural network simulator."] });
P("demis-hassabis", "Demis Hassabis", "DH", "GB", "europe", "ai-pioneers", { qid: "demis-hassabis-london", type: "birthplace", diff: "easy", chapter: "From games to proteins",
 question: "Demis Hassabis, Nobel laureate for using AI to predict protein structures, was born in 1976 in which city?", clue: "On the River Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], url: "biography/Demis-Hassabis",
 story: "Demis Hassabis was born in London in 1976. A love of computer games led him to code his first game; he was awarded the 2024 Nobel Prize in Chemistry for using AI to predict protein structure.",
 quotes: ["Demis Hassabis (born July 27, 1976, London, England) is an English computer scientist who was awarded the 2024 Nobel Prize in Chemistry for his work using artificial intelligence (AI) to predict protein structure", "His affection for computer games inspired him to code his first game"] });
P("fei-fei-li", "Fei-Fei Li", "FL", "US", "north-america", "ai-pioneers", { qid: "fei-fei-li-beijing", type: "birthplace", diff: "easy", originNote: "Chinese American", chapter: "The Godmother of AI",
 question: "Fei-Fei Li, the 'Godmother of AI' known for computer vision, was born in 1976 in which city?", clue: "Northern China.", hint: "It's China's capital.",
 city: "Beijing", country: "China", code: "CN", url: "biography/Fei-Fei-Li",
 story: "Fei-Fei Li was born in Beijing in 1976. Known as the 'Godmother of AI' for her groundbreaking work in computer vision, she was named director of Stanford's AI laboratory in 2013.",
 quotes: ["Fei-Fei Li (born July 3, 1976, Beijing, China) is a Chinese American computer scientist widely known as the “Godmother of AI” for her groundbreaking work in computer vision", "In 2013 she was named director of Stanford’s AI laboratory"] });
P("herbert-simon", "Herbert A. Simon", "HS", "US", "north-america", "ai-pioneers", { qid: "herbert-simon-milwaukee", type: "birthplace", diff: "hard", chapter: "A Wisconsin polymath",
 question: "Herbert A. Simon, an early AI pioneer and Nobel economist, was born in 1916 in which Wisconsin city?", clue: "On the western shore of Lake Michigan.", hint: "It's famous for its breweries.",
 city: "Milwaukee", country: US[0], code: US[1], url: "biography/Herbert-A-Simon",
 story: "Herbert A. Simon was born in Milwaukee in 1916. A social scientist who worked across psychology, mathematics and more, he began a long association with Allen Newell at RAND.",
 quotes: ["Herbert A. Simon (born June 15, 1916, Milwaukee, Wis., U.S.—died Feb. 9, 2001, Pittsburgh, Pa.) was an American social scientist known for his contributions to a number of fields",
  ["biography/Allen-Newell", "In 1952 Newell’s work at RAND led to the creation of the Systems Research Laboratory and the beginning of his long-term association with Simon"]] });
P("allen-newell", "Allen Newell", "AN", "US", "north-america", "ai-pioneers", { qid: "allen-newell-san-francisco", type: "birthplace", diff: "medium", chapter: "An AI pioneer",
 question: "Allen Newell, one of the pioneers of artificial intelligence, was born in 1927 in which city?", clue: "Northern California, at the mouth of a great bay.", hint: "Its Golden Gate Bridge is famous.",
 city: "San Francisco", country: US[0], code: US[1], url: "biography/Allen-Newell",
 story: "Allen Newell was born in San Francisco in 1927 and became one of the pioneers of artificial intelligence; in 1957 he earned his institute's first AI-based doctoral degree.",
 quotes: ["Allen Newell (born March 19, 1927, San Francisco, Calif., U.S.—died July 19, 1992, Pittsburgh, Pa.) was an American computer scientist and one of the pioneers of the science of artificial intelligence (AI)", "In 1957 Newell earned the institute’s first AI-based doctoral degree."] });
P("judea-pearl", "Judea Pearl", "JP", "IL", "middle-east", "ai-pioneers", { qid: "judea-pearl-tel-aviv", type: "birthplace", diff: "medium", originNote: "Israeli-American", chapter: "Reasoning with probability",
 question: "Turing Award winner Judea Pearl was born in 1936 in which Mediterranean city?", clue: "On Israel's Mediterranean coast.", hint: "Its full name pairs it with the old port of Jaffa.",
 city: "Tel Aviv", country: "Israel", code: "IL", geocode: "Tel Aviv, Israel", url: "biography/Judea-Pearl",
 story: "Judea Pearl was born in Tel Aviv in 1936. The Israeli-American computer scientist won the 2011 A.M. Turing Award.",
 quotes: ["Judea Pearl (born 1936, Tel Aviv, Palestine [now Tel Aviv–Yafo, Israel]) is an Israeli-American computer scientist and winner of the 2011 A"] });
P("yann-lecun", "Yann LeCun", "YL", "FR", "europe", "ai-pioneers", { qid: "yann-lecun-soisy", type: "birthplace", diff: "legend", chapter: "A Paris suburb",
 question: "Turing Award winner Yann LeCun was born in 1960 in Soisy-sous-Montmorency — a suburb of which capital?", clue: "Val-d'Oise, just north of Paris. Tap Soisy.", hint: "The suburb sits beside the Forest of Montmorency.",
 city: "Soisy-sous-Montmorency", country: "France", code: "FR", geocode: "Soisy-sous-Montmorency, France", url: "https://amturing.acm.org/award_winners/lecun_6017366.cfm", quality: "authoritative",
 story: "Yann LeCun was born in Soisy-sous-Montmorency, France, in 1960 and trained as an electrical engineer in Paris. A 1985 workshop in Les Houches in the French Alps first brought him into contact with the international research community in his field.",
 quotes: ["Birth: July 8, 1960 in Soisy-sous-Montmorency, France.", "A workshop held in Les Houches in the French Alps in 1985 first brought LeCun into direct contact with the international research community working along these lines."] });

// ── Software Legends ────────────────────────────────────────────
P("linus-torvalds", "Linus Torvalds", "LT", "FI", "europe", "software-legends", { qid: "linus-torvalds-helsinki", type: "birthplace", diff: "easy", chapter: "Linux begins",
 question: "Linus Torvalds, the force behind Linux, was born in 1969 in which capital — where he started Linux as a student?", clue: "On the Gulf of Finland.", hint: "It's Finland's capital.",
 city: "Helsinki", country: "Finland", code: "FI", url: "biography/Linus-Torvalds",
 story: "Linus Torvalds was born in Helsinki in 1969. In 1991, as a computer science student at the University of Helsinki, he bought his first PC — and became the principal force behind the Linux operating system.",
 quotes: ["Linus Torvalds (born December 28, 1969, Helsinki, Finland) is a Finnish computer scientist who was the principal force behind the development of the Linux operating system", "In 1991 while a computer science student at the University of Helsinki (M.S., 1996), he purchased his first personal computer (PC)."] });
P("dennis-ritchie", "Dennis Ritchie", "DR", "US", "north-america", "software-legends", { qid: "dennis-ritchie-bronxville", type: "birthplace", diff: "legend", chapter: "Before Bell Labs",
 question: "Dennis Ritchie, co-creator of UNIX and the C language, was born in 1941 in which village north of New York City?", clue: "Westchester County, just north of the Bronx.", hint: "Its name begins with 'Bronx'.",
 city: "Bronxville", country: US[0], code: US[1], geocode: "Bronxville, New York", url: "biography/Dennis-M-Ritchie",
 story: "Dennis M. Ritchie was born in Bronxville, New York, in 1941. He joined Bell Labs in 1967 and, with Ken Thompson, created the UNIX operating system.",
 quotes: ["Dennis M. Ritchie (born September 9, 1941, Bronxville, Eastchester, New York, U.S.—found dead October 2011, Berkeley Heights, New Jersey) was an American computer scientist", "In 1967 he joined Bell Labs",
  ["biography/Kenneth-Lane-Thompson", "Within a few months, Thompson and Ritchie, who had joined him, had created UNIX"]] });
P("ken-thompson", "Ken Thompson", "KT", "US", "north-america", "software-legends", { qid: "ken-thompson-new-orleans", type: "birthplace", diff: "medium", chapter: "The UNIX co-creator",
 question: "Ken Thompson, co-creator of the UNIX operating system, was born in 1943 in which city?", clue: "Louisiana, on the Mississippi near the Gulf of Mexico.", hint: "It's the birthplace of jazz.",
 city: "New Orleans", country: US[0], code: US[1], url: "biography/Kenneth-Lane-Thompson",
 story: "Ken Thompson was born in New Orleans in 1943. At Bell Labs he and Dennis Ritchie created UNIX, an operating system not tied to any particular computer hardware.",
 quotes: ["Ken Thompson (born February 4, 1943, New Orleans, Louisiana, U.S.) is an American computer scientist", "Within a few months, Thompson and Ritchie, who had joined him, had created UNIX"] });
P("margaret-hamilton", "Margaret Hamilton", "MH", "US", "north-america", "software-legends", { qid: "margaret-hamilton-paoli", type: "birthplace", diff: "legend", chapter: "Software engineering",
 question: "Margaret Hamilton, who coined the term 'software engineer', was born in 1936 in which small Indiana town?", clue: "Southern Indiana, in the hills north-west of Louisville.", hint: "It shares its name with a town near Philadelphia.",
 city: "Paoli", country: US[0], code: US[1], geocode: "Paoli, Indiana", url: "biography/Margaret-Hamilton-American-computer-scientist",
 story: "Margaret Hamilton was born in Paoli, Indiana, in 1936. One of the first software programmers, she created the term software engineer and later worked at MIT's Instrumentation Laboratory, which provided technology for NASA.",
 quotes: ["Margaret Hamilton (born August 17, 1936, Paoli, Indiana, U.S.) is an American computer scientist who was one of the first computer software programmers; she created the term software engineer to describe her work",
  "Hamilton next worked at MIT’s Instrumentation Laboratory (now the independent Charles Stark Draper Laboratory), which provided aeronautical technology for the National Aeronautics and Space Administration (NASA)."] });
P("niklaus-wirth", "Niklaus Wirth", "NW", "CH", "europe", "software-legends", { qid: "niklaus-wirth-winterthur", type: "birthplace", diff: "hard", chapter: "A Swiss programmer",
 question: "Niklaus Wirth, creator of the Pascal language and 1984 Turing Award winner, was born in 1934 in which Swiss city?", clue: "North-east of Zürich.", hint: "It's Switzerland's sixth-largest city.",
 city: "Winterthur", country: "Switzerland", code: "CH", url: "biography/Niklaus-Emil-Wirth",
 story: "Niklaus Wirth was born in Winterthur, Switzerland, in 1934. The Swiss computer scientist won the 1984 A.M. Turing Award; he died in Zürich in 2024.",
 quotes: ["Niklaus Emil Wirth (born February 15, 1934, Winterthur, Switzerland—died January 1, 2024, Zürich) was a Swiss computer scientist and winner of the 1984 A"] });
P("donald-knuth", "Donald Knuth", "DK", "US", "north-america", "software-legends", { qid: "donald-knuth-milwaukee", type: "birthplace", diff: "hard", chapter: "The Art of Programming",
 question: "Donald Knuth, author of The Art of Computer Programming, was born in 1938 in which Wisconsin city?", clue: "On the western shore of Lake Michigan.", hint: "Wisconsin's largest city.",
 city: "Milwaukee", country: US[0], code: US[1], url: "biography/Donald-Knuth",
 story: "Donald Knuth was born in Milwaukee in 1938. He is known for his authoritative multivolume series The Art of Computer Programming, whose first volume appeared in 1968.",
 quotes: ["Donald Knuth (born January 10, 1938, Milwaukee, Wisconsin, U.S.) is an American mathematician and computer scientist known for his authoritative multivolume series of books The Art of Computer Programming",
  "the first volume of The Art of Computer Programming was published in 1968."] });
P("john-backus", "John Backus", "JB", "US", "north-america", "software-legends", { qid: "john-backus-philadelphia", type: "birthplace", diff: "medium", chapter: "FORTRAN",
 question: "John Backus, who led the team that designed FORTRAN, was born in 1924 in which city?", clue: "South-eastern Pennsylvania, on the Delaware River.", hint: "The Liberty Bell is there.",
 city: "Philadelphia", country: US[0], code: US[1], url: "biography/John-Warner-Backus",
 story: "John Backus was born in Philadelphia in 1924. He led the IBM team that designed FORTRAN, the first important algorithmic language.",
 quotes: ["John Warner Backus (born Dec. 3, 1924, Philadelphia, Pa., U.S.—died March 17, 2007, Ashland, Ore.) was an American computer scientist and mathematician who led the team that designed FORTRAN (formula translation), the first important algorithmic language"] });
P("richard-stallman", "Richard Stallman", "RS", "US", "north-america", "software-legends", { qid: "richard-stallman-new-york", type: "birthplace", diff: "medium", chapter: "Free software",
 question: "Richard Stallman, founder of the Free Software Foundation, was born in 1953 in which city?", clue: "At the mouth of the Hudson River.", hint: "The 'Big Apple'.",
 city: "New York City", country: US[0], code: US[1], geocode: "Manhattan, New York", url: "biography/Richard-Stallman",
 story: "Richard Stallman was born in New York City in 1953. A computer programmer and free-software advocate, he founded the Free Software Foundation in 1985.",
 quotes: ["Richard Stallman (born March 16, 1953, New York, New York, U.S.) is an American computer programmer and free-software advocate who founded (1985) the Free Software Foun"] });

// ── Internet Pioneers ───────────────────────────────────────────
P("vint-cerf", "Vint Cerf", "VC", "US", "north-america", "internet-pioneers", { qid: "vint-cerf-new-haven", type: "birthplace", diff: "hard", chapter: "A father of the Internet",
 question: "Vint Cerf, one of the founders of the Internet, was born in 1943 in which Connecticut city?", clue: "On Long Island Sound.", hint: "It's home to Yale University.",
 city: "New Haven", country: US[0], code: US[1], geocode: "New Haven, Connecticut", url: "biography/Vinton-Cerf",
 story: "Vinton Cerf was born in New Haven, Connecticut, in 1943. With Robert Kahn he is considered one of the founders of the Internet; later, at MCI, he led the first commercial e-mail service connected to the Internet.",
 quotes: ["Vinton Cerf (born June 23, 1943, New Haven, Connecticut, U.S.) is an American computer scientist who is considered one of the founders, along with Robert Kahn, of the Internet", "While at MCI he led the effort to develop and deploy MCI Mail, the first commercial e-mail service that was connected to the Internet."] });
P("bob-kahn", "Robert Kahn", "RK", "US", "north-america", "internet-pioneers", { qid: "robert-kahn-brooklyn", type: "birthplace", diff: "medium", chapter: "Architect of the Internet",
 question: "Robert Kahn, co-architect of the Internet with Vint Cerf, was born in 1938 in which New York borough?", clue: "On the western end of Long Island.", hint: "Its famous bridge crosses the East River to Manhattan.",
 city: "New York City", country: US[0], code: US[1], geocode: "Brooklyn, New York", url: "biography/Robert-Elliot-Kahn",
 story: "Robert Kahn was born in Brooklyn, New York, in 1938. One of the principal architects of the Internet with Vinton Cerf, he helped organize the 1972 conference that served as the ARPANET's public debut.",
 quotes: ["Robert Kahn (born December 23, 1938, Brooklyn, New York, U.S.) is an American electrical engineer, one of the principal architects, with Vinton Cerf, of the Internet", "in 1972 Kahn helped organize the first International Conference on Computer Communication, which served as the ARPANET’s public debut."] });
P("marc-andreessen", "Marc Andreessen", "MA", "US", "north-america", "internet-pioneers", { qid: "marc-andreessen-cedar-falls", type: "birthplace", diff: "legend", chapter: "Mosaic and Netscape",
 question: "Marc Andreessen, co-creator of the Mosaic web browser and co-founder of Netscape, was born in 1971 in which Iowa city?", clue: "North-eastern Iowa, beside Waterloo.", hint: "Its name pairs trees with a waterfall.",
 city: "Cedar Falls", country: US[0], code: US[1], geocode: "Cedar Falls, Iowa", url: "biography/Marc-Andreessen",
 story: "Marc Andreessen was born in Cedar Falls, Iowa, in 1971. He played a key role in creating the Web browser Mosaic and in April 1994 co-founded Mosaic Communications, later renamed Netscape.",
 quotes: ["Marc Andreessen (born July 9, 1971, Cedar Falls, Iowa, U.S.) is an American-born software engineer who played a key role in creating the Web browser Mosaic and who cofounded Netscape Communications Corporation", "In April 1994 the duo founded Mosaic Communications Corporation (later rechristened Netscape Communications)."] });
P("jimmy-wales", "Jimmy Wales", "JW", "US", "north-america", "internet-pioneers", { qid: "jimmy-wales-huntsville", type: "birthplace", diff: "hard", chapter: "A free encyclopedia",
 question: "Wikipedia co-founder Jimmy Wales was born in 1966 in which Alabama city?", clue: "Northern Alabama, near the Tennessee River.", hint: "It's nicknamed 'Rocket City' for its NASA centre.",
 city: "Huntsville", country: US[0], code: US[1], geocode: "Huntsville, Alabama", url: "money/Jimmy-Wales",
 story: "Jimmy Wales was born in Huntsville, Alabama, in 1966. In March 2000 he founded Nupedia, a free online encyclopedia, and went on to co-found Wikipedia.",
 quotes: ["Jimmy Wales (born August 8, 1966, Huntsville, Alabama, U.S.) is an American entrepreneur who cofounded Wikipedia", "In March 2000, perhaps inspired by objectivist “openness,” he founded a free online encyclopaedia called Nupedia"] });
P("paul-baran", "Paul Baran", "PB", "US", "north-america", "internet-pioneers", { qid: "paul-baran-hrodna", type: "birthplace", diff: "legend", originNote: "Polish-born American engineer", chapter: "Packets",
 question: "Paul Baran, inventor of the distributed network, was born in 1926 in Grodno — a city now in which country?", clue: "On the Neman River, near the Polish and Lithuanian borders. Tap Hrodna.", hint: "The country's capital is Minsk.",
 city: "Hrodna", country: "Belarus", code: "BY", url: "biography/Paul-Baran",
 story: "Paul Baran was born in Grodno, Poland — now Hrodna, Belarus — in 1926. An engineer at the RAND Corporation, he invented the distributed network and was the first to imagine breaking data into smaller packets.",
 quotes: ["Paul Baran (born April 29, 1926, Grodno, Poland [now Hrodna, Belarus]—died March 26, 2011, Palo Alto, California, U.S.) was an American electrical engineer, inventor of the distributed network", "The idea to break up large units of data into smaller packets was first imagined by Paul Baran, an engineer at the RAND Corporation."] });
P("leonard-kleinrock", "Leonard Kleinrock", "LK", "US", "north-america", "internet-pioneers", { qid: "leonard-kleinrock-new-york", type: "birthplace", diff: "medium", chapter: "The first message",
 question: "Leonard Kleinrock, who sent the first message between two networked computers, was born in 1934 in which city?", clue: "At the mouth of the Hudson River.", hint: "The 'Big Apple'.",
 city: "New York City", country: US[0], code: US[1], geocode: "New York City", url: "biography/Leonard-Kleinrock",
 story: "Leonard Kleinrock was born in New York City in 1934. He developed the mathematical theory behind packet switching and sent the first message between two computers on a network that was a precursor of the Internet.",
 quotes: ["Leonard Kleinrock (born June 13, 1934, New York City) is an American computer scientist who developed the mathematical theory behind packet switching and who sent the first message between two computers on a network that was a precursor of the Internet."] });
P("donald-davies", "Donald Davies", "DD", "GB", "europe", "internet-pioneers", { qid: "donald-davies-teddington", type: "career_location", diff: "legend", chapter: "The National Physical Laboratory",
 question: "Packet-switching inventor Donald Davies spent his whole career at the National Physical Laboratory in which London suburb?", clue: "South-west London, on the Thames near Hampton Court.", hint: "Its name contains 'Tedd'.",
 city: "Teddington", country: GB[0], code: GB[1], geocode: "Teddington, London", url: "biography/Donald-Davies",
 story: "Donald Davies, born in Treorchy, Wales, in 1924, co-invented packet switching. In 1947 he went to work under Alan Turing at the National Physical Laboratory in suburban Teddington, and stayed with the NPL for his whole professional life.",
 quotes: ["In 1947 he went to work on the design of the Automatic Computing Engine under Alan Turing at the National Physical Laboratory (NPL) in suburban Teddington, and he remained associated with the NPL for all of his professional life.",
  "Donald Davies (born June 7, 1924, Treorchy, Glamorgan, Wales—died May 28, 2000, Esher, Surrey, England) was a British computer scientist and inventor of packet switching"] });
P("jcr-licklider", "J. C. R. Licklider", "JCRL", "US", "north-america", "internet-pioneers", { qid: "jcr-licklider-st-louis", type: "birthplace", diff: "hard", chapter: "ARPANET's visionary",
 question: "J. C. R. Licklider, who laid the groundwork for ARPANET, was born in 1915 in which Missouri city?", clue: "Where the Missouri joins the Mississippi.", hint: "Its Gateway Arch is the world's tallest arch.",
 city: "St. Louis", country: US[0], code: US[1], geocode: "St. Louis, Missouri", url: "biography/J-C-R-Licklider",
 story: "J. C. R. Licklider was born in St. Louis in 1915. A computer scientist, he helped lay the groundwork for computer networking and ARPANET, the predecessor of the Internet.",
 quotes: ["J.C.R. Licklider (born March 11, 1915, St. Louis, Missouri, U.S.—died June 26, 1990, Arlington, Massachusetts) was an American computer scientist who helped lay the groundwork for computer networking and ARPANET, the predecessor of the Internet"] });
P("robert-metcalfe", "Robert Metcalfe", "RM", "US", "north-america", "internet-pioneers", { qid: "robert-metcalfe-palo-alto", type: "career_location", diff: "hard", chapter: "Ethernet",
 question: "Robert Metcalfe led the Xerox PARC team that developed Ethernet in 1973. In which Silicon Valley city is PARC?", clue: "Santa Clara County, beside Stanford University.", hint: "Its name is Spanish for 'tall stick', after a redwood tree.",
 city: "Palo Alto", country: US[0], code: US[1], geocode: "Palo Alto, California", url: "biography/Robert-Metcalfe",
 story: "Robert Metcalfe is best known for co-inventing Ethernet, crucial for local area networks. He led the team at Xerox PARC that developed it in 1973, and later co-founded 3Com to commercialize the technology.",
 quotes: ["He led the team at Xerox PARC that developed Ethernet in 1973", "Metcalfe later co-founded 3Com Corporation to commercialize Ethernet technology"] });

// ── Inventors ───────────────────────────────────────────────────
P("martin-cooper", "Martin Cooper", "MC", "US", "north-america", "inventors", { qid: "martin-cooper-chicago", type: "birthplace", diff: "medium", chapter: "The first cell phone call",
 question: "Martin Cooper, who led the team that built the first mobile phone and made the first cell-phone call, was born in 1928 in which city?", clue: "On the south-western shore of Lake Michigan.", hint: "It's Illinois's largest city.",
 city: "Chicago", country: US[0], code: US[1], url: "biography/Martin-Cooper",
 story: "Martin Cooper was born in Chicago in 1928. At Motorola he led the team that in 1972–73 built the first mobile cell phone and made the first cell-phone call.",
 quotes: ["Martin Cooper (born December 26, 1928, Chicago, Illinois, U.S.) is an American engineer who led the team that in 1972–73 built the first mobile cell phone and made the first cell phone call."] });
P("shuji-nakamura", "Shuji Nakamura", "SN", "US", "north-america", "inventors", { qid: "shuji-nakamura-ikata", type: "birthplace", diff: "legend", originNote: "Japanese-born American", chapter: "Blue light",
 question: "Nobel laureate Shuji Nakamura, inventor of the blue LED, was born in 1954 in which town on the island of Shikoku?", clue: "At the base of a long, thin peninsula in western Ehime prefecture.", hint: "It's on the Sadamisaki Peninsula.",
 city: "Ikata", country: JP[0], code: JP[1], geocode: "Ikata, Ehime, Japan", url: "https://www.nobelprize.org/prizes/physics/2014/nakamura/facts/", quality: "authoritative",
 story: "Shuji Nakamura was born in Ikata, Japan, in 1954. He studied electrical engineering at the University of Tokushima and shared the 2014 Nobel Prize in Physics for inventing efficient blue light-emitting diodes.",
 quotes: ["Shuji Nakamura was born in Ikata, Japan.", "After studying electrical engineering at the University of Tokushima",
  ["biography/Shuji-Nakamura", "was awarded the 2014 Nobel Prize in Physics for inventing blue light-emitting diodes (LEDs)", "reputable_secondary"]] });
P("charles-kao", "Charles Kao", "CK", "GB", "europe", "inventors", { qid: "charles-kao-shanghai", type: "birthplace", diff: "medium", originNote: "Chinese-born British-American physicist", chapter: "Light through glass",
 question: "Charles Kao, Nobel laureate who showed how light can travel through fibre-optic cables, was born in 1933 in which city?", clue: "China's east coast, at the mouth of the Yangtze.", hint: "China's largest city.",
 city: "Shanghai", country: "China", code: "CN", url: "biography/Charles-Kao",
 story: "Charles Kao was born in Shanghai in 1933. He was awarded the 2009 Nobel Prize for Physics for discovering how light can be transmitted through fibre-optic cables.",
 quotes: ["Charles Kao (born November 4, 1933, Shanghai, China—died September 23, 2018, Hong Kong) was a physicist who was awarded the Nobel Prize for Physics in 2009 for his discovery of how light can be transmitted through fibre-optic cables"] });
P("jack-kilby", "Jack Kilby", "JK", "US", "north-america", "inventors", { qid: "jack-kilby-jefferson-city", type: "birthplace", diff: "hard", chapter: "The microchip",
 question: "Jack Kilby, co-inventor of the integrated circuit, was born in 1923 in which state capital?", clue: "Central Missouri, on the Missouri River.", hint: "It's Missouri's capital, named after a founding father.",
 city: "Jefferson City", country: US[0], code: US[1], geocode: "Jefferson City, Missouri", url: "biography/Jack-Kilby",
 story: "Jack Kilby was born in Jefferson City, Missouri, in 1923. One of the inventors of the integrated circuit, he built a working prototype at Texas Instruments, which filed its patent in February 1959.",
 quotes: ["Jack Kilby (born Nov. 8, 1923, Jefferson City, Mo., U.S.—died June 20, 2005, Dallas, Texas) was an American engineer and one of the inventors of the integrated circuit",
  "in February 1959 TI filed a patent application for this “miniaturized electronic circuit”—the world’s first integrated circuit."] });
P("hedy-lamarr", "Hedy Lamarr", "HL", "US", "north-america", "inventors", { qid: "hedy-lamarr-vienna", type: "birthplace", diff: "medium", originNote: "Austrian-born American", chapter: "Star and inventor",
 question: "Film star and inventor Hedy Lamarr was born in 1913/14 in which European capital?", clue: "On the Danube, in central Europe.", hint: "It's Austria's capital.",
 city: "Vienna", country: "Austria", code: "AT", url: "biography/Hedy-Lamarr",
 story: "Hedy Lamarr, the daughter of a Viennese banker, was born in Vienna and became a Hollywood film star. Years after her screen career ended, she won recognition as a noted inventor of a radio communications device.",
 quotes: ["Hedy Lamarr (born November 9, 1913/14, Vienna, Austria—died January 19, 2000, near Orlando, Florida, U.S.) was an Austrian-born American film star", "Years after her screen career ended, she achieved recognition as a noted inventor of a radio communications device."] });
P("philo-farnsworth", "Philo Farnsworth", "PF", "US", "north-america", "inventors", { qid: "philo-farnsworth-beaver", type: "birthplace", diff: "legend", chapter: "Electronic television",
 question: "Philo Farnsworth, who developed the first all-electronic television system, was born in 1906 in which small Utah town?", clue: "South-western Utah, on the edge of the Tushar Mountains.", hint: "It's named after an animal famous for building dams.",
 city: "Beaver", country: US[0], code: US[1], geocode: "Beaver, Beaver County, Utah, United States", url: "biography/Philo-Farnsworth",
 story: "Philo Farnsworth was born in Beaver, Utah, in 1906. An inventor, he developed the first all-electronic television system.",
 quotes: ["Philo Farnsworth (born August 19, 1906, Beaver, Utah, U.S.—died March 11, 1971, Salt Lake City, Utah) was an American inventor who developed the first all-electronic television system."] });
P("john-logie-baird", "John Logie Baird", "JLB", "GB", "europe", "inventors", { qid: "john-logie-baird-helensburgh", type: "birthplace", diff: "hard", chapter: "The Televisor",
 question: "John Logie Baird, the first person to televise moving pictures, was born in 1888 in which Scottish town?", clue: "On the Firth of Clyde, west of Glasgow.", hint: "It sits at the mouth of the Gare Loch.",
 city: "Helensburgh", country: GB[0], code: GB[1], url: "biography/John-Logie-Baird",
 story: "John Logie Baird was born in Helensburgh, Scotland, in 1888. His 'Televisor', shown to the public on 26 January 1926, is considered the first demonstration of television.",
 quotes: ["John Logie Baird (born August 13, 1888, Helensburgh, Dunbarton, Scotland—died June 14, 1946, Bexhill-on-Sea, Sussex, England) was a Scottish engineer, the first man to televise pictures of objects in motion",
  "His invention, known as the “Televisor,” was shown to the public on January 26, 1926, and is considered the first demonstration of television."] });
P("james-dyson", "James Dyson", "JD", "GB", "europe", "inventors", { qid: "james-dyson-cromer", type: "birthplace", diff: "hard", chapter: "The cyclone",
 question: "Inventor James Dyson, famous for cyclone vacuum cleaners, was born in 1947 in which Norfolk seaside town?", clue: "On the north Norfolk coast.", hint: "It's famous for its crabs and its pier.",
 city: "Cromer", country: GB[0], code: GB[1], url: "money/James-Dyson",
 story: "James Dyson was born in Cromer, Norfolk, in 1947. Frustrated with clogged filters in his factory, in 1978 he built a cyclone particle collector — the start of his innovative household appliances.",
 quotes: ["James Dyson (born May 2, 1947, Cromer, Norfolk, England) is a British inventor, industrial designer, and entrepreneur who successfully manufactured innovative household appliances",
  "In 1978 Dyson, having grown impatient with clogged air filters in his Ballbarrow factory, built a cyclone particle collector"] });
P("willard-boyle", "Willard Boyle", "WB", "CA", "north-america", "inventors", { qid: "willard-boyle-amherst", type: "birthplace", diff: "legend", chapter: "A Nova Scotia physicist",
 question: "Nobel physicist Willard Boyle was born in 1924 in which town in Nova Scotia?", clue: "Near the Nova Scotia–New Brunswick border, at the head of the Bay of Fundy.", hint: "It shares its name with a famous Massachusetts college town.",
 city: "Amherst", country: "Canada", code: "CA", geocode: "Amherst, Nova Scotia", url: "biography/Willard-Boyle",
 story: "Willard Boyle was born in Amherst, Nova Scotia, in 1924. With Donald Nelson he invented, in 1962, the first laser that could operate continuously, and he shared a Nobel Prize in Physics.",
 quotes: ["Willard Boyle (born Aug. 19, 1924, Amherst, N.S., Can.—died May 7, 2011, Truro, N.S.) was a physicist who was awarded", "In 1962, with American physicist Donald Nelson, he invented the first laser capable of being operated continuously"] });
P("robert-noyce", "Robert Noyce", "RN", "US", "north-america", "inventors", { qid: "robert-noyce-grinnell", type: "hometown", diff: "legend", chapter: "A young tinkerer",
 question: "Robert Noyce, co-inventor of the integrated circuit, grew up from 1939 in which Iowa college town?", clue: "Central Iowa, between Des Moines and Iowa City.", hint: "Its college shares the town's name.",
 city: "Grinnell", country: US[0], code: US[1], geocode: "Grinnell, Iowa", url: "biography/Robert-Noyce",
 story: "Robert Noyce, co-inventor of the integrated circuit on a silicon chip, moved with his family to Grinnell, Iowa, in 1939, where he began to show the traits of an inventor and tinkerer.",
 quotes: ["In 1939 the Noyce family moved to Grinnell, Iowa, where the father had accepted a position as a Congregational minister and where the son began to demonstrate the traits of an inventor and tinkerer.",
  "was an American engineer and co-inventor of the integrated circuit, a system of interconnected transistors on a single silicon microchip"] });

// ── Gaming Creators ─────────────────────────────────────────────
const MAF = s => `https://www.bunka.go.jp/j-mediaarts-festival/en/award/profile/${s}/index-2.html`;
P("shigeru-miyamoto", "Shigeru Miyamoto", "SM", "JP", "asia", "gaming-creators", { qid: "shigeru-miyamoto-sonobe", type: "birthplace", diff: "legend", display: "Games", chapter: "A country childhood",
 question: "Shigeru Miyamoto, creator of Mario and Zelda, was born in 1952 in Sonobe, in which Japanese prefecture? Tap Sonobe.", clue: "North-west of Kyoto city, in the hills.", hint: "Sonobe is now part of the city of Nantan.",
 city: "Sonobe", country: JP[0], code: JP[1], geocode: "Sonobe, Nantan, Kyoto", url: MAF("miyamoto-shigeru"), quality: "authoritative",
 story: "Miyamoto Shigeru was born in Sonobe, Kyoto prefecture, in 1952. He graduated from Kanazawa College of Art and joined Nintendo in 1977.",
 quotes: ["Born in Sonobe-cho, Kyoto in November 1952. MIYAMOTO Shigeru graduated from Kanazawa College of Art and started working for Nintendo Co. Ltd. in 1977."] });
P("toru-iwatani", "Toru Iwatani", "TI", "JP", "asia", "gaming-creators", { qid: "toru-iwatani-tokyo", type: "birthplace", diff: "medium", display: "Games", chapter: "Pac-Man",
 question: "Toru Iwatani, who created Pac-Man in 1980, was born in 1955 in which city?", clue: "On a great bay on Honshu's Pacific coast.", hint: "It's Japan's capital.",
 city: "Tokyo", country: JP[0], code: JP[1], url: MAF("iwatani-toru"), quality: "authoritative",
 story: "Iwatani Toru was born in Tokyo in 1955 and joined Namco in 1977. In 1980 he created the video game Pac-Man.",
 quotes: ["Born in 1955 in Tokyo, IWATANI joined Namco Ltd. (now Namco Bandai Games) in 1977. In 1980 he created the video game Pac-Man."] });
P("yuji-horii", "Yuji Horii", "YH", "JP", "asia", "gaming-creators", { qid: "yuji-horii-waseda", type: "career_location", diff: "hard", display: "Games", chapter: "Before Dragon Quest",
 question: "Dragon Quest creator Yuji Horii graduated from Waseda University. In which city is Waseda?", clue: "On Honshu's Pacific coast, on a great bay.", hint: "It's Japan's capital.",
 city: "Tokyo", country: JP[0], code: JP[1], geocode: "Waseda University, Tokyo", url: MAF("horii-yuji"), quality: "authoritative",
 story: "Horii Yuji was born in Hyogo Prefecture in 1954 and graduated from Waseda University. He found success with The Portopia Serial Murder Case (1983) and is the creator of the Dragon Quest role-playing series.",
 quotes: ["Graduated from Waseda University", "HORII is also the creator of the Dragon Quest role-playing game series."] });
P("roberta-williams", "Roberta Williams", "RW", "US", "north-america", "gaming-creators", { qid: "roberta-williams-los-angeles", type: "birthplace", diff: "medium", display: "Games", chapter: "Queen of adventure",
 question: "Roberta Williams, designer of the King's Quest adventure games, was born in 1953 in which city?", clue: "Southern California, on the Pacific.", hint: "It's home to Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: "https://historylink.org/File/20912",
 story: "Roberta Williams was born in Los Angeles in 1953. Her first game, Mystery House (1980), launched On-Line Systems — soon renamed Sierra On-Line — and she designed the King's Quest series (1984–1998).",
 quotes: ["Roberta Lynn Heuer was born on February 16, 1953, in Los Angeles", "Her first, Mystery House in 1980, was an unexpected success that launched the couple's business On-Line Systems.",
  "Roberta Williams worked on Wizard and the Princess (1980), Mission: Asteroid (1980), the King's Quest series (1984-1998)"] });
P("ralph-baer", "Ralph Baer", "RB", "US", "north-america", "gaming-creators", { qid: "ralph-baer-pirmasens", type: "birthplace", diff: "legend", display: "Games", originNote: "German-born American", chapter: "Father of home video games",
 question: "Ralph Baer, 'father of home video games' and creator of the Brown Box console, was born in 1922 in which German town?", clue: "South-west Germany, in the Palatinate near the French border.", hint: "It was a centre of Germany's shoe industry.",
 city: "Pirmasens", country: "Germany", code: "DE", url: "https://spectrum.ieee.org/remembering-ralph-baer-the-father-of-video-games",
 story: "Ralph Baer was born in Pirmasens, Germany, in 1922, where his father worked in a shoe factory. In New Hampshire he and colleagues at Sanders Associates developed the 'Brown Box', the prototype of the first home games console.",
 quotes: ["Baer was born 8 March 1922 to a Jewish family in Pirmasens, Germany, where his father worked in a shoe factory.", "to develop a prototype console called the “Brown Box.”"] });
P("richard-garriott", "Richard Garriott", "RG", "US", "north-america", "gaming-creators", { qid: "richard-garriott-cambridge", type: "birthplace", diff: "hard", display: "Games", originNote: "British-born American", chapter: "Lord British",
 question: "Ultima creator and space tourist Richard Garriott was born in 1961 in which English university city?", clue: "East Anglia, on the River Cam.", hint: "Its university rivals Oxford.",
 city: "Cambridge", country: GB[0], code: GB[1], geocode: "Cambridge, England", url: "biography/Richard-Garriott",
 story: "Richard Garriott was born in Cambridge, England, in 1961 and grew up in Houston. His Ultima series made him a major figure in computer gaming; in 1983 he co-founded Origin Systems, and he later became a space tourist.",
 quotes: ["Richard Garriott (born July 4, 1961, Cambridge, England) is a British-born American computer-game developer who became the sixth space tourist", "in 1983 Garriott cofounded Origin Systems, Inc."] });
P("john-carmack", "John Carmack", "JC", "US", "north-america", "gaming-creators", { qid: "john-carmack-kansas-city", type: "hometown", diff: "medium", display: "Games", chapter: "Doom and Quake",
 question: "John Carmack, pioneer of 3D first-person shooters like Doom and Quake, grew up in which Missouri city?", clue: "Western Missouri, on the Kansas border.", hint: "Its name is shared by a neighbouring city across the state line.",
 city: "Kansas City", country: US[0], code: US[1], geocode: "Kansas City, Missouri", url: "biography/John-Carmack",
 story: "John Carmack grew up in Kansas City, Missouri. His pioneering 3D game design popularized the first-person shooter, in hits such as Doom and Quake.",
 quotes: ["Carmack grew up in Kansas City, Missouri, and knew early on that programming was his calling.", "John Carmack (born August 21, 1970) is an American computer-game designer whose pioneering work on three-dimensional game design led to the popularization of the “first-person shooter” genre"] });
P("william-higinbotham", "William Higinbotham", "WH", "US", "north-america", "gaming-creators", { qid: "william-higinbotham-brookhaven", type: "event_location", diff: "legend", display: "Games", chapter: "Tennis for Two",
 question: "In 1958 William Higinbotham created Tennis for Two, an early video game, at Brookhaven National Laboratory. Tap Brookhaven.", clue: "Long Island, New York, about 60 miles east of Manhattan.", hint: "The lab is at Upton, in Suffolk County.",
 city: "Upton", country: US[0], code: US[1], geocode: "Brookhaven National Laboratory", url: "topic/electronic-game",
 story: "In 1958 William A. Higinbotham of the Brookhaven National Laboratory in New York used an analog computer, control boxes and an oscilloscope to create Tennis for Two, a public display for visitors to the laboratory.",
 quotes: ["For example, in 1958 William A. Higinbotham of the Brookhaven National Laboratory in New York used an analog computer, control boxes, and an oscilloscope to create Tennis for Two as part of a public display for visitors to the laboratory."] });
P("steve-russell", "Steve Russell", "SR", "US", "north-america", "gaming-creators", { qid: "steve-russell-mit", type: "event_location", diff: "hard", display: "Games", chapter: "Spacewar!",
 question: "Steve Russell and colleagues created the pioneering game Spacewar! (1962) at MIT. Tap MIT's city.", clue: "Across the Charles River from Boston.", hint: "Harvard shares the city.",
 city: "Cambridge", country: US[0], code: US[1], geocode: "Massachusetts Institute of Technology", url: "topic/electronic-game",
 story: "Steve Russell, Alan Kotok, J. Martin Graetz and others created Spacewar! in 1962 at the Massachusetts Institute of Technology, as a demonstration program for the PDP-1 minicomputer.",
 quotes: ["Only a few years later Steve Russell, Alan Kotok, J. Martin Graetz, and others created Spacewar! (1962) at the Massachusetts Institute of Technology (MIT)."] });
P("nolan-bushnell", "Nolan Bushnell", "NB", "US", "north-america", "gaming-creators", { qid: "nolan-bushnell-utah", type: "career_location", diff: "hard", display: "Games", chapter: "Before Atari",
 question: "Atari founder Nolan Bushnell first met the game Spacewar! as an engineering student at which university's city?", clue: "At the foot of the Wasatch Range, beside the Great Salt Lake.", hint: "It's Utah's capital.",
 city: "Salt Lake City", country: US[0], code: US[1], geocode: "University of Utah", url: "topic/electronic-game",
 story: "Nolan Bushnell studied electrical engineering at the University of Utah, a strong computer-graphics school where Spacewar! was played. He founded Atari in 1972 with Ted Dabney.",
 quotes: ["One such institution was the University of Utah, home of a strong program in computer graphics and an electrical engineering student named Nolan Bushnell.",
  ["https://lemelson.mit.edu/resources/nolan-bushnell", "Bushnell founded Atari in 1972 with the help of his friend, Ted Dabney, and only $500.", "authoritative"]] });

// ── Robotics ────────────────────────────────────────────────────
P("george-devol", "George Devol", "GD", "US", "north-america", "robotics", { qid: "george-devol-louisville", type: "birthplace", diff: "hard", chapter: "The first industrial robot",
 question: "George Devol, whose 1954 patent led to the first industrial robot, was born in which Kentucky city?", clue: "On the Ohio River, northern Kentucky.", hint: "It hosts the Kentucky Derby.",
 city: "Louisville", country: US[0], code: US[1], geocode: "Louisville, Kentucky", url: "https://invent.org/blog/inventors/George-Devol-Industrial-Robot", quality: "authoritative",
 story: "George Devol was born in Louisville, Kentucky. In 1954 he filed a patent describing an autonomous machine that could store commands and move parts — the basis of the first industrial robot.",
 quotes: ["Devol was born in Louisville, Kentucky.", "In 1954, George Devol filed U.S. Patent No. 2,988,237 describing an autonomous machine that could store commands and move parts."] });
P("joseph-engelberger", "Joseph Engelberger", "JE", "US", "north-america", "robotics", { qid: "joseph-engelberger-brooklyn", type: "birthplace", diff: "medium", chapter: "Father of robotics",
 question: "Joseph Engelberger, 'father of robotics' and founder of Unimation, was born in 1925 in which New York borough?", clue: "Western Long Island.", hint: "Its famous bridge crosses to Manhattan.",
 city: "New York City", country: US[0], code: US[1], geocode: "Brooklyn, New York", url: "https://www.automate.org/news/obituary-joseph-f-engelberger-father-of-robotics",
 story: "Joseph Engelberger was born in Brooklyn, New York, in 1925. He founded Unimation, the world's first industrial robotics manufacturer.",
 quotes: ["Engelberger was born in Brooklyn, New York, on July 26, 1925", "Engelberger was founder and president of Unimation, Inc., the world’s first industrial robotics manufacturer"] });
P("hiroshi-ishiguro", "Hiroshi Ishiguro", "HI", "JP", "asia", "robotics", { qid: "hiroshi-ishiguro-osaka", type: "career_location", diff: "medium", chapter: "Androids",
 question: "Android-builder Hiroshi Ishiguro is a professor at the university of which Japanese city?", clue: "Kansai region, on Osaka Bay.", hint: "It's Japan's third-largest city.",
 city: "Osaka", country: JP[0], code: JP[1], geocode: "Osaka University, Suita", url: "https://conferences.au.dk/robo-philosophy/previous-conferences/rp2018/keynotes/hiroshi-ishiguro", quality: "authoritative",
 story: "Hiroshi Ishiguro received his doctorate in systems engineering from Osaka University in 1991 and is a professor of systems innovation there.",
 quotes: ["received a D.Eng. in systems engineering from the Osaka University, Japan in 1991.", "He is currently Professor of Department of Systems Innovation in the Graduate School of Engineering Science at Osaka University (2009–)"] });
P("daniela-rus", "Daniela Rus", "DR", "US", "north-america", "robotics", { qid: "daniela-rus-mit", type: "career_location", diff: "medium", chapter: "Director of CSAIL",
 question: "Roboticist Daniela Rus directs MIT's Computer Science and Artificial Intelligence Laboratory. Tap MIT's city.", clue: "Across the Charles River from Boston.", hint: "Harvard shares the city.",
 city: "Cambridge", country: US[0], code: US[1], geocode: "Massachusetts Institute of Technology", url: "https://www.csail.mit.edu/user/876", quality: "primary",
 story: "Daniela Rus is director of the Computer Science and Artificial Intelligence Laboratory (CSAIL) at MIT. Her research interests are robotics, mobile computing and data science; she is a 2002 MacArthur Fellow.",
 quotes: ["Director of the Computer Science and Artificial Intelligence Laboratory (CSAIL) at MIT.", "Rus’s research interests are in robotics, mobile computing, and data science."] });
P("rodney-brooks", "Rodney Brooks", "RB", "AU", "oceania", "robotics", { qid: "rodney-brooks-adelaide", type: "birthplace", diff: "medium", chapter: "Mobile robots",
 question: "Robot designer Rodney Brooks was born in 1954 in which Australian city?", clue: "On Gulf St Vincent, South Australia.", hint: "It's South Australia's capital.",
 city: "Adelaide", country: "Australia", code: "AU", url: "biography/Rodney-Allen-Brooks",
 story: "Rodney Brooks was born in Adelaide in 1954. An AI scientist and designer of mobile autonomous robots, he built robots such as Attila at MIT for planetary exploration research.",
 quotes: ["Rodney Brooks (born December 30, 1954, Adelaide, South Australia, Australia) is an Australian computer scientist, artificial intelligence scientist, and designer of mobile autonomous robots",
  "Attila, along with its twin, Hannibal, was built at MIT (1989–91) as part of a research project to develop autonomous robots for planetary exploration."] });
P("hans-moravec", "Hans Moravec", "HM", "CA", "north-america", "robotics", { qid: "hans-moravec-pittsburgh", type: "career_location", diff: "hard", originNote: "Austrian-born Canadian", chapter: "The Robotics Institute",
 question: "Hans Moravec directed Carnegie Mellon University's Robotics Institute from 1980 to 2005. In which city is it?", clue: "Western Pennsylvania, where three rivers meet.", hint: "It's famous for its many bridges and its steel history.",
 city: "Pittsburgh", country: US[0], code: US[1], geocode: "Carnegie Mellon University", url: "biography/Hans-Moravec",
 story: "Hans Moravec, born in Kautzen, Austria, in 1948, worked on robot spatial awareness. After his Stanford PhD he moved to Carnegie Mellon University, directing its Robotics Institute from 1980 to 2005.",
 quotes: ["he moved to Carnegie Mellon University, where he directed the Robotics Institute from 1980 to 2005.", "Hans Moravec (born November 30, 1948, Kautzen, Austria) is an Austrian-born Canadian computer scientist whose influential work in robotics focused on spatial awareness"] });
P("isaac-asimov", "Isaac Asimov", "IA", "US", "north-america", "robotics", { qid: "isaac-asimov-petrovichi", type: "birthplace", diff: "legend", originNote: "Russian-born American author", chapter: "The Three Laws",
 question: "Isaac Asimov, author of the robot stories and the Three Laws of Robotics, was born in 1920 in Petrovichi — in which country?", clue: "Western Russia, south-west of Smolensk. Tap Petrovichi.", hint: "He was brought to the United States aged three.",
 city: "Petrovichi", country: "Russia", code: "RU", geocode: "Петровичи, Шумячский район, Смоленская область", url: "biography/Isaac-Asimov",
 story: "Isaac Asimov was born in Petrovichi, Russia, in 1920 and brought to the United States at age three; he grew up in Brooklyn. He wrote about 500 volumes, most famously the Foundation and robot series.",
 quotes: ["Isaac Asimov (born January 2, 1920, Petrovichi, Russia—died April 6, 1992, New York, New York, U.S.) was an American author and biochemist", "the most famous are those in the Foundation and robot series.", "Asimov was brought to the United States at age three."] });
P("karel-capek", "Karel Čapek", "KČ", "CZ", "europe", "robotics", { qid: "karel-capek-prague", type: "career_location", diff: "medium", chapter: "The word 'robot'",
 question: "Karel Čapek, who invented the word 'robot', settled in 1917 as a writer in which city?", clue: "On the Vltava River, in Bohemia.", hint: "It's the Czech capital.",
 city: "Prague", country: "Czech Republic", code: "CZ", url: "biography/Karel-Capek",
 story: "Karel Čapek studied in Prague, Berlin and Paris and in 1917 settled in Prague as a writer and journalist. For his play R.U.R. he invented the word 'robot', from the Czech word for forced labour.",
 quotes: ["He studied philosophy in Prague, Berlin, and Paris and in 1917 settled in Prague as a writer and journalist.", "For this play Čapek invented the word “robot,” deriving it from the Czech word for forced labour."] });
P("grey-walter", "W. Grey Walter", "GW", "GB", "europe", "robotics", { qid: "grey-walter-bristol", type: "career_location", diff: "hard", chapter: "The tortoises",
 question: "W. Grey Walter, creator of the first autonomous robot 'tortoises', moved in 1939 to which English city to open a neurological institute?", clue: "South-west England, on the River Avon near the Severn.", hint: "Its Clifton Suspension Bridge is famous.",
 city: "Bristol", country: GB[0], code: GB[1], url: "https://www.bristol.ac.uk/news/2008/212017945378.html", quality: "authoritative",
 story: "In 1939 Grey Walter moved to Bristol to open the Burden Neurological Institute. His robot 'tortoises', complete with primitive neural pathways, gave new insights into the nervous system and made him a founding father of cybernetics.",
 quotes: ["In 1939 Walter moved to Bristol to open the BNI as a research centre in neuropsychiatry.", "His ‘tortoises’, complete with primitive neural pathways, led to new insights into the function of the nervous system"] });
P("dean-kamen", "Dean Kamen", "DK", "US", "north-america", "robotics", { qid: "dean-kamen-rockville-centre", type: "birthplace", diff: "legend", chapter: "Robotic arm",
 question: "Dean Kamen, inventor of the Segway and of a robotic arm prosthesis, was born in 1951 in which Long Island village?", clue: "Nassau County, Long Island, New York.", hint: "Its name combines a town in Maryland with 'Centre'.",
 city: "Rockville Centre", country: US[0], code: US[1], geocode: "Rockville Centre, New York", url: "biography/Dean-Kamen",
 story: "Dean Kamen was born in Rockville Centre, New York, in 1951. He created the Segway and, in 2007, debuted a robotic arm prosthesis capable of tasks as delicate as scratching the wearer's nose.",
 quotes: ["Dean Kamen (born April 5, 1951, Rockville Centre, New York, U.S.) is an American inventor who created the Segway Human Transporter", "In 2007 Kamen debuted a robotic arm prosthesis capable of activities as delicate as scratching the wearer’s nose."] });

// ── Space Technology ────────────────────────────────────────────
P("wernher-von-braun", "Wernher von Braun", "WvB", "US", "north-america", "space-technology", { qid: "wernher-von-braun-wyrzysk", type: "birthplace", diff: "legend", originNote: "German-born American engineer", chapter: "Rocket pioneer",
 question: "Rocket engineer Wernher von Braun was born in 1912 in Wirsitz, Germany — a town now in which country?", clue: "North-western Poland, north of Poznań. Tap Wyrzysk.", hint: "Today it's called Wyrzysk.",
 city: "Wyrzysk", country: "Poland", code: "PL", url: "biography/Wernher-von-Braun",
 story: "Wernher von Braun was born in Wirsitz, Germany (now Wyrzysk, Poland), in 1912. He played a prominent role in rocketry and space exploration, first in Germany and after World War II in the United States.",
 quotes: ["Wernher von Braun (born March 23, 1912, Wirsitz, Germany [now Wyrzysk, Poland]—died June 16, 1977, Alexandria, Virginia, U.S.) was a German engineer who played a prominent role in all aspects of rocketry and space exploration, first in Germany and after World War II in the United States."] });
P("sergei-korolev", "Sergei Korolev", "SK", "RU", "europe", "space-technology", { qid: "sergei-korolev-zhytomyr", type: "birthplace", diff: "legend", chapter: "Chief Designer",
 question: "Soviet rocket and spacecraft designer Sergei Korolev was born in 1907 in Zhitomir — a city now in which country?", clue: "West of Kyiv. Tap Zhytomyr.", hint: "Today it's spelled Zhytomyr.",
 city: "Zhytomyr", country: "Ukraine", code: "UA", geocode: "Zhytomyr, Zhytomyr Raion, Ukraine", url: "biography/Sergei-Korolev",
 story: "Sergei Korolev was born in Zhitomir (now Zhytomyr, Ukraine) in 1907. The Soviet designer of missiles, rockets and spacecraft co-founded a group that in 1933 launched the Soviet Union's first liquid-propellant rocket.",
 quotes: ["Sergei Korolev (born January 12, 1907 [December 30, 1906, Old Style], Zhitomir, Russia [now Zhytomyr, Ukraine]—died January 14, 1966, Moscow, Russia, U.S.S.R.) was a Soviet designer of guided missiles, rockets, and spacecraft",
  "in 1933 the group launched the Soviet Union’s first liquid-propellant rocket."] });
P("robert-goddard", "Robert Goddard", "RG", "US", "north-america", "space-technology", { qid: "robert-goddard-worcester", type: "birthplace", diff: "hard", chapter: "Father of modern rocketry",
 question: "Robert Goddard, father of modern rocketry, was born in 1882 in which Massachusetts city?", clue: "Central Massachusetts, west of Boston.", hint: "It shares its name with an English city famous for a sauce.",
 city: "Worcester", country: US[0], code: US[1], geocode: "Worcester, Massachusetts", url: "biography/Robert-Goddard",
 story: "Robert Goddard was born in Worcester, Massachusetts, in 1882. Generally acknowledged as the father of modern rocketry, he was the first to prove that thrust can take place in a vacuum.",
 quotes: ["Robert Goddard (born October 5, 1882, Worcester, Massachusetts, U.S.—died August 10, 1945, Baltimore, Maryland) was an American professor and inventor generally acknowledged to be the father of modern rocketry",
  "he was the first to prove that thrust and consequent propulsion can take place in a vacuum"] });
P("hermann-oberth", "Hermann Oberth", "HO", "DE", "europe", "space-technology", { qid: "hermann-oberth-sibiu", type: "birthplace", diff: "legend", chapter: "Founder of astronautics",
 question: "Hermann Oberth, a founder of modern astronautics, was born in 1894 in Nagyszeben — which Romanian city is that today?", clue: "Transylvania, in central Romania.", hint: "Its German name is Hermannstadt.",
 city: "Sibiu", country: "Romania", code: "RO", url: "biography/Hermann-Julius-Oberth",
 story: "Hermann Oberth was born in Nagyszeben, Austria-Hungary (now Sibiu, Romania), in 1894. He is considered one of the founders of modern astronautics; his first rocket was launched near Berlin in 1931.",
 quotes: ["Hermann Oberth (born June 25, 1894, Nagyszeben, Austria-Hungary [now Sibiu, Rom.]—died Dec. 29, 1989, Nürnberg, W.Ger.) was a German scientist who is considered to be one of the founders of modern astronautics", "the first rocket was launched on May 7, 1931, near Berlin."] });
P("katherine-johnson", "Katherine Johnson", "KJ", "US", "north-america", "space-technology", { qid: "katherine-johnson-white-sulphur-springs", type: "birthplace", diff: "legend", chapter: "Flight paths",
 question: "Katherine Johnson, the NASA mathematician who calculated spacecraft flight paths, was born in 1918 in which West Virginia town?", clue: "South-eastern West Virginia, in the Allegheny Mountains.", hint: "It's home to The Greenbrier resort.",
 city: "White Sulphur Springs", country: US[0], code: US[1], geocode: "White Sulphur Springs, West Virginia", url: "biography/Katherine-Johnson",
 story: "Katherine Johnson was born in White Sulphur Springs, West Virginia, in 1918. In 1939 she was one of the first three African American students in a graduate programme at West Virginia University; she went on to calculate the flight paths of many spacecraft.",
 quotes: ["Katherine Johnson (born August 26, 1918, White Sulphur Springs, West Virginia, U.S.—died February 24, 2020, Newport News, Virginia) was an American mathematician who calculated and analyzed the flight paths of many spacecraft",
  "In 1939, however, she was selected to be one of the first three African American students to enroll in a graduate program at West Virginia University."] });
P("vikram-sarabhai", "Vikram Sarabhai", "VS", "IN", "asia", "space-technology", { qid: "vikram-sarabhai-ahmedabad", type: "career_location", diff: "medium", chapter: "India's space research",
 question: "Vikram Sarabhai, who initiated India's space research, founded the Physical Research Laboratory in which city?", clue: "Gujarat, on the Sabarmati River.", hint: "Gandhi's Sabarmati Ashram is there.",
 city: "Ahmedabad", country: "India", code: "IN", url: "biography/Vikram-Sarabhai",
 story: "Vikram Sarabhai was born in Ahmadabad in 1919. A physicist who initiated space research in India, he founded the Physical Research Laboratory in Ahmadabad on his return to India.",
 quotes: ["He founded the Physical Research Laboratory in Ahmadabad on his return to India.", "Vikram Sarabhai (born August 12, 1919, Ahmadabad, India—died December 30, 1971, Kovalam) was an Indian physicist and industrialist who initiated space research"] });
P("yuri-gagarin", "Yuri Gagarin", "YG", "RU", "europe", "space-technology", { qid: "yuri-gagarin-gagarin", type: "birthplace", diff: "hard", chapter: "First in space",
 question: "Yuri Gagarin, the first human in space, was born in 1934 near Gzhatsk — a town later renamed in his honour. Tap it.", clue: "Western Russia, in Smolensk oblast, between Moscow and Smolensk.", hint: "It's now simply called Gagarin.",
 city: "Gagarin", country: "Russia", code: "RU", geocode: "Gagarin, Smolensk Oblast", url: "biography/Yuri-Gagarin",
 story: "Yuri Gagarin was born near Gzhatsk (now Gagarin, Russia) in 1934. On 12 April 1961 his Vostok 1 spacecraft orbited Earth once, making him the first man to travel into space.",
 quotes: ["Yuri Gagarin (born March 9, 1934, near Gzhatsk, Russia, U.S.S.R. [now Gagarin, Russia]—died March 27, 1968, near Moscow) was a Soviet cosmonaut who in 1961 became the first man to travel into space"] });
P("neil-armstrong", "Neil Armstrong", "NA", "US", "north-america", "space-technology", { qid: "neil-armstrong-wapakoneta", type: "birthplace", diff: "hard", chapter: "First on the Moon",
 question: "Neil Armstrong, the first person to set foot on the Moon, was born in 1930 in which Ohio town?", clue: "West-central Ohio, north of Dayton.", hint: "Its Armstrong Air & Space Museum honours him.",
 city: "Wapakoneta", country: US[0], code: US[1], geocode: "Wapakoneta, Ohio", url: "biography/Neil-Armstrong",
 story: "Neil Armstrong was born in Wapakoneta, Ohio, in 1930. His passion for flight began with his first airplane ride at age 6; as a US astronaut he became the first person to set foot on the Moon.",
 quotes: ["Neil Armstrong (born August 5, 1930, Wapakoneta, Ohio, U.S.—died August 25, 2012, Cincinnati, Ohio) was a U.S. astronaut, and the first person to set foot on the Moon.", "Neil’s passion for aviation and flight was kindled when he took his first airplane ride at age 6."] });

// ── Startup Founders ────────────────────────────────────────────
P("brian-chesky", "Brian Chesky", "BC", "US", "north-america", "startup-founders", { qid: "brian-chesky-san-francisco", type: "company_origin", diff: "easy", chapter: "Air mattresses",
 question: "Airbnb began in 2007 when Brian Chesky and Joe Gebbia rented out air mattresses in their apartment in which city?", clue: "Northern California, at the mouth of a great bay.", hint: "It's famous for the Golden Gate Bridge.",
 city: "San Francisco", country: US[0], code: US[1], url: "money/Airbnb",
 story: "Airbnb traces its beginnings to 2007, when Brian Chesky and Joe Gebbia, recent Rhode Island School of Design graduates, rented out air mattresses in their San Francisco apartment during a design conference.",
 quotes: ["Airbnb traces its beginnings to 2007, when Brian Chesky and Joe Gebbia, recent graduates of the Rhode Island School of Design, rented out air mattresses in their San Francisco apartment"] });
P("daniel-ek", "Daniel Ek", "DE", "SE", "europe", "startup-founders", { qid: "daniel-ek-stockholm", type: "hometown", diff: "easy", chapter: "Spotify",
 question: "Spotify co-founder Daniel Ek was born in 1983 and grew up in Rågsved, near which capital?", clue: "Where Lake Mälaren meets the Baltic.", hint: "It's Sweden's capital.",
 city: "Stockholm", country: "Sweden", code: "SE", url: "money/Daniel-Ek",
 story: "Daniel Ek was born in Stockholm in 1983 and grew up in Rågsved, near Stockholm, building websites as a teenager. In 2006 he co-founded Spotify, the music-streaming service.",
 quotes: ["Daniel Ek (born February 21, 1983, Stockholm, Sweden) is a Swedish entrepreneur who in 2006 cofounded Spotify", "Ek grew up in Ragsved, near Stockholm"] });
P("jack-dorsey", "Jack Dorsey", "JD", "US", "north-america", "startup-founders", { qid: "jack-dorsey-st-louis", type: "birthplace", diff: "medium", chapter: "just setting up my twttr",
 question: "Twitter co-founder Jack Dorsey was born in 1976 in which Missouri city?", clue: "Where the Missouri meets the Mississippi.", hint: "Its Gateway Arch is the world's tallest arch.",
 city: "St. Louis", country: US[0], code: US[1], geocode: "St. Louis, Missouri", url: "money/Jack-Dorsey",
 story: "Jack Dorsey was born in St. Louis in 1976. He co-founded Twitter in 2006 and on 21 March that year posted its first message: 'just setting up my twttr'.",
 quotes: ["Jack Dorsey (born November 19, 1976, St. Louis, Missouri, U.S.) is an American Web developer and entrepreneur who, with Evan Williams and Christopher Stone, cofounded (2006) the online microblogging service Twitter", "On March 21, 2006, Dorsey posted the first Twitter message"] });
P("reed-hastings", "Reed Hastings", "RH", "US", "north-america", "startup-founders", { qid: "reed-hastings-boston", type: "birthplace", diff: "medium", chapter: "Netflix",
 question: "Netflix co-founder Reed Hastings was born in 1960 in which city?", clue: "On Massachusetts Bay, New England.", hint: "It's the capital of Massachusetts.",
 city: "Boston", country: US[0], code: US[1], url: "money/Reed-Hastings",
 story: "Reed Hastings was born in Boston in 1960. After founding Pure Software in 1991, he co-founded Netflix in 1997.",
 quotes: ["Reed Hastings (born October 8, 1960, Boston, Massachusetts, U.S.) is an American entrepreneur who was cofounder (1997) of Netflix", "in 1991 he founded Pure Software (later Pure Atria Corporation)"] });
P("stewart-butterfield", "Stewart Butterfield", "SB", "CA", "north-america", "startup-founders", { qid: "stewart-butterfield-lund", type: "birthplace", diff: "legend", chapter: "Flickr and Slack",
 question: "Stewart Butterfield, co-founder of Flickr and Slack, was born in 1973 in Lund — a fishing village in which Canadian province?", clue: "On the Sunshine Coast, north-west of Vancouver. Tap Lund.", hint: "The province is Canada's westernmost.",
 city: "Lund", country: "Canada", code: "CA", geocode: "Lund, British Columbia", url: "money/Stewart-Butterfield",
 story: "Stewart Butterfield was born in Lund, British Columbia, in 1973; his parents lived in a commune there. He co-founded both Flickr (2004) and Slack Technologies.",
 quotes: ["Stewart Butterfield (born March 21, 1973, Lund, British Columbia, Canada) is a Canadian entrepreneur who cofounded both Flickr (2004), a photo-sharing site, and Slack Technologies", "Butterfield’s parents, who lived in a commune in a small British Columbia fishing village"] });
P("travis-kalanick", "Travis Kalanick", "TK", "US", "north-america", "startup-founders", { qid: "travis-kalanick-los-angeles", type: "birthplace", diff: "easy", chapter: "Uber",
 question: "Uber co-founder Travis Kalanick was born in 1976 in which city?", clue: "Southern California, on the Pacific.", hint: "Home of Hollywood.",
 city: "Los Angeles", country: US[0], code: US[1], url: "money/Travis-Kalanick",
 story: "Travis Kalanick was born in Los Angeles in 1976 and was the co-founding CEO of the ride-hailing company Uber from 2009 to 2017.",
 quotes: ["Travis Kalanick (born August 6, 1976, Los Angeles, California, U.S.) is an American entrepreneur who was the cofounding CEO (2009–17) of the ride-hailing app company Uber"] });
P("sam-altman", "Sam Altman", "SA", "US", "north-america", "startup-founders", { qid: "sam-altman-chicago", type: "birthplace", diff: "medium", chapter: "Early life",
 question: "OpenAI chief Sam Altman was born in 1985 in which city, before moving to the suburbs of St. Louis?", clue: "On the south-western shore of Lake Michigan.", hint: "Illinois's largest city.",
 city: "Chicago", country: US[0], code: US[1], url: "money/Sam-Altman",
 story: "Sam Altman was born in Chicago in 1985 and moved as a young boy to the suburbs of St. Louis, showing an early aptitude for numbers and computing.",
 quotes: ["Sam Altman was born April 22, 1985 in Chicago and moved as a young boy to the suburbs of St. Louis.", "He showed an aptitude for numbers and computing at an early age."] });
P("jerry-yang", "Jerry Yang", "JY", "US", "north-america", "startup-founders", { qid: "jerry-yang-stanford", type: "company_origin", diff: "medium", originNote: "Taiwanese-born American", chapter: "Yahoo",
 question: "Yahoo was founded in 1994 by Jerry Yang and David Filo while they were graduate students at which university? Tap it.", clue: "Santa Clara County, California, beside Palo Alto.", hint: "Its campus is known as 'the Farm'.",
 city: "Stanford", country: US[0], code: US[1], geocode: "Stanford University", url: "biography/Jerry-Yang-American-businessman",
 story: "Yahoo was founded in 1994 by Jerry Yang and David Filo, graduate students at Stanford University, and became one of the early, widely used gateways to the World Wide Web.",
 quotes: ["was founded in 1994 by Jerry Yang and David Filo, graduate students at Stanford University, and was one of the early, widely used gateways to the World Wide Web."] });
P("pony-ma", "Pony Ma", "PM", "CN", "asia", "startup-founders", { qid: "pony-ma-chaoyang", type: "birthplace", diff: "legend", chapter: "Tencent",
 question: "Tencent co-founder Ma Huateng ('Pony Ma') was born in 1971 in Chaoyang, in which Chinese province? Tap Chaoyang.", clue: "Eastern Guangdong, near the coast at Shantou.", hint: "Chaoyang is now a district of Shantou.",
 city: "Chaoyang", country: "China", code: "CN", geocode: "Chaoyang District, Shantou", url: "money/Ma-Huateng",
 story: "Ma Huateng was born in Chaoyang, Guangdong province, in 1971. He co-founded the Internet company Tencent in 1998, which raised nearly $200 million in its 2004 Hong Kong listing.",
 quotes: ["Ma Huateng (born October 29, 1971, Chaoyang, Guangdong province, China) is a Chinese business executive who cofounded the Internet company Tencent Holdings in 1998", "raised nearly $200 million when it went public on the Hong Kong stock exchange in June 2004."] });

// ── Computing History ───────────────────────────────────────────
P("charles-babbage", "Charles Babbage", "CB", "GB", "europe", "computing-history", { qid: "charles-babbage-london", type: "birthplace", diff: "easy", chapter: "The first computer",
 question: "Charles Babbage, who conceived the first automatic digital computer, was born in 1791 in which city?", clue: "On the Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], url: "biography/Charles-Babbage",
 story: "Charles Babbage was born in London in 1791 and died there in 1871. The mathematician and inventor is credited with conceiving the first automatic digital computer.",
 quotes: ["Charles Babbage (born December 26, 1791, London, England—died October 18, 1871, London) was an English mathematician and inventor who is credited with having conceived the first automatic digital computer."] });
P("ada-lovelace", "Ada Lovelace", "AL", "GB", "europe", "computing-history", { qid: "ada-lovelace-london", type: "birthplace", diff: "easy", chapter: "The first programmer",
 question: "Ada Lovelace, associate of Charles Babbage, was born in 1815 at Piccadilly Terrace — in which city?", clue: "On the Thames.", hint: "It's the UK's capital.",
 city: "London", country: GB[0], code: GB[1], geocode: "Piccadilly, London", url: "biography/Ada-Lovelace",
 story: "Ada Lovelace was born at Piccadilly Terrace, London, in 1815. A mathematician and associate of Charles Babbage, she was helped in her studies by Augustus De Morgan.",
 quotes: ["Ada Lovelace (born December 10, 1815, Piccadilly Terrace, Middlesex [now in London], England—died November 27, 1852, Marylebone, London) was an English mathematician, an associate of Charles Babbage"] });
P("grace-hopper", "Grace Hopper", "GH", "US", "north-america", "computing-history", { qid: "grace-hopper-harvard", type: "career_location", diff: "medium", chapter: "Mark I",
 question: "In 1944 Grace Hopper was assigned to work on Mark I, an early automatic calculator, at which university's city?", clue: "Across the Charles River from Boston.", hint: "The university is Harvard.",
 city: "Cambridge", country: US[0], code: US[1], geocode: "Harvard Yard, Cambridge, Massachusetts", url: "biography/Grace-Hopper",
 story: "Grace Hopper, born in New York in 1906, was assigned in 1944 to the Computation Project at Harvard University, working on Mark I. She wrote its first computer manual — the first extensive treatment of how to program a computer.",
 quotes: ["She became a lieutenant and was assigned to the Bureau of Ordnance’s Computation Project at Harvard University (1944), where she worked on Mark I, the first large-scale automatic calculator and a precursor of electronic computers.",
  "She wrote the first computer manual"] });
P("john-von-neumann", "John von Neumann", "JvN", "US", "north-america", "computing-history", { qid: "john-von-neumann-budapest", type: "birthplace", diff: "medium", originNote: "Hungarian-born American", chapter: "Budapest beginnings",
 question: "John von Neumann, mathematician of early computers, was born in 1903 in which city?", clue: "On the Danube in central Europe.", hint: "It's Hungary's capital.",
 city: "Budapest", country: "Hungary", code: "HU", url: "biography/John-von-Neumann",
 story: "John von Neumann was born in Budapest in 1903. The Hungarian-born American mathematician became one of the first professors at the Institute for Advanced Study in Princeton in 1933.",
 quotes: ["John von Neumann (born December 28, 1903, Budapest, Hungary—died February 8, 1957, Washington, D.C., U.S.) was a Hungarian-born American mathematician", "In 1933 von Neumann became one of the first professors at the Institute for Advanced Study (IAS), Princeton, New Jersey."] });
P("herman-hollerith", "Herman Hollerith", "HH", "US", "north-america", "computing-history", { qid: "herman-hollerith-buffalo", type: "birthplace", diff: "hard", chapter: "The tabulating machine",
 question: "Herman Hollerith, inventor of the tabulating machine, was born in 1860 in which New York city?", clue: "Western New York, on Lake Erie near Niagara Falls.", hint: "It shares its name with the American bison.",
 city: "Buffalo", country: US[0], code: US[1], geocode: "Buffalo, New York", url: "money/Herman-Hollerith",
 story: "Herman Hollerith was born in Buffalo, New York, in 1860. He invented a tabulating machine that was an important precursor of the electronic computer.",
 quotes: ["Herman Hollerith (born February 29, 1860, Buffalo, New York, U.S.—died November 17, 1929, Washington, D.C.) was an American inventor of a tabulating machine that was an important precursor of the electronic computer"] });
P("claude-shannon", "Claude Shannon", "CS", "US", "north-america", "computing-history", { qid: "claude-shannon-petoskey", type: "birthplace", diff: "legend", chapter: "Information theory",
 question: "Claude Shannon, founder of information theory, was born in 1916 in which Michigan town?", clue: "On Little Traverse Bay, Lake Michigan.", hint: "It's famous for its fossil 'stones'.",
 city: "Petoskey", country: US[0], code: US[1], geocode: "Petoskey, Michigan", url: "biography/Claude-Shannon",
 story: "Claude Shannon was born in Petoskey, Michigan, in 1916. He laid the theoretical foundations for digital circuits and information theory, publishing 'A Mathematical Theory of Communication' in 1948.",
 quotes: ["Claude Shannon (born April 30, 1916, Petoskey, Michigan, U.S.—died February 24, 2001, Medford, Massachusetts) was an American mathematician and electrical engineer who laid the theoretical foundations for digital circuits and information theory",
  "In 1948 Shannon published “A Mathematical Theory of Communication,”"] });
P("edsger-dijkstra", "Edsger Dijkstra", "ED", "NL", "europe", "computing-history", { qid: "edsger-dijkstra-rotterdam", type: "birthplace", diff: "medium", chapter: "Structured programming",
 question: "Edsger Dijkstra, pioneer of structured programming, was born in 1930 in which Dutch port city?", clue: "On the Nieuwe Maas, in South Holland.", hint: "It's Europe's largest seaport.",
 city: "Rotterdam", country: "Netherlands", code: "NL", url: "biography/Edsger-Dijkstra",
 story: "Edsger Dijkstra was born in Rotterdam in 1930. He developed the paradigm of structured programming and in 1960 co-developed the first compiler for ALGOL-60.",
 quotes: ["Edsger Dijkstra (born May 11, 1930, Rotterdam, Netherlands—died August 6, 2002, Nuenen) was a Dutch computer scientist who developed the paradigm of structured programming", "In 1960 he and Dutch computer scientist Jaap A. Zonnefeld developed the first compiler for the ALGOL-60 programming language."] });
P("gordon-moore", "Gordon Moore", "GM", "US", "north-america", "computing-history", { qid: "gordon-moore-palo-alto", type: "career_location", diff: "hard", chapter: "Shockley's lab",
 question: "In 1956 Intel co-founder Gordon Moore joined Shockley Semiconductor Laboratory, newly opened in which Californian city?", clue: "Santa Clara County, beside Stanford.", hint: "Its name is Spanish for 'tall stick'.",
 city: "Palo Alto", country: US[0], code: US[1], geocode: "Palo Alto, California", url: "biography/Gordon-Moore",
 story: "Gordon Moore, co-founder of Intel with Robert Noyce, returned to California in 1956 to work at Shockley Semiconductor Laboratory, which William Shockley had just opened in Palo Alto.",
 quotes: ["In 1956 Moore returned to California to work at Shockley Semiconductor Laboratory, which William Shockley, one of the Nobel Prize-winning inventors of the transistor, had just opened in Palo Alto.", "was an American engineer and cofounder, with Robert Noyce, of Intel Corporation"] });
P("douglas-engelbart", "Douglas Engelbart", "DE", "US", "north-america", "computing-history", { qid: "douglas-engelbart-portland", type: "birthplace", diff: "medium", chapter: "The mouse",
 question: "Douglas Engelbart, inventor of the computer mouse, was born in 1925 and grew up near which city?", clue: "North-western Oregon, where the Willamette meets the Columbia.", hint: "Oregon's largest city.",
 city: "Portland", country: US[0], code: US[1], geocode: "Portland, Oregon", url: "biography/Douglas-Engelbart",
 story: "Douglas Engelbart was born in Portland, Oregon, in 1925 and grew up on a farm nearby. His work led to the computer mouse, invented in 1963–64, and the basic graphical user interface; he won the 1997 Turing Award.",
 quotes: ["Douglas Engelbart (born January 30, 1925, Portland, Oregon, U.S.—died July 2, 2013, Atherton, California) was an American inventor whose work beginning in the 1950s led to his patent for the computer mouse", "Engelbart grew up on a farm near Portland."] });

const memberships = [
 ["bill-gates-birthplace", "tech-founders", "co-founder of Microsoft"], ["elon-musk-birthplace", "tech-founders", "founder of SpaceX"], ["jack-ma-birthplace", "tech-founders", "founder of Alibaba"],
 ["alan-turing-bletchley-park", "ai-pioneers", "proposed the Turing test of machine intelligence"], ["melanie-perkins-canva", "startup-founders", "co-founded the start-up Canva"],
].map(([questionId, subcategory, reason]) => ({ questionId, category: "tech", subcategory, reason }));
require("fs").writeFileSync(require("path").join(__dirname, "../../src/content/batches/batch-13.json"),
 JSON.stringify({ batch: 13, researched: "2026-10-07", coordinateSource: "OpenStreetMap Nominatim", entries, memberships }, null, 1) + "\n");
console.log(entries.length, "entries,", memberships.length, "memberships");
