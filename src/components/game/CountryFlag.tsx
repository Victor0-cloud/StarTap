import Image from "next/image";

const flags: Record<string, string> = { Brazil:"br",Switzerland:"ch",Germany:"de",Indonesia:"id",Sweden:"se",
 "Tanzania":"tz",
 "Denmark":"dk",
 "Senegal":"sn",
 "Malaysia":"my",
 "New Zealand":"nz",
 "Belgium":"be",
 "Monaco":"mc",
 "Trinidad and Tobago":"tt",
 "Jordan":"jo",
 "Iran":"ir",
 "Taiwan":"tw",
 "Italy":"it",
 "Pakistan":"pk",
 "Kenya":"ke",
 "Lebanon":"lb",
 "Iraq":"iq",
 "Poland":"pl",
 "Romania":"ro",
 "Cameroon":"cm",
 "Saint Lucia":"lc",
 "Ireland":"ie",
 "South Korea":"kr",
 "Mexico":"mx",
 "Austria":"at",
 "Thailand":"th",
 "Portugal":"pt",
 "Jamaica":"jm",
 "France":"fr",
 "Benin":"bj",
 "Egypt":"eg",
 "Iceland":"is",
 "Canada":"ca",
 "Russia":"ru",
 "Puerto Rico":"pr",
 "Spain":"es",
 "South Africa":"za",
 "United Kingdom": "gb", "United States": "us", Australia: "au",
 // Answer countries whose flag files were added with batches 4–11 (the reveal looks flags up by country name).
 Ghana: "gh", "Cape Verde": "cv", Mali: "ml", Cuba: "cu", Croatia: "hr", Mozambique: "mz", Liberia: "lr", Uruguay: "uy",
 Georgia: "ge", Turkey: "tr", Norway: "no", Netherlands: "nl", Hungary: "hu", "Côte d'Ivoire": "ci", Angola: "ao",
 Ecuador: "ec", Serbia: "rs", "Dominican Republic": "do", Venezuela: "ve", Panama: "pa", Kyrgyzstan: "kg", Belarus: "by",
 "United Arab Emirates": "ae", Greece: "gr", Ethiopia: "et", Lesotho: "ls", Botswana: "bw", Peru: "pe", Eswatini: "sz", Morocco: "ma",
 "North Macedonia": "mk", Gabon: "ga", Philippines: "ph", Bangladesh: "bd", Israel: "il", Finland: "fi", "Czech Republic": "cz", Ukraine: "ua", Yemen: "ye", Algeria: "dz", "Burkina Faso": "bf", Mauritania: "mr", Chile: "cl",
 Argentina: "ar", China: "cn", Barbados: "bb", India: "in",
 Nigeria: "ng", Colombia: "co", Japan: "jp",
};
export function CountryFlag({country}: {country: string}) {
 const code = flags[country];
 if (!code) return null;
 return <Image className="country-flag" src={"/flags/" + code + ".svg"} alt={"Flag of " + country} width={32} height={22} unoptimized />;
}


