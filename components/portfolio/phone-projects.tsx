"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, Check, FileText, Fingerprint, Layers, Mic, Sparkles } from "lucide-react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import gsap from "gsap";

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
  const host=useRef<HTMLButtonElement>(null);
  useEffect(()=>{
    const media=gsap.matchMedia();
    media.add("(max-width:600px) and (prefers-reduced-motion:no-preference)",()=>{
      const el=host.current!;
      if(el.closest('.motion-paused')) return;
      gsap.registerPlugin(ScrollTrigger);
      const motion=gsap.fromTo(el.querySelector('.phone-project-art'),{y:12,scale:.98},{y:-12,scale:1.02,ease:'none',scrollTrigger:{trigger:el.closest('.project-story'),start:'top top',end:'bottom bottom',scrub:.25,invalidateOnRefresh:true}});
      return()=>{motion.scrollTrigger?.kill();motion.kill();};
    });
    return()=>media.revert();
  },[]);
  return <button ref={host} className={`phone-project-scene phone-project-${index}`} data-phase={step} onClick={onOpen} aria-label={`Open interactive ${["Solenne","CortexEdu","DoChain","AI Fitness"][index]} demo`}>
    <span className="phone-project-scene-top"><span>0{step+1} / PRODUCT WALKTHROUGH</span><ArrowUpRight size={18}/></span>
    <span className="phone-project-art" aria-hidden="true">
      {index===0 && <><span className="journal-lens"><i/><i/><i/><span><Mic size={32}/></span></span><span className="journal-signals">{["VOICE","SPEECH","VISUAL"].map((v,i)=><span key={v} style={{"--order":i} as CSSProperties}>{v}<i/></span>)}</span><span className="journal-result"><Sparkles size={19}/><strong>Journal summary</strong><small>Transcript and reflection cards.</small></span></>}
      {index===1 && <><span className="classroom-sheet"><span className="visual-sheet-label">CORTEX / CLASSROOM</span><strong>Software<br/>Engineering</strong><span className="classroom-people">{["R","A","S","+"].map(v=><i key={v}>{v}</i>)}</span><span className="classroom-chart">{[35,62,45,85,70,95].map((h,i)=><i key={i} style={{"--bar":`${h}%`} as CSSProperties}/>)}</span><span className="classroom-reward"><Sparkles size={24}/><strong>Participation<br/>tokens</strong></span></span><span className="classroom-status"><Check size={14}/>{["Class check-in","Assessment overview","Token reward system"][step]}</span></>}
      {index===2 && <><span className="document-halo"/><span className="chain-document"><span className="visual-sheet-label">DOC / 001</span><FileText size={35}/><strong>document.pdf</strong><span className="document-lines"><i/><i/><i/></span><span className="document-seal"><Check size={24}/></span></span><span className="chain-stations"><span><Fingerprint size={19}/>Identity</span><span><Layers size={19}/>Storage</span><span><Check size={19}/>Proof</span></span></>}
      {index===3 && <><span className="fitness-dial"><i/><span><strong>{["GOAL","PLAN","VIEW"][step]}</strong><small>{["USER PREFERENCES","GENERATED ROUTINE","SESSION OVERVIEW"][step]}</small></span></span><span className="fitness-routes">{["Movement","Strength","Recovery"].map((v,i)=><span key={v}><i>0{i+1}</i>{v}<Check size={14}/></span>)}</span></>}
    </span>
    <span className="phone-project-scene-bottom"><strong>{captions[index][step]}</strong><span>EXPLORE THE DEMO <ArrowUpRight size={12}/></span></span>
  </button>;
}

export function PhoneScrollRail() {
  const rail = useRef<HTMLDivElement>(null);
  const [progress,setProgress]=useState(0);
  useEffect(()=>{
    const media=matchMedia("(max-width:600px)");
    let frame=0;
    let resizeTimer: ReturnType<typeof setTimeout>;
    let width=innerWidth;
    const update=()=>{frame=0;if(media.matches)setProgress(Math.round(100*scrollY/Math.max(1,document.documentElement.scrollHeight-innerHeight)));};
    const schedule=()=>{if(!frame)frame=requestAnimationFrame(update);};
    const resize=()=>{
      schedule();
      if(media.matches && width!==innerWidth){clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>ScrollTrigger.refresh(),180);}
      width=innerWidth;
    };
    addEventListener("scroll",schedule,{passive:true});addEventListener("resize",resize);update();
    return()=>{clearTimeout(resizeTimer);cancelAnimationFrame(frame);removeEventListener("scroll",schedule);removeEventListener("resize",resize);};
  },[]);
  const move=(y:number)=>{const r=rail.current!.getBoundingClientRect();window.scrollTo({top:Math.max(0,Math.min(1,(y-r.top)/r.height))*(document.documentElement.scrollHeight-innerHeight),behavior:"instant"});};
  return <div ref={rail} className="phone-scroll-rail" role="slider" tabIndex={0} aria-label="Page scroll position" aria-orientation="vertical" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} style={{"--read":`${progress}%`} as CSSProperties}
    onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);move(e.clientY);}}
    onPointerMove={e=>{if(e.currentTarget.hasPointerCapture(e.pointerId))move(e.clientY);}}
    onKeyDown={e=>{if(["ArrowDown","ArrowUp","Home","End","PageDown","PageUp"].includes(e.key)){e.preventDefault();const max=document.documentElement.scrollHeight-innerHeight;const y=e.key==="Home"?0:e.key==="End"?max:scrollY+(e.key==="ArrowUp"||e.key==="PageUp"?-1:1)*innerHeight*.55;window.scrollTo({top:y,behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth'});}}}>
    <span className="phone-rail-track"><i/><b/></span><span className="phone-rail-label">SCROLL</span>
  </div>;
}
