"use client";

import { useRef, type CSSProperties } from "react";
import { ArrowUpRight, Check, FileText, Fingerprint, Layers, Sparkles } from "lucide-react";
import { scrollStoryTo, stopStoryScroll } from "./story-scroll";
import { StoryLabel } from "./story-label";

export const phoneProjectTitles = [
  ["Video journaling", "Multimodal analysis", "Reflection dashboard"],
  ["Classes & attendance", "Assessment tracking", "Participation rewards"],
  ["Wallet authentication", "Distributed file storage", "Transaction records"],
  ["Goals & preferences", "Routine generation", "Workout plan"],
];

const captions = [
  ["Video input", "Speech · voice · visual signals", "Transcript & reflection cards"],
  ["QR check-in", "Internal assessment", "Student token rewards"],
  ["MetaMask identity", "IPFS / Pinata storage", "Polygon testnet record"],
  ["User preferences", "Gemini-generated routine", "Sessions & recovery"],
];

/** Compact visual narratives; full product demos remain available in the dialog. */
export function PhoneProjectVisual({ index, step, onOpen }: { index:number; step:number; onOpen:()=>void }) {
  return <button className={`phone-project-scene phone-project-${index}`} data-phase={step} onClick={onOpen} aria-label={`Open interactive ${["Solenne","CortexEdu","DoChain","AI Fitness"][index]} demo`}>
    <span className="phone-project-scene-top"><StoryLabel values={["01 / PRODUCT WALKTHROUGH", "02 / PRODUCT WALKTHROUGH", "03 / PRODUCT WALKTHROUGH"]} step={step}/><ArrowUpRight size={18}/></span>
    <span className="phone-project-art" aria-hidden="true">
      {index===0 && <JournalSequence step={step}/>}
      {index===1 && <><span className="classroom-sheet"><span className="visual-sheet-label">CORTEX / CLASSROOM</span><strong>Software<br/>Engineering</strong><span className="classroom-people">{["R","A","S","+"].map(v=><i key={v}>{v}</i>)}</span><span className="classroom-chart">{[35,62,45,85,70,95].map((h,i)=><i key={i} style={{"--bar":`${h}%`} as CSSProperties}/>)}</span><span className="classroom-reward"><Sparkles size={24}/><strong>Participation<br/>tokens</strong></span></span><span className="classroom-status"><Check size={14}/><StoryLabel values={["Class check-in", "Assessment overview", "Token reward system"]} step={step}/></span></>}
      {index===2 && <><span className="document-halo"/><span className="chain-document"><span className="visual-sheet-label">DOC / 001</span><FileText size={35}/><strong>document.pdf</strong><span className="document-lines"><i/><i/><i/></span><span className="document-seal"><Check size={24}/></span></span><span className="chain-stations"><span><Fingerprint size={19}/>Identity</span><span><Layers size={19}/>Storage</span><span><Check size={19}/>Proof</span></span></>}
      {index===3 && <><span className="fitness-dial"><i/><span><strong><StoryLabel values={["GOAL", "PLAN", "VIEW"]} step={step}/></strong><small><StoryLabel values={["USER PREFERENCES", "GENERATED ROUTINE", "SESSION OVERVIEW"]} step={step}/></small></span></span><span className="fitness-routes">{["Movement","Strength","Recovery"].map((v,i)=><span key={v}><i>0{i+1}</i>{v}<Check size={14}/></span>)}</span></>}
    </span>
    <span className="phone-project-scene-bottom">
      <strong className="phone-project-caption">
        {captions[index].map((caption, beat) => <span key={caption} data-active={step === beat} data-story-slot={beat} aria-hidden={step !== beat}>{caption}</span>)}
      </strong>
      <span>EXPLORE THE DEMO <ArrowUpRight size={12}/></span>
    </span>
  </button>;
}

export function PhoneScrollRail({ still }: { still: boolean }) {
  const drag = useRef({ top: 0, height: 1, max: 0 });
  const scrollLimit = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  const move = (y: number) => {
    const { top, height, max } = drag.current;
    const fraction = Math.max(0, Math.min(1, (y - top) / height));
    window.scrollTo({ top: fraction * max, behavior: "instant" });
  };

  return <div className="phone-scroll-rail" role="slider" tabIndex={0} aria-label="Page scroll position" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={100} aria-valuenow={0}
    onPointerDown={event => {
      if (!event.isPrimary || event.button !== 0) return;
      stopStoryScroll();
      const track = event.currentTarget.querySelector(".phone-rail-track")!.getBoundingClientRect();
      const thumb = event.currentTarget.querySelector(".phone-rail-track > b")!.getBoundingClientRect();
      const y = event.clientY;
      const grabbedThumb = y >= thumb.top && y <= thumb.bottom;
      const grabOffset = grabbedThumb ? y - thumb.top - thumb.height / 2 : 0;
      drag.current = {
        top: track.top + thumb.height / 2 + grabOffset,
        height: Math.max(1, track.height - thumb.height),
        max: scrollLimit(),
      };
      event.currentTarget.setPointerCapture(event.pointerId);
      if (!grabbedThumb) move(y);
    }}
    onPointerMove={event => {
      if (event.currentTarget.hasPointerCapture(event.pointerId)) move(event.clientY);
    }}
    onKeyDown={event => {
      const destinations: Record<string, number> = {
        Home: 0, End: scrollLimit(),
        ArrowDown: scrollY + innerHeight * .16, ArrowUp: scrollY - innerHeight * .16,
        PageDown: scrollY + innerHeight * .8, PageUp: scrollY - innerHeight * .8,
      };
      const top = destinations[event.key];
      if (typeof top !== "number") return;
      event.preventDefault();
      scrollStoryTo(top, still);
    }}>
    <span className="phone-rail-track"><i/><b/></span><span className="phone-rail-label">SCROLL</span>
  </div>;
}

export function JournalSequence({step}:{step:number}) {
 return <span className="journal-sequence" data-step={step}>
  <span className="journal-sequence-header"><span>solenne</span><small>PRIVATE JOURNAL</small></span>
  <span className="journal-sequence-stage">
   <span className="journal-panel journal-capture" data-story-slot={0}><small>01 / CAPTURE</small><strong>A moment<br/>to reflect.</strong><span className="journal-timeline">{Array.from({length:32},(_,i)=><i key={i} style={{height:`${Math.round(12+Math.abs(Math.sin(i*1.9)*Math.cos(i*.3))*70)}%`}}/>)}</span><span className="journal-record"><i/> Video journal</span></span>
   <span className="journal-panel journal-analysis" data-story-slot={1}><small>02 / UNDERSTAND</small><strong>Three signals.<br/>One entry.</strong><span className="journal-channels">{['Speech / transcript','Voice / tone','Visual / expression'].map((v,i)=><span key={v}><b>0{i+1}</b>{v}<i/></span>)}</span></span>
   <span className="journal-panel journal-reflect" data-story-slot={2}><small>03 / REFLECT</small><strong>Return to<br/>your thoughts.</strong><span className="journal-note"><span>TRANSCRIPT</span><i/><i/><i/></span><span className="journal-tags"><span>Reflection cards</span><span>Journal history</span></span></span>
  </span>
  <span className="journal-sequence-footer">{[0,1,2].map(i=><i key={i} className={i<=step?'filled':''}/>)}<small><StoryLabel values={["01 / 03", "02 / 03", "03 / 03"]} step={step}/></small></span>
 </span>;
}
