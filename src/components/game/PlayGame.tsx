"use client";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import type { Coordinates, Question } from "@/types/game";
import { summarizeResults, MAX_GAME_SCORE } from "@/lib/game/results";
import { HINT_COST, dateKey } from "@/lib/game/daily";
import { emptyProgress, restoreProgress, resultsFor, type Progress, type SavedAnswer } from "@/lib/game/progress";
import { crossedMilestone } from "@/lib/game/milestones";
import { resultState, sparkMood, SPARK_LINES, type ResultState, type ResultTier, type ScoringVersion } from "@/lib/game/result";
import { countryAt, isSameCountry, loadCountryLookup } from "@/lib/geo/countries";
import { focusBounds, loadCities } from "@/lib/geo/focus";
import { calculateDistanceKm } from "@/lib/game/distance";
import { earnsStamp, PASSPORT_KEY, readPassport, recordDiscovery } from "@/lib/game/passport";
import { readStreak, recordCompletion, STREAK_KEY } from "@/lib/game/streak";
import { ADVENTURE_KEY, readAdventure, starTotals } from "@/lib/game/adventure";
import { sparkRewardClasses } from "@/lib/game/rewards";
import { compassDirection, COUNTRY_POINTS, CITY_POINTS, JOKER_COUNTRY_POINTS, LIFE_SAVER_CITY_POINTS, LIFE_SAVER_KM, jokerZone, pixelClue, stageLabel, stageTier, type RoundPhase } from "@/lib/game/stages";
import { BIOME_STYLE, landingWorldFor, type LandingWorlds } from "@/lib/game/landing";
import { MASCOTS, motionScale } from "@/lib/game/mascots";
import { MascotImage } from "@/components/mascot/MascotImage";
import { GameIcon } from "./GameIcon";
import { MOTION, outcomeOf } from "@/lib/game/motion";
import adventureData from "@/content/adventure.json";
import landingData from "@/content/landing-worlds.json";
import type { Adventure } from "@/content/schema";
import { StreakBadge } from "./StreakBadge";
import { RevealExtras } from "./RevealExtras";
import { FinishSummary, type FinishRound } from "./FinishSummary";
import { StarWheel } from "./StarWheel";
import { CountryFlag } from "./CountryFlag";
import { StarPortrait } from "./StarPortrait";
import { SharePreview } from "./SharePreview";
import { GameMap } from "./GameMap";
import { SoundToggle, useGameSound } from "./SoundToggle";
import { WonderReveal } from "./WonderReveal";
import { RescueBurst } from "@/components/mascot/RescueBurst";
import { useMascot } from "@/components/mascot/useMascot";
import { allowRoundReveal, roundWonder, type WonderReveal as Reveal } from "@/lib/game/wonder";

const subscribe=()=>()=>{};
// Local progression stores (passport, streak, adventure). Failures never interrupt play.
const lsGet=(key:string)=>{try{return localStorage.getItem(key);}catch{return null;}};
const lsSet=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* progress stays in memory */}};
const reducedMotion=()=>window.matchMedia("(prefers-reduced-motion: reduce)").matches;
// Optional non-daily mode (World Mix, category, subcategory, Adventure). Absent for Today's Five, which keeps its exact
// one-step behaviour. Every session mode plays two-stage rounds: country first, then the city in its landing world.
export type ModeSession={storageKey:string;label:string;backHref:string;backLabel:string;sharePath:string;onPlayAgain:()=>void;
 onFinish?:(total:number)=>void;finishExtra?:(total:number)=>ReactNode;playAgainLabel?:string;
 // Wonder Reveal at the end of a game; called before onFinish so it can compare with earlier progress.
 finishReveal?:(total:number)=>Reveal|null};
// Tiny intro above each question, for an adventure feel. Picked by round, so it is stable on reload.
const INTROS=["Ready for your next star?","Where did this story begin?","Can you find the place?","Next stop…","{mascot} found another mystery!"];
type Props={day:string;edition:string;scoring:ScoringVersion;questions:readonly Question[];session?:ModeSession};
const SOUND_FOR:Record<ResultTier,"perfect"|"close"|"miss">={nailed:"perfect",city:"perfect",region:"close",country:"close",close:"close",miss:"miss"};
/** Where a two-stage round resumes after a reload: always from the saved moment, never from an earlier one. */
function phaseFor(progress:Progress):RoundPhase{
 if(progress.answers[progress.roundIndex])return "round_complete";
 const p=progress.pending?.round===progress.roundIndex?progress.pending:null;
 if(!p)return "country_select";
 return p.phase==="country_wrong"?"country_result":p.phase==="country_retry"?"country_select":p.phase==="city_missed"?"city_locked":"city_select";
}
export function PlayGame(props:Props) {
 const mounted=useSyncExternalStore(subscribe,()=>true,()=>false);
 return mounted?<GameSession {...props}/>:<main className="empty-state">Preparing your five stars…</main>;
}
function GameSession({day,edition,scoring,questions,session}:Props) {
 const storageKey=session?.storageKey??"startap:"+edition+":"+day;
 const staged=Boolean(session);
 const [progress,setProgressRaw]=useState<Progress>(()=>{
  try {return restoreProgress(localStorage.getItem(storageKey));} catch {return emptyProgress();}
 });
 const [revealedId,setRevealedId]=useState<string|null>(null);
 const [draft,setDraft]=useState<Coordinates|null>(null);
 const [practice,setPractice]=useState(false);
 const [storageWarning,setStorageWarning]=useState(false);
 const [locking,setLocking]=useState(false);
 const [stampNote,setStampNote]=useState<{id:string;text:string}|null>(null);
 const [mascot]=useMascot();
 const buddy=MASCOTS[mascot];
 // Two-stage round state. The phase is explicit and saved via progress.pending, never inferred from the UI.
 const [phase,setPhase]=useState<RoundPhase>(()=>staged?phaseFor(progress):"country_select");
 const [draftCountry,setDraftCountry]=useState<{code:string;point:Coordinates}|null>(null);
 const [rescue,setRescue]=useState<{kind:"joker"|"lifesaver";key:number}|null>(null);
 const [zone,setZone]=useState<{id:string;codes:string[]}|null>(null);
 const phaseTimers=useRef<number[]>([]);
 const clearPhaseTimers=()=>{phaseTimers.current.forEach(clearTimeout);phaseTimers.current=[];};
 useEffect(()=>()=>clearPhaseTimers(),[]);
 // The mascot wears the free rewards unlocked by Wonder Stars.
 const [sparkClass]=useState(()=>sparkRewardClasses(starTotals(adventureData as Adventure,readAdventure(lsGet(ADVENTURE_KEY))).earned));
 // Wonder Reveal: only in World Mix, category and Adventure play (Today's Five is unchanged), only for moments locked live
 // (never on reload), each moment once, and at most MAX_ROUND_REVEALS per game.
 const [wonder,setWonder]=useState<Reveal|null>(null);
 const wonderShown=useRef<{count:number;ids:Set<string>}>({count:0,ids:new Set()});
 // The reveal waits until the map has shown the guess, answer, line and score; moving on first simply drops it.
 const wonderTimer=useRef<number|null>(null);
 const cancelWonder=()=>{if(wonderTimer.current!==null)window.clearTimeout(wonderTimer.current);wonderTimer.current=null;setWonder(null);};
 useEffect(()=>()=>{if(wonderTimer.current!==null)window.clearTimeout(wonderTimer.current);},[]);
 const showWonder=(w:Reveal|null,round:boolean)=>{
  const seen=wonderShown.current;
  if(!w||seen.ids.has(w.rewardId)||(round&&!allowRoundReveal(seen.count)))return;
  seen.ids.add(w.rewardId);if(round)seen.count++;
  // In the landing world the reveal waits for the in-world result tour (≈2.2 s) to finish first.
  const after=reducedMotion()?250:round?(staged&&(pending?.phase==="city_select"||pending?.phase==="city_missed")?2900:1500):700;
  wonderTimer.current=window.setTimeout(()=>{wonderTimer.current=null;setWonder(w);sound.play(w.soundKey);},after);
 };
 const lock=useRef(false);
 const resultCard=useRef<HTMLElement>(null);
 const sound=useGameSound();
 const question=questions[progress.roundIndex];
 const completed=resultsFor(progress.answers,questions,scoring);
 const result=completed[progress.roundIndex]??null;
 const summary=summarizeResults(completed);
 const today=dateKey();
 const isToday=day===today;
 const answer=progress.answers[progress.roundIndex];
 const pending=progress.pending?.round===progress.roundIndex&&!answer?progress.pending:null;
 const milestone=result?crossedMilestone(summary.totalScore-result.score,summary.totalScore):null;
 const state:ResultState|null=result&&answer?(answer.stage?{tier:stageTier(result.distanceKm,answer.stage.countryRight),label:stageLabel(result.distanceKm,answer.stage.countryRight),score:result.score,
   subtitle:[answer.stage.joker?"Joker used":null,answer.stage.lifeSaver?"Life Saver used":null,answer.hintUsed?"Hint used · −200":null].filter(Boolean).join(" · ")||null}
  :resultState({distanceKm:result.distanceKm,score:result.score,hintUsed:answer.hintUsed,sameCountry:isSameCountry(answer.countryCode,question.answerCountryCode)})):null;
 const world=landingWorldFor(landingData as LandingWorlds,{coordinates:question.answerCoordinates,countryCode:question.answerCountryCode});
 const k=reducedMotion()?0.25:motionScale(mascot);
 // Warm the country lookup so locking an answer is instant.
 useEffect(()=>{void loadCountryLookup();},[]);
 // Bring the result card into view on phones, where it sits below the map.
 useEffect(()=>{
  if(!result)return;
  const go=()=>resultCard.current?.scrollIntoView({block:"nearest",behavior:reducedMotion()?"auto":"smooth"});
  if(!staged){go();return;}
  const t=window.setTimeout(go,reducedMotion()?0:2600); // the result plays in the world first (camera tour ≈2.2 s)
  return ()=>window.clearTimeout(t);
 },[result?.questionId]); // eslint-disable-line react-hooks/exhaustive-deps
 // Joker zone for this round, computed from the offline country outlines (same zone on every reload).
 const zoneActive=staged&&phase==="country_select"&&Boolean(pending?.joker);
 useEffect(()=>{
  if(!zoneActive||!question.answerCountryCode)return;
  let live=true;
  void loadCountryLookup().then(lookup=>{
   if(!live||!lookup)return;
   const centres=lookup.countries.map(c=>{const [[w,s],[e,n]]=focusBounds(c);return {code:c.c,centre:{latitude:(s+n)/2,longitude:(w+e)/2}};});
   const codes=jokerZone(question.answerCountryCode!,centres,question.id);
   // Hong Kong and Macau count as China in scoring, so they light up with it.
   if(codes.includes("CN"))codes.push(...["HK","MO"].filter(c=>!codes.includes(c)&&lookup.countries.some(x=>x.c===c)));
   setZone({id:question.id,codes});
  });
  return ()=>{live=false;};
 },[zoneActive,question.id,question.answerCountryCode]);
 function setProgress(next: Progress) {
  setProgressRaw(next);
  if (practice) return;
  try {localStorage.setItem(storageKey,JSON.stringify({...next,version:1}));}
  catch {setStorageWarning(true);}
 }
 const place=useCallback((coordinates:Coordinates)=>{
  if (!lock.current) setDraft(coordinates);
 },[]);
 /** Saves a finished round and runs everything that follows it: passport stamp, sound, Wonder Reveal. */
 function commit(answers:SavedAnswer[],tier:ResultTier,extra:Partial<Progress>={}){
  const latest=resultsFor(answers,questions,scoring).at(-1)!;
  const crossed=crossedMilestone(summary.totalScore,summary.totalScore+latest.score);
  let newStamp:{stampType:string;newCountry:boolean}|null=null;
  // Star Passport: finding the right country in World Mix, category play or the Adventure earns a stamp.
  if(session&&!practice&&earnsStamp(tier)&&question.answerCountryCode&&question.primaryCategory){
   const r=recordDiscovery(readPassport(lsGet(PASSPORT_KEY)),{countryCode:question.answerCountryCode,countryName:question.answerCountry,category:question.primaryCategory,
    subcategory:question.subcategory??"",stampType:question.stampType??"World Star",score:latest.score,date:dateKey()});
   lsSet(PASSPORT_KEY,r.passport);
   if(r.isNewStamp)newStamp={stampType:question.stampType??"World Star",newCountry:r.isNewCountry};
   if(r.isNewStamp)setStampNote({id:question.id,text:(r.isNewCountry?"New country discovered! ":"Stamp unlocked! ")+question.answerCountry+" · "+(question.stampType??"World Star")});
  }
  sound.play(crossed?"victory":SOUND_FOR[tier]);
  if(session&&!practice)showWonder(roundWonder({tier,score:latest.score,category:question.primaryCategory,countryName:question.answerCountry,newStamp,milestone:crossed,
   roundKey:storageKey+":"+progress.roundIndex+":"+question.id}),true);
  setProgress({...progress,...extra,answers});
 }
 // Classic one-step round (Today's Five and its practice replays).
 async function confirm() {
  if (!draft || result || lock.current) return;
  lock.current=true;setLocking(true);
  // The tapped country is saved with the pin, so scores recompute identically on every reload.
  const lookup=await loadCountryLookup();
  const answers=[...progress.answers,{coordinates:draft,hintUsed:progress.hintUsed,...(lookup?{countryCode:countryAt(lookup,draft)}:{})}];
  const latest=resultsFor(answers,questions,scoring).at(-1)!;
  const tier=resultState({distanceKm:latest.distanceKm,score:latest.score,sameCountry:isSameCountry(answers.at(-1)!.countryCode,question.answerCountryCode)}).tier;
  setLocking(false);
  commit(answers,tier);
 }
 // ── Two-stage round ──────────────────────────────────────────────────────────────────────────────────────────────
 const later=(fn:()=>void,ms:number)=>{phaseTimers.current.push(window.setTimeout(fn,ms*k));};
 function finishStaged(point:Coordinates,country:string,countryRight:boolean,joker:boolean,lifeSaver:boolean){
  const answers=[...progress.answers,{coordinates:point,hintUsed:progress.hintUsed,countryCode:country,stage:{country,countryRight,joker,lifeSaver}}];
  const d=calculateDistanceKm(point,question.answerCoordinates);
  lock.current=true;setDraft(null);setDraftCountry(null);setPhase("city_result");
  commit(answers,stageTier(d,countryRight),{pending:null});
  later(()=>setPhase("round_complete"),900);
 }
 function lockCountry(){
  if(!draftCountry||phase!=="country_select")return;
  const {code,point}=draftCountry;
  const joker=Boolean(pending?.joker);
  setPhase("country_locked");
  if(isSameCountry(code,question.answerCountryCode)){
   // COUNTRY FOUND → points → ENTERING LANDING WORLD → city challenge. Saved first, so a reload resumes in the city phase.
   setProgress({...progress,pending:{round:progress.roundIndex,phase:"city_select",country:code,countryPoint:point,joker,lifeSaver:false}});
   sound.play("reveal");setDraft(null);
   setPhase("country_result");
   later(()=>setPhase("city_transition"),650);
   later(()=>{setPhase("city_select");lock.current=false;},1650);
   return;
  }
  if(!progress.jokerUsed&&!joker){
   setProgress({...progress,pending:{round:progress.roundIndex,phase:"country_wrong",country:code,countryPoint:point,joker:false,lifeSaver:false}});
   sound.play("miss");setPhase("country_result");
   return;
  }
  finishStaged(point,code,false,joker,false);
 }
 function applyJoker(){
  if(!pending||progress.jokerUsed)return;
  setProgress({...progress,jokerUsed:true,pending:{...pending,phase:"country_retry",joker:true}});
  setDraftCountry(null);setRescue({kind:"joker",key:Date.now()});setPhase("country_select");
 }
 function acceptWrongCountry(){
  if(!pending)return;
  finishStaged(pending.countryPoint,pending.country,false,pending.joker,false);
 }
 function lockCity(){
  if(!draft||!pending||phase!=="city_select")return;
  const d=calculateDistanceKm(draft,question.answerCoordinates);
  if(d>LIFE_SAVER_KM&&!progress.lifeSaverUsed&&!pending.lifeSaver){
   setProgress({...progress,pending:{...pending,phase:"city_missed",firstCity:draft}});
   sound.play("close");setPhase("city_locked");
   return;
  }
  finishStaged(draft,pending.country,true,pending.joker,pending.lifeSaver);
 }
 function applyLifeSaver(){
  if(!pending?.firstCity||progress.lifeSaverUsed)return;
  setProgress({...progress,lifeSaverUsed:true,pending:{...pending,phase:"city_select",lifeSaver:true}});
  setDraft(null);setRescue({kind:"lifesaver",key:Date.now()});setPhase("city_select");
 }
 function acceptCityMiss(){
  if(!pending?.firstCity)return;
  finishStaged(pending.firstCity,pending.country,true,pending.joker,false);
 }
 async function clueBurst(){
  if(!pending||pending.clue||!question.answerCountryCode)return;
  const cities=await loadCities();
  const clue=pixelClue(question.answerCoordinates,cities?.countries[question.answerCountryCode])??"No extra clue in the map data for this one.";
  setProgress({...progress,pending:{...pending,clue}});
 }
 function next() {
  if (!result) return;
  clearPhaseTimers();
  if (progress.roundIndex===4) {
   cancelWonder();setProgress({...progress,finished:true,pending:null});
   sound.play(summary.totalScore>=3000?"victory":"finish");
   if(!practice)showWonder(session?.finishReveal?.(summary.totalScore)??null,false);
   if(!practice)session?.onFinish?.(summary.totalScore);
   if(!session&&!practice&&isToday)lsSet(STREAK_KEY,recordCompletion(readStreak(lsGet(STREAK_KEY)),day)); // daily streak
   return;
  }
  lock.current=false;setDraft(null);setDraftCountry(null);setZone(null);cancelWonder();setPhase("country_select");
  setProgress({...progress,roundIndex:progress.roundIndex+1,hintUsed:false,pending:null});
 }
 const finishRounds:FinishRound[]=completed.map((item,i)=>{
  const a=progress.answers[i],q=questions[i];
  const st=a.stage?{tier:stageTier(item.distanceKm,a.stage.countryRight),label:stageLabel(item.distanceKm,a.stage.countryRight)}
   :resultState({distanceKm:item.distanceKm,score:item.score,sameCountry:isSameCountry(a.countryCode,q.answerCountryCode)});
  const tone:FinishRound["tone"]=st.tier==="nailed"||st.tier==="city"?"great":st.tier==="region"||st.tier==="country"?"good":st.tier==="close"?"ok":"miss";
  return {id:item.questionId,score:item.score,status:st.label.replace(/!$/,""),tone,starName:item.starName,city:q.answerCity,country:q.answerCountry,km:item.distanceKm,
   biome:landingWorldFor(landingData as LandingWorlds,{coordinates:q.answerCoordinates,countryCode:q.answerCountryCode}).biome,joker:Boolean(a.stage?.joker),lifeSaver:Boolean(a.stage?.lifeSaver),hint:a.hintUsed};
 });
 const overlay=wonder&&<WonderReveal key={wonder.rewardId} reveal={wonder} onClose={()=>setWonder(null)} mascot={mascot}/>;
 if (progress.finished && session) return <main className="finish-panel">
  {overlay}
  <SoundToggle enabled={sound.enabled} onToggle={sound.toggle}/>
  <FinishSummary mascot={mascot} total={summary.totalScore} max={MAX_GAME_SCORE} rounds={finishRounds} eyebrow={"★ STARTAP · "+session.label.toUpperCase()}>
   {session.finishExtra?.(summary.totalScore)}
   <SharePreview edition={edition} day={day} results={completed} practice={false} mode={{label:session.label,path:session.sharePath}} mascot={mascot}/>
  </FinishSummary>
  <div className="share-actions"><button className="primary-button" onClick={session.onPlayAgain}>{session.playAgainLabel??"PLAY ANOTHER FIVE"}</button><Link className="secondary-button" href={session.backHref}>{session.backLabel}</Link></div>
 </main>;
 if (progress.finished) return <main className="finish-panel">
  <SoundToggle enabled={sound.enabled} onToggle={sound.toggle}/>
  {isToday&&<StreakBadge showLongest/>}
  <FinishSummary mascot={mascot} total={summary.totalScore} max={MAX_GAME_SCORE} rounds={finishRounds} eyebrow={"★ STARTAP · "+(isToday?"TODAY'S FIVE":day)+(practice?" · PRACTICE":"")}>
   <SharePreview edition={edition} day={day} results={completed} practice={practice} mascot={mascot}/>
   <div className="result-stats"><p>CLOSEST TAP<strong>{Math.round(summary.closestKm??0).toLocaleString()} KM</strong></p><p>AVERAGE DISTANCE<strong>{Math.round(summary.averageKm??0).toLocaleString()} KM</strong></p></div>
  </FinishSummary>
  <p className="tomorrow-note">Come back for the next daily mix. A new edition begins at midnight UTC.</p>
  <p className="disclaimer">{edition==="global-v4"||edition==="global-v5"?"65 stars · five per day · a thirteen-day starter rotation. Stories repeat after the cycle.":edition==="global-v3"?"50 stars · five per day · a ten-day starter rotation. Stories repeat after the cycle.":"Archive edition · ten stars in rotation."}</p>
  <div className="share-actions"><button className="secondary-button" onClick={()=>{setPractice(true);setRevealedId(null);setProgressRaw(emptyProgress());setDraft(null);lock.current=false;}}>PRACTISE THESE FIVE</button><Link className="secondary-button" href={isToday?"/":"/play"}>{isToday?"HOME":"PLAY TODAY"}</Link></div>
 </main>;
 // Map inputs for the current phase. Two-stage: globe for the country, landing world for the city.
 const inCity=staged&&(phase==="city_transition"||phase==="city_select"||phase==="city_locked"||((phase==="city_result"||phase==="round_complete")&&Boolean(answer?.stage?.countryRight)));
 const stage=staged?(inCity?"city":"country"):undefined;
 const landingCode=pending?.country??answer?.stage?.country??null;
 const mapPlayer=result?.playerCoordinates??(staged?(inCity?draft:draftCountry?.point??(phase==="country_result"&&pending?pending.countryPoint:null)):draft);
 const stepIndex=inCity||result?1:0;
 const lifeSaverClue=pending?.lifeSaver&&pending.firstCity?`Try further ${compassDirection(pending.firstCity,question.answerCoordinates)}.`:null;
 const countryOk=phase==="country_result"&&pending?.phase==="city_select";
 return <main className="game-page" data-phase={result?"result":"aim"} data-round-phase={staged?phase:undefined}>
  {overlay}
  {rescue&&<RescueBurst key={rescue.key} mascot={mascot} kind={rescue.kind}/>}
  <div className="game-top"><Link href={session?.backHref??"/"}>← {session?.backLabel??"HOME"}</Link><span>ROUND {String(progress.roundIndex+1).padStart(2,"0")} / 05</span><SoundToggle enabled={sound.enabled} onToggle={sound.toggle}/></div>
  <div className="running-score" aria-live="polite">SCORE <strong>{summary.totalScore.toLocaleString()} / 5,000</strong><span>{session?session.label.toUpperCase():practice?"PRACTICE":isToday?"TODAY'S FIVE":day}</span></div>
  <div className="progress-rail" aria-label={completed.length+" of 5 answered"}><div style={{width:completed.length*20+"%"}}/></div>
  {storageWarning&&<p className="disclaimer" role="status">Your browser cannot save progress. Keep this page open to finish.</p>}
  {!result && revealedId!==question.id && !(staged&&(pending||phase!=="country_select")) ? <StarWheel key={question.id} questions={questions} round={progress.roundIndex} note={session?`${session.label}: five stars picked for this game. Spinning does not change your score.`:undefined} onSpin={()=>sound.play("theme")} onReveal={()=>{sound.play("reveal");setRevealedId(question.id);}}/> : <div className="game-grid">
   <section className="star-card" aria-labelledby="star-name">
    <div className="star-meta"><span>THE STAR FILE</span><span>{question.category.toUpperCase()}</span></div>
    <StarPortrait key={question.id} name={question.starName} monogram={question.monogram} imageUrl={question.imageUrl}/>
    <p className="question-intro">{INTROS[progress.roundIndex%INTROS.length].replace("{mascot}",buddy.name)}</p>
    <span className="eyebrow">{question.chapter?.toUpperCase() ?? "A STAR. A STORY. A PLACE."}</span>
    <h1 id="star-name">{question.starName}</h1>
    <p className="question-text">{question.question}</p>
    <div className="clue-panel"><span className="eyebrow">YOUR FIRST CLUE</span><p>{question.clue}</p>
     {!result&&(progress.hintUsed?<p className="hint-answer" role="status">{question.hint}<small>Hint used · maximum 800 points this round</small></p>:<button className="hint-button" disabled={locking} onClick={()=>setProgress({...progress,hintUsed:true})}>ANOTHER HINT · −{HINT_COST} PTS</button>)}
    </div>
    {question.imageCredit&&<details className="photo-credit"><summary>Photo credit</summary><p><a href={question.imageCredit.sourceUrl} target="_blank" rel="noreferrer">{question.imageCredit.title}</a> — {question.imageCredit.author}. <a href={question.imageCredit.licenseUrl} target="_blank" rel="noreferrer">{question.imageCredit.license}</a>. {question.imageCredit.changes}</p></details>}
   </section>
   <div className="map-side">
    <div className="map-title"><span><i/> {inCity?"LANDING WORLD · "+BIOME_STYLE[world.biome].title:"YOUR WORLD MAP"}</span><span>{result?"THE REVEAL":staged?(inCity?"FIND THE CITY":"FIND THE COUNTRY"):"HOW CLOSE CAN YOU GET?"}</span></div>
    <div className="map-stage">
     {staged&&<ol className="stage-steps" aria-label="Round steps">
      <li className={stepIndex===0?"on":"done"}><span>1</span> COUNTRY</li>
      <li className={stepIndex===1?"on":""}><span>2</span> CITY{inCity&&<small> · {BIOME_STYLE[world.biome].title}</small>}</li>
     </ol>}
     <GameMap roundId={question.id} playerCoordinates={mapPlayer} answerCoordinates={result?question.answerCoordinates:null} mascotMood={state?sparkMood(state.tier,milestone):null}
      onTap={place} onClear={()=>{if(!lock.current)setDraft(null);}} sparkClass={sparkClass} mascot={mascot}
      stage={stage} selectedCountry={staged?(draftCountry?.code??(pending&&pending.phase!=="country_retry"?pending.country:null)??answer?.stage?.country??null):null}
      onCountry={(code,point)=>{if(phase==="country_select")setDraftCountry({code,point});}}
      zone={zoneActive&&zone?.id===question.id?zone.codes:null}
      landing={inCity&&landingCode?{code:landingCode,biome:world.biome,aurora:world.aurora}:null}
      ghost={inCity&&pending?.lifeSaver?pending.firstCity??null:null}
      frozen={staged&&phase!=="country_select"&&phase!=="city_select"}
      reveal={staged&&result&&state&&answer?.stage?.countryRight?{label:state.label,tone:state.tier==="nailed"||state.tier==="city"?"great":state.tier==="region"||state.tier==="country"?"good":"miss",
       points:state.score,cityPoints:result.cityPoints,countryPoints:result.countryPoints,km:result.distanceKm,place:question.answerCity,country:question.answerCountry,line:`${buddy.name}: “${MOTION[mascot].lines[outcomeOf(state.tier)]}”`}:null}
      companion={inCity&&pending&&!result?(pending.lifeSaver&&pending.firstCity?pending.firstCity:pending.countryPoint):null}
      cue={phase==="country_result"?(pending?.phase==="city_select"?"country-success":"country-miss"):!result&&(pending?.phase==="country_retry"||(pending?.lifeSaver&&!draft))?"retry":null}
      rescue={answer?.stage?(answer.stage.joker&&answer.stage.lifeSaver?"both":answer.stage.joker?"joker":answer.stage.lifeSaver?"lifesaver":null):null}/>
     {staged&&result&&state&&!answer?.stage?.countryRight&&<div className={"world-result tone-"+(state.tier==="nailed"||state.tier==="city"?"great":state.tier==="region"||state.tier==="country"?"good":"miss")} role="status" style={{["--mascot" as string]:buddy.color}}>
      <MascotImage id={mascot} kind="portal" size={64} className="world-result-mascot"/>
      <div><strong>{state.label}</strong>
       {result.countryPoints!==undefined&&answer?.stage?.countryRight?<span className="world-result-points">+{result.cityPoints} CITY PTS</span>:<span className="world-result-points">+{state.score.toLocaleString()} PTS</span>}
       {result.countryPoints!==undefined&&<small>COUNTRY +{result.countryPoints} · TOTAL +{state.score.toLocaleString()}</small>}
       <em className="world-result-line">{buddy.name}: “{MOTION[mascot].lines[outcomeOf(state.tier)]}”</em></div>
     </div>}
     {countryOk&&<div className="stage-banner country-found" role="status"><MascotImage id={mascot} kind="portal" size={68} className="banner-mascot"/><strong>COUNTRY FOUND!</strong><span>+{pending?.joker?JOKER_COUNTRY_POINTS:COUNTRY_POINTS} PTS</span><em>{MOTION[mascot].lines.country}</em></div>}
     {phase==="city_transition"&&<div className={`landing-transition lt-${world.biome}`} role="status" data-mascot={mascot}>
      <span className="lt-cloud lt-cloud-a" aria-hidden="true"/><span className="lt-cloud lt-cloud-b" aria-hidden="true"/>
      <MascotImage id={mascot} kind="portal" size={110} className="lt-mascot"/>
      <small>ENTERING LANDING WORLD</small><strong>{BIOME_STYLE[world.biome].title}</strong>
     </div>}
    </div>
    {staged&&!result?stagedControls():!result||!state?<div className="answer-controls"><p>{draft?`${buddy.name} is placed. Move it as often as you like before locking.`:"Spin the globe, tap a country, then choose a city."}</p>{draft&&<button className="primary-button lock-button" disabled={locking} onClick={()=>void confirm()}>LOCK ANSWER →</button>}</div>:
    <section className={"result-card result-"+state.tier} aria-live="polite" ref={resultCard} data-mascot={mascot} style={{["--mascot" as string]:buddy.color}}>
     <div className="result-hero">
      <p className="result-label">{state.label}</p>
      <p className="spark-line"><MascotImage id={mascot} size={30} className="mascot-mini"/>{buddy.name}: “{staged?MOTION[mascot].lines[outcomeOf(state.tier)]:SPARK_LINES[state.tier]}”</p>
      <p className="result-points">+{state.score.toLocaleString()}<span> PTS</span></p>
      {result.countryPoints!==undefined&&<p className="score-split"><span>COUNTRY <b>+{result.countryPoints}</b></span><span>{answer?.stage?.countryRight?"CITY":"NEAR MISS"} <b>+{result.cityPoints}</b></span>{answer?.hintUsed&&<span>HINT <b>−{HINT_COST}</b></span>}</p>}
      {milestone&&<p className="result-crown"><span aria-hidden="true">♛ </span>{milestone.toLocaleString()} POINTS · CROWN EARNED</p>}
      <h2 className="location-heading"><CountryFlag country={question.answerCountry}/><span>{question.answerCity}, {question.answerCountry}</span></h2>
      <p className="result-km">{Math.round(result.distanceKm).toLocaleString()} km away</p>
      {state.subtitle&&<p className="result-subtitle">{state.subtitle}</p>}
      {stampNote?.id===question.id&&<p className="stamp-note" role="status"><span aria-hidden="true">🛂 </span>{stampNote.text}</p>}
     </div>
     <RevealExtras key={question.id} question={question}/>
     <button className="primary-button result-next" onClick={next}>{progress.roundIndex===4?"SEE MY RESULTS →":"NEXT STAR →"}</button>
    </section>}
    <p className="map-disclaimer">{staged?`Country ${COUNTRY_POINTS} + city up to ${CITY_POINTS} = 1,000 per round. Joker: country ${JOKER_COUNTRY_POINTS}. Life Saver: city up to ${LIFE_SAVER_CITY_POINTS}.`:scoring==="country-v2"?"The right country always scores at least 500. Full points within 10 km before hints.":"Near counts. Full points within 25 km before hints."} Locations use approximate city or parish centres.</p>
   </div>
  </div>}
 </main>;
 // Controls for each two-stage phase.
 function stagedControls(){
  if(phase==="country_select")return <div className="answer-controls stage-controls">
   <p>{pending?.joker?"Joker zone: the country is one of the lit ones.":draftCountry?"Country selected. Tap another to change, or lock it.":"Spin the globe and tap the country."}</p>
   {draftCountry&&<button className="primary-button lock-button" onClick={lockCountry}>LOCK COUNTRY →</button>}
  </div>;
  if(phase==="country_result"&&pending?.phase==="country_wrong")return <div className="answer-controls stage-decision" role="alertdialog" aria-label="Wrong country">
   <p><strong>WRONG COUNTRY</strong>{progress.jokerUsed?"Your Joker is already used this game.":"Use your Joker for one more try inside a smaller zone (country worth "+JOKER_COUNTRY_POINTS+")."}</p>
   <div className="stage-buttons">{!progress.jokerUsed&&<button className="primary-button" onClick={applyJoker}><GameIcon name="joker" size={20}/> USE JOKER</button>}<button className="secondary-button" onClick={acceptWrongCountry}>SEE ANSWER</button></div>
  </div>;
  if(phase==="city_select")return <div className="answer-controls stage-controls">
   <p>{lifeSaverClue??(draft?`${buddy.name} is ready to land. Move it, or lock the city.`:`Tap the city in ${pending?.country?findCountryName(pending.country):"this country"}.`)}{pending?.clue&&<span className="pixel-clue"><GameIcon name="clue" size={14}/> {pending.clue}</span>}</p>
   <div className="stage-buttons">
    {mascot==="pixel"&&!pending?.clue&&<button className="secondary-button clue-burst" onClick={()=>void clueBurst()}>CLUE BURST</button>}
    {draft&&<button className="primary-button lock-button" onClick={lockCity}>LOCK CITY →</button>}
   </div>
  </div>;
  if(phase==="city_locked"&&pending?.phase==="city_missed")return <div className="answer-controls stage-decision" role="alertdialog" aria-label="Missed the city">
   <p><strong>NOT ON THE CITY</strong>{progress.lifeSaverUsed?"Your Life Saver is already used this game.":"Use your Life Saver for one more city tap with a direction clue (city worth up to "+LIFE_SAVER_CITY_POINTS+")."}</p>
   <div className="stage-buttons">{!progress.lifeSaverUsed&&<button className="primary-button" onClick={applyLifeSaver}><GameIcon name="lifesaver" size={20}/> USE LIFE SAVER</button>}<button className="secondary-button" onClick={acceptCityMiss}>SEE RESULT</button></div>
  </div>;
  return <div className="answer-controls stage-controls"><p>{phase==="city_transition"?"Entering the landing world…":phase==="country_result"?"Country found!":"…"}</p></div>;
 }
 function findCountryName(code:string){return code===question.answerCountryCode?question.answerCountry:code;}
}
