"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowDown, ArrowUpRight, Check, Download, Expand, Menu, Minus, Pause, Play, Plus, RotateCcw, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { projects, type Project } from "@/components/portfolio/content";
import { SolenneDemo, CortexDemo, DoChainDemo, FitnessDemo } from "@/components/portfolio/demos";
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

function ProjectStory({ project, index, step, onStep, onDetails }: { project: Project; index: number; step: number; onStep: (step: number) => void; onDetails: () => void }) {
  const Demo = demos[index];
  const [previewOpen, setPreviewOpen] = useState(false);
  const projectHost = useRef<HTMLElement>(null);
  useEffect(() => {
    const el = projectHost.current;
    if (!el) return;
    const composition = el.querySelector<HTMLElement>(".project-composition")!;
    const copy = el.querySelector<HTMLElement>(".project-copy")!;
    const demo = el.querySelector<HTMLElement>(".project-demo")!;
    const fit = () => {
      const prelude = el.querySelector<HTMLElement>(".project-mobile-prelude")!;
      el.style.setProperty("--mobile-prelude", `${prelude.offsetHeight}px`);
      const rig = demo.querySelector<HTMLElement>(".demo-rig");
      if (rig) el.style.setProperty("--mobile-demo-fit", String(Math.min(innerWidth <= 600 ? 1 : .8, demo.clientHeight / Math.max(1, rig.offsetHeight), demo.clientWidth / Math.max(1, rig.offsetWidth))));
      const available = composition.clientHeight;
      const natural = Math.max(copy.offsetHeight, demo.offsetHeight);
      el.style.setProperty("--project-fit", String(Math.min(1, available / Math.max(1, natural))));
    };
    const observer = new ResizeObserver(fit);
    [composition, copy, demo, el.querySelector<HTMLElement>(".project-mobile-prelude")!].forEach(item => observer.observe(item));
    const rig = demo.querySelector<HTMLElement>(".demo-rig");
    if (rig) observer.observe(rig);
    fit();
    return () => observer.disconnect();
  }, []);
  return <section ref={projectHost} id={project.id} className={`project-story project-${project.id}`} data-chapter={index + 2} style={{ "--project-color": project.color } as CSSProperties} aria-labelledby={`${project.id}-title`}>
    <div className="project-mobile-prelude"><span className="micro">{project.number} / {project.name}</span><h2>{project.title[0]}<br/><em>{project.title[1]}</em></h2><p>{project.short}</p></div>
    <div className="project-sticky">
      <div className="project-atmosphere" />
      <div className="project-watermark" aria-hidden="true">{project.name}</div>
      <div className="project-topline"><span><b>{project.number}</b> / <span className="project-desktop-label">SELECTED SYSTEMS</span><span className="project-mobile-label">{project.name}</span></span><span>{project.category}</span><span>{project.date}</span></div>
      <div className="project-composition">
        <div className="project-copy"><span className="project-wordmark">{project.name}<ArrowUpRight size={19}/></span><h2 id={`${project.id}-title`}>{project.title[0]}<br/><em>{project.title[1]}</em></h2><p className="project-intro">{project.intro}</p><div className="story-copy" aria-live="off"><span className="micro">0{step + 1} / {project.steps[step].label.toUpperCase()}</span><h3><span className="project-desktop-label">{project.steps[step].title}</span><span className="project-mobile-label">{phoneProjectTitles[index][step]}</span></h3><p className="story-full-text">{project.steps[step].text}</p><p className="story-mobile-text">{mobileStories[index][step]}</p><span className="step-tech">{project.steps[step].tech}</span></div><button className="underlined-link" onClick={onDetails}><span className="project-desktop-label">Explore the engineering</span><span className="project-mobile-label">Project details</span> <Plus size={17}/></button><button className="mobile-preview-open" onClick={() => setPreviewOpen(true)}>Try the demo <Expand size={15}/></button></div>
        <div className="project-demo"><PhoneProjectVisual index={index} step={step} onOpen={() => setPreviewOpen(true)}/><div className="demo-motion"><Demo step={step}/></div><span className="demo-caption"><span>INTERACTIVE CONCEPT</span><span>ILLUSTRATIVE DATA · TRY THE CONTROLS</span></span></div>
      </div>
      <div className="project-bottomline"><div className="chapter-controls" aria-label={`${project.name} story steps`}>{project.steps.map((item, i) => <button key={item.label} onClick={() => onStep(i)} aria-current={step === i ? "step" : undefined} className={step === i ? "active" : ""}><span>0{i + 1}</span>{item.label}<i/></button>)}</div><span className="scroll-to-unfold">SCROLL TO UNFOLD <ArrowDown size={14}/></span></div>
    </div>
    <Dialog open={previewOpen} onOpenChange={setPreviewOpen}><DialogContent className="project-preview-dialog" showCloseButton={false}><header><div><DialogTitle>{project.name}</DialogTitle><DialogDescription>Interactive concept · illustrative data</DialogDescription></div><button aria-label="Close interactive preview" onClick={() => setPreviewOpen(false)}><X/></button></header><Demo step={step}/></DialogContent></Dialog>
  </section>;
}

export default function Home() {
  const root = useRef<HTMLElement>(null);
  const scene = useRef<SceneState>({ chapter: 0, progress: 0, openingProgress: 0, openingExit: 0, paused: false, reduced: false, exploded: false, pointer: { x: 0, y: 0 } });
  const [resumeOpen, setResumeOpen] = useState(false);
  const [paused, setPaused] = useState(false), [exploded, setExploded] = useState(false), [menuOpen, setMenuOpen] = useState(false), [detail, setDetail] = useState<number | null>(null), [copied, setCopied] = useState(false);
  const [chapter, setChapter] = useState(0), [steps, setSteps] = useState([0, 0, 0, 0]);
  const reduced = useSyncExternalStore(subscribeMotion, getMotion, getServerMotion);
  useEffect(() => {
    scene.current.paused = paused; scene.current.reduced = reduced; scene.current.exploded = exploded;
    if (paused || reduced) scene.current.pointer = { x: 0, y: 0 };
  }, [paused, reduced, exploded]);
  useEffect(() => {
    const el = root.current; if (!el) return;
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    const context = gsap.context(() => {
      const all = Array.from(el.querySelectorAll<HTMLElement>("[data-chapter]"));
      const updateChapter = (element: HTMLElement, progress: number) => {
        const lead = element.querySelector<HTMLElement>(".project-mobile-prelude")?.offsetHeight ?? 0;
        progress = Math.max(0, Math.min(1, (-element.getBoundingClientRect().top - lead) / Math.max(1, element.offsetHeight - lead - innerHeight)));
        const c = Number(element.dataset.chapter); scene.current.chapter = c; scene.current.progress = progress; setChapter(c);
      };
      all.forEach(element => {
        ScrollTrigger.create({ trigger: element, start: "top center", end: "bottom center", onEnter: self => updateChapter(element, self.progress), onEnterBack: self => updateChapter(element, self.progress) });
        ScrollTrigger.create({ trigger: element, start: "top top", end: "bottom bottom", onUpdate: self => { if (self.isActive) updateChapter(element, self.progress); element.style.setProperty("--chapter-progress", String(self.progress)); } });
      });
      // Each project owns its story progress, independently of the global chapter rail.
      // Keep the final stage on screen for a full third of the pinned scroll distance.
      if (!paused && !reduced) gsap.utils.toArray<HTMLElement>(".project-story").forEach((project, index) => {
        const syncStep = (progress: number) => {
          if (innerWidth <= 800 && innerHeight < 600 && !(innerWidth <= 600 && innerHeight >= 500)) return;
          const measured = innerWidth <= 600 ? Math.max(0, Math.min(1, -project.getBoundingClientRect().top / Math.max(1, project.offsetHeight - innerHeight))) : progress;
          const next = Math.min(2, Math.floor(measured * 3));
          setSteps(previous => previous[index] === next ? previous : previous.map((value, i) => i === index ? next : value));
        };
        ScrollTrigger.create({ trigger: project, start: () => `top+=${project.querySelector<HTMLElement>(".project-mobile-prelude")!.offsetHeight} top`, end: "bottom bottom", invalidateOnRefresh: true, onUpdate: self => syncStep(self.progress), onRefresh: self => syncStep(self.progress) });
      });
      const syncOpening = () => {
        const opening = el.querySelector<HTMLElement>(".opening");
        if (!opening) return;
        // Desktop arrival owns the shared camera/DOM clock in Mindset.
        if ((innerWidth <= 900 && innerHeight < 600) || paused || reduced) scene.current.openingExit = Math.max(0, (innerHeight - opening.getBoundingClientRect().bottom) / innerHeight);
        if (paused || reduced) scene.current.openingProgress = 0;
      };
      ScrollTrigger.create({ start: 0, end: "max", onRefresh: syncOpening, onUpdate: self => { syncOpening(); el.style.setProperty("--page-progress", String(self.progress)); const readout = el.querySelector(".progress-number"); if (readout) readout.textContent = `${Math.round(self.progress * 100)}`.padStart(2, "0"); } });
      if (!reduced && !paused) {

        const intro = gsap.timeline({ onUpdate: () => { scene.current.openingProgress = intro.progress(); }, scrollTrigger: { trigger: ".opening", start: "top top", end: "bottom bottom", scrub: 0.65 } });
        intro.fromTo(".hero-name .name-one", { yPercent: 0, opacity: 1 }, { yPercent: -35, opacity: 0, duration: 0.25, ease: "power2.inOut" }, 0.05)
          .fromTo(".hero-name .name-two", { yPercent: 0, opacity: 1 }, { yPercent: -25, opacity: 0, duration: 0.25, ease: "power2.inOut" }, 0.09)
          .fromTo(".hero-side, .hero-description, .hero-meta, .sculpture-controls", { y: 0, opacity: 1 }, { y: -30, opacity: 0, duration: 0.2 }, 0.02)
          .fromTo(".opening-next", { y: 45, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power2.out" }, 0.38)
          .fromTo(".system-caption", { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.16 }, 0.68)
          .to(".opening-next, .system-caption, .hero-scroll", { opacity: 0, y: -35, duration: 0.16 }, 0.84)
          .to({}, { duration: 0.16 }, 0.84);
        gsap.utils.toArray<HTMLElement>(".project-story").forEach(project => {
          gsap.fromTo(project.querySelector(".demo-motion"), { rotateY: () => innerWidth <= 600 ? -3 : -12, rotateZ: () => innerWidth <= 600 ? 0 : -3, y: () => innerWidth <= 600 ? 14 : 45 }, { rotateY: () => innerWidth <= 600 ? 3 : 9, rotateZ: () => innerWidth <= 600 ? 0 : 2, y: () => innerWidth <= 600 ? -8 : -22, ease: "none", scrollTrigger: { trigger: project, start: () => `top+=${project.querySelector<HTMLElement>(".project-mobile-prelude")!.offsetHeight} top`, end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
          gsap.fromTo(project.querySelector(".project-watermark"), { xPercent: 8 }, { xPercent: -20, ease: "none", scrollTrigger: { trigger: project, start: () => `top+=${project.querySelector<HTMLElement>(".project-mobile-prelude")!.offsetHeight} top`, end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
          gsap.fromTo(project.querySelector(".project-atmosphere"), { scale: 0.7, opacity: 0.3 }, { scale: 1.5, opacity: 0.7, scrollTrigger: { trigger: project, start: () => `top+=${project.querySelector<HTMLElement>(".project-mobile-prelude")!.offsetHeight} top`, end: "bottom bottom", scrub: true, invalidateOnRefresh: true } });
        });
        gsap.fromTo(".journey-track", { x: 0 }, { x: () => -Math.max(0, (el.querySelector(".journey-track")?.scrollWidth ?? 0) - innerWidth * 0.88), ease: "none", scrollTrigger: { trigger: ".journey", start: "top top", end: "bottom bottom", scrub: 0.8, invalidateOnRefresh: true } });
        gsap.utils.toArray<HTMLElement>(".reveal:not(.index-heading)").forEach(item => gsap.fromTo(item, { y: 45, opacity: 0.35 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: item, start: "top 92%", toggleActions: "play none none reverse" } }));
        gsap.fromTo(".contact-big", { xPercent: -5 }, { xPercent: 0, scrollTrigger: { trigger: ".contact", start: "top bottom", end: "bottom bottom", scrub: 1 } });
      }
    }, el);
    let disposed = false; document.fonts.ready.then(() => { if (!disposed) ScrollTrigger.refresh(); });
    return () => { disposed = true; context.revert(); };
  }, [reduced, paused]);
  const jumpStep = (index: number, step: number) => {
    const el = document.getElementById(projects[index].id); if (!el) return;
    if ((innerWidth <= 800 && innerHeight < 600 && !(innerWidth <= 600 && innerHeight >= 500)) || reduced || paused) { setSteps(previous => previous.map((value, i) => i === index ? step : value)); return; }
    const lead = el.querySelector<HTMLElement>(".project-mobile-prelude")!.offsetHeight;
    const travel = Math.max(0, el.offsetHeight - lead - innerHeight);
    const y = el.getBoundingClientRect().top + scrollY + lead + travel * ((step + 0.22) / 3);
    window.scrollTo({ top: y, behavior: reduced || paused ? "instant" : "smooth" });
    setSteps(previous => previous.map((value, i) => i === index ? step : value));
  };
  const pointer = (event: PointerEvent<HTMLElement>) => { if (paused || reduced || event.pointerType !== "mouse") return; scene.current.pointer = { x: (event.clientX / innerWidth - 0.5) * 2, y: (event.clientY / innerHeight - 0.5) * 2 }; };
  const copyEmail = async () => { try { await navigator.clipboard.writeText(email); setCopied(true); } catch { location.href = `mailto:${email}`; } };
  const resetScene = () => { setExploded(false); scene.current.pointer = { x: 0, y: 0 }; };
  const selected = detail === null ? null : projects[detail];
  return <main ref={root} className={`portfolio ${paused ? "motion-paused" : ""} ${reduced ? "reduced-motion" : ""}`} onPointerMove={pointer}>
    <a className="skip-link" href="#work">Skip to selected projects</a>
    <World state={scene}/><div className="vignette" aria-hidden="true"/><div className="grain" aria-hidden="true"/>
    <header className="site-header"><a href="#home" className="brand" aria-label="A R Rajeev Chandar home"><span>A R RAJEEV<br/>CHANDAR<span className="brand-star">✳</span></span></a><span className="header-center">ENGINEERING WITH INTENT<span>BENGALURU / INDIA</span></span><div className="header-actions"><button className="resume-button magnetic" onClick={() => setResumeOpen(true)} onPointerMove={magnet} onPointerLeave={resetMagnet}>RÉSUMÉ</button><button className="menu-button" aria-label="Open navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(true)}><span className="menu-strokes" aria-hidden="true"><i/><i/><i/></span></button></div></header>
    <aside className="journey-rail" aria-label="Current chapter"><span className="rail-number">0{Math.min(chapter + 1, 7)}</span><span className="rail-line"/><span className="rail-name">{chapterNames[chapter]}</span></aside>
    <PhoneScrollRail/><div className="persistent-controls"><button onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Resume motion" : "Pause motion"}>{paused || reduced ? <Play size={13}/> : <Pause size={13}/>}<span>{reduced ? "REDUCED MOTION" : paused ? "MOTION PAUSED" : "MOTION ON"}</span></button><span className="page-progress"><b className="progress-number">00</b> / 100</span></div>
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
    <div className="project-worlds">{projects.map((project, i) => <ProjectStory key={project.id} project={project} index={i} step={steps[i]} onStep={step => jumpStep(i, step)} onDetails={() => setDetail(i)}/>)}</div>
    <section id="experience" className="journey" data-chapter="6"><PhoneJourney still={paused || reduced}/><div className="journey-sticky"><div className="section-eyebrow"><span>03 / ALWAYS IN PROGRESS</span><span>THE JOURNEY SO FAR</span></div><div className="journey-heading"><h2>KEEP LEARNING.<br/><em>KEEP BUILDING.</em></h2><p>Each chapter adds another<br/>way of looking at a problem.</p></div><div className="journey-track">{[
      { year: "2022", tag: "THE FOUNDATION", name: "Beginning the BCA.", text: "Started the Bachelor of Computer Applications program at Jain University.", footer: "JAIN UNIVERSITY" },
      { year: "2025", tag: "THE FOUNDATION, DEEPER", name: "BCA. Strong foundations.", text: "Completed a Bachelor of Computer Applications at Jain University with a CGPA of 9.230 / 10.0.", footer: "JAIN UNIVERSITY · 2022–2025" },
      { year: "2025", tag: "THE NEXT CHAPTER", name: "MCA at CHRIST", text: "Began the 2025–27 MCA program. Volunteered at Gateways, a national-level inter-collegiate IT fest.", footer: "CHRIST UNIVERSITY · BENGALURU" },
      { year: "2026", tag: "A MOMENT OF RECOGNITION", name: "SHELLS’26 winner", text: "Overall winner at the national-level inter-collegiate tech fest hosted by Kristu Jayanti University.", footer: "FEBRUARY 2026" },
      { year: "2026", tag: "ENGINEERING IN PRACTICE", name: "Inside Adobe", text: "Technical Consultant Intern. Completed UI enablement training, explored EDS architecture, and built a responsive e-commerce capstone.", footer: "APRIL–JUNE 2026 · BENGALURU" },
    ].map((item, i) => <article className="journey-card" key={item.name}><div className="journey-year">{item.year}<span>0{i + 1}</span></div><span className="micro">{item.tag}</span><h3>{item.name}</h3><p>{item.text}</p><div className="journey-card-footer">{item.footer}<ArrowUpRight size={18}/></div></article>)}</div><div className="timeline-line"><span/></div></div></section>
    <section id="toolkit" className="toolkit section-space"><div className="section-eyebrow"><span>04 / THE TOOLKIT</span><span>FROM FIRST PIXEL TO FINAL REQUEST</span></div><div className="toolkit-top"><h2 className="reveal">THINK ACROSS<br/><em>THE STACK.</em></h2><p>Tools change. Understanding<br/>how the pieces fit together stays.</p></div><Tabs defaultValue="interfaces" className="stack-tabs"><TabsList aria-label="Explore technical skills"><TabsTrigger value="interfaces">Interfaces</TabsTrigger><TabsTrigger value="engineering">Engineering</TabsTrigger><TabsTrigger value="data">Data & delivery</TabsTrigger><TabsTrigger value="foundations">Foundations</TabsTrigger></TabsList>{[
      { id: "interfaces", intro: "Where the system meets the person.", tools: ["React.js", "Next.js", "Flutter", "Tailwind CSS", "Adobe EDS"], used: "Applied in Solenne, CortexEdu, DoChain, AI Fitness, and the Adobe internship capstone." },
      { id: "engineering", intro: "The logic behind the experience.", tools: ["TypeScript", "JavaScript", "Python", "Go", "Java", "C / C++", "Node.js", "Express.js"], used: "From application development to asynchronous analysis workers and API integration." },
      { id: "data", intro: "A connected system needs solid foundations.", tools: ["MongoDB", "MySQL", "Firebase", "SQL", "Docker", "Git", "GitHub"], used: "Data management, live updates, version control, and reproducible environments." },
      { id: "foundations", intro: "Understand the problem before the implementation.", tools: ["Data structures", "Algorithms", "Object-oriented design", "Database systems", "Microservices", "Problem solving"], used: "Grounded in academic study, technical training, hands-on projects, and team collaboration." },
    ].map(group => <TabsContent key={group.id} value={group.id}><div className="stack-content"><div><span className="micro">HOW I THINK ABOUT IT</span><h3>{group.intro}</h3><p>{group.used}</p></div><div className="stack-tools">{group.tools.map((tool, i) => <div key={tool}><span>{String(i + 1).padStart(2, "0")}</span><strong>{tool}</strong></div>)}</div></div></TabsContent>)}</Tabs><div className="training-strip"><span className="micro">CONTINUING THE LEARNING</span><span>React.js Essential Training <small>2024</small></span><span>Python for Data Visualization <small>2023</small></span><span>Functional Programming with Java <small>2023</small></span></div></section>
    <footer id="contact" className="contact section-space"><div className="section-eyebrow"><span>05 / THE NEXT THING WE BUILD</span><a href="#home">BACK TO THE START <ArrowUpRight size={14}/></a></div><div className="contact-prelude"><span className="contact-star">✳</span><p>A challenging problem.<br/>A thoughtful team.<br/><strong>A good place to start.</strong></p></div><a className="contact-big" href={`mailto:${email}`}>LET’S MAKE<br/><span>IT HAPPEN.</span><ArrowUpRight/></a><div className="contact-bottom"><div><span className="micro">HAVE A ROLE OR PROJECT IN MIND?</span><a className="email-address" href={`mailto:${email}`}>{email}</a><button className="copy-email" onClick={copyEmail} aria-live="polite">{copied ? <><Check size={14}/>Email copied</> : <>Copy email <Plus size={14}/></>}</button></div><div className="contact-socials"><a href="https://www.linkedin.com/in/a-r-rajeev-chandar-442141264/" target="_blank" rel="noreferrer">LinkedIn<ArrowUpRight size={20}/></a><a href="/Rajeev-Chandar-Resume.pdf" download>Download résumé<Download size={18}/></a></div></div><div className="footer-meta"><span>© 2026 A R RAJEEV CHANDAR</span><span>BENGALURU, INDIA</span><span>CURIOUS BY NATURE. ENGINEER BY CRAFT.</span></div></footer>
    <ChapterNavigation open={menuOpen} onOpenChange={setMenuOpen} still={paused || reduced}/>
    <ResumeViewer open={resumeOpen} onOpenChange={setResumeOpen} still={paused || reduced}/>
    <Dialog open={detail !== null} onOpenChange={open => { if (!open) setDetail(null); }}><DialogContent className="case-dialog" showCloseButton={false}>{selected && <><div className="case-header"><span className="micro">PROJECT {selected.number} / ENGINEERING NOTES</span><button aria-label="Close project details" onClick={() => setDetail(null)}><X/></button></div><DialogTitle style={{ color: selected.color }}>{selected.name}</DialogTitle><DialogDescription>{selected.intro}</DialogDescription><div className="case-meta"><span>{selected.category}</span><span>{selected.date}</span></div><div className="case-section"><span>01 / THE CHALLENGE</span><p>{selected.challenge}</p></div><div className="case-section"><span>02 / THE APPROACH</span><p>{selected.approach}</p></div><div className="case-section"><span>03 / ENGINEERING DECISIONS</span><div className="case-decisions">{selected.decisions.map(([title, text], i) => <article key={title}><b>0{i + 1}</b><div><h3>{title}</h3><p>{text}</p></div></article>)}</div></div><div className="case-section"><span>04 / BUILT WITH</span><div className="case-stack">{selected.stack.map(tool => <span key={tool}>{tool}</span>)}</div></div><p className="case-note">{selected.note}</p><a className="underlined-link" href={`mailto:${email}?subject=${encodeURIComponent(`Let's discuss ${selected.name}`)}`}>Let’s talk about this project<ArrowUpRight size={17}/></a></>}</DialogContent></Dialog>
  </main>;
}
