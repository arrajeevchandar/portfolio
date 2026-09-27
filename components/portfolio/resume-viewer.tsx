"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Download, Minus, Plus, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import pages from "./resume-pages.json";

function ResumeDocument({ close, still }: { close: () => void; still: boolean }) {
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const stage = useRef<HTMLDivElement>(null);
  const space = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const element = space.current;
    if (!element) return;
    const fit = () => {
      const width = Math.max(1, Math.min(element.clientWidth - 40, (element.clientHeight - 40) * 595 / 842));
      setFitWidth(width);
      const trigger = document.querySelector(".resume-button")?.getBoundingClientRect();
      const rect = element.getBoundingClientRect();
      if (trigger && stage.current) {
        stage.current.style.setProperty("--paper-origin-x", `${trigger.left + trigger.width / 2 - (rect.left + rect.width / 2)}px`);
        stage.current.style.setProperty("--paper-origin-y", `${trigger.top + trigger.height / 2 - (rect.top + rect.height / 2)}px`);
      }
    };
    fit();
    const observer = new ResizeObserver(fit);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);
  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (still || zoom !== 1 || event.pointerType !== "mouse" || !sheet.current) return;
    const r = event.currentTarget.getBoundingClientRect();
    sheet.current.style.setProperty("--paper-ry", `${(event.clientX - r.left - r.width / 2) / r.width * 3}deg`);
    sheet.current.style.setProperty("--paper-rx", `${-(event.clientY - r.top - r.height / 2) / r.height * 3}deg`);
  };
  const resetTilt = () => { sheet.current?.style.setProperty("--paper-ry", "0deg"); sheet.current?.style.setProperty("--paper-rx", "0deg"); };
  const changeZoom = (value: number) => { resetTilt(); setZoom(value); if (value === 1) space.current?.scrollTo({ top: 0, left: 0, behavior: "instant" }); };
  return <div className="folio-scene" ref={stage} data-ready={fitWidth > 0 && imageReady} data-zoomed={zoom > 1}>
    <header className="folio-toolbar">
      <div><span className="cinema-eyebrow">THE PROFILE / ORIGINAL DOCUMENT</span><DialogTitle>A R Rajeev Chandar</DialogTitle></div>
      <div className="folio-actions"><a href="/Rajeev-Chandar-Resume.pdf" download aria-label="Download résumé PDF"><Download size={18}/><span>Download PDF</span></a><button className="cinema-close" onClick={close} aria-label="Close résumé"><X size={22}/></button></div>
    </header>
    <DialogDescription className="sr-only">The original résumé unfolds into a full page. Fit the page to your screen, zoom in to read, or download the PDF.</DialogDescription>
    <div className="folio-reading-space" ref={space} tabIndex={0} aria-label="Résumé document. Complete page fits the screen. Use zoom to read more closely.">
      <div className="folio-centering"><div className="folio-arrival" style={{ width: fitWidth * zoom || undefined }}>
        <div ref={sheet} className="folio-interaction" onPointerMove={tilt} onPointerLeave={resetTilt}>
          {pages.map((page, index) => <figure key={page.image} className="folio-paper" style={{ "--paper-image": `url(${page.image})` } as CSSProperties}>
            <img className="folio-original" src={page.image} onLoad={() => setImageReady(true)} onError={() => setImageReady(true)} alt={`Original résumé, page ${index + 1}. Full text follows for screen readers.`}/>
            <div className="folio-folds" aria-hidden="true">
              <div className="folio-leaf leaf-middle"><span className="leaf-front"/></div>
              <div className="folio-leaf leaf-bottom"><span className="leaf-front"/><span className="leaf-back"><span>EXPERIENCE / EDUCATION / SELECTED WORK</span></span></div>
              <div className="folio-leaf leaf-top"><span className="leaf-front"/><span className="leaf-back"><b>A R RAJEEV<br/>CHANDAR</b><span>CURRICULUM VITAE</span></span></div>
            </div>
            <figcaption className="sr-only">{page.text}</figcaption>
          </figure>)}
        </div>
      </div></div>
    </div>
    <footer className="folio-footer"><span>{pages.length.toString().padStart(2, "0")} / {pages.length.toString().padStart(2, "0")} <i/> RÉSUMÉ</span><div className="folio-zoom"><button aria-label="Zoom out résumé" disabled={zoom <= 1} onClick={() => changeZoom(Math.max(1, zoom - .5))}><Minus size={17}/></button><button aria-label="Fit entire résumé to screen" onClick={() => changeZoom(1)}><Maximize2 size={15}/><span>{zoom === 1 ? "Fit page" : `${Math.round(zoom * 100)}%`}</span></button><button aria-label="Zoom in résumé" disabled={zoom >= 3} onClick={() => changeZoom(Math.min(3, zoom + .5))}><Plus size={17}/></button></div><span className="folio-footer-note">A CLOSER LOOK AT THE WORK</span></footer>
  </div>;
}

export default function ResumeViewer({ open, onOpenChange, still = false }: { open: boolean; onOpenChange: (open: boolean) => void; still?: boolean }) {
  const changeOpen = (value: boolean) => {
    if (!value) {
      const stage = document.querySelector<HTMLElement>(".folio-scene");
      [[".folio-arrival", "--return-start"], [".leaf-top", "--top-start"], [".leaf-bottom", "--bottom-start"]].forEach(([selector, variable]) => {
        const element = stage?.querySelector(selector);
        if (element) stage?.style.setProperty(variable, getComputedStyle(element).transform);
      });
    }
    onOpenChange(value);
  };
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent className="folio-dialog" data-still={still} showCloseButton={false}
    onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".resume-button")?.focus({ preventScroll: true }); }}>
    <ResumeDocument close={() => changeOpen(false)} still={still}/>
  </DialogContent></Dialog>;
}
