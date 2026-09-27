"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

const chapters = [
  ["home", "Introduction", "The human behind the code", "01"],
  ["about", "Mindset", "Understand. Connect. Build.", "02"],
  ["work", "Selected work", "Four ideas, made tangible", "03"],
  ["experience", "Experience", "The journey so far", "04"],
  ["toolkit", "Toolkit", "From interface to infrastructure", "05"],
  ["contact", "Let’s talk", "The next thing we build", "06"],
];

function ChapterStage({ close }: { close: () => void }) {
  const [active, setActive] = useState(2);
  const stage = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const trigger = document.querySelector(".menu-button")?.getBoundingClientRect();
    if (trigger && stage.current) {
      stage.current.style.setProperty("--menu-x", `${trigger.left + trigger.width / 2}px`);
      stage.current.style.setProperty("--menu-y", `${trigger.top + trigger.height / 2}px`);
    }
  }, []);
  return <div className="chapter-canvas" ref={stage}>
    <header className="theatre-header">
      <div><span className="cinema-eyebrow">A R RAJEEV CHANDAR</span><DialogTitle>Choose your chapter<span>.</span></DialogTitle></div>
      <button className="cinema-close" aria-label="Close navigation" onClick={close}><span>Close</span><X size={22}/></button>
    </header>
    <DialogDescription className="sr-only">Six chapters: the thinking, the work, and the person behind it.</DialogDescription>
    <nav className="chapter-rail" aria-label="Full site navigation" onPointerLeave={() => setActive(2)}>
      {chapters.map(([id, title, caption, number], i) => <a
        href={`#${id}`} key={id} className="chapter-door" data-active={active === i}
        style={{ "--door": i, "--weight": active === i ? 2.2 : 1 } as CSSProperties}
        onPointerEnter={event => { if (event.pointerType === "mouse") setActive(i); }}
        onFocus={() => setActive(i)}
        onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) close(); }}
      >
        <div className="chapter-door-face">
          <span className="door-rule" aria-hidden="true"/>
          <span className="door-number">{number}</span><ArrowUpRight className="door-arrow" size={24}/>
          <div className="door-aperture" aria-hidden="true"><i/><i/><i/><span>{number}</span></div>
          <div className="door-type"><strong>{title}</strong><span>{caption}</span></div>
          <span className="door-enter" aria-hidden="true">ENTER CHAPTER <ArrowUpRight size={14}/></span>
        </div>
      </a>)}
    </nav>
    <footer className="theatre-footer"><span>BENGALURU / INDIA</span><span>ENGINEERING WITH INTENT</span><span><b>{chapters[active][3]}</b> / 06</span></footer>
  </div>;
}

export default function ChapterNavigation({ open, onOpenChange, still = false }: { open: boolean; onOpenChange: (open: boolean) => void; still?: boolean }) {
  const changeOpen = (value: boolean) => {
    if (!value) {
      const canvas = document.querySelector<HTMLElement>(".chapter-canvas");
      if (canvas) canvas.style.setProperty("--iris-start", getComputedStyle(canvas).clipPath);
      document.querySelectorAll<HTMLElement>(".chapter-door-face").forEach(face => {
        face.style.setProperty("--door-exit-start", getComputedStyle(face).transform);
        face.style.setProperty("--door-exit-opacity", getComputedStyle(face).opacity);
      });
    }
    onOpenChange(value);
  };
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent className="chapter-theatre top-0 left-0 translate-x-0 translate-y-0" data-still={still} showCloseButton={false}
    onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".menu-button")?.focus({ preventScroll: true }); }}>
    <ChapterStage close={() => changeOpen(false)}/>
  </DialogContent></Dialog>;
}
