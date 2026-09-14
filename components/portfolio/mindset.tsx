"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown } from "lucide-react";
import { SolenneDemo, CortexDemo } from "./demos";

const beats = [
  { word: "Understand the person.", lead: "THE STARTING POINT", label: "Understand", text: "Good software begins with a human need. A quiet space to reflect. A simpler way to check in. A document someone can trust.", note: "Solenne explores the first of those ideas through private video journaling." },
  { word: "Consider the whole journey.", lead: "THE ENGINEERING", label: "Connect", text: "I work across the interface, application logic, and data. The aim is to make each part feel like it belongs to the same experience.", note: "CortexEdu brings classes, attendance, and assessment into one connected flow." },
  { word: "Let the work speak.", lead: "THE RESULT", label: "Build", text: "Four projects. Different constraints. The same attention to how the pieces fit together.", note: "Explore the experience, then look closer at the decisions behind it." },
];

export default function Mindset({ staticMotion }: { staticMotion: boolean }) {
  const host = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    const studio = element.querySelector<HTMLElement>(".mindset-studio")!;
    const rigs = Array.from(studio.querySelectorAll<HTMLElement>(".demo-rig"));
    const fit = () => rigs.forEach(rig => {
      const caption = rig.previousElementSibling as HTMLElement | null;
      const space = studio.clientHeight - (caption?.offsetHeight ?? 0) - 30;
      rig.style.setProperty("--mindset-demo-fit", String(Math.min(.7, Math.max(.2, space / Math.max(1, rig.offsetHeight)))));
    });
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
    media.add("(min-width: 901px)", () => {
      const panels = element.querySelectorAll<HTMLElement>(".mindset-beat");
      const context = gsap.context(() => {
        // Hold the destination in the viewport while the camera crosses the gateway.
        // A widening aperture reveals the real section behind the WebGL frames.
        gsap.fromTo(".mindset-sticky", { y: () => -innerHeight }, { y: 0, ease: "none", scrollTrigger: { trigger: element, start: "top bottom", end: "top top", scrub: true, invalidateOnRefresh: true } });
        gsap.fromTo(".mindset-shell", { scale: 0.94, opacity: 0 }, { scale: 1, opacity: 1, ease: "power2.out", scrollTrigger: { trigger: element, start: "top 65%", end: "top top", scrub: true } });
        const story = gsap.timeline({ onUpdate: () => { setActive(Math.min(2, Math.floor(story.progress() * 3))); }, scrollTrigger: { trigger: element, start: "top top", end: "bottom bottom", scrub: 0.65 } });
        panels.forEach((panel, i) => {
          if (i) story.fromTo(panel, { y: 65, opacity: 0 }, { y: 0, opacity: 1, duration: 0.12 }, i / 3);
          if (i < 2) story.to(panel, { y: -55, opacity: 0, duration: 0.1 }, (i + 1) / 3 - 0.1);
        });
        element.querySelectorAll<HTMLElement>(".mindset-plate").forEach((plate, i) => {
          if (i) story.fromTo(plate, { z: -650, x: 100, rotateY: -12, opacity: 0 }, { z: 0, x: 0, rotateY: -5, opacity: 1, duration: 0.2, ease: "power2.inOut" }, i / 3 - 0.06);
          if (i < 2) story.to(plate, { z: 350, x: -100, rotateY: 8, opacity: 0, duration: 0.2, ease: "power2.inOut" }, (i + 1) / 3 - 0.15);
        });
        story.to(".mindset-progress-fill", { scaleX: 1, duration: 1, ease: "none" }, 0);
        gsap.fromTo(".work-index", { clipPath: "inset(0 12% 0 12% round 24px)" }, { clipPath: "inset(0 0% 0 0% round 0px)", ease: "none", scrollTrigger: { trigger: ".work-index", start: "top 95%", end: "top 10%", scrub: 0.5 } });
        gsap.fromTo(".work-index .index-heading", { y: 90 }, { y: 0, scrollTrigger: { trigger: ".work-index", start: "top bottom", end: "top 20%", scrub: 0.5 } });
        gsap.fromTo(".index-item", { y: 60, opacity: 0.2 }, { y: 0, opacity: 1, stagger: 0.08, scrollTrigger: { trigger: ".project-index-list", start: "top 95%", end: "top 40%", scrub: 0.4 } });
      }, element.parentElement!);
      return () => context.revert();
    });
    media.add("(max-width: 900px)", () => {
      const trigger = ScrollTrigger.create({ trigger: element, start: "top 20%", end: "bottom bottom", onUpdate: self => { setActive(Math.min(2, Math.floor(self.progress * 3))); } });
      return () => trigger.kill();
    });
    return () => media.revert();
  }, [staticMotion]);
  const jump = (index: number) => {
    const el = host.current;
    if (!el) return;
    setActive(index);
    const pinned = !staticMotion && matchMedia("(min-width: 901px)").matches;
    const target = pinned ? el : el.querySelectorAll<HTMLElement>(".mindset-beat")[index];
    if (!target) return;
    const offset = pinned ? (el.offsetHeight - innerHeight) * ((index + 0.4) / 3) : -100;
    window.scrollTo({ top: target.getBoundingClientRect().top + scrollY + offset, behavior: staticMotion ? "instant" : "smooth" });
  };
  return <section ref={host} id="about" className={`mindset-chapter ${staticMotion ? "mindset-static" : ""}`} data-chapter="1" aria-label="The mindset">
    <div className="mindset-sticky">
      <div className="mindset-surface"/>
      <div className="mindset-shell">
        <div className="mindset-eyebrow"><span>01 / THE MINDSET</span><span>A R RAJEEV CHANDAR</span></div>
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
