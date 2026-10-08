"use client";
import { useId, useState } from "react";
import type { Question } from "@/types/game";
import { portalLinks } from "@/lib/game/media";
import { StarPortal } from "./StarPortal";

type Panel = "story" | "trivia" | "discover";

/** Optional reveal content, collapsed by default so the result stays the focus. One panel opens at a time. */
export function RevealExtras({ question }: { question: Question }) {
 const [open, setOpen] = useState<Panel | null>(null);
 const id = useId();
 const panels: { key: Panel; label: string }[] = [
  { key: "story", label: "Story" },
  ...(question.triviaCard ? [{ key: "trivia" as const, label: "Trivia" }] : []),
  ...(portalLinks(question.media).length ? [{ key: "discover" as const, label: "Discover" }] : []),
 ];
 return <div className="reveal-extras">
  <div className="reveal-tabs">
   {panels.map(p => <button key={p.key} type="button" className="reveal-tab" aria-expanded={open === p.key} aria-controls={open === p.key ? id + p.key : undefined}
    onClick={() => setOpen(open === p.key ? null : p.key)}>{p.label}<span aria-hidden="true">{open === p.key ? "−" : "+"}</span></button>)}
  </div>
  {open === "story" && <div className="reveal-panel" id={id + "story"} role="region" aria-label="Story">
   {question.storyTitle && <h3>{question.storyTitle}</h3>}
   <p>{question.story}</p>
   <p className="reveal-sources">
    <a href={question.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a>
    {question.extraSource && <a href={question.extraSource} target="_blank" rel="noreferrer">More about this story ↗</a>}
   </p>
  </div>}
  {open === "trivia" && question.triviaCard && <div className="reveal-panel trivia-card" id={id + "trivia"} role="region" aria-label="Trivia">
   <p className="trivia-title"><span aria-hidden="true">✦ </span>{question.triviaCard.title.toUpperCase()}</p>
   <p>{question.triviaCard.text}</p>
   <p className="reveal-sources"><a href={question.triviaCard.sourceUrl} target="_blank" rel="noreferrer">Source: {question.triviaCard.sourceName} ↗</a></p>
  </div>}
  {open === "discover" && <div className="reveal-panel" id={id + "discover"} role="region" aria-label="Discover"><StarPortal media={question.media} starName={question.starName} /></div>}
 </div>;
}
