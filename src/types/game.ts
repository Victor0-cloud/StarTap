export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface StarMedia {
  listenUrl?: string;
  watchUrl?: string;
  discoverUrl?: string;
  listenLabel?: string;
  watchLabel?: string;
  discoverLabel?: string;
  sourceName?: string;
}

export interface StarQuestion {
  media?: StarMedia;
  id: string;
  starName: string;
  question: string;
  imageUrl?: string;
  imageCredit?: { title: string; author: string; sourceUrl: string; license: string; licenseUrl: string; changes: string };
  answerCity: string;
  answerCountry: string;
  answerCoordinates: Coordinates;
  category: string;
  sourceUrl: string;
  monogram: string;
}

export interface RoundResult {
  questionId: string;
  starName: string;
  playerCoordinates: Coordinates;
  distanceKm: number;
  score: number;
  countryPoints?: number; // two-stage rounds only
  cityPoints?: number;
}

// The playable shape the game UI consumes, built from V2 content by src/lib/content/build.ts.
export type Question = StarQuestion & { clue: string; hint: string; story: string; chapter?: string; storyTitle?: string; trivia?: string; extraSource?: string; answerCountryCode?: string;
 triviaCard?: { type: string; title: string; text: string; sourceUrl: string; sourceName: string };
 primaryCategory?: string; subcategory?: string; stampType?: string };
