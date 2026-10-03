"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Check, Layers, Mic, GraduationCap, Trophy, Briefcase } from "lucide-react";

// Phone scenes are separate compositions, not scaled desktop screenshots.
const shortPhoneQuery = "(max-width:600px) and (max-height:499px)";
const subscribeShortPhone = (notify: () => void) => {
  const query = matchMedia(shortPhoneQuery);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const getShortPhone = () => matchMedia(shortPhoneQuery).matches;
const getServerShortPhone = () => false;

export function PhoneMindset({ active, still }: { active: number; still: boolean }) {
  still = useSyncExternalStore(subscribeShortPhone, getShortPhone, getServerShortPhone) || still;
  const [signal, setSignal] = useState(false);
  const [connected, setConnected] = useState(false);
  return <div className="phone-mindset" data-still={still} data-scene={active}>
    <div className="phone-mindset-narrative">
      {[
        ["START WITH PEOPLE", "Understand the person.", "A real human need. A thoughtful response."],
        ["CONNECT THE PIECES", "Think in systems.", "Interface, logic, and data. One connected experience."],
        ["MAKE IT REAL", "Let the work speak.", "Four ideas. Built with intention."]
      ].map(([label, title, text], i) => <article className="phone-mindset-beat" key={title} aria-hidden={!still && active !== i}><span className="phone-eyebrow">0{i + 1} / {label}</span><h2>{title}</h2><p>{text}</p></article>)}
    </div>
    <div className="phone-mindset-gallery">
      <div className="phone-stage-frame" aria-hidden="true"><i/><i/><i/><i/><span>FROM INTENT TO EXPERIENCE</span></div>
      <div className="phone-mindset-visual phone-reflection" aria-hidden={!still && active !== 0} inert={!still && active !== 0}>
        <div className="phone-scene-label"><strong>solenne <span>✳</span></strong><span>01 / REFLECT</span></div>
        <div className="phone-reflection-orbit" data-signal={signal}><i/><i/><i/><button aria-label="Explore the reflection signal" aria-pressed={signal} onClick={() => setSignal(!signal)}>{signal ? <Check size={27}/> : <Mic size={27}/>}</button></div>
        <div className="phone-signal-bars" aria-hidden="true">{Array.from({length:35}, (_,i)=><i key={i} style={{height:`${10 + Math.abs(Math.sin(i*1.8)*Math.cos(i*.3))*35}px`}}/>)}</div>
        <p>{signal ? "A moment, understood." : "Your story starts here."}</p><span className="phone-tap-hint">{signal ? "TAP TO RESET" : "TAP TO EXPLORE"}</span>
      </div>
      <div className="phone-mindset-visual phone-system" aria-hidden={!still && active !== 1} inert={!still && active !== 1} data-connected={connected}>
        <div className="phone-scene-label"><strong>CortexEdu</strong><span>02 / CONNECT</span></div>
        <div className="phone-system-layers" aria-hidden="true">
          <div className="phone-system-layer layer-data"><span>03 / DATA</span><div className="phone-data-bars"><i/><i/><i/><i/><i/><i/><i/></div><small>A single source of truth</small></div>
          <div className="phone-system-layer layer-logic"><span>02 / LOGIC</span><div className="phone-logic-route"><i>Check in</i><b>→</b><i>Validate</i><b>→</b><i>Sync</i></div></div>
          <div className="phone-system-layer layer-interface"><span>01 / INTERFACE</span><strong>A good day<br/>to learn something.</strong><div><span>Today's classroom</span><Check size={15}/></div></div>
        </div>
        <button className="phone-scene-action" onClick={() => setConnected(!connected)} aria-pressed={connected}><Layers size={18}/>{connected ? "The pieces work together" : "Connect the system"}<ArrowUpRight size={16}/></button>
        <p>{connected ? "Less repetition. More room to learn." : "A classroom. One connected flow."}</p>
      </div>
      <div className="phone-mindset-visual phone-work-stack" aria-hidden={!still && active !== 2} inert={!still && active !== 2}>
        <span className="phone-eyebrow">IDEAS, IN PRACTICE</span><h3>Made to<br/><em>make a difference.</em></h3>
        {[["solenne","Solenne","Reflection"],["cortexedu","CortexEdu","Learning"],["dochain","DoChain","Trust"],["ai-fitness","AI Fitness","Personalization"]].map(([id,name,label],i)=><a href={`#${id}`} key={id}><span>0{i+1}</span><strong>{name}</strong><small>{label}</small><ArrowUpRight size={17}/></a>)}
      </div>
    </div>
  </div>;
}

const milestones = [
  { year:"2022", title:"A strong beginning.", fact:"Top 30", unit:"KARNATAKA STATE RANK", text:"II PUC board examination.", icon:GraduationCap },
  { year:"2025", title:"Foundations, deeper.", fact:"9.23", unit:"BCA / CGPA OUT OF 10", text:"Jain University. A foundation in computing.", icon:GraduationCap },
  { year:"2025", title:"The next chapter.", fact:"MCA", unit:"CHRIST UNIVERSITY / 2025–27", text:"Continuing to learn. Continuing to build.", icon:GraduationCap },
  { year:"2026", title:"A moment of recognition.", fact:"Winner", unit:"SHELLS’26 / NATIONAL TECH FEST", text:"Overall winner at Kristu Jayanti University.", icon:Trophy },
  { year:"2026", title:"Engineering in practice.", fact:"Adobe", unit:"TECHNICAL CONSULTANT INTERN", text:"Edge Delivery Services. A responsive commerce capstone.", icon:Briefcase },
];

export function PhoneJourney({ still }: { still: boolean }) {
  still = useSyncExternalStore(subscribeShortPhone, getShortPhone, getServerShortPhone) || still;
  const host = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    if (!host.current || still) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add("(max-width:600px) and (min-height:500px)", () => {
      const el=host.current!;
      const cards=el.querySelectorAll(".phone-milestone");
      const timeline=gsap.timeline({scrollTrigger:{trigger:el.parentElement, start:"top top",end:"bottom bottom",scrub:.28,invalidateOnRefresh:true},onUpdate:()=>setActive(Math.min(4,Math.floor(timeline.progress()*5)))});
      cards.forEach((card,i)=>{
        if(i) timeline.fromTo(card,{y:80,z:-200,rotateX:12,opacity:0},{y:0,z:0,rotateX:0,opacity:1,duration:.055,ease:"power2.out"},i/5);
        if(i<4) timeline.to(card,{y:-55,z:100,rotateX:-7,opacity:0,duration:.045,ease:"power2.in"},(i+1)/5-.045);
      });
      timeline.to(el.querySelector(".phone-milestone-orbit"),{rotate:210,duration:1,ease:"none"},0);
      timeline.to(el.querySelector(".phone-journey-progress"),{scaleX:1,duration:1,ease:"none"},0);
      return ()=>timeline.kill();
    });
    return ()=>media.revert();
  },[still]);
  const jump=(index:number)=>{
    const el=host.current?.parentElement;
    if(!el) return;
    if(still || innerHeight<500){host.current?.querySelectorAll<HTMLElement>(".phone-milestone")[index]?.scrollIntoView({behavior:"smooth",block:"center"});return;}
    window.scrollTo({top:el.getBoundingClientRect().top+scrollY+(el.offsetHeight-innerHeight)*(index+.35)/5,behavior:"smooth"});
  };
  return <div ref={host} className="phone-journey" data-still={still}>
    <header><span className="phone-eyebrow">03 / THE JOURNEY</span><h2>Keep learning.<br/><em>Keep building.</em></h2></header>
    <div className="phone-milestones">
      <svg className="phone-milestone-orbit" viewBox="0 0 300 300" aria-hidden="true"><circle cx="150" cy="150" r="125"/><path d="M150 25 A125 125 0 0 1 275 150"/><circle cx="150" cy="25" r="5"/><circle cx="275" cy="150" r="5"/></svg>
      {milestones.map((item,i)=>{const Icon=item.icon;return <article className="phone-milestone" key={i} aria-hidden={!still && active!==i}><div className="phone-milestone-year"><span>{item.year}</span><span>0{i+1} / 05</span></div><div className="phone-milestone-fact"><Icon size={26}/><strong>{item.fact}</strong><span>{item.unit}</span></div><h3>{item.title}</h3><p>{item.text}</p></article>;})}
    </div>
    <nav className="phone-year-controls" aria-label="Experience milestones">{milestones.map((item,i)=><button key={i} onClick={()=>jump(i)} aria-current={active===i?"step":undefined} aria-label={`${item.year}: ${item.fact}`}><span>0{i+1}</span><small>{item.year}</small></button>)}</nav>
    <div className="phone-journey-track"><span className="phone-journey-progress"/></div>
  </div>;
}
