"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Check, Download, Expand, Menu, Minus, Pause, Play, Plus, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projects, type Project } from "@/components/portfolio/content";
import { SolenneDemo, CortexDemo, DoChainDemo, FitnessDemo } from "@/components/portfolio/demos";
import { scrollStoryTo, stopStoryScroll } from "@/components/portfolio/story-scroll";
import { captureStory, getStoryLayout, measureStory, restoreStory, type StoryPosition } from "@/components/portfolio/story-position";
import type { SceneState } from "@/components/portfolio/world";
import Mindset from "@/components/portfolio/mindset";
import ResumeViewer from "@/components/portfolio/resume-viewer";
import ChapterNavigation from "@/components/portfolio/chapter-navigation";
import { PhoneJourney } from "@/components/portfolio/phone-scenes";
import { PhoneProjectVisual, PhoneScrollRail, phoneProjectTitles } from "@/components/portfolio/phone-projects";

const World = dynamic(() => import("@/components/portfolio/world"), { ssr: false });
const demos = [SolenneDemo, CortexDemo, DoChainDemo, FitnessDemo];
const chapterNames = ["The introduction", "The mindset", "Solenne", "CortexEdu", "DoChain", "AI Fitness", "The journey"];
const mobileStories = [
  ["Capture a private video journal.", "Connect speech, voice, and visual signals.", "Read the transcript and review reflection cards."],
  ["Bring the classroom and check-in together.", "Calculate internal assessment from classwork.", "Track participation with student tokens."],
  ["Connect a wallet identity.", "Store the document with IPFS.", "Record document transactions on the Polygon testnet."],
  ["Begin with the person and their goals.", "Generate a routine from that context.", "Review the generated sessions and recovery blocks."],
];
const email = "Rajeev.chandar@mca.christuniversity.in";
const subscribeMotion = (callback: () => void) => { const query = matchMedia("(prefers-reduced-motion: reduce)"); query.addEventListener("change", callback); return () => query.removeEventListener("change", callback); };
const getMotion = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const getServerMotion = () => false;
const magnet = (event: PointerEvent<HTMLElement>) => { if (event.pointerType !== "mouse" || matchMedia("(prefers-reduced-motion: reduce)").matches) return; const r = event.currentTarget.getBoundingClientRect(); event.currentTarget.style.setProperty("--mx", `${(event.clientX - r.left - r.width / 2) * 0.14}px`); event.currentTarget.style.setProperty("--my", `${(event.clientY - r.top - r.height / 2) * 0.2}px`); };
const resetMagnet = (event: PointerEvent<HTMLElement>) => { event.currentTarget.style.setProperty("--mx", "0px"); event.currentTarget.style.setProperty("--my", "0px"); };

function ProjectStory({ project, index, still, onDetails }: { project: Project; index: number; still: boolean; onDetails: () => void }) {
  const Demo = demos[index];
  const [previewOpen, setPreviewOpen] = useState(false);
  const [step, setStep] = useState(0);
  const track = useRef<ScrollTrigger | undefined>(undefined);
  const projectHost = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = projectHost.current;
    if (!el) return;
    const composition = el.querySelector<HTMLElement>(".project-composition")!;
    const copy = el.querySelector<HTMLElement>(".project-copy")!;
    const demo = el.querySelector<HTMLElement>(".project-demo")!;
    const prelude = el.querySelector<HTMLElement>(".project-mobile-prelude")!;
    const rig = demo.querySelector<HTMLElement>(".demo-rig");
    const fit = () => {
      const available = composition.clientHeight;
      const natural = Math.max(copy.offsetHeight, demo.offsetHeight);
      const properties = {
        "--mobile-prelude": `${prelude.offsetHeight}px`,
        "--project-fit": String(Math.min(1, available / Math.max(1, natural))),
        "--project-copy-fit": String(Math.min(1, available / Math.max(1, copy.offsetHeight))),
        "--mobile-demo-fit": rig
          ? String(Math.min(innerWidth <= 600 ? 1 : .8, demo.clientHeight / Math.max(1, rig.offsetHeight), demo.clientWidth / Math.max(1, rig.offsetWidth)))
          : "",
      };
      Object.entries(properties).forEach(([name, value]) => {
        if (el.style.getPropertyValue(name) !== value) el.style.setProperty(name, value);
      });
    };
    const observer = new ResizeObserver(fit);
    [composition, copy, demo, prelude].forEach(item => observer.observe(item));
    if (rig) observer.observe(rig);
    fit();
    return () => observer.disconnect();
  }, []);
  useEffect(() => {
    const el = projectHost.current;
    if (!el || still) return;
    gsap.registerPlugin(ScrollTrigger);

    const prelude = el.querySelector<HTMLElement>(".project-mobile-prelude")!;
    const sticky = el.querySelector<HTMLElement>(".project-sticky")!;
    const art = el.querySelector<HTMLElement>(".phone-project-art");
    const controls = el.querySelector<HTMLElement>(".chapter-controls");
    const desktopDemo = el.querySelector<HTMLElement>(".demo-motion");
    let disposed = false;
    let pinned = false;
    let currentStep = -1;
    let currentBlend = "";
    const blendAt = (travel: number, boundary: number) => {
      const ratio = gsap.utils.clamp(0, 1, (travel - boundary + .28) / .56);
      return ratio * ratio * (3 - 2 * ratio);
    };
    const removeBlend = () => {
      sticky.removeAttribute("data-project-scrub");
      [0, 1, 2].forEach(beat => sticky.style.removeProperty(`--beat-${beat}`));
      currentBlend = "";
    };

    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { duration: 1, ease: "none" } });
      timeline
        .fromTo(desktopDemo, { rotateY: -12, rotateZ: -3, y: 45 }, { rotateY: 9, rotateZ: 2, y: -22 }, 0)
        .fromTo(".project-watermark", { xPercent: 8 }, { xPercent: -20 }, 0)
        .fromTo(".project-atmosphere", { scale: .7, opacity: .3 }, { scale: 1.5, opacity: .7 }, 0);
      const update = () => {
        if (disposed || !pinned) return;
        const progress = timeline.progress();
        if (innerWidth <= 600) art?.style.setProperty("--project-progress", String(progress));
        const traveled = progress * project.steps.length;
        const second = blendAt(traveled, 1);
        const third = blendAt(traveled, 2);
        const blend = [1 - second, second - third, third].map(value => value.toFixed(4));
        const blendKey = blend.join(",");
        if (blendKey !== currentBlend) {
          if (!currentBlend) sticky.setAttribute("data-project-scrub", "");
          currentBlend = blendKey;
          blend.forEach((value, beat) => sticky.style.setProperty(`--beat-${beat}`, value));
        }
        if (controls) {
          if (!controls.hasAttribute("data-progress")) controls.setAttribute("data-progress", "");
          controls.style.setProperty("--story-travel", String(traveled));
        }
        const nextStep = Math.min(project.steps.length - 1, Math.floor(traveled));
        if (nextStep !== currentStep) {
          currentStep = nextStep;
          setStep(nextStep);
        }
      };
      timeline.eventCallback("onUpdate", update);
      track.current = ScrollTrigger.create({
        trigger: el,
        animation: timeline,
        start: () => {
          const nextPinned = getComputedStyle(sticky).position === "sticky";
          if (pinned !== nextPinned) currentStep = -1;
          pinned = nextPinned;
          return pinned ? `top+=${prelude.offsetHeight} top` : "top bottom";
        },
        end: () => pinned ? `bottom top+=${sticky.offsetHeight}` : "bottom top",
        scrub: .14,
        onRefresh: () => {
          if (pinned) update();
          else {
            controls?.removeAttribute("data-progress");
            removeBlend();
          }
        },
      });
    }, el);

    return () => {
      disposed = true;
      track.current = undefined;
      context.revert();
      removeBlend();
      art?.style.removeProperty("--project-progress");
      controls?.style.removeProperty("--story-travel");
      controls?.removeAttribute("data-progress");
    };
  }, [project.steps.length, still]);

  const jumpStep = (next: number) => {
    const trigger = track.current;
    const sticky = projectHost.current?.querySelector<HTMLElement>(".project-sticky");
    if (!trigger || !sticky || getComputedStyle(sticky).position !== "sticky") {
      setStep(next);
      return;
    }
    const progress = (next + .5) / project.steps.length;
    scrollStoryTo(trigger.start + (trigger.end - trigger.start) * progress);
  };

  const stepKeys = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    const buttons = Array.from(event.currentTarget.querySelectorAll("button"));
    const index = buttons.indexOf(event.target as HTMLButtonElement);
    if (index < 0) return;
    const last = buttons.length - 1;
    const destinations: Record<string, number> = {
      ArrowLeft: Math.max(0, index - 1), ArrowRight: Math.min(last, index + 1),
      Home: 0, End: last,
    };
    const next = destinations[event.key];
    if (typeof next !== "number") return;
    event.preventDefault();
    buttons[next].focus({ preventScroll: true });
    jumpStep(next);
  };

  return <section ref={projectHost} id={project.id} className={`project-story project-${project.id}`} data-chapter={index + 2} style={{ "--project-color": project.color } as CSSProperties} aria-labelledby={`${project.id}-title`}>
    <div className="project-mobile-prelude"><span className="micro">{project.number} / {project.name}</span><h2>{project.title[0]}<br/><em>{project.title[1]}</em></h2><p>{project.short}</p></div>
    <div className="project-sticky">
      <div className="project-atmosphere" />
      <div className="project-watermark" aria-hidden="true">{project.name}</div>
      <div className="project-topline"><span><b>{project.number}</b> / <span className="project-desktop-label">SELECTED SYSTEMS</span><span className="project-mobile-label">{project.name}</span></span><span>{project.category}</span><span>{project.date}</span></div>
      <div className="project-composition">
        <div className="project-copy"><span className="project-wordmark">{project.name}<ArrowUpRight size={19}/></span><h2 id={`${project.id}-title`}>{project.title[0]}<br/><em>{project.title[1]}</em></h2><p className="project-intro">{project.intro}</p><div className="story-copy" aria-live="off">
          {project.steps.map((item, beat) => <div className="story-beat" key={item.label} data-story-slot={beat} data-active={step === beat} aria-hidden={step !== beat}>
            <span className="micro">0{beat + 1} / {item.label.toUpperCase()}</span>
            <h3><span className="project-desktop-label">{item.title}</span><span className="project-mobile-label">{phoneProjectTitles[index][beat]}</span></h3>
            <p className="story-full-text">{item.text}</p><p className="story-mobile-text">{mobileStories[index][beat]}</p><span className="step-tech">{item.tech}</span>
          </div>)}
        </div><button className="underlined-link" onClick={onDetails}><span className="project-desktop-label">Explore the engineering</span><span className="project-mobile-label">Project details</span> <Plus size={17}/></button><button className="mobile-preview-open" onClick={() => setPreviewOpen(true)}>Try the demo <Expand size={15}/></button></div>
        <div className="project-demo"><PhoneProjectVisual index={index} step={step} onOpen={() => setPreviewOpen(true)}/><div className="demo-motion"><Demo step={step}/></div><span className="demo-caption"><span>INTERACTIVE CONCEPT</span><span>ILLUSTRATIVE DATA · TRY THE CONTROLS</span></span></div>
      </div>
      <div className="project-bottomline"><div className="chapter-controls" role="group" aria-label={`${project.name} story steps`} onKeyDown={stepKeys}>{project.steps.map((item, i) => <button key={item.label} style={{ "--story-offset": i } as CSSProperties} onClick={() => jumpStep(i)} aria-current={step === i ? "step" : undefined} className={step === i ? "active" : ""}><span>0{i + 1}</span>{item.label}<i/></button>)}</div><span className="scroll-to-unfold">SCROLL TO UNFOLD <ArrowDown size={14}/></span></div>
    </div>
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className={`project-preview-dialog ${still ? "motion-paused" : ""}`} showCloseButton={false}><header><div><DialogTitle>{project.name}</DialogTitle><DialogDescription>Interactive concept · illustrative data</DialogDescription></div><button aria-label="Close interactive preview" onClick={() => setPreviewOpen(false)}><X/></button></header><Demo step={step}/></DialogContent></Dialog>
  </section>;
}

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const scene = useRef<SceneState>({ chapter: 0, progress: 0, openingProgress: 0, openingExit: 0, paused: false, reduced: false, exploded: false, pointer: { x: 0, y: 0 } });
  const [resumeOpen, setResumeOpen] = useState(false);
  const [paused, setPaused] = useState(false), [exploded, setExploded] = useState(false), [menuOpen, setMenuOpen] = useState(false), [detail, setDetail] = useState<number | null>(null), [copied, setCopied] = useState(false);
  const [chapter, setChapter] = useState(0);
  const readingPosition = useRef<StoryPosition | undefined>(undefined);
  const pendingPosition = useRef<StoryPosition | undefined>(undefined);
  const pausedPosition = useRef<{ position: StoryPosition; y: number; step: Element | null } | undefined>(undefined);
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);

  const toggleMotion = () => {
    const saved = pausedPosition.current;
    pendingPosition.current = paused && saved && Math.abs(window.scrollY - saved.y) < 8
      && saved.step === saved.position.section.querySelector(".chapter-controls [aria-current=step]")
      ? saved.position
      : readingPosition.current;
    stopStoryScroll();
    setPaused(value => !value);
  };

  useLayoutEffect(() => {
    const position = pendingPosition.current;
    pendingPosition.current = undefined;
    if (!position) return;
    restoreStory(position);
    pausedPosition.current = paused ? {
      position,
      y: window.scrollY,
      step: position.section.querySelector(".chapter-controls [aria-current=step]"),
    } : undefined;
  }, [paused]);
  useEffect(() => {
    scene.current.paused = paused; scene.current.reduced = reduced; scene.current.exploded = exploded;
    if (paused || reduced) scene.current.pointer = { x: 0, y: 0 };
    scene.current.invalidate?.();
  }, [paused, reduced, exploded]);
  useEffect(() => {
    const el = root.current; if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    let pendingResize = 0;
    const context = gsap.context(() => {
      const storySections = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter],#work,#toolkit,#contact"));
      let regions: ReturnType<typeof measureStory>[] = [];
      let layout = getStoryLayout();
      const chapters = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"), section => ({
        section,
        number: Number(section.dataset.chapter),
        prelude: section.querySelector<HTMLElement>(".project-mobile-prelude"),
        top: 0, height: 0, lead: 0,
      }));
      const opening = el.querySelector<HTMLElement>(".opening")!;
      const scrub = .24;
      const controls = el.querySelector<HTMLElement>(".persistent-controls");
      const readout = el.querySelector(".progress-number");
      const rail = el.querySelector<HTMLElement>(".phone-scroll-rail");
      const useOpeningFallback = matchMedia("(min-width:901px), (min-height:600px), (max-width:600px) and (min-height:500px)");
      let viewportHeight = innerHeight;
      let openingBottom = 0;
      let previousPercent = -1;
      let worldTarget = 1;
      scene.current.worldChapter = worldTarget;
      const moveWorld = gsap.quickTo(scene.current, "worldChapter", {
        duration: scrub,
        ease: "power1.out",
        onUpdate: () => scene.current.invalidate?.(),
      });
      const updatePage = (trigger: ScrollTrigger) => {
        const y = trigger.scroll();
        if (!pendingResize && layout === getStoryLayout()) {
          readingPosition.current = captureStory(regions, y, viewportHeight);
        }
        const middle = y + viewportHeight / 2;
        let current = chapters[0];
        for (const candidate of chapters) {
          if (candidate.top <= middle) current = candidate;
          else break;
        }

        const progress = gsap.utils.clamp(0, 1, (y - current.top - current.lead) / Math.max(1, current.height - current.lead - viewportHeight));
        if (scene.current.chapter !== current.number) {
          scene.current.chapter = current.number;
          setChapter(current.number);
        }
        scene.current.progress = progress;
        if (!useOpeningFallback.matches || paused || reduced) {
          scene.current.openingExit = Math.max(0, (y + viewportHeight - openingBottom) / viewportHeight);
        }
        if (paused || reduced) scene.current.openingProgress = 0;

        if (!paused && !reduced) {
          // Blend the field across the part of the viewport shared by adjacent scenes.
          let nextWorld = 1;
          const blend = viewportHeight * .64;
          for (const candidate of chapters) {
            if (candidate.number < 2) continue;
            const fraction = gsap.utils.clamp(0, 1, (middle - candidate.top + blend / 2) / blend);
            nextWorld += fraction * fraction * (3 - 2 * fraction);
          }
          if (worldTarget !== nextWorld) {
            worldTarget = nextWorld;
            moveWorld(nextWorld);
          }
        }
        controls?.style.setProperty("--page-progress", String(trigger.progress));
        rail?.style.setProperty("--read", String(trigger.progress));
        const percent = Math.round(trigger.progress * 100);
        if (percent !== previousPercent) {
          previousPercent = percent;
          if (readout) readout.textContent = String(percent).padStart(2, "0");
          rail?.setAttribute("aria-valuenow", String(percent));
        }
        scene.current.invalidate?.();
      };
      const measurePage = (trigger: ScrollTrigger) => {
        const y = trigger.scroll();
        viewportHeight = innerHeight;
        const nextLayout = getStoryLayout();
        const resizePosition = layout !== nextLayout ? readingPosition.current : undefined;
        layout = nextLayout;
        regions = storySections.map(section => measureStory(section, y, viewportHeight));
        if (resizePosition && !pendingResize) {
          pendingResize = requestAnimationFrame(() => {
            pendingResize = 0;
            stopStoryScroll();
            restoreStory(resizePosition);
            ScrollTrigger.update();
          });
        }
        openingBottom = opening.getBoundingClientRect().bottom + y;
        chapters.forEach(chapter => {
          chapter.top = chapter.section.getBoundingClientRect().top + y;
          chapter.height = chapter.section.offsetHeight;
          chapter.lead = chapter.prelude?.offsetHeight ?? 0;
        });
        updatePage(trigger);
      };
      ScrollTrigger.create({ start: 0, end: "max", onRefresh: measurePage, onUpdate: updatePage });
      if (!reduced && !paused) {

        const intro = gsap.timeline({
          defaults: { ease: "sine.inOut" },
          scrollTrigger: { trigger: opening, start: "top top", end: "bottom bottom", scrub },
        });
        intro
          .fromTo(".hero-name .name-one", { yPercent: 0, opacity: 1 }, { yPercent: -26, opacity: 0, duration: .31 }, .06)
          .fromTo(".hero-name .name-two", { yPercent: 0, opacity: 1 }, { yPercent: -22, opacity: 0, duration: .30 }, .10)
          .fromTo(".hero-side, .hero-description, .hero-meta, .sculpture-controls",
            { y: 0, opacity: 1 }, { y: -24, opacity: 0, duration: .25 }, .03)
          // The next line rises into the remaining motion of the hero rather than waiting for an empty frame.
          .fromTo(".opening-next", { y: 32, opacity: 0 }, { y: 0, opacity: 1, duration: .34 }, .24)
          .fromTo(".system-caption", { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: .20 }, .60)
          .to(".system-caption, .hero-scroll", { opacity: 0, y: -23, duration: .19 }, .81);
        intro.eventCallback("onUpdate", () => {
          scene.current.openingProgress = intro.progress();
          scene.current.invalidate?.();
        });

        const desktop = gsap.matchMedia();
        desktop.add("(min-width:601px)", () => {
          const journey = el.querySelector<HTMLElement>(".journey")!;
          const sticky = journey.querySelector<HTMLElement>(".journey-sticky")!;
          const track = sticky.querySelector<HTMLElement>(".journey-track")!;
          const progressFill = sticky.querySelector(".timeline-line > span");
          const travel = () => {
            const { paddingLeft, paddingRight } = getComputedStyle(sticky);
            return Math.max(0, track.scrollWidth - (sticky.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight)));
          };
          const timeline = gsap.timeline({
            defaults: { duration: 1, ease: "none" },
            scrollTrigger: { trigger: journey, start: "top top", end: "bottom bottom", scrub, invalidateOnRefresh: true },
          });
          timeline
            .fromTo(track, { x: 0 }, { x: () => -travel() }, 0)
            .fromTo(progressFill, { scaleX: 0 }, { scaleX: 1 }, 0)
            .fromTo(sticky.querySelector(".journey-heading"), { y: 0 }, { y: -12 }, 0);
        });

        const settleSection = (trigger: string, target: string) => {
          gsap.fromTo(target, { y: 24, opacity: .72 }, {
            y: 0, opacity: 1, ease: "sine.out",
            scrollTrigger: { trigger, start: "top 95%", end: "top 54%", scrub },
          });
        };
        settleSection(".toolkit-top", ".toolkit-top > h2, .toolkit-top > p");
        settleSection(".contact-prelude", ".contact-prelude");
        settleSection(".contact-big", ".contact-big");

      }
    }, el);
    let disposed = false; document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; cancelAnimationFrame(pendingResize); context.revert(); };
  }, [reduced, paused]);
  const pointer = (event: PointerEvent<HTMLElement>) => { if (paused || reduced || event.pointerType !== "mouse") return; scene.current.pointer = { x: (event.clientX / innerWidth - 0.5) * 2, y: (event.clientY / innerHeight - 0.5) * 2 }; };
  useEffect(() => {
    if (paused || reduced || resumeOpen || menuOpen || detail !== null) stopStoryScroll();
  }, [paused, reduced, resumeOpen, menuOpen, detail]);

  const copyEmail = async () => { try { await navigator.clipboard.writeText(email); setCopied(true); } catch { location.href = `mailto:${email}`; } };
  const resetScene = () => { setExploded(false); scene.current.pointer = { x: 0, y: 0 }; };
  const selected = detail === null ? null : projects[detail];
  return <main ref={root} className={`portfolio ${paused ? "motion-paused" : ""} ${reduced ? "reduced-motion" : ""}`} onPointerMove={pointer}>
    <a className="skip-link" href="#work">Skip to selected projects</a>
    <World state={scene}/><div className="vignette" aria-hidden="true"/><div className="grain" aria-hidden="true"/>
    <header className="site-header"><a href="#home" className="brand" aria-label="A R Rajeev Chandar home"><span>A R RAJEEV<br/>CHANDAR<span className="brand-star">✳</span></span></a><span className="header-center"><span>BENGALURU / INDIA</span></span><div className="header-actions"><button className="resume-button magnetic" onClick={() => setResumeOpen(true)} onPointerMove={magnet} onPointerLeave={resetMagnet}>RÉSUMÉ</button><button className="menu-button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><span className="menu-strokes" aria-hidden="true"><i/><i/><i/></span></button></div></header>
    <aside className="journey-rail" aria-label="Current chapter"><span className="rail-number">0{Math.min(chapter + 1, 7)}</span><span className="rail-line"/><span className="rail-name">{chapterNames[chapter]}</span></aside>
    <PhoneScrollRail still={paused || reduced}/><div className="persistent-controls"><button onClick={toggleMotion} aria-pressed={paused} aria-label={paused ? "Resume motion" : "Pause motion"}>{paused || reduced ? <Play size={13}/> : <Pause size={13}/>}<span>{reduced ? "REDUCED MOTION" : paused ? "MOTION PAUSED" : "MOTION ON"}</span></button><span className="page-progress"><b className="progress-number">00</b> / 100</span></div>
    <section id="home" className="opening" data-chapter="0">
      <div className="opening-sticky">
        <div className="hero-meta hero-enter"><span>FULL-STACK DEVELOPER</span><span>PORTFOLIO / 2026</span></div>
        <h1 className="hero-name" aria-label="A R Rajeev Chandar"><span className="name-one hero-enter"><span className="hero-initials">A R</span><span className="name-reveal">RAJEEV</span></span><span className="name-two hero-enter"><span className="name-reveal">CHANDAR</span></span></h1>
        <div className="hero-side hero-enter"><span className="micro">THE HUMAN BEHIND THE CODE</span><p>Curiosity in the mind.<br/>Precision in the build.</p></div>
        <div className="hero-description hero-enter"><p>I build systems that make<br/><em>complex things feel simple.</em></p><a href="#work" className="round-cta magnetic" onPointerMove={magnet} onPointerLeave={resetMagnet}>Explore the work <span><ArrowDown size={20}/></span></a></div>

        <div className="opening-next"><span className="micro">FROM A SINGLE IDEA</span><p>TO AN ENTIRE<br/><em>SYSTEM.</em></p><span className="opening-next-caption">INTERFACE. LOGIC. DATA.<br/>HUMAN EXPERIENCE.</span></div>
        <div className="system-caption" aria-hidden="true"><span>01 / INTERFACE</span><span>02 / LOGIC</span><span>03 / DATA</span><span>04 / PEOPLE</span></div>
        <div className="hero-scroll"><span>SCROLL TO ENTER THE STORY</span></div>
      </div>
    </section>
    <Mindset staticMotion={paused || reduced} scene={scene}/>
    <section id="work" className="work-index section-space"><div className="section-eyebrow"><span>02 / SELECTED SYSTEMS</span><span>FOUR CHALLENGES. FOUR WORLDS.</span></div><div className="index-heading reveal"><h2>BUILT TO<br/><em>DO SOMETHING.</em></h2><p>From private reflection to connected classrooms.<br/>Explore the idea, then get inside the engineering.</p></div><div className="project-index-list">{projects.map((project, i) => <a className="index-item" href={`#${project.id}`} key={project.id} style={{ "--project-color": project.color } as CSSProperties}><span>{project.number}</span><strong>{project.name}</strong><span className="index-subtitle">{project.short}</span><span className="index-category">{project.category}</span><ArrowUpRight/><span className="index-hover-word" aria-hidden="true">{i === 0 ? "REFLECT" : i === 1 ? "CONNECT" : i === 2 ? "VERIFY" : "PERSONALIZE"}</span></a>)}</div></section>
    <div className="project-worlds">{projects.map((project, i) => <ProjectStory key={project.id} project={project} index={i} still={paused || reduced} onDetails={() => setDetail(i)}/>)}</div>
    <section id="experience" className="journey" data-chapter="6"><PhoneJourney still={paused || reduced}/><div className="journey-sticky"><div className="section-eyebrow"><span>03 / ALWAYS IN PROGRESS</span><span>THE JOURNEY SO FAR</span></div><div className="journey-heading"><h2>EDUCATION &amp;<br/><em>EXPERIENCE.</em></h2><p>From studying computing at Jain University<br/>to building an e-commerce capstone at Adobe.</p></div><div className="journey-track">{[
      { year: "2022", tag: "THE FOUNDATION", name: "Beginning the BCA.", text: "Started the Bachelor of Computer Applications program at Jain University.", footer: "JAIN UNIVERSITY" },
      { year: "2025", tag: "THE FOUNDATION, DEEPER", name: "BCA. Strong foundations.", text: "Completed a Bachelor of Computer Applications at Jain University with a CGPA of 9.230 / 10.0.", footer: "JAIN UNIVERSITY · 2022–2025" },
      { year: "2025", tag: "THE NEXT CHAPTER", name: "MCA at CHRIST", text: "Began the 2025–27 MCA program. Volunteered at Gateways, a national-level inter-collegiate IT fest.", footer: "CHRIST UNIVERSITY · BENGALURU" },
      { year: "2026", tag: "A MOMENT OF RECOGNITION", name: "SHELLS’26 winner", text: "Overall winner at the national-level inter-collegiate tech fest hosted by Kristu Jayanti University.", footer: "FEBRUARY 2026" },
      { year: "2026", tag: "ENGINEERING IN PRACTICE", name: "Inside Adobe", text: "Technical Consultant Intern. Completed UI enablement training, explored EDS architecture, and built a responsive e-commerce capstone.", footer: "APRIL–JUNE 2026 · BENGALURU" },
    ].map((item, i) => <article className="journey-card" key={item.name}><div className="journey-year">{item.year}<span>0{i + 1}</span></div><span className="micro">{item.tag}</span><h3>{item.name}</h3><p>{item.text}</p><div className="journey-card-footer">{item.footer}<ArrowUpRight size={18}/></div></article>)}</div><div className="timeline-line"><span/></div></div></section>
    <section id="toolkit" className="toolkit section-space"><div className="section-eyebrow"><span>04 / THE TOOLKIT</span><span>FROM FIRST PIXEL TO FINAL REQUEST</span></div><div className="toolkit-top"><h2 className="reveal">MY<br/><em>TOOLKIT.</em></h2><p>The languages, frameworks and tools<br/>I use across my projects.</p></div><Tabs defaultValue="interfaces" className="stack-tabs"><TabsList aria-label="Explore technical skills"><TabsTrigger value="interfaces">Interfaces</TabsTrigger><TabsTrigger value="engineering">Engineering</TabsTrigger><TabsTrigger value="data">Data & delivery</TabsTrigger><TabsTrigger value="foundations">Foundations</TabsTrigger></TabsList>{[
      { id: "interfaces", intro: "Where the system meets the person.", tools: ["React.js", "Next.js", "Flutter", "Tailwind CSS", "Adobe EDS"], used: "Applied in Solenne, CortexEdu, DoChain, AI Fitness, and the Adobe internship capstone." },
      { id: "engineering", intro: "The logic behind the experience.", tools: ["TypeScript", "JavaScript", "Python", "Go", "Java", "C / C++", "Node.js", "Express.js"], used: "From application development to asynchronous analysis workers and API integration." },
      { id: "data", intro: "A connected system needs solid foundations.", tools: ["MongoDB", "MySQL", "Firebase", "SQL", "Docker", "Git", "GitHub"], used: "Data management, live updates, version control, and reproducible environments." },
      { id: "foundations", intro: "Understand the problem before the implementation.", tools: ["Data structures", "Algorithms", "Object-oriented design", "Database systems", "Microservices", "Problem solving"], used: "Grounded in academic study, technical training, hands-on projects, and team collaboration." },
    ].map(group => <TabsContent key={group.id} value={group.id}><div className="stack-content"><div><span className="micro">HOW I THINK ABOUT IT</span><h3>{group.intro}</h3><p>{group.used}</p></div><div className="stack-tools">{group.tools.map((tool, i) => <div key={tool}><span>{String(i + 1).padStart(2, "0")}</span><strong>{tool}</strong></div>)}</div></div></TabsContent>)}</Tabs><div className="training-strip"><span className="micro">CONTINUING THE LEARNING</span><span>React.js Essential Training <small>2024</small></span><span>Python for Data Visualization <small>2023</small></span><span>Functional Programming with Java <small>2023</small></span></div></section>
    <footer id="contact" className="contact section-space"><div className="section-eyebrow"><span>05 / THE NEXT THING WE BUILD</span><a href="#home">BACK TO THE START <ArrowUpRight size={14}/></a></div><div className="contact-prelude"><span className="contact-star">✳</span><p>A challenging problem.<br/>A thoughtful team.<br/><strong>A good place to start.</strong></p></div><a className="contact-big" href={`mailto:${email}`}>GET IN<br/><span>TOUCH.</span><ArrowUpRight/></a><div className="contact-bottom"><div><span className="micro">HAVE A ROLE OR PROJECT IN MIND?</span><a className="email-address" href={`mailto:${email}`}>{email}</a><button className="copy-email" onClick={copyEmail} aria-live="polite">{copied ? <><Check size={14}/>Email copied</> : <>Copy email <Plus size={14}/></>}</button></div><div className="contact-socials"><a href="https://www.linkedin.com/in/a-r-rajeev-chandar-442141264/" target="_blank" rel="noreferrer">LinkedIn<ArrowUpRight size={20}/></a><a href="/Rajeev-Chandar-Resume.pdf" download>Download résumé<Download size={18}/></a></div></div><div className="footer-meta"><span>© 2026 A R RAJEEV CHANDAR</span><span>BENGALURU, INDIA</span><span>CURIOUS BY NATURE. ENGINEER BY CRAFT.</span></div></footer>
    <ChapterNavigation open={menuOpen} onOpenChange={setMenuOpen} still={paused || reduced}/>
    <ResumeViewer open={resumeOpen} onOpenChange={setResumeOpen} still={paused || reduced}/>
    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent className="case-dialog" showCloseButton={false}>{selected && <><div className="case-header"><span className="micro">PROJECT {selected.number} / ENGINEERING NOTES</span><button aria-label="Close project details" onClick={() => setDetail(null)}><X/></button></div><DialogTitle style={{ color: selected.color }}>{selected.name}</DialogTitle><DialogDescription>{selected.intro}</DialogDescription><div className="case-meta"><span>{selected.category}</span><span>{selected.date}</span></div><div className="case-section"><span>01 / THE CHALLENGE</span><p>{selected.challenge}</p></div><div className="case-section"><span>02 / THE APPROACH</span><p>{selected.approach}</p></div><div className="case-section"><span>03 / ENGINEERING DECISIONS</span><div className="case-decisions">{selected.decisions.map(([title, text], i) => <article key={title}><b>0{i + 1}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div><div className="case-section"><span>04 / BUILT WITH</span><div className="case-stack">{selected.stack.map(tool => <span key={tool}>{tool}</span>)}</div></div><p className="case-note">{selected.note}</p><a className="underlined-link" href={`mailto:${email}?subject=${encodeURIComponent(`Let's discuss ${selected.name}`)}`}>Let’s talk about this project<ArrowUpRight size={17}/></a></>}</DialogContent></Dialog>
  </main>;
}
