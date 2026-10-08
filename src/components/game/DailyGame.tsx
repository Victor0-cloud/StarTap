"use client";
import { useSyncExternalStore } from "react";
import { useSearchParams } from "next/navigation";
import { PlayGame } from "@/components/game/PlayGame";
import { catalog } from "@/lib/content/catalog";
import { dailyQuestions, editionScoring, stickyEdition } from "@/lib/content/build";
import { dateKey, validDate } from "@/lib/game/daily";
import { restoreProgress } from "@/lib/game/progress";

const subscribe=()=>()=>{};
const hasSave=(edition:string,day:string)=>{
 try {return restoreProgress(localStorage.getItem("startap:"+edition+":"+day)).answers.length>0;} catch {return false;}
};
export function DailyGame(){
 const params=useSearchParams();
 const mounted=useSyncExternalStore(subscribe,()=>true,()=>false);
 if(!mounted)return <main className="empty-state">Preparing your five stars…</main>;
 const requestedDay=params.get("day");
 const day=validDate(requestedDay)?requestedDay:dateKey();
 // Frozen editions resolve through the content registry; saved progress keys and shared links are unchanged.
 // A day already started under global-v4 stays there, so its scoring never changes mid-game.
 const edition=stickyEdition(catalog,params.get("edition"),day,hasSave);
 const questions=dailyQuestions(catalog,edition,day);
 return <PlayGame key={edition+day} day={day} edition={edition} scoring={editionScoring(catalog,edition)} questions={questions}/>;
}
