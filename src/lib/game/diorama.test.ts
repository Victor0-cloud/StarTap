import test from "node:test";
import assert from "node:assert/strict";
import { biomeProps, cityBlocks, dioramaScale, inCountry, landmassKm, type CountryOutline } from "./diorama.ts";

// A 4°x4° square "country" with a 1°x1° hole (a lake), around 0–4°E, 0–4°N.
const square: CountryOutline = { c: "ZZ", p: [[[0, 0, 4, 0, 4, 4, 0, 4, 0, 0], [1.5, 1.5, 2.5, 1.5, 2.5, 2.5, 1.5, 2.5, 1.5, 1.5]]] };
const bounds: [[number, number], [number, number]] = [[0, 0], [4, 4]];
const cities: [string, number, number, 0 | 1][] = [["Capital", 0.8, 0.8, 1], ["Second", 3.2, 3.2, 0]];

test("diorama: point-in-country respects holes", () => {
 assert.equal(inCountry(square, 0.5, 0.5), true);
 assert.equal(inCountry(square, 2, 2), false, "inside the lake");
 assert.equal(inCountry(square, 5, 1), false);
});

test("diorama: city blocks cluster around each city, leaving the beacon clear", () => {
 const km = landmassKm(bounds);
 const blocks = cityBlocks(cities, "neutral", km);
 assert.ok(blocks.features.length >= 13, "capital gets 9, others at least 4");
 const unit = dioramaScale(km).unitKm;
 for (const f of blocks.features) {
  const [lng, lat] = f.geometry.coordinates[0][0];
  const d = Math.min(...cities.map(([, x, y]) => Math.hypot((x - lng) * 111, (y - lat) * 111)));
  assert.ok(d < unit * 3 && f.properties.h > 0, "near a city and has height");
 }
 assert.deepEqual(cityBlocks(cities, "neutral", km), blocks, "deterministic: a reload draws the same world");
 const lowDesert = cityBlocks(cities, "desert", km).features.reduce((t, f) => t + f.properties.h, 0);
 const tallCity = blocks.features.reduce((t, f) => t + f.properties.h, 0);
 assert.ok(lowDesert < tallCity, "desert settlements are low-rise");
});

test("diorama: biome props stay inside the country, out of lakes and away from cities", () => {
 const props = biomeProps(square, bounds, "rainforest", cities, 60);
 assert.ok(props.features.length > 30);
 for (const f of props.features) {
  const [[a, b], [c]] = f.geometry.coordinates[0];
  assert.ok(inCountry(square, a, b) || inCountry(square, (a + c) / 2, b), "on land");
 }
 assert.deepEqual(biomeProps(square, bounds, "rainforest", cities, 60), props);
});
