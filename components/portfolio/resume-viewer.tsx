"use client";
import { useEffect, useRef, useState, type CSSProperties } from "react";
import { Download, Minus, Plus, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import pages from "./resume-pages.json";

export default function ResumeViewer({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(500);
  const space = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const frame = requestAnimationFrame(() => {
      const element = space.current;
      if (!element) return;
      const fit = () => setFitWidth(Math.max(1, Math.min(element.clientWidth - 32, (element.clientHeight - 32) * 595 / 842)));
      fit();
      const observer = new ResizeObserver(fit);
      observer.observe(element);
      cleanup = () => observer.disconnect();
    });
    let cleanup = () => {};
    return () => { cancelAnimationFrame(frame); cleanup(); };
  }, [open]);
  return <Dialog open={open} onOpenChange={value => { onOpenChange(value); if (!value) setZoom(1); }}>
    <DialogContent className="resume-dialog" showCloseButton={false}>
      <header className="resume-toolbar"><div><span className="micro">THE PROFILE / 01</span><DialogTitle>A R Rajeev Chandar</DialogTitle></div><div className="resume-tools"><a href="/Rajeev-Chandar-Resume.pdf" download aria-label="Download résumé PDF"><Download size={18}/><span>Download PDF</span></a><button onClick={() => onOpenChange(false)} aria-label="Close résumé"><X size={22}/></button></div></header>
      <DialogDescription className="resume-description">Experience, projects, and the foundations behind the work.</DialogDescription>
      <div ref={space} className="resume-paper-space" tabIndex={0} aria-label="Résumé document. The complete page fits the screen. Use zoom to read more closely.">
        <div className="resume-paper-stack" style={{ width: fitWidth * zoom }}>{pages.map((page, index) => <figure className="resume-paper" key={page.image} style={{ "--paper-image": `url(${page.image})` } as CSSProperties}>
          <div className="paper-folds" aria-hidden="true"><span/><span/><span/></div>
          <img src={page.image} alt={`Original résumé, page ${index + 1}. Full text follows for screen readers.`}/><i className="paper-corner" aria-hidden="true"/><figcaption className="sr-only">{page.text}</figcaption></figure>)}</div>
      </div>
      <footer className="resume-viewer-footer"><span>{pages.length} PAGE · ORIGINAL DOCUMENT</span><div><button aria-label="Zoom out résumé" disabled={zoom <= 1} onClick={() => setZoom(v => Math.max(1, v - .5))}><Minus size={17}/></button><button aria-label="Fit entire résumé to screen" onClick={() => setZoom(1)}><Maximize2 size={15}/><span>{zoom === 1 ? "Fit page" : `${Math.round(zoom * 100)}%`}</span></button><button aria-label="Zoom in résumé" disabled={zoom >= 3} onClick={() => setZoom(v => Math.min(3, v + .5))}><Plus size={17}/></button></div></footer>
    </DialogContent>
  </Dialog>;
}
