"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { MASCOT_IDS, MASCOTS } from "@/lib/game/mascots";
import { ONBOARDING_KEY, ONBOARDING_STEPS } from "@/lib/game/onboarding";
import { COUNTRY_POINTS, CITY_POINTS, JOKER_COUNTRY_POINTS, LIFE_SAVER_CITY_POINTS } from "@/lib/game/stages";
import { BIOME_STYLE, BIOMES } from "@/lib/game/landing";
import { MascotPicker } from "@/components/mascot/MascotPicker";
import { MascotImage } from "@/components/mascot/MascotImage";
import { useMascot } from "@/components/mascot/useMascot";
import { LandingScene } from "@/components/game/LandingScene";
import { GameIcon } from "@/components/game/GameIcon";

const finish = () => { try { localStorage.setItem(ONBOARDING_KEY, "done"); } catch { /* the intro may show again; play is never blocked */ } };
const BIOME_NOTE = { desert: "Golden dunes and warm light", rainforest: "Deep green canopy and mist", snow: "Snow fields and icy ridges", neutral: "City lights for everywhere else" } as const;

/** Six short screens, built to match the provided onboarding art; every control is real and keyboard-reachable. */
export function Onboarding() {
 const router = useRouter();
 const [step, setStep] = useState(0);
 const [mascot, choose] = useMascot();
 const m = MASCOTS[mascot];
 const last = step === ONBOARDING_STEPS.length - 1;
 const go = (href: string) => { finish(); router.push(href); };
 const id = ONBOARDING_STEPS[step];
 return <main className="onboarding" data-step={id}>
  <div className="ob-top">
   <span className="ob-count">{step + 1}/{ONBOARDING_STEPS.length}</span>
   <div className="ob-progress" role="progressbar" aria-valuemin={1} aria-valuemax={ONBOARDING_STEPS.length} aria-valuenow={step + 1} aria-label="Intro progress">
    {ONBOARDING_STEPS.map((s, i) => <i key={s} className={i <= step ? "on" : ""} />)}
   </div>
   <button type="button" className="ob-skip" onClick={() => go("/")}>SKIP</button>
  </div>
  <section className="ob-body" aria-live="polite">
   {id === "mascot" && <>
    <h1 className="ob-title">Choose Your <em>Mascot</em></h1>
    <p className="ob-sub">Pick your travel buddy</p>
    <MascotPicker value={mascot} onChange={choose} />
    <p className="ob-note">✦ Each mascot has a special travel power. You can change it any time.</p>
   </>}
   {id === "country-city" && <>
    <ol className="ob-steps" aria-label="How a round works">
     <li className="done"><MascotImage id={mascot} size={44} /><span>Choose<br />Mascot</span></li>
     <li className="on"><span className="ob-step-icon" aria-hidden="true">🌍</span><span>Pick<br />Country</span></li>
     <li><span className="ob-step-icon" aria-hidden="true">📍</span><span>Tap<br />City</span></li>
     <li><span className="ob-step-icon" aria-hidden="true">🏆</span><span>Win</span></li>
    </ol>
    <h1 className="ob-title">Country First. <em className="ob-violet">City Next.</em></h1>
    <p className="ob-sub">Get the country right to earn points, then tap the right city to win bigger.</p>
    <div className="ob-route" aria-hidden="true">
     <span className="ob-chip ob-chip-country">🌍 Country first <b>+{COUNTRY_POINTS} pts</b></span>
     <span className="ob-chip ob-chip-city">📍 City next <b>+{CITY_POINTS} pts</b></span>
     <span className="ob-arc" /><MascotImage id={mascot} size={88} className="ob-flyer" />
     <span className="ob-win">Nail the city = <b>WIN!</b></span>
    </div>
   </>}
   {id === "worlds" && <>
    <h1 className="ob-title">Landing <em>Worlds</em></h1>
    <p className="ob-sub">Find the country and you fly down into a new world for the city challenge.</p>
    <ul className="ob-worlds">{BIOMES.map(b => <li key={b} className={`ob-world ob-world-${b}`} style={{ ["--land" as string]: BIOME_STYLE[b].land, ["--sky" as string]: BIOME_STYLE[b].sky }}>
     <LandingScene biome={b} aurora={b === "snow"} /><strong>{BIOME_STYLE[b].title}</strong><small>{BIOME_NOTE[b]}</small></li>)}</ul>
    <p className="ob-note">Worlds follow real climate data for each place, never stereotypes.</p>
   </>}
   {id === "powers" && <>
    <h1 className="ob-title">Mascot <em>Powers</em></h1>
    <div className="ob-power-hero" style={{ ["--mascot" as string]: m.color }}><MascotImage id={mascot} kind="card" size={140} />
     <div><small>{m.name.toUpperCase()} · {m.role}</small><strong>{m.power}</strong><p>{m.powerText}</p><p className="ob-touch">Touchdown: {m.touchdown}</p></div></div>
    <ul className="ob-power-list">{MASCOT_IDS.filter(x => x !== mascot).map(x => <li key={x}><MascotImage id={x} size={36} /><span><b>{MASCOTS[x].name}</b> {MASCOTS[x].power}</span></li>)}</ul>
    <p className="ob-note">Powers change how play looks and feels. None of them changes your score.</p>
   </>}
   {id === "rescues" && <>
    <h1 className="ob-title">Joker &amp; <em>Life Saver</em></h1>
    <div className="ob-rescues">
     <div className="ob-rescue"><GameIcon name="joker" size={34} /><strong>JOKER</strong><p>Wrong country? One more try inside a smaller lit zone. The country is then worth {JOKER_COUNTRY_POINTS}.</p></div>
     <div className="ob-rescue"><GameIcon name="lifesaver" size={34} /><strong>LIFE SAVER</strong><p>Missed the city? One more tap with a direction clue. The city is then worth up to {LIFE_SAVER_CITY_POINTS}.</p></div>
    </div>
    <p className="ob-note">One of each per game. They never show the exact answer.</p>
   </>}
   {id === "practice" && <>
    <h1 className="ob-title">Ready, <em>{m.name}?</em></h1>
    <MascotImage id={mascot} kind="card" size={180} className="ob-ready" />
    <p className="ob-sub">Your first adventure is a World Mix five: find each country, then land on the city.</p>
    <p className="ob-note">Today&apos;s Five stays the classic one-tap daily game.</p>
   </>}
  </section>
  <div className="ob-actions">
   {step > 0 && <button type="button" className="secondary-button" onClick={() => setStep(s => s - 1)}>BACK</button>}
   {last ? <button type="button" className="primary-button ob-cta" onClick={() => go("/world-mix/")}>START ADVENTURE ›</button>
    : <button type="button" className="primary-button ob-cta" onClick={() => setStep(s => s + 1)}>CONTINUE ›</button>}
  </div>
  <div className="ob-islands" aria-hidden="true" />
 </main>;
}
