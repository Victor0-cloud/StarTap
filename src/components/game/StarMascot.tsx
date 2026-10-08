type Props = { happy: boolean; milestone?: number | null; final?: boolean; showCharacter?: boolean };
/** Original StarTap character: approved artwork animated with lightweight CSS. */
export function StarMascot({happy,milestone=null,final=false,showCharacter=true}:Props){
 const mood=milestone?"crowned":happy?"happy":"sad";
 const title=milestone===5000?"A PERFECT CONSTELLATION!":milestone?milestone.toLocaleString()+" POINTS — CROWN EARNED!":happy?"YOU’RE A STAR!":final?"A LITTLE WISER. READY FOR NEXT TIME?":"OOPS! NEXT STOP, A BETTER GUESS.";
 return <div className={"mascot-reaction mascot-"+mood} data-mood={mood}>
  {showCharacter&&<div className="mascot-stage" aria-hidden="true">
   <span className="mascot-spark spark-one">✦</span><span className="mascot-spark spark-two">✧</span><span className="mascot-spark spark-three">✦</span>
   <span className={"star-mascot mascot-body spark-art"+(milestone?" mascot-crown":"")} data-pose={mood}/>
  </div>}
  <div className="mascot-message"><span className="eyebrow">SPARK · YOUR TRAVEL BUDDY</span><strong>{title}</strong><small>{milestone?"A royal cheer for your journey around the world.":happy?"That pin deserves a little victory dance.":"A missed pin still leads to a new discovery."}</small></div>
 </div>;
}

