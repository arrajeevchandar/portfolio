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
  return <div className="phone-mindset mindset-orbital" data-still={still} data-scene={active}>
    <div className="phone-mindset-narrative">
      {[
        ["THE PERSON", "Begin with a need.", "Understand what someone is trying to do."],
        ["THE SYSTEM", "Make the pieces work.", "Connect the interface, application logic and data."],
        ["THE WORK", "Put it into practice.", "Four projects. Four different problems to solve."]
      ].map(([label,title,text],i)=><article className="phone-mindset-beat" key={label} aria-hidden={!still&&active!==i}><span className="phone-eyebrow">0{i+1} / {label}</span><h2>{title}</h2><p>{text}</p></article>)}
    </div>
    <div className="orbital-stage" aria-hidden="true">
      <svg className="orbital-sculpture" viewBox="0 0 360 360">
        <defs>
          <linearGradient id="mindset-metal" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#4c5750"/><stop offset=".22" stopColor="#e9eddf"/><stop offset=".32" stopColor="#7c8c79"/><stop offset=".53" stopColor="#252f29"/><stop offset=".74" stopColor="#bec9ae"/><stop offset=".85" stopColor="#eff2e4"/><stop offset="1" stopColor="#5b6b56"/></linearGradient>
          <radialGradient id="mindset-halo"><stop stopColor="#c8e6a2" stopOpacity=".13"/><stop offset="1" stopColor="#c8e6a2" stopOpacity="0"/></radialGradient>
        </defs>
        <circle cx="180" cy="180" r="165" fill="url(#mindset-halo)"/>
        <g fill="none" stroke="url(#mindset-metal)" strokeWidth="9">
          <ellipse className="orbital-band band-one" transform="rotate(-55 180 180)" cx="180" cy="180" rx="137" ry="65"/>
          <ellipse className="orbital-band band-two" transform="rotate(55 180 180)" cx="180" cy="180" rx="137" ry="65"/>
          <ellipse className="orbital-band band-three" cx="180" cy="180" rx="137" ry="65"/>
        </g>
        <circle className="orbital-guide" cx="180" cy="180" r="158" fill="none" stroke="#b8d68e" strokeOpacity=".3" strokeWidth=".7" strokeDasharray="100 32 3 32"/>
        <circle className="orbital-core" cx="180" cy="180" r="6" fill="#d3ff40"/>
      </svg>
      <div className="orbital-caption"><span>{['A SINGLE STARTING POINT','ONE CONNECTED SYSTEM','IDEAS, MADE TANGIBLE'][active]}</span><b>0{active+1}</b></div>
    </div>
    <div className="orbital-evidence">
      <div className="orbital-note" aria-hidden={active!==0}><span>01 / OBSERVE</span><p>Less friction.<br/><strong>A clearer experience.</strong></p></div>
      <div className="orbital-note" aria-hidden={active!==1}><span>02 / CONNECT</span><div className="orbital-stack"><span>Interface</span><i/><span>Logic</span><i/><span>Data</span></div></div>
      <div className="orbital-projects" aria-hidden={active!==2} inert={!still&&active!==2}>
       {[["solenne","Solenne","Reflection"],["cortexedu","CortexEdu","Learning"],["dochain","DoChain","Documents"],["ai-fitness","AI Fitness","Personalization"]].map(([id,name,label],i)=><a href={`#${id}`} key={id}><span>0{i+1}</span><strong>{name}</strong><small>{label}</small></a>)}
      </div>
    </div>
  </div>;
}

const milestones = [
  { year:"2022", title:"Beginning the BCA.", fact:"BCA", unit:"JAIN UNIVERSITY / 2022", text:"Started the Bachelor of Computer Applications program.", icon:GraduationCap },
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
