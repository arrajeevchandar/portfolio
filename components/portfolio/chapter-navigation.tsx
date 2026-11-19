"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowUpRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";

import "./chapter-navigation.css";
const chapters = [
  ["home", "Introduction", "The human behind the code", "01"],
  ["about", "Mindset", "Understand. Connect. Build.", "02"],
  ["work", "Selected work", "Four ideas, made tangible", "03"],
  ["experience", "Experience", "The journey so far", "04"],
  ["toolkit", "Toolkit", "From interface to infrastructure", "05"],
  ["contact", "Let’s talk", "The next thing we build", "06"],
];

function navigateGrid(event: KeyboardEvent<HTMLElement>) {
  if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
  const links = Array.from(event.currentTarget.querySelectorAll<HTMLAnchorElement>("a"));
  const index = links.indexOf(event.target as HTMLAnchorElement);
  if (index < 0) return;
  const columns = getComputedStyle(event.currentTarget).gridTemplateColumns.split(" ").length;
  const next: Record<string, number> = {
    ArrowRight: index + 1, ArrowLeft: index - 1,
    ArrowDown: index + columns, ArrowUp: index - columns,
    Home: 0, End: links.length - 1,
  };
  if (!(event.key in next)) return;
  event.preventDefault();
  links[Math.max(0, Math.min(links.length - 1, next[event.key]))].focus();
}
function ChapterStage({ close, visit }: { close: () => void; visit: (id: string) => void }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const [focused, setFocused] = useState<number | null>(null);
  const active = hovered ?? focused;
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
    <nav className="chapter-rail" aria-label="Full site navigation" onKeyDown={navigateGrid} onPointerLeave={event => { if (event.pointerType === "mouse") setHovered(null); }}>
      {chapters.map(([id, title, caption, number], i) => <a
        href={`#${id}`} key={id} className="chapter-door" data-active={active === i}
        style={{ "--door": i, "--weight": active === i ? 2.2 : 1 } as CSSProperties}
        onPointerEnter={event => { if (event.pointerType === "mouse") setHovered(i); }}
        onFocus={() => { setHovered(null); setFocused(i); }}
        onBlur={() => setFocused(null)}
        onClick={event => { if (!event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey) visit(id); }}
      >
        <div className="chapter-door-face">
          <span className="door-rule" aria-hidden="true"/>
          <span className="door-number">{number}</span><ArrowUpRight className="door-arrow" size={24}/>
          <div className="door-aperture" aria-hidden="true"><svg viewBox="0 0 240 160"><path className="chapter-blueprint" pathLength="1" d={["M30 120 L70 40 L110 120 L150 40 L190 120 M50 80 H170", "M30 80 H90 L120 30 L150 80 H210 M90 80 L120 130 L150 80", "M30 30 H95 V95 H30 Z M145 65 H210 V130 H145 Z M95 62 H145 V98", "M25 130 H70 V100 H115 V70 H160 V40 H210", "M40 45 L15 80 L40 115 M200 45 L225 80 L200 115 M140 25 L100 135", "M35 30 H205 V115 H100 L65 145 V115 H35 Z M70 60 H170 M70 85 H140"][i]}/></svg><span>{number}</span></div>
          <div className="door-type"><strong>{title}</strong><span>{caption}</span></div>
          <span className="door-enter" aria-hidden="true">ENTER CHAPTER <ArrowUpRight size={14}/></span>
        </div>
      </a>)}
    </nav>
    <footer className="theatre-footer"><span>BENGALURU / INDIA</span><span><b>{active === null ? "—" : chapters[active][3]}</b> / 06</span></footer>
  </div>;
}

export default function ChapterNavigation({ open, onOpenChange, still = false }: { open: boolean; onOpenChange: (open: boolean) => void; still?: boolean }) {
  const destination = useRef<string | null>(null);
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
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent className="chapter-theatre chapter-directory top-0 left-0 translate-x-0 translate-y-0" data-still={still} showCloseButton={false}
    onOpenAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".chapter-theatre .cinema-close")?.focus({ preventScroll: true }); }}
    onCloseAutoFocus={event => {
      event.preventDefault();
      const section = destination.current ? document.getElementById(destination.current) : null;
      destination.current = null;
      if (section) {
        if (!section.hasAttribute("tabindex")) {
          section.tabIndex = -1;
          section.addEventListener("blur", () => section.removeAttribute("tabindex"), { once: true });
        }
        section.focus({ preventScroll: true });
      } else {
        document.querySelector<HTMLButtonElement>(".menu-button")?.focus({ preventScroll: true });
      }
    }}>
    <ChapterStage close={() => changeOpen(false)} visit={id => { destination.current = id; changeOpen(false); }}/>
  </DialogContent></Dialog>;
}
