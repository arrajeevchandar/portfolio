"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { addBeatCrossfade } from "./beat-crossfade";
import { scrollStoryTo } from "./story-scroll";
import { ArrowDown } from "lucide-react";
import { SolenneDemo, CortexDemo } from "./demos";
import type { SceneState } from "./world";
import { PhoneMindset } from "./phone-scenes";

const beats = [
  { word: "Understand the person.", lead: "THE STARTING POINT", label: "Understand", text: "Good software begins with a human need. A quiet space to reflect. A simpler way to check in. A document someone can trust.", note: "Solenne explores the first of those ideas through private video journaling." },
  { word: "Consider the whole journey.", lead: "THE ENGINEERING", label: "Connect", text: "I work across the interface, application logic, and data. The aim is to make each part feel like it belongs to the same experience.", note: "CortexEdu brings classes, attendance, and assessment into one connected flow." },
  { word: "Let the work speak.", lead: "THE RESULT", label: "Build", text: "Four projects. Different constraints. The same attention to how the pieces fit together.", note: "Explore the experience, then look closer at the decisions behind it." },
];

const phoneQuery = "(max-width:600px)";
const stagedQuery = "(min-width:901px), (min-height:600px), (max-width:600px) and (min-height:500px)";
const stackedQuery = "(min-width:601px) and (max-width:900px) and (max-height:599px), (max-width:600px) and (max-height:499px)";

function getArrivalDistance(element: HTMLElement) {
  // The chapter overlaps the introduction by one stable viewport (100svh).
  return Math.max(1, -parseFloat(getComputedStyle(element).marginTop));
}

export default function Mindset({ staticMotion, scene }: { staticMotion: boolean; scene: RefObject<SceneState> }) {
  const host = useRef<HTMLElement>(null);
  const activeBeat = useRef(0);
  const [active, setActive] = useState(0);
  const setBeat = useCallback((index: number) => {
    if (index === activeBeat.current) return;
    activeBeat.current = index;
    setActive(index);
  }, []);

  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const studio = element.querySelector<HTMLElement>(".mindset-studio")!;
    const rigs = Array.from(studio.querySelectorAll<HTMLElement>(".demo-rig"));
    const scales = new Map<HTMLElement, number>();
    const fit = () => {
      const height = studio.clientHeight;
      if (!height) return;

      const measurements = rigs.map(rig => {
        const caption = rig.previousElementSibling as HTMLElement | null;
        const space = height - (caption?.offsetHeight ?? 0) - 30;
        const scale = Math.min(.7, Math.max(.2, space / Math.max(1, rig.offsetHeight)));
        return { rig, scale };
      });
      for (const { rig, scale } of measurements) {
        if (scales.get(rig) === scale) continue;
        scales.set(rig, scale);
        rig.style.setProperty("--mindset-demo-fit", String(scale));
      }
    };
    const observer = new ResizeObserver(fit);
    [studio, ...rigs].forEach(item => observer.observe(item));
    fit();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const element = host.current;
    if (!element || staticMotion) return;
    gsap.registerPlugin(ScrollTrigger);
    const media = gsap.matchMedia();
    media.add({ phone: phoneQuery, staged: stagedQuery }, mediaContext => {
      if (!mediaContext.conditions?.staged) return;
      const phone = !!mediaContext.conditions?.phone;
      const panels = element.querySelectorAll<HTMLElement>(phone ? ".phone-mindset-beat" : ".mindset-beat");
      const context = gsap.context(() => {
        // The destination is held by native sticky positioning throughout arrival.
        // One scrubbed clock drives both the camera and DOM: no translated sticky
        // element or independent scroll lag to create a jump at the handoff.
        const arrival = gsap.timeline({ onUpdate: () => { scene.current.openingExit = arrival.progress() * 1.1; } });
        arrival.set(".mindset-surface", { opacity: 1 }, 0)
          .set(".mindset-shell", { opacity: 1 }, 0)
          .set(".mindset-shell", { y: 0 }, 0)
          .to({}, { duration: 1 }, 0);
        const story = gsap.timeline({
          onUpdate: () => {
            const progress = story.progress();
            scene.current.mindsetProgress = progress;
            setBeat(Math.min(beats.length - 1, Math.floor(progress * beats.length)));
          },
        });
        const blend = phone ? .15 : .18;
        const travel = phone ? 16 : 30;
        addBeatCrossfade(story, panels, {
          enter: { y: travel, autoAlpha: 0 },
          rest: { y: 0, autoAlpha: 1 },
          exit: { y: -travel, autoAlpha: 0 },
        }, blend);
        const selector = phone ? ".orbital-evidence > *" : ".mindset-plate";
        const visuals = element.querySelectorAll<HTMLElement>(selector);
        story.set(visuals[0], { opacity: 1 }, 0);
        addBeatCrossfade(story, visuals, phone ? {
          enter: { y: 10, opacity: 0 },
          rest: { y: 0, opacity: 1 },
          exit: { y: -10, opacity: 0 },
        } : {
          enter: { z: -250, x: 55, rotateY: -10, opacity: 0 },
          rest: { z: 0, x: 0, rotateY: -5, opacity: 1 },
          exit: { z: 150, x: -55, rotateY: 5, opacity: 0 },
        }, blend);
        if (phone) {
          addBeatCrossfade(story, element.querySelectorAll<HTMLElement>(".orbital-caption > span"), {
            enter: { y: 5, opacity: 0 },
            rest: { y: 0, opacity: 1 },
            exit: { y: -5, opacity: 0 },
          }, blend);
        }
        story.to(".mindset-progress-fill", { scaleX: 1, duration: 1, ease: "none" }, 0);
        // Arrival, form and copy share one scrubbed playhead, including when
        // rapidly reversing across the section boundary.
        const storyDuration = () => Math.max(.1, element.offsetHeight / getArrivalDistance(element) - 2);
        arrival.duration(1);
        let duration = storyDuration();
        story.duration(duration);
        gsap.timeline({ scrollTrigger: {
          trigger: element, start: "top top", end: () => `bottom top+=${getArrivalDistance(element)}`, scrub: .24,
          onRefreshInit: () => {
            const nextDuration = storyDuration();
            if (nextDuration === duration) return;
            duration = nextDuration;
            story.duration(duration);
          },
        } }).add(arrival, 0).add(story, 1);
        const work = gsap.timeline({ scrollTrigger: {
          trigger: ".work-index", start: "top 95%", end: "top 10%", scrub: .24,
        } });
        const inset = phone ? "4%" : "10%";
        work.fromTo(".work-index", { clipPath: `inset(0 ${inset} 0 ${inset} round 20px)` },
          { clipPath: "inset(0 0% 0 0% round 0px)", duration: 1, ease: "sine.out" }, 0)
          .fromTo(".work-index .index-heading", { y: phone ? 22 : 42 },
            { y: 0, duration: 1, ease: "sine.out" }, 0);
        gsap.utils.toArray<HTMLElement>(".index-item", element.parentElement!).forEach(row => {
          gsap.fromTo(row, { y: phone ? 14 : 26, opacity: .6 }, {
            y: 0, opacity: 1, ease: "sine.out",
            scrollTrigger: { trigger: row, start: "top 95%", end: "top 72%", scrub: .24 },
          });
        });
      }, element.parentElement!);
      return () => context.revert();
    });
    media.add(stackedQuery, () => {
      // Stacked chapters use the headings' positions instead of the overall
      // progress, which also includes the art and navigation after the copy.
      const panels = element.querySelectorAll(matchMedia(phoneQuery).matches ? ".phone-mindset-beat" : ".mindset-beat");
      panels.forEach((panel, i) => {
        ScrollTrigger.create({ trigger: panel, start: "top center", end: "bottom center", onEnter: () => setBeat(i), onEnterBack: () => setBeat(i) });
      });
    });
    return () => media.revert();
  }, [staticMotion, scene, setBeat]);
  const jump = (index: number) => {
    const el = host.current;
    if (!el) return;
    if (staticMotion || !matchMedia(stagedQuery).matches) {
      const selector = matchMedia(phoneQuery).matches ? ".phone-mindset-beat" : ".mindset-beat";
      const target = el.querySelectorAll<HTMLElement>(selector)[index];
      if (target) {
        const rect = target.getBoundingClientRect();
        scrollStoryTo(scrollY + rect.top + (rect.height - innerHeight) / 2, staticMotion);
      }
      setBeat(index);
      return;
    }
    const arrival = getArrivalDistance(el);
    const travel = Math.max(0, el.offsetHeight - arrival * 2);
    scrollStoryTo(el.getBoundingClientRect().top + scrollY + arrival + travel * ((index + .5) / beats.length));
  };
  return <section ref={host} id="about" className={`mindset-chapter ${staticMotion ? "mindset-static" : ""}`} data-chapter="1" aria-label="The mindset">
    <div className="mindset-sticky">
      <div className="mindset-surface"/>
      <div className="mindset-shell">
        <div className="mindset-eyebrow"><span>01 / THE MINDSET</span><span>A R RAJEEV CHANDAR</span></div>
        <PhoneMindset active={active} still={staticMotion}/>
        <div className="mindset-editorial">
          <div className="mindset-narrative">{beats.map((beat, i) => <article className={`mindset-beat mindset-beat-${i}`} key={beat.label}>
            <span className="mindset-kicker">0{i + 1} / {beat.lead}</span><h2>{beat.word}</h2><p>{beat.text}</p><div className="mindset-footnote"><span/> {beat.note}</div>
          </article>)}</div>
          <div className="mindset-studio" aria-hidden="true" inert>
            <div className="mindset-plate plate-solenne"><div className="plate-caption"><span>01 / SOLENNE</span><span>A SPACE TO REFLECT</span></div><SolenneDemo step={0}/></div>
            <div className="mindset-plate plate-cortex"><div className="plate-caption"><span>02 / CORTEXEDU</span><span>A CONNECTED CLASSROOM</span></div><CortexDemo step={1}/></div>
            <div className="mindset-plate plate-collection"><span className="collection-eyebrow">SELECTED WORK / 2025—2026</span><h3>Ideas,<br/>in practice.</h3>{["Solenne", "CortexEdu", "DoChain", "AI Fitness"].map((name,i)=><div className="collection-item" key={name}><span>0{i+1}</span><strong>{name}</strong><span>↗</span></div>)}</div>
          </div>
        </div>
        <div className="mindset-evidence"><div><span>IN PRACTICE</span><strong>Adobe</strong><small>Technical Consultant Intern</small></div><div><span>THE FOUNDATION</span><strong>9.23 <em>/ 10</em></strong><small>BCA · Jain University</small></div><div><span>STILL EXPLORING</span><strong>MCA <em>’27</em></strong><small>CHRIST University · Bengaluru</small></div></div>
        <div className="mindset-navigation"><div>{beats.map((beat, i) => <button key={beat.label} onClick={() => jump(i)} aria-current={active === i ? "step" : undefined}><span>0{i + 1}</span>{beat.label}</button>)}</div><a href="#work">SEE THE THINKING IN PRACTICE <ArrowDown size={16}/></a></div>
        <div className="mindset-progress"><span className="mindset-progress-fill"/></div>
      </div>
    </div>
  </section>;
}
