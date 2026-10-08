// Node-only loader for tests and scripts; the app uses catalog.ts.
import { readdirSync, readFileSync, existsSync } from "node:fs";
import type { RawContent } from "../../content/schema.ts";

export const contentDir = new URL("../../content/", import.meta.url);
const json = (file: string) => JSON.parse(readFileSync(new URL(file, contentDir), "utf8"));
export const questionFiles = () => readdirSync(new URL("questions/", contentDir)).filter(f => f.endsWith(".json")).sort();
export function loadRawContent(): RawContent {
 return {
  taxonomy: json("taxonomy.json"), entities: json("entities.json"), editions: json("editions.json"), packs: json("packs.json"),
  questions: questionFiles().flatMap(file => json("questions/" + file)),
 };
}
export const loadJson = json;
export const flagExists = (code: string) => existsSync(new URL(`../../../public/flags/${code.toLowerCase()}.svg`, import.meta.url));
