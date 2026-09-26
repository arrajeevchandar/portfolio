"use client";
import { useState, type CSSProperties } from "react";
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

export default function ChapterNavigation({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [active, setActive] = useState(0);
  return <Dialog open={open} onOpenChange={onOpenChange}><DialogContent className="chapter-map" showCloseButton={false}>
    <header className="map-header"><div><span className="micro">A R RAJEEV CHANDAR / INDEX</span><DialogTitle>Where to next<span>?</span></DialogTitle></div><button aria-label="Close navigation" onClick={() => onOpenChange(false)}><X/></button></header>
    <DialogDescription className="map-description">Explore the thinking, the work, and the person behind it.</DialogDescription>
    <nav className="chapter-grid" aria-label="Full site navigation">{chapters.map(([id, title, caption, n], i) => <a href={`#${id}`} key={id} data-scene={id} data-active={active === i} style={{ "--tile": i } as CSSProperties} onPointerEnter={() => setActive(i)} onFocus={() => setActive(i)} onClick={() => onOpenChange(false)}>
      <span className="tile-number">{n}</span><span className="chapter-symbol" aria-hidden="true"><i/><i/><i/><i/></span><ArrowUpRight className="tile-arrow" size={20}/><div className="tile-caption"><strong>{title}</strong><span>{caption}</span></div><span className="tile-border" aria-hidden="true"/>
    </a>)}</nav>
    <footer className="map-footer"><span>BENGALURU / INDIA</span><span><b>{chapters[active][3]}</b> / EXPLORE YOUR CHAPTER</span></footer>
  </DialogContent></Dialog>;
}
