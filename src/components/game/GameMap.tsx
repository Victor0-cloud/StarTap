"use client";
import { useEffect, useRef, useState } from "react";
import type { Map as MapLibreMap, Marker as MapLibreMarker } from "maplibre-gl";
import type { Coordinates } from "@/types/game";
import type { SparkMood } from "@/lib/game/result";
import { countryAt, isSameCountry, loadCountryLookup, type CountryLookup } from "@/lib/geo/countries";
import { CITY_HIT_RADIUS, cityLimit, cityPoints, countryShape, findCountry, focusBounds, loadCities, nearestCity, worldZoom, type CityList } from "@/lib/geo/focus";
import { pushBackHandler } from "@/lib/platform/backStack";
import { cityTiersFor, DEFAULT_MASCOT, MASCOTS, mascotPortal, motionScale, type MascotId } from "@/lib/game/mascots";
import { iconSvg } from "./GameIcon";
import { MOTION, outcomeOf, pointAt, routePoints, travelDuration, travelFrame } from "@/lib/game/motion";
import { BIOME_STYLE, type Biome } from "@/lib/game/landing";
import { BLOCK_COLORS, PROP_COLORS, biomeProps, cityBlocks, landmassKm } from "@/lib/game/diorama";
import { MapTutorial } from "./MapTutorial";
import { LandingBackdrop, LandingForeground } from "./LandingScene";

const EMPTY = { type: "FeatureCollection" as const, features: [] };
// Joker zone membership uses the scoring rule for "same country" (Hong Kong and Macau count as China).
const inZone = (zone: readonly string[] | null | undefined, code: string) => !zone || zone.some(z => isSameCountry(z, code));
const WORLD_CENTER: [number, number] = [10, 15];
type GeoSource = import("maplibre-gl").GeoJSONSource;
const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const wrapLng = (lng: number) => ((lng + 180) % 360 + 360) % 360 - 180;
const easeInOut = (t: number) => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

// The globe look, restored whenever a landing world is left.
const GLOBE_PAINT = { ocean: "#143448", land: "#315f64", coast: "#8ba994", dim: "#081224", focus: "#4f9483", glow: "#e9ff6b", edge: "#e9ff6b", label: "#f4f6ed", halo: "#143448" };
const GLOBE_SKY = { "atmosphere-blend": ["interpolate", ["linear"], ["zoom"], 0, 0.9, 4, 0.6, 7, 0] } as const;
// Orbit's GLOBE SPIN: continent names and the equator / prime meridian, for orientation only (no country is marked).
const CONTINENTS = { type: "FeatureCollection" as const, features: ([["AFRICA", 20, 4], ["EUROPE", 15, 53], ["ASIA", 92, 45], ["NORTH AMERICA", -100, 46], ["SOUTH AMERICA", -60, -14], ["OCEANIA", 134, -24], ["ANTARCTICA", 0, -78]] as const)
 .map(([name, lon, lat]) => ({ type: "Feature" as const, properties: { name }, geometry: { type: "Point" as const, coordinates: [lon, lat] } })) };
const GUIDES = { type: "FeatureCollection" as const, features: [
 { type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: Array.from({ length: 73 }, (_, i) => [-180 + i * 5, 0]) } },
 { type: "Feature" as const, properties: {}, geometry: { type: "LineString" as const, coordinates: Array.from({ length: 35 }, (_, i) => [0, -85 + i * 5]) } },
] };

const MOOD_LABEL: Record<SparkMood, string> = {
 nailed: "celebrating a perfect tap", city: "cheering at your guess", region: "happy at your guess",
 country: "pleased at your guess", close: "encouraging at your guess", miss: "sad at your guess", crowned: "celebrating a milestone at your guess",
};

export interface LandingView { code: string; biome: Biome; aurora: boolean }
interface GameMapProps {
 roundId: string; playerCoordinates: Coordinates | null; answerCoordinates: Coordinates | null;
 mascotMood: SparkMood | null;
 onTap: (point: Coordinates) => void;
 onClear?: () => void; // called when the player zooms back out to the world view
 sparkClass?: string; // free cosmetic rewards the mascot is wearing
 mascot?: MascotId;
 // Two-stage rounds only. Without `stage` the map keeps the classic one-step flow (Today's Five).
 stage?: "country" | "city";
 selectedCountry?: string | null; // highlighted, not yet locked
 onCountry?: (code: string, point: Coordinates) => void;
 zone?: readonly string[] | null; // Joker: only these countries can be picked
 landing?: LandingView | null; // city stage: the landing world to enter
 ghost?: Coordinates | null; // Life Saver: the first city attempt, shown faded
 frozen?: boolean; // ignore taps (transitions and decisions)
 rescue?: "joker" | "lifesaver" | "both" | null; // result reaction: a small Joker / Life Saver badge on the mascot
 companion?: Coordinates | null; // landing world before the first city tap: the mascot waits where it arrived
 cue?: "country-success" | "country-miss" | "retry" | null; // a one-off mascot reaction (country found, wrong country, rescue)
 reveal?: RevealInfo | null; // two-stage city result, shown as signs inside the landing world
}
export interface RevealInfo { label: string; tone: "great" | "good" | "miss"; points: number; cityPoints?: number; countryPoints?: number; km: number; place: string; country: string; line: string }
/** An in-world sign built from text nodes only (content strings never become HTML). */
function worldSign(cls: string, parts: [string, string][]) {
 const el = document.createElement("div"); el.className = "world-sign " + cls; el.setAttribute("aria-hidden", "true");
 for (const [c, t] of parts) { const span = document.createElement("span"); span.className = c; span.textContent = t; el.appendChild(span); }
 return el;
}
/**
 * The shared map for every mode. Classic camera states: WORLD → COUNTRY (flown in, cities) → REVEAL.
 * Two-stage: COUNTRY STAGE on the globe (select + lock a country) → LANDING WORLD (flat, tilted, biome-styled view of the
 * locked country) → REVEAL. Each round starts back at the WORLD globe.
 */
export function GameMap({ roundId, playerCoordinates, answerCoordinates, mascotMood, onTap, onClear, sparkClass = "", mascot = DEFAULT_MASCOT,
 stage, selectedCountry = null, onCountry, zone = null, landing = null, ghost = null, frozen = false, rescue = null, companion = null, cue = null, reveal = null }: GameMapProps) {
 const box = useRef<HTMLDivElement>(null);
 const container = useRef<HTMLDivElement>(null);
 const map = useRef<MapLibreMap | null>(null);
 const callback = useRef(onTap);
 const countryCallback = useRef(onCountry);
 const locked = useRef(false);
 const lastPosition = useRef<{roundId:string;point:Coordinates}|null>(null);
 const initialized = useRef(false);
 const [ready, setReady] = useState(false);
 const [spun, setSpun] = useState(false); // the player has moved the globe (tutorial step 1)
 const [status, setStatus] = useState("Loading world map…");
 // Classic two-step play: tap a country to fly in and see its main cities, then tap a city (or anywhere) to place the mascot.
 const focus = useRef<{ code: string; zoom: number } | null>(null);
 // The zoomed-in view is tagged with its round, so each new round starts in the world view with no state reset.
 const [view, setView] = useState<{ round: string; code: string; cities: number } | null>(null);
 const focusCode = view?.round === roundId ? view.code : null;
 const cityCount = view?.round === roundId ? view.cities : 0;
 const roundRef = useRef(roundId);
 const lookupRef = useRef<CountryLookup | null>(null);
 const citiesRef = useRef<CityList | null>(null);
 const clearRef = useRef(onClear);
 const stageRef = useRef({ stage, zone, frozen, mascot });
 const landingCentre = useRef<[number, number] | null>(null); // for the backdrop parallax
 const scale = motionScale(mascot);
 useEffect(() => { clearRef.current = onClear; roundRef.current = roundId; countryCallback.current = onCountry; stageRef.current = { stage, zone, frozen, mascot }; });
 useEffect(() => { void loadCountryLookup().then(l => { lookupRef.current = l; }); void loadCities().then(c => { citiesRef.current = c; }); }, []);
 const worldView = () => { const el = container.current; return { center: WORLD_CENTER, zoom: worldZoom(el?.clientWidth ?? 360, el?.clientHeight ?? 420) }; };
 function showCities(instance: MapLibreMap, code: string, limit: number) {
  const data = citiesRef.current ? cityPoints(citiesRef.current, code, limit) : EMPTY;
  (instance.getSource("cities") as GeoSource | undefined)?.setData(data);
  setView(v => v && v.code === code ? { ...v, cities: data.features.length } : { round: roundRef.current, code, cities: data.features.length });
 }
 function setFocusPaint(instance: MapLibreMap, on: boolean, dim = 0.42) {
  instance.setPaintProperty("dim", "fill-opacity", on ? dim : 0);
  instance.setPaintProperty("focus-fill", "fill-opacity", on ? 0.55 : 0);
  instance.setPaintProperty("focus-glow", "line-opacity", on ? 0.5 : 0);
  // Neighbouring country names fade so the chosen country's cities read clearly.
  instance.setPaintProperty("country-labels", "text-opacity", on ? 0.3 : 1);
 }
 function focusOn(instance: MapLibreMap, lookup: CountryLookup, code: string) {
  const country = findCountry(lookup, code)!;
  (instance.getSource("focus") as GeoSource | undefined)?.setData(countryShape(country));
  focus.current = { code, zoom: instance.getZoom() };
  setView({ round: roundRef.current, code, cities: 0 });
  instance.once("moveend", () => {
   if (map.current !== instance || focus.current?.code !== code) return;
   focus.current = { code, zoom: instance.getZoom() };
   showCities(instance, code, cityLimit(instance.getZoom(), instance.getZoom(), cityTiersFor(stageRef.current.mascot)));
  });
  setFocusPaint(instance, true);
  // A smooth eased flight into the country. Extra bottom room keeps cities clear of the World / map-centre buttons.
  instance.fitBounds(focusBounds(country), { padding: { top: 64, bottom: 100, left: 36, right: 52 }, maxZoom: 7, duration: reducedMotion() ? 0 : 900 * scale, curve: 1.3, essential: true });
 }
 // Country stage: light up the tapped country and glide it toward the middle; no zoom, no cities, nothing revealed.
 function highlight(instance: MapLibreMap, code: string | null, glide: boolean) {
  const country = code && lookupRef.current ? findCountry(lookupRef.current, code) : undefined;
  (instance.getSource("focus") as GeoSource | undefined)?.setData(country ? countryShape(country) : EMPTY);
  instance.setPaintProperty("focus-fill", "fill-opacity", country ? 0.6 : 0);
  instance.setPaintProperty("focus-glow", "line-opacity", country ? 0.55 : 0);
  if (country && glide) {
   const [[w, s], [e, n]] = focusBounds(country);
   instance.easeTo({ center: [(w + e) / 2, (s + n) / 2], duration: reducedMotion() ? 0 : 650 * scale, essential: true });
  }
 }
 function applyGlobeLook(instance: MapLibreMap) {
  const p = GLOBE_PAINT;
  instance.setProjection({ type: "globe" });
  instance.setSky(GLOBE_SKY as never);
  instance.setPaintProperty("ocean", "background-color", p.ocean);
  instance.setPaintProperty("land", "fill-color", p.land);
  instance.setPaintProperty("coasts", "line-color", p.coast);
  instance.setPaintProperty("dim", "fill-color", p.dim);
  instance.setPaintProperty("focus-fill", "fill-color", p.focus);
  instance.setPaintProperty("focus-glow", "line-color", p.glow);
  instance.setPaintProperty("focus-line", "line-color", p.edge);
  instance.setPaintProperty("city-label", "text-color", p.label);
  instance.setPaintProperty("city-label", "text-halo-color", p.halo);
  instance.setPaintProperty("city-label", "text-halo-width", 1.6);
  instance.setPaintProperty("ocean", "background-opacity", 1);
  instance.setPaintProperty("land", "fill-opacity", 0.95);
  instance.setPaintProperty("coasts", "line-opacity", 0.55);
  for (const id of ["island-cliff-1", "island-cliff-2", "island-cliff-3", "island-shadow"]) instance.setPaintProperty(id, "fill-opacity", 0);
  instance.setPaintProperty("city-glow", "circle-opacity", 0);
  instance.setPaintProperty("city-dot", "circle-radius", ["case", ["==", ["get", "cap"], 1], 5.5, 4]);
  for (const id of ["diorama-props", "diorama-blocks", "route"]) (instance.getSource(id) as GeoSource | undefined)?.setData(EMPTY);
  landingCentre.current = null;
  box.current?.style.removeProperty("--plx-x"); box.current?.style.removeProperty("--plx-y");
 }
 // Landing world: the locked country alone, flat and tilted like a landscape under a biome sky.
 function enterLanding(instance: MapLibreMap, lookup: CountryLookup, world: LandingView) {
  const country = findCountry(lookup, world.code);
  if (!country) return;
  const st = BIOME_STYLE[world.biome];
  // A floating island: only the locked country is drawn, over the biome backdrop that shows through the empty canvas.
  instance.setProjection({ type: "mercator" });
  instance.setSky({ "sky-color": "rgba(0,0,0,0)", "horizon-color": "rgba(0,0,0,0)", "fog-color": "rgba(0,0,0,0)", "atmosphere-blend": 0 });
  instance.setPaintProperty("ocean", "background-opacity", 0);
  instance.setPaintProperty("land", "fill-opacity", 0);
  instance.setPaintProperty("coasts", "line-opacity", 0);
  instance.setPaintProperty("dim", "fill-opacity", 0);
  instance.setPaintProperty("focus-fill", "fill-color", st.land);
  instance.setPaintProperty("focus-fill", "fill-opacity", 1);
  // The island slab: the outline repeated a few pixels lower in darker tones reads as cliffs from the tilted camera.
  st.cliff.forEach((c, i) => { instance.setPaintProperty(`island-cliff-${i + 1}`, "fill-color", c); instance.setPaintProperty(`island-cliff-${i + 1}`, "fill-opacity", 1); });
  instance.setPaintProperty("island-shadow", "fill-opacity", 0.35);
  instance.setPaintProperty("city-glow", "circle-color", st.accent);
  instance.setPaintProperty("city-glow", "circle-opacity", 0.55);
  instance.setPaintProperty("city-dot", "circle-radius", ["case", ["==", ["get", "cap"], 1], 7, 5.5]);
  // Miniature city blocks around each beacon, and biome props across the island; real coordinates, so taps stay exact.
  const bounds = focusBounds(country), km = landmassKm(bounds);
  const list = (citiesRef.current?.countries[world.code] ?? []).slice(0, 16);
  const colorBy = (c: readonly [string, string, string]) => ["match", ["get", "c"], "0", c[0], "1", c[1], c[2]];
  (instance.getSource("diorama-blocks") as GeoSource | undefined)?.setData(cityBlocks(list, world.biome, km) as never);
  (instance.getSource("diorama-props") as GeoSource | undefined)?.setData(biomeProps(country, bounds, world.biome, list) as never);
  instance.setPaintProperty("diorama-blocks", "fill-extrusion-color", colorBy(BLOCK_COLORS[world.biome]) as never);
  instance.setPaintProperty("diorama-props", "fill-extrusion-color", colorBy(PROP_COLORS[world.biome]) as never);
  // Toy scale at any zoom: heights shrink as the player zooms in (on-screen height stays about the same).
  const zl = Math.max(1.5, (instance.cameraForBounds(focusBounds(country), { padding: 40 })?.zoom ?? 5));
  const height = ["*", ["get", "h"], ["interpolate", ["exponential", 2], ["zoom"], zl, 1, zl + 5, 0.03125]];
  for (const id of ["diorama-blocks", "diorama-props"]) instance.setPaintProperty(id, "fill-extrusion-height", height as never);
  instance.setLight({ anchor: "viewport", color: "#ffffff", intensity: 0.45, position: [1.4, 210, 40] });
  instance.setPaintProperty("focus-glow", "line-color", st.accent);
  instance.setPaintProperty("focus-glow", "line-opacity", 0.6);
  instance.setPaintProperty("focus-line", "line-color", st.landEdge);
  instance.setPaintProperty("country-labels", "text-opacity", 0);
  instance.setPaintProperty("city-label", "text-color", st.label);
  instance.setPaintProperty("city-label", "text-halo-color", st.halo);
  instance.setPaintProperty("city-label", "text-halo-width", 2.4); // readable over the diorama, even in sunlight
  (instance.getSource("focus") as GeoSource | undefined)?.setData(countryShape(country));
  (instance.getSource("cities") as GeoSource | undefined)?.setData(EMPTY);
  const camera = instance.cameraForBounds(focusBounds(country), { padding: { top: 70, bottom: 80, left: 18, right: 18 }, bearing: -14, maxZoom: 7.5 });
  const zoom = Math.max(1.5, (camera?.zoom ?? 5) + 0.25); // the tilt foreshortens the island, so frame it a little closer
  focus.current = { code: world.code, zoom };
  instance.once("moveend", () => {
   if (map.current !== instance || focus.current?.code !== world.code) return;
   focus.current = { code: world.code, zoom: instance.getZoom() };
   showCities(instance, world.code, cityLimit(instance.getZoom(), instance.getZoom(), cityTiersFor(stageRef.current.mascot)));
  });
  const centre = (camera?.center ?? instance.getCenter()) as { lng: number; lat: number }; // cameraForBounds returns a LngLat
  landingCentre.current = [centre.lng, centre.lat];
  instance.flyTo({ center: centre, zoom, pitch: 58, bearing: -14, duration: reducedMotion() ? 0 : 1100 * scale, curve: 1.2, essential: true });
 }
 // Map-only reset (no React state), safe to call from effects.
 function resetMap(animate: boolean) {
  const instance = map.current;
  focus.current = null;
  if (!instance) return;
  applyGlobeLook(instance);
  (instance.getSource("focus") as GeoSource | undefined)?.setData(EMPTY);
  (instance.getSource("cities") as GeoSource | undefined)?.setData(EMPTY);
  (instance.getSource("zone") as GeoSource | undefined)?.setData(EMPTY);
  instance.setPaintProperty("zone-line", "line-opacity", 0);
  setFocusPaint(instance, false);
  if (animate) instance.flyTo({ ...worldView(), pitch: 0, bearing: 0, duration: reducedMotion() ? 0 : 750 * scale, curve: 1.2, essential: true });
  else instance.jumpTo({ ...worldView(), pitch: 0, bearing: 0 });
 }
 function goWorld() { resetMap(true); setView(null); clearRef.current?.(); }
 // A brief ripple where the finger landed, so every tap is acknowledged.
 function ripple(x: number, y: number) {
  const host = box.current;
  if (!host || reducedMotion()) return;
  const dot = document.createElement("span");
  dot.className = "map-tap"; dot.style.left = x + "px"; dot.style.top = y + "px";
  host.appendChild(dot);
  window.setTimeout(() => dot.remove(), 650);
 }
 // The map's own event handlers are registered once; they reach the latest functions through this ref.
 const handlers = useRef({ focusOn, showCities, ripple, resetMap, highlight });
 useEffect(() => { handlers.current = { focusOn, showCities, ripple, resetMap, highlight }; });
 useEffect(() => { callback.current = onTap; }, [onTap]);
 useEffect(() => { locked.current = Boolean(answerCoordinates); }, [answerCoordinates]);
 // Android back while zoomed into a country returns to the world view before leaving the game (classic flow).
 const inCountry = Boolean(ready && !stage && focusCode && !answerCoordinates);
 const goWorldRef = useRef(goWorld);
 useEffect(() => { goWorldRef.current = goWorld; });
 useEffect(() => inCountry ? pushBackHandler(() => { goWorldRef.current(); return true; }) : undefined, [inCountry]);
 useEffect(() => {
  let disposed = false;
  if (!container.current) return;
  import("maplibre-gl").then(lib => {
   if (disposed || !container.current) return;
   lib.setWorkerUrl("/maplibre-gl-worker.mjs");
   const start = worldView();
   const p = GLOBE_PAINT;
   const instance = new lib.Map({
    container: container.current, style: {
     version: 8, glyphs:"/fonts/{fontstack}/{range}.pbf",
     // The Earth as a globe you can spin; it flattens smoothly as you zoom into a country.
     projection: { type: "globe" },
     sky: GLOBE_SKY as never,
     sources: { countries: {type:"geojson", data:"/world-countries.geojson"}, labels:{type:"geojson",data:"/country-labels.geojson",attribution:"Country labels and cities: Natural Earth"}, focus:{type:"geojson",data:EMPTY}, cities:{type:"geojson",data:EMPTY},
      zone:{type:"geojson",data:EMPTY}, continents:{type:"geojson",data:CONTINENTS}, guides:{type:"geojson",data:GUIDES},
      "diorama-blocks":{type:"geojson",data:EMPTY}, "diorama-props":{type:"geojson",data:EMPTY}, route:{type:"geojson",data:EMPTY} },
     layers: [
      {id:"ocean",type:"background",paint:{"background-color":p.ocean}},
      {id:"land",type:"fill",source:"countries",paint:{"fill-color":p.land,"fill-opacity":0.95}},
      {id:"coasts",type:"line",source:"countries",paint:{"line-color":p.coast,"line-opacity":0.55,"line-width":0.7}},
      {id:"guides",type:"line",source:"guides",layout:{visibility:"none"},paint:{"line-color":"#5cc8ff","line-opacity":0.45,"line-width":1,"line-dasharray":[2,3]}},
      // Everything but the chosen country dims a little; the country itself lifts and glows.
      {id:"dim",type:"fill",source:"countries",paint:{"fill-color":p.dim,"fill-opacity":0,"fill-opacity-transition":{duration:450,delay:0}}},
      {id:"zone-fill",type:"fill",source:"zone",paint:{"fill-color":"#e9ff6b","fill-opacity":0.16}},
      {id:"zone-line",type:"line",source:"zone",paint:{"line-color":"#e9ff6b","line-width":1.4,"line-opacity":0,"line-dasharray":[2,1.5]}},
      // Landing diorama: the island slab (offset copies of the outline), drawn under the island top.
      {id:"island-shadow",type:"fill",source:"focus",paint:{"fill-color":"#000000","fill-opacity":0,"fill-translate":[0,34],"fill-translate-anchor":"viewport"}},
      {id:"island-cliff-3",type:"fill",source:"focus",paint:{"fill-color":"#1a1a3a","fill-opacity":0,"fill-translate":[0,18],"fill-translate-anchor":"viewport"}},
      {id:"island-cliff-2",type:"fill",source:"focus",paint:{"fill-color":"#2a2c5c","fill-opacity":0,"fill-translate":[0,12],"fill-translate-anchor":"viewport"}},
      {id:"island-cliff-1",type:"fill",source:"focus",paint:{"fill-color":"#3a3f7a","fill-opacity":0,"fill-translate":[0,6],"fill-translate-anchor":"viewport"}},
      {id:"focus-fill",type:"fill",source:"focus",paint:{"fill-color":p.focus,"fill-opacity":0,"fill-opacity-transition":{duration:450,delay:0}}},
      {id:"focus-glow",type:"line",source:"focus",paint:{"line-color":p.glow,"line-width":7,"line-blur":6,"line-opacity":0,"line-opacity-transition":{duration:450,delay:0}}},
      {id:"focus-line",type:"line",source:"focus",paint:{"line-color":p.edge,"line-width":1.8,"line-opacity":0.9}},
      {id:"country-labels",type:"symbol",source:"labels",layout:{"text-field":["get","name"],"text-font":["Open Sans Semibold"],"text-size":["interpolate",["linear"],["zoom"],0,10,4,14,8,17],"text-max-width":8,"text-padding":5,"symbol-sort-key":["get","rank"]},paint:{"text-color":"#f4f6ed","text-halo-color":"#143448","text-halo-width":1.5,"text-opacity-transition":{duration:400,delay:0}}},
      {id:"continents",type:"symbol",source:"continents",layout:{visibility:"none","text-field":["get","name"],"text-font":["Open Sans Semibold"],"text-size":15,"text-letter-spacing":0.3,"text-allow-overlap":true},paint:{"text-color":"#9fe3ff","text-opacity":0.75,"text-halo-color":"#0a1c3a","text-halo-width":1.4}},
      // Miniature 3D world on the island (landing stage only; empty otherwise).
      {id:"diorama-props",type:"fill-extrusion",source:"diorama-props",paint:{"fill-extrusion-color":"#2f7a48","fill-extrusion-height":["get","h"],"fill-extrusion-base":0,"fill-extrusion-opacity":0.95,"fill-extrusion-vertical-gradient":true}},
      {id:"diorama-blocks",type:"fill-extrusion",source:"diorama-blocks",paint:{"fill-extrusion-color":"#5a47c4","fill-extrusion-height":["get","h"],"fill-extrusion-base":0,"fill-extrusion-opacity":0.97,"fill-extrusion-vertical-gradient":true}},
      // The mascot's travel route through the landing world (style set per mascot).
      {id:"route-glow",type:"line",source:"route",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#ffb020","line-width":10,"line-blur":4,"line-opacity":0.55}},
      {id:"route-line",type:"line",source:"route",layout:{"line-cap":"round","line-join":"round"},paint:{"line-color":"#ffd84a","line-width":4,"line-opacity":0.95}},
      // City beacons: a glowing landing pad under each dot.
      {id:"city-glow",type:"circle",source:"cities",paint:{"circle-radius":["case",["==",["get","cap"],1],22,17],"circle-color":"#e9ff6b","circle-blur":0.9,"circle-opacity":0,"circle-pitch-alignment":"map"}},
      // Invisible, thumb-sized touch target around every city; the visible dot stays small.
      {id:"city-hit",type:"circle",source:"cities",paint:{"circle-radius":CITY_HIT_RADIUS,"circle-opacity":0}},
      {id:"city-dot",type:"circle",source:"cities",paint:{"circle-radius":["case",["==",["get","cap"],1],5.5,4],"circle-color":["case",["==",["get","cap"],1],"#e9ff6b","#f4f6ed"],"circle-stroke-color":"#143448","circle-stroke-width":1.5}},
      {id:"city-label",type:"symbol",source:"cities",layout:{"text-field":["get","name"],"text-font":["Open Sans Semibold"],"text-size":["case",["==",["get","cap"],1],14,12.5],"text-variable-anchor":["top","right","left"],"text-radial-offset":0.7,"text-max-width":9,"symbol-sort-key":["get","rank"],"text-padding":4},paint:{"text-color":p.label,"text-halo-color":p.halo,"text-halo-width":1.6}},
     ],
    }, center:start.center,zoom:start.zoom,minZoom:0,maxZoom:12,attributionControl:false,
    // Spin and zoom only: no tilt or rotation by the player, so the world never ends up sideways.
    dragRotate:false,pitchWithRotate:false,touchPitch:false,fadeDuration:250,
   });
   map.current = instance;
   instance.touchZoomRotate.disableRotation();
   instance.keyboard.disableRotation();
   // Momentum after a flick, easing out softly.
   instance.dragPan.enable({linearity:0.25,easing:t=>1-Math.pow(1-t,3),deceleration:2200,maxSpeed:1600});
   instance.addControl(new lib.NavigationControl({showCompass:false}),"top-right");
   instance.addControl(new lib.AttributionControl({compact:true}),"bottom-right");
   instance.on("load",() => {
    if (disposed) return;
    initialized.current=true;setReady(true);setStatus("Tap a country to zoom in");
    // Keep the credit behind its (i) button so it never covers the globe.
    container.current?.querySelector(".maplibregl-ctrl-attrib")?.classList.remove("maplibregl-compact-show");
   });
   instance.on("dragstart",() => setSpun(true));
   let plxFrame = 0;
   instance.on("move",() => {
    if (!landingCentre.current || plxFrame || document.documentElement.dataset.quality !== "high") return;
    plxFrame = requestAnimationFrame(() => {
     plxFrame = 0;
     const c = landingCentre.current, el = box.current;
     if (!c || !el) return;
     const p = instance.project(c), w = instance.getContainer();
     el.style.setProperty("--plx-x", ((w.clientWidth / 2 - p.x) * -0.05).toFixed(1) + "px");
     el.style.setProperty("--plx-y", ((w.clientHeight / 2 - p.y) * -0.03).toFixed(1) + "px");
    });
   });
   // More cities appear, in steps, as the player zooms in on the chosen country.
   instance.on("zoomend",() => {
    const f = focus.current;
    if (f) handlers.current.showCities(instance, f.code, cityLimit(instance.getZoom(), f.zoom, cityTiersFor(stageRef.current.mascot)));
   });
   instance.on("error",() => { if (!disposed && !instance.loaded()) setStatus("Map unavailable. Please reload to retry."); });
   instance.on("click",event => {
    const s = stageRef.current;
    if (locked.current || !initialized.current || s.frozen) return;
    handlers.current.ripple(event.point.x, event.point.y);
    const point = {latitude:event.lngLat.lat,longitude:wrapLng(event.lngLat.lng)};
    const lookup = lookupRef.current;
    if (s.stage === "country") {
     // Two-stage: a tap picks (and lights up) a country. Nothing is revealed until the player locks it.
     const code = lookup ? countryAt(lookup, point) : null;
     if (!lookup || !code || !findCountry(lookup, code)) { setStatus("Tap a country"); return; }
     if (!inZone(s.zone, code)) { setStatus("Joker zone: pick one of the lit countries"); return; }
     handlers.current.highlight(instance, code, true);
     setStatus("Country selected");
     countryCallback.current?.(code, point);
     return;
    }
    if (s.stage === "city" || focus.current) {
     // Zoomed in: a tap near a city snaps to the nearest one; anywhere else places the mascot exactly there.
     const r = CITY_HIT_RADIUS, {x, y} = event.point;
     const near = instance.queryRenderedFeatures([[x - r, y - r], [x + r, y + r]], {layers:["city-hit"]})
      .flatMap(f => f.geometry.type === "Point" ? [{item:f.geometry.coordinates as [number, number], ...instance.project(f.geometry.coordinates as [number, number])}] : []);
     const at = nearestCity({x, y}, near);
     callback.current(at ? {latitude:at[1],longitude:at[0]} : point);
     return;
    }
    const code = lookup ? countryAt(lookup, point) : null;
    if (lookup && code && findCountry(lookup, code)) { handlers.current.focusOn(instance, lookup, code); return; }
    if (!lookup) callback.current(point); // country data not ready: never block play, place the pin directly
    else setStatus("Tap a country to zoom in");
   });
  }).catch(() => {if (!disposed) setStatus("Map unavailable. Please reload to retry.");});
  return () => {disposed=true;initialized.current=false;map.current?.remove();map.current=null;};
 }, []);
 useEffect(() => {
  if (!ready) return;
  // Every round starts from the world view; a reload that resumes inside a landing world goes straight there instead.
  handlers.current.resetMap(stageRef.current.stage !== "city");
 }, [roundId,ready]);
 // Country stage: keep the highlight in step with the selection (restored after a reload, cleared by a Joker retry).
 useEffect(() => {
  const instance = map.current;
  if (!ready || !instance || stage !== "country" || answerCoordinates) return;
  handlers.current.highlight(instance, selectedCountry, false);
 }, [ready, stage, selectedCountry, answerCoordinates, roundId]);
 // Joker zone: the lit group of countries the answer is in.
 useEffect(() => {
  const instance = map.current, lookup = lookupRef.current;
  if (!ready || !instance) return;
  const shapes = zone && lookup ? zone.flatMap(code => { const c = findCountry(lookup, code); return c ? [countryShape(c)] : []; }) : [];
  (instance.getSource("zone") as GeoSource | undefined)?.setData({ type: "FeatureCollection", features: shapes });
  instance.setPaintProperty("zone-line", "line-opacity", shapes.length ? 0.9 : 0);
  if (stage === "country") instance.setPaintProperty("dim", "fill-opacity", shapes.length ? 0.5 : 0);
  // Turn the globe to face the lit zone: it shows the region (the Joker's help), never which country it is.
  if (shapes.length && lookup && zone) {
   const boxes = zone.flatMap(code => { const c = findCountry(lookup, code); return c ? [focusBounds(c)] : []; });
   const lng = boxes.reduce((t, [[w], [e]]) => t + (w + e) / 2, 0) / boxes.length, lat = boxes.reduce((t, [[, s0], [, n]]) => t + (s0 + n) / 2, 0) / boxes.length;
   instance.easeTo({ center: [lng, lat], zoom: Math.max(instance.getZoom(), 1.6), duration: reducedMotion() ? 0 : 900 * scale, essential: true });
  }
 }, [ready, zone, stage, scale]);
 // Orbit's GLOBE SPIN guides, on the globe only.
 useEffect(() => {
  const instance = map.current;
  if (!ready || !instance) return;
  const on = mascot === "orbit" && stage !== "city" && !answerCoordinates ? "visible" : "none";
  instance.setLayoutProperty("continents", "visibility", on);
  instance.setLayoutProperty("guides", "visibility", on);
 }, [ready, mascot, stage, answerCoordinates]);
 // Enter the landing world once the country is locked (the transition overlay hides the camera change).
 const landingKey = stage === "city" && landing ? `${roundId}|${landing.code}|${landing.biome}` : null;
 useEffect(() => {
  const instance = map.current, lookup = lookupRef.current;
  if (!ready || !instance || !landingKey || !landing) return;
  if (lookup) enterLanding(instance, lookup, landing);
  else void loadCountryLookup().then(l => { if (l && map.current === instance) enterLanding(instance, l, landing); });
 }, [ready, landingKey]); // eslint-disable-line react-hooks/exhaustive-deps
 useEffect(() => {
  const instance = map.current;
  if (!instance || !ready) return;
  let cancelled = false;
  const frames = new Set<number>();
  const timers: number[] = [];
  const frame = (fn: FrameRequestCallback) => { const id = requestAnimationFrame(t => { frames.delete(id); fn(t); }); frames.add(id); };
  let resizeReveal: (() => void) | null = null;
  const markers: MapLibreMarker[] = [];
  const clearLine = () => {
   if (map.current !== instance) return;
   for (const id of ["distance-line", "distance-glow"]) if (instance.getLayer(id)) instance.removeLayer(id);
   if (instance.getSource("distance-line")) instance.removeSource("distance-line");
  };
  clearLine();
  const art = mascotPortal(mascot);
  // Fixed local markup only; the image path comes from the mascot table and the icons from GameIcon, never from content.
  // The character stands on its landing point: aura-faded portal art (no token ring), ground shadow and touchdown effects.
  const badge = rescue && answerCoordinates ? `<span class="mascot-rescue">${rescue !== "lifesaver" ? iconSvg("joker", 16) : ""}${rescue !== "joker" ? iconSvg("lifesaver", 16) : ""}</span>` : "";
  const mascotHtml = (fx: boolean) => `${fx ? '<span class="td-fx"><i></i><i></i><i></i><i></i><i></i><i></i></span><span class="td-trail"></span>' : ""}<span class="map-land-ring"></span><span class="map-ball-shadow"></span><span class="map-ball mascot-portal" style="background-image:url('${art}')"></span><span class="spark-acc acc-crown"></span><span class="spark-acc acc-badge"></span>${badge}`;
  if (ghost && !answerCoordinates) void import("maplibre-gl").then(({Marker}) => {
   if (cancelled || map.current !== instance) return;
   const el = document.createElement("div");
   el.className = "map-pin map-pin-player map-pin-ghost";
   el.setAttribute("role", "img"); el.setAttribute("aria-label", "Your first city attempt");
   el.innerHTML = mascotHtml(false);
   markers.push(new Marker({element:el,anchor:"bottom"}).setLngLat([ghost.longitude, ghost.latitude]).addTo(instance));
  });
  const profile = MOTION[mascot];
  const styleRoute = (alpha: number) => {
   const r = profile.route;
   instance.setPaintProperty("route-line", "line-color", r.color); instance.setPaintProperty("route-line", "line-width", r.width);
   instance.setPaintProperty("route-line", "line-dasharray", (r.dash ?? undefined) as never); instance.setLayoutProperty("route-line", "line-cap", r.cap);
   instance.setPaintProperty("route-line", "line-opacity", 0.95 * alpha);
   instance.setPaintProperty("route-glow", "line-color", r.glow); instance.setPaintProperty("route-glow", "line-width", r.glowWidth);
   instance.setPaintProperty("route-glow", "line-blur", r.blur); instance.setPaintProperty("route-glow", "line-opacity", 0.55 * alpha);
  };
  const setRoute = (pts: [number, number][]) => (instance.getSource("route") as GeoSource | undefined)?.setData(pts.length > 1 ? { type: "Feature", properties: {}, geometry: { type: "LineString", coordinates: pts } } : EMPTY);
  if (answerCoordinates || stage !== "city") setRoute([]);
  // Landing world before the first tap: the mascot arrives (its own entrance) and waits where the country was found.
  if (companion && !playerCoordinates && !answerCoordinates && stage === "city") void import("maplibre-gl").then(({Marker}) => {
   if (cancelled || map.current !== instance) return;
   const el = document.createElement("div");
   el.className = ("map-pin map-pin-player companion " + sparkClass).trim();
   el.dataset.mascot = mascot; if (landing) el.dataset.biome = landing.biome; if (cue) el.dataset.cue = cue;
   el.setAttribute("role", "img"); el.setAttribute("aria-label", `${MASCOTS[mascot].name} waiting for your city tap`);
   el.innerHTML = mascotHtml(false);
   markers.push(new Marker({element:el,anchor:"bottom"}).setLngLat([companion.longitude, companion.latitude]).addTo(instance));
   lastPosition.current = { roundId, point: companion };
  });
  if (playerCoordinates) void import("maplibre-gl").then(({Marker}) => {
   if (cancelled || map.current !== instance) return;
   const element=document.createElement("div");
   const touchdown = Boolean(answerCoordinates && stage === "city");
   element.className=("map-pin map-pin-player "+sparkClass+(touchdown?" touchdown":"")).trim();
   element.dataset.mood=mascotMood??"ready";
   element.dataset.mascot=mascot;
   if (landing) element.dataset.biome=landing.biome;
   if (cue && !answerCoordinates) element.dataset.cue=cue;
   if (answerCoordinates && mascotMood) element.dataset.outcome=outcomeOf(mascotMood);
   element.setAttribute("role","img");
   element.setAttribute("aria-label",`${MASCOTS[mascot].name} ${mascotMood?MOOD_LABEL[mascotMood]:"at your selected location"}`);
   element.innerHTML=mascotHtml(touchdown);
   const reduced=reducedMotion();
   const centre=instance.getCenter();
   const origin=lastPosition.current?.roundId===roundId?lastPosition.current.point:{latitude:centre.lat,longitude:centre.lng};
   const target=playerCoordinates;
   const playerMarker=new Marker({element,anchor:"bottom"}).setLngLat([target.longitude,target.latitude]).addTo(instance);
   markers.push(playerMarker);
   const moved=Math.abs(origin.latitude-target.latitude)+Math.abs(wrapLng(origin.longitude-target.longitude))>1e-7;
   if(!answerCoordinates&&!reduced&&moved){
    // Each mascot travels in its own way along its own route: Sparkle hops, Orbit glides and spins, Dash rockets,
    // Aura floats on a wide curve, Pixel streams as pixels, Nova rides a star trail. Same destination for all.
    const delta=wrapLng(target.longitude-origin.longitude);
    const pts=routePoints([origin.longitude,origin.latitude],[origin.longitude+delta,target.latitude],profile.curve);
    const from=instance.project([origin.longitude,origin.latitude]),to=instance.project([target.longitude,target.latitude]);
    const pixels=Math.min(900,Math.hypot(to.x-from.x,to.y-from.y)||0);
    const duration=travelDuration(profile,pixels);
    const drawRoute=stage==="city";
    if(drawRoute)styleRoute(1);
    const started=performance.now();
    element.classList.add("ball-travelling","travelling");
    const fly=(now:number)=>{
     if(cancelled)return;
     const t=Math.min((now-started)/duration,1),f=travelFrame(profile,t),[lng,lat]=pointAt(pts,f.progress);
     playerMarker.setLngLat([lng,lat]);
     element.style.setProperty("--hop",(-f.lift).toFixed(1)+"px");
     element.style.setProperty("--shadow",(1-Math.min(0.6,f.lift/60)).toFixed(2));
     element.style.setProperty("--spin",f.spin.toFixed(0)+"deg");
     element.style.setProperty("--tilt",(f.tilt*Math.sign(to.x-from.x||1)).toFixed(1)+"deg");
     element.style.setProperty("--op",f.opacity.toFixed(2));element.style.setProperty("--sc",f.scale.toFixed(2));
     if(drawRoute)setRoute(pts.slice(0,Math.max(2,Math.ceil(Math.min(1,f.progress+profile.route.ahead)*(pts.length-1))+1)));
     lastPosition.current={roundId,point:{longitude:lng,latitude:lat}};
     if(t<1){frame(fly);return;}
     element.classList.remove("ball-travelling","travelling");element.classList.add("ball-landed");
     for(const v of ["--spin","--tilt","--op","--sc"])element.style.removeProperty(v);
     playerMarker.setLngLat([target.longitude,target.latitude]);lastPosition.current={roundId,point:target};
     if(drawRoute){setRoute(pts);styleRoute(0.55);} // the chosen path stays, softer
    };
    playerMarker.setLngLat([origin.longitude,origin.latitude]);
    frame(fly);
   }else{
    lastPosition.current={roundId,point:target};
    if(!answerCoordinates&&stage==="city"&&moved){styleRoute(0.55);setRoute(routePoints([origin.longitude,origin.latitude],[target.longitude,target.latitude],profile.curve));}
   }
   if (!answerCoordinates) return;
   // Reveal: the camera frames both points, the answer star pops in, then the distance line draws from guess to answer.
   const answer=answerCoordinates;
   const answerElement=document.createElement("div");answerElement.className="map-pin map-pin-answer";answerElement.textContent="★";
   answerElement.setAttribute("role","img");answerElement.setAttribute("aria-label","Correct location");
   markers.push(new Marker({element:answerElement,anchor:"center"}).setLngLat([answer.longitude,answer.latitude]).addTo(instance));
   const left=target.longitude, right=answer.longitude;
   const adjusted=Math.abs(left-right)>180?right+(left>right?360:-360):right;
   const line=(t:number)=>({type:"Feature" as const,properties:{},geometry:{type:"LineString" as const,
    coordinates:[[left,target.latitude],[left+(adjusted-left)*t,target.latitude+(answer.latitude-target.latitude)*t]]}});
   instance.addSource("distance-line",{type:"geojson",data:line(reduced?1:0)});
   const rs=profile.route; // the reveal line uses the mascot's route style
   instance.addLayer({id:"distance-glow",source:"distance-line",type:"line",paint:{"line-color":rs.glow,"line-width":rs.glowWidth,"line-blur":rs.blur,"line-opacity":0.45}});
   instance.addLayer({id:"distance-line",source:"distance-line",type:"line",layout:{"line-cap":rs.cap},paint:{"line-color":rs.color,"line-width":Math.max(2.2,rs.width-1),"line-dasharray":rs.dash??[3,2]}});
   // In the landing diorama, stay close to the miniature scale (a deep zoom would turn the city blocks into towers).
   const revealMax=stage==="city"?Math.min(7,instance.getZoom()+0.9):7;
   const fitReveal=(duration:number)=>instance.fitBounds([[Math.min(left,adjusted),Math.min(target.latitude,answer.latitude)],
    [Math.max(left,adjusted),Math.max(target.latitude,answer.latitude)]],
    {padding:{top:stage?150:95,bottom:55,left:55,right:55},maxZoom:revealMax,duration,essential:true});
   const tour=stage==="city"&&Boolean(reveal)&&!reduced;
   // In the landing world the camera tells the story (as in the reference): push in on the touchdown, follow the route to
   // the destination while it draws and a small echo of the mascot flies it, then pull back to show both. ~2.2 s.
   let echo:MapLibreMarker|null=null;
   if(tour){
    instance.easeTo({center:[target.longitude,target.latitude],zoom:Math.min(instance.getZoom()+0.5,revealMax+0.6),duration:500,essential:true});
    timers.push(window.setTimeout(()=>{if(!cancelled&&map.current===instance)instance.easeTo({center:[adjusted,answer.latitude],duration:900,essential:true});},550));
    timers.push(window.setTimeout(()=>{if(!cancelled&&map.current===instance)fitReveal(700);},1500));
    const echoEl=document.createElement("div");echoEl.className="reveal-echo";echoEl.dataset.mascot=mascot;echoEl.setAttribute("aria-hidden","true");
    echoEl.innerHTML=`<span style="background-image:url('${art}')"></span>`;
    echo=new Marker({element:echoEl,anchor:"bottom"}).setLngLat([left,target.latitude]).addTo(instance);markers.push(echo);
   }else fitReveal(reduced?0:500);
   const drawDelay=tour?550:300,drawMs=tour?900:600;
   if(!reduced)timers.push(window.setTimeout(()=>{
    const began=performance.now();
    const draw=(now:number)=>{
     if(cancelled||map.current!==instance)return;
     const t=Math.min((now-began)/drawMs,1),e=easeInOut(t);
     (instance.getSource("distance-line") as GeoSource|undefined)?.setData(line(e));
     if(echo){echo.setLngLat([left+(adjusted-left)*e,target.latitude+(answer.latitude-target.latitude)*e]);if(t>=1)echo.getElement().classList.add("arrived");}
     if(t<1)frame(draw);
    };
    frame(draw);
   },drawDelay));
   // In-world signs: result plaque under the mascot, points above its head, route tag, destination billboard.
   if(stage==="city"&&reveal){
    const tone=" tone-"+reveal.tone;
    markers.push(new Marker({element:worldSign("world-sign-result"+tone,[["ws-label",reveal.label]]),anchor:"top",offset:[0,10]}).setLngLat([target.longitude,target.latitude]).addTo(instance));
    markers.push(new Marker({element:worldSign("world-sign-points"+tone,reveal.cityPoints!==undefined?[["ws-big",`+${reveal.cityPoints} CITY PTS`],["ws-small",`COUNTRY +${reveal.countryPoints} · TOTAL +${reveal.points}`]]:[["ws-big",`+${reveal.points} PTS`]]),anchor:"bottom",offset:[0,-96]}).setLngLat([target.longitude,target.latitude]).addTo(instance));
    const routeTag=new Marker({element:worldSign("world-sign-route",[["ws-small",`${Math.round(reveal.km).toLocaleString()} km away`],["ws-quote",reveal.line]]),anchor:"bottom",offset:[0,-8]}).setLngLat([left+(adjusted-left)*0.5,target.latitude+(answer.latitude-target.latitude)*0.5]).addTo(instance);
    markers.push(routeTag);
    const place=new Marker({element:worldSign("world-sign-place",[["ws-place",reveal.place.toUpperCase()],["ws-country",reveal.country.toUpperCase()]]),anchor:"bottom",offset:[0,-24]}).setLngLat([answer.longitude,answer.latitude]).addTo(instance);
    markers.push(place);
    // When the guess is on (or near) the answer, the billboard steps aside so it never covers the mascot.
    const aside=()=>{if(cancelled||map.current!==instance)return;const g=instance.project([target.longitude,target.latitude]),q=instance.project([answer.longitude,answer.latitude]);
     const w=instance.getContainer().clientWidth;const half=place.getElement().offsetWidth/2,near=Math.hypot(g.x-q.x,g.y-q.y)<130;
     const fits=(dx:number)=>q.x+dx-half>=8&&q.x+dx+half<=w-8;
     const clamp=(dx:number)=>Math.min(w-8-half-q.x,Math.max(8+half-q.x,dx));
     // Near: the route midpoint is under the mascot, so its tag drops below the result plaque.
     routeTag.setOffset(near?[0,92]:[0,-8]);
     if(!near){place.setOffset([clamp(0),-24]);return;}
     // Beside the mascot (inward side first, then the other); with no room either side, stacked above the points sign.
     const inward=(q.x<w/2?1:-1)*(half+48),side=fits(inward)?inward:fits(-inward)?-inward:null;
     place.setOffset(side!==null?[side,-30]:[clamp(0),-152]);}; // aside, toward the middle of the map
    aside();timers.push(window.setTimeout(aside,tour?2250:550));
   }
   resizeReveal=()=>{if(!instance.isMoving())fitReveal(0);}; // re-frame after a layout change, never mid-flight
   instance.on("resize",resizeReveal);
  });
  return () => {cancelled=true;if(resizeReveal)instance.off("resize",resizeReveal);frames.forEach(cancelAnimationFrame);timers.forEach(clearTimeout);markers.forEach(marker=>marker.remove());clearLine();};
 },[ready,roundId,playerCoordinates,answerCoordinates,mascotMood,sparkClass,mascot,ghost,stage,landing?.biome,rescue,companion?.latitude,companion?.longitude,cue,reveal?.label,reveal?.points]); // eslint-disable-line react-hooks/exhaustive-deps
 const mapView = answerCoordinates ? "reveal" : stage === "city" ? "landing" : stage === "country" ? (selectedCountry ? "country" : "world") : focusCode ? "country" : "world";
 const tutorialSteps = stage ? ["Spin the world", "Tap a country", "Lock the country", "Find the city"] : ["Spin the world", "Tap a country", "Choose a city", "Lock your answer"];
 const tutorialStep = stage ? (stage === "city" ? 3 : selectedCountry ? 2 : spun ? 1 : 0) : (playerCoordinates ? 3 : focusCode ? 2 : spun ? 1 : 0);
 const statusText = answerCoordinates ? "Answer revealed"
  : stage === "country" ? (selectedCountry ? "Country selected · tap another to change" : zone ? "Joker zone: pick one of the lit countries" : status === "Tap a country to zoom in" ? "Tap a country" : status)
  : playerCoordinates ? `${MASCOTS[mascot].name} is here · tap again to move`
  : stage === "city" || focusCode ? `Tap a city, or anywhere, to send ${MASCOTS[mascot].name}` : status;
 return <div ref={box} className="map-box" data-focus={stage === "city" ? landing?.code ?? "" : focusCode ?? ""} data-cities={cityCount} data-view={mapView}
  data-stage={stage ?? "classic"} data-biome={stage === "city" ? landing?.biome : undefined} data-mascot={mascot}>
  {stage === "city" && landing && <LandingBackdrop biome={landing.biome} aurora={landing.aurora} />}
  <div ref={container} className="map-canvas" role="application" aria-label="World globe. Drag to spin, pinch or plus and minus to zoom, arrow keys pan. Use the map-centre button to select a location." />
  {stage === "city" && landing && <LandingForeground biome={landing.biome} />}
  {!playerCoordinates && !focusCode && stage !== "city" && !selectedCountry && <div className="map-hint">TAP A COUNTRY</div>}
  <p className="map-status" role="status">{statusText}</p>
  {ready && <MapTutorial steps={tutorialSteps} step={tutorialStep} revealed={Boolean(answerCoordinates)} mascot={mascot} />}
  {inCountry && <button className="map-world" onClick={goWorld}>← WORLD</button>}
  {ready && !answerCoordinates && !frozen && <button className="map-centre" onClick={()=>{
   const instance=map.current, point=instance?.getCenter();
   if (!instance || !point) return;
   const centre={latitude:point.lat,longitude:wrapLng(point.lng)};
   if (stage === "country") {
    // Keyboard / mouse fallback for picking a country: the one under the map centre.
    const lookup = lookupRef.current, code = lookup ? countryAt(lookup, centre) : null;
    if (!code || !inZone(zone, code)) { setStatus(zone ? "Joker zone: pick one of the lit countries" : "Tap a country"); return; }
    handlers.current.highlight(instance, code, false);
    onCountry?.(code, centre);
    return;
   }
   callback.current(centre);
  }}>USE MAP CENTRE</button>}
 </div>;
}
