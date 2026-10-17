"use client";
import Link from "next/link";
import { useState, useSyncExternalStore, type ReactNode } from "react";
import { PlayGame } from "@/components/game/PlayGame";
import { catalog } from "@/lib/content/catalog";
import { toPlayable } from "@/lib/content/build";
import { dateKey } from "@/lib/game/daily";
import { finishWonder, type WonderReveal } from "@/lib/game/wonder";
import { modeKey, modeLabel, modePath, selectQuestions, sessionStorageKey, type ModeSpec } from "@/lib/game/modes";
import { isFreeWorld } from "@/lib/premium/access";
import { browserQuota, canStartPlayFive, recordPlayFive } from "@/lib/premium/quota";
import { usePremium, type PremiumAccess } from "@/lib/premium/usePremium";
import { PremiumLock } from "@/components/premium/PremiumLock";

const subscribe=()=>()=>{};
const quotaDecisions=new Map<number,"play"|"block">();
let quotaSerial=0;
const RECENT_LIMIT=15;
const read=(key:string)=>{try{return JSON.parse(localStorage.getItem(key)??"null");}catch{return null;}};
const write=(key:string,value:unknown)=>{try{localStorage.setItem(key,JSON.stringify(value));}catch{/* in-memory session still works */}};
const remove=(key:string)=>{try{localStorage.removeItem(key);}catch{/* ignore */}};
const seed=()=>globalThis.crypto?.randomUUID?.()??String(Math.random());

// A saved session is reused only if all five questions still exist and are active.
function restoreIds(key:string):string[]|null{
 const saved=read(key);
 const ids=saved?.version===1&&Array.isArray(saved.ids)?saved.ids as unknown[]:null;
 return ids&&ids.length===5&&ids.every(id=>typeof id==="string"&&catalog.questions.get(id)?.active)?ids as string[]:null;
}
function startSession(spec:ModeSpec,key:string,extraExclude:readonly string[]=[]):string[]|null{
 const recentKey=`startap:recent:${modeKey(spec)}`;
 const recent:string[]=Array.isArray(read(recentKey))?read(recentKey):[];
 const exclude=new Set([...recent,...extraExclude]);
 const ids=selectQuestions(catalog.raw,spec,{seed:seed(),exclude});
 if(ids){write(key,{version:1,ids});write(recentKey,[...ids,...recent.filter(id=>!ids.includes(id))].slice(0,RECENT_LIMIT));}
 return ids;
}

// fixedIds: a hand-picked five (Adventure levels) instead of a random selection; label/finish hooks customise the end screen.
// fresh: always deal a new five from Round 1 (a Music genre tap, right after its intro), whatever was saved before.
type Props={spec:ModeSpec;backHref:string;backLabel:string;fresh?:boolean;fixedIds?:readonly string[];label?:string;onFinish?:(total:number)=>void;finishExtra?:(total:number)=>ReactNode;playAgainLabel?:string;finishReveal?:(total:number)=>WonderReveal|null;onBeforePlayAgain?:()=>boolean};
export function ModeGame(props:Props){
 const mounted=useSyncExternalStore(subscribe,()=>true,()=>false);
 const access=usePremium();
 if(!mounted)return <main className="empty-state">Preparing your five stars…</main>;
 // Flag off (and the Android build) keep the original session, with no quota and no lock.
 if(!access.paymentsOn)return <ModeSession {...props}/>;
 return <GatedMode access={access} {...props}/>;
}
function GatedMode({access,...props}:Props&{access:PremiumAccess}){
 const category=props.spec.mode==="category"||props.spec.mode==="subcategory"?props.spec.category:null;
 const blockedWorld=Boolean(category&&!isFreeWorld(category)&&!access.isPremium);
 const blockedAdventure=props.spec.mode==="adventure"&&!access.isPremium;
 const limited=!blockedWorld&&!blockedAdventure&&!access.isPremium&&props.spec.mode!=="adventure";
 const [mountId]=useState(()=>++quotaSerial);
 const [again,setAgain]=useState(false);
 // Remember the decision for this mount so a second render does not spend another free round.
 let quota:"pending"|"play"|"block"=quotaDecisions.get(mountId)??"pending";
 if(!access.loading&&limited&&quota==="pending"){
  const restored=!props.fresh&&restoreIds(sessionStorageKey(props.spec));
  if(restored||canStartPlayFive(browserQuota)){
   if(!restored)recordPlayFive(browserQuota);
   quota="play";
  }else quota="block";
  quotaDecisions.set(mountId,quota);
 }
 if(access.loading)return <main className="empty-state">Checking access…</main>;
 if(blockedWorld)return <PremiumLock kind="world"/>;
 if(blockedAdventure)return <PremiumLock kind="adventure"/>;
 if(limited&&(quota==="block"||again))return <PremiumLock kind="play-five"/>;
 return <ModeSession {...props} onBeforePlayAgain={limited?()=>{
  if(!canStartPlayFive(browserQuota)){setAgain(true);return false;}
  recordPlayFive(browserQuota);
  return true;
 }:undefined}/>;
}
function ModeSession({spec,backHref,backLabel,fresh,fixedIds,label:customLabel,onFinish,finishExtra,playAgainLabel,finishReveal,onBeforePlayAgain}:Props){
 const key=sessionStorageKey(spec);
 const [ids,setIds]=useState<string[]|null>(()=>{
  if(fixedIds){
   const valid=fixedIds.length===5&&fixedIds.every(id=>catalog.questions.get(id)?.active);
   const saved=restoreIds(key);
   if(fresh||!saved||saved.join()!==fixedIds.join())remove(key+":progress");
   if(valid)write(key,{version:1,ids:[...fixedIds]});
   return valid?[...fixedIds]:null;
  }
  const restored=restoreIds(key);
  if(restored&&!fresh)return restored;
  remove(key+":progress"); // progress always belongs to the saved five; never carry it into a new set
  return startSession(spec,key,restored??[]);
 });
 const [round,setRound]=useState(0);
 const label=customLabel??modeLabel(catalog.raw,spec);
 if(!ids) return <main className="empty-state"><p>Not enough stars here yet for a full five.</p><Link href={backHref}>← {backLabel}</Link></main>;
 function playAgain(){
  if(onBeforePlayAgain&&!onBeforePlayAgain())return;
  remove(key+":progress");
  if(!fixedIds)setIds(startSession(spec,key,ids??[]));
  setRound(r=>r+1);
 }
 return <PlayGame key={ids.join()+round} day={dateKey()} edition={"mode:"+modeKey(spec)} scoring="country-v2"
  questions={ids.map(id=>toPlayable(catalog,id))}
  session={{storageKey:key+":progress",label,backHref,backLabel,sharePath:modePath(spec),onPlayAgain:playAgain,onFinish,finishExtra,playAgainLabel,
   // World Mix shows the country scene; category play shows its own world.
   finishReveal:finishReveal??(total=>finishWonder({total,label,category:"category" in spec?spec.category:"geography",gameKey:key+":"+ids.join()+":"+round}))}}/>;
}
