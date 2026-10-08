// App-side content catalog (Next.js / Android bundle). Every file in src/content/questions must be listed here;
// validate.test.ts enforces that.
import taxonomy from "@/content/taxonomy.json";
import entities from "@/content/entities.json";
import editions from "@/content/editions.json";
import packs from "@/content/packs.json";
import business from "@/content/questions/business.json";
import creators from "@/content/questions/creators.json";
import fashion from "@/content/questions/fashion.json";
import icons from "@/content/questions/icons.json";
import music from "@/content/questions/music.json";
import royalty from "@/content/questions/royalty.json";
import screen from "@/content/questions/screen.json";
import sports from "@/content/questions/sports.json";
import tech from "@/content/questions/tech.json";
import type { RawContent } from "@/content/schema";
import { buildCatalog } from "./build";

export const catalog = buildCatalog({ taxonomy, entities, editions, packs, questions: [...business, ...creators, ...fashion, ...icons, ...music, ...royalty, ...screen, ...sports, ...tech] } as unknown as RawContent);
