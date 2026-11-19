"use client";
import { useLayoutEffect, useRef, useState, type CSSProperties, type PointerEvent } from "react";
import { Download, Minus, Plus, X, Maximize2 } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import pages from "./resume-pages.json";
import "./resume-reading.css";

function ResumeText({ text }: { text: string }) {
  const paragraphs: { text: string; heading: boolean }[] = [];
  for (const line of text.split(/\r?\n/)) {
    const heading = /^[A-Z &–]+$/.test(line);
    const previous = paragraphs.at(-1);
    const continuation = /^[a-z]/.test(line) || (previous && /[,;]$/.test(previous.text));
    if (previous && !previous.heading && !heading && continuation) previous.text += " " + line;
    else paragraphs.push({ text: line, heading });
  }
  return <article className="folio-transcript">
    {paragraphs.map((item, index) => item.heading
      ? <h3 key={index}>{item.text}</h3>
      : <p key={index}>{item.text}</p>)}
  </article>;
}

function ResumeDocument({ close, still }: { close: () => void; still: boolean }) {
  const [reading, setReading] = useState(false);
  const [failedImage, setFailedImage] = useState(false);
  const textMode = reading || failedImage;
  const [zoom, setZoom] = useState(1);
  const [fitWidth, setFitWidth] = useState(0);
  const [imageReady, setImageReady] = useState(false);
  const [playFlight, setPlayFlight] = useState(true);
  const stage = useRef<HTMLDivElement>(null);
  const space = useRef<HTMLDivElement>(null);
  const zoomSurface = useRef<HTMLDivElement>(null);
  const sheet = useRef<HTMLDivElement>(null);
  const tiltFrame = useRef(0);
  const pointer = useRef({ x: 0, y: 0 });
  const zoomAnchor = useRef<{ x: number; y: number; scale: number } | null>(null);
  const zoomAnimation = useRef<Animation | null>(null);
  useLayoutEffect(() => {
    const element = space.current;
    if (!element) return;
    const holder = element.querySelector<HTMLElement>(".folio-centering");
    const fit = () => {
      const inset = holder ? parseFloat(getComputedStyle(holder).paddingLeft) * 2 : 0;
      const width = Math.max(1, Math.floor(Math.min(element.clientWidth - inset, (element.clientHeight - inset) * 595 / 842)));
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
  }, [textMode]);

  useLayoutEffect(() => {
    const element = space.current;
    const surface = zoomSurface.current;
    const anchor = zoomAnchor.current;
    if (!element || !surface || !anchor) return;
    zoomAnchor.current = null;
    const page = surface.getBoundingClientRect();
    const viewport = element.getBoundingClientRect();
    element.scrollTo({
      left: zoom === 1 ? 0 : element.scrollLeft + (page.left - viewport.left) + page.width * anchor.x - element.clientWidth / 2,
      top: zoom === 1 ? 0 : element.scrollTop + (page.top - viewport.top) + page.height * anchor.y - element.clientHeight / 2,
      behavior: "instant",
    });
    if (!still) {
      const origin = zoom === 1 ? "center" : `${anchor.x * 100}% ${anchor.y * 100}%`;
      zoomAnimation.current = surface.animate([
        { scale: anchor.scale, transformOrigin: origin },
        { scale: 1, transformOrigin: origin },
      ], { duration: 210, easing: "cubic-bezier(.18,.7,.24,1)" });
    }
    return () => zoomAnimation.current?.cancel();
  }, [zoom, still]);

  useLayoutEffect(() => () => cancelAnimationFrame(tiltFrame.current), []);

  const tilt = (event: PointerEvent<HTMLDivElement>) => {
    if (still || zoom !== 1 || event.pointerType !== "mouse" || !sheet.current) return;
    pointer.current = { x: event.clientX, y: event.clientY };
    if (tiltFrame.current) return;
    tiltFrame.current = requestAnimationFrame(() => {
      tiltFrame.current = 0;
      if (!sheet.current || !zoomSurface.current) return;
      const { x, y } = pointer.current;
      const { left, top, width, height } = zoomSurface.current.getBoundingClientRect();
      sheet.current.style.setProperty("--paper-ry", `${(x - left - width / 2) / Math.max(1, width) * 3}deg`);
      sheet.current.style.setProperty("--paper-rx", `${-(y - top - height / 2) / Math.max(1, height) * 3}deg`);
    });
  };
  const resetTilt = () => {
    cancelAnimationFrame(tiltFrame.current);
    tiltFrame.current = 0;
    sheet.current?.style.removeProperty("--paper-ry");
    sheet.current?.style.removeProperty("--paper-rx");
  };
  const changeZoom = (value: number) => {
    if (value === zoom) return;
    const element = space.current;
    const surface = zoomSurface.current;
    if (element && surface) {
      const page = surface.getBoundingClientRect();
      const viewport = element.getBoundingClientRect();
      const withinPage = (offset: number, size: number) => Math.max(0, Math.min(1, offset / Math.max(1, size)));
      zoomAnchor.current = {
        x: zoom === 1 ? .5 : withinPage(viewport.left + element.clientWidth / 2 - page.left, page.width),
        y: zoom === 1 ? .5 : withinPage(viewport.top + element.clientHeight / 2 - page.top, page.height),
        scale: Math.max(.4, page.width / Math.max(1, surface.offsetWidth / zoom * value)),
      };
      zoomAnimation.current?.cancel();
    }
    resetTilt();
    setPlayFlight(false);
    setZoom(value);
  };
  return <div className="folio-scene" ref={stage} data-ready={fitWidth > 0 && imageReady} data-zoomed={zoom > 1} data-reading={textMode} data-flight={playFlight}>
    <header className="folio-toolbar">
      <div><span className="cinema-eyebrow">RÉSUMÉ</span><DialogTitle>A R Rajeev Chandar</DialogTitle></div>
      <div className="folio-actions"><a href="/Rajeev-Chandar-Resume.pdf" download aria-label="Download résumé PDF"><Download size={18}/><span>Download PDF</span></a><button className="cinema-close" onClick={close} aria-label="Close résumé"><X size={22}/></button></div>
    </header>
    <DialogDescription className="sr-only">The original résumé unfolds into a full page. Fit the page to your screen, zoom in to read, or download the PDF.</DialogDescription>
    <div className="folio-reading-space" ref={space} tabIndex={0} aria-label="Résumé document. Complete page fits the screen. Use zoom to read more closely.">
      {textMode ? pages.map(page => <ResumeText key={page.image} text={page.text}/>) :
      <div className="folio-centering"><div className="folio-arrival" style={{ width: fitWidth * zoom || undefined }}><div ref={zoomSurface} className="folio-zoom-surface">
        <div ref={sheet} className="folio-interaction" onPointerMove={tilt} onPointerLeave={resetTilt}>
          {pages.map((page, index) => <figure key={page.image} className="folio-paper" style={{ "--paper-image": `url(${page.image})` } as CSSProperties}>
            <img className="folio-original" src={page.image} onLoad={() => setImageReady(true)} onError={() => setFailedImage(true)} alt={`Original résumé, page ${index + 1}. Full text follows for screen readers.`}/>
            <div className="folio-folds" aria-hidden="true">
              <div className="folio-leaf leaf-middle"><span className="leaf-front"/></div>
              <div className="folio-leaf leaf-bottom"><span className="leaf-front"/><span className="leaf-back"><span>EXPERIENCE / EDUCATION / SELECTED WORK</span></span></div>
              <div className="folio-leaf leaf-top"><span className="leaf-front"/><span className="leaf-back"><b>A R RAJEEV<br/>CHANDAR</b><span>CURRICULUM VITAE</span></span></div>
            </div>
            <figcaption className="sr-only">{page.text}</figcaption>
          </figure>)}
        </div>
      </div></div></div>}
    </div>
    <footer className="folio-footer">
      <button className="folio-mode" disabled={failedImage} aria-pressed={textMode} onClick={() => {
        resetTilt();
        zoomAnimation.current?.cancel();
        zoomAnchor.current = null;
        setZoom(1);
        setPlayFlight(false);
        space.current?.scrollTo({ top: 0, left: 0, behavior: "instant" });
        setReading(!reading);
      }}>{textMode ? (failedImage ? "Text view" : "Show original") : "Read as text"}</button>
      {!textMode && <div className="folio-zoom">
        <button aria-label="Zoom out résumé" disabled={zoom <= 1} onClick={() => changeZoom(Math.max(1, zoom - .5))}><Minus size={17}/></button>
        <button aria-label="Fit entire résumé to screen" onClick={() => changeZoom(1)}><Maximize2 size={15}/><span>{zoom === 1 ? "Fit page" : `${Math.round(zoom * 100)}%`}</span></button>
        <button aria-label="Zoom in résumé" disabled={zoom >= 3} onClick={() => changeZoom(Math.min(3, zoom + .5))}><Plus size={17}/></button>
      </div>}
    </footer>
  </div>;
}

export default function ResumeViewer({ open, onOpenChange, still = false }: { open: boolean; onOpenChange: (open: boolean) => void; still?: boolean }) {
  const dialog = useRef<HTMLDivElement>(null);
  const changeOpen = (value: boolean) => {
    if (!value && !still) {
      const stage = dialog.current?.querySelector<HTMLElement>(".folio-scene");
      if (stage) {
        const coordinates = [
          [".folio-arrival", "--return-start", "transform"],
          [".leaf-top", "--top-start", "transform"],
          [".leaf-bottom", "--bottom-start", "transform"],
          [".folio-original", "--ink-start", "opacity"],
          [".folio-folds", "--folds-start", "opacity"],
        ];
        const values = coordinates.map(([selector, cssVariable, property]) => {
          const element = stage.querySelector(selector);
          return [cssVariable, element ? getComputedStyle(element).getPropertyValue(property) : ""];
        });
        const light = getComputedStyle(stage, "::before").opacity;
        for (const [cssVariable, result] of values) stage.style.setProperty(cssVariable, result);
        stage.style.setProperty("--light-start", light);
      }
    }
    onOpenChange(value);
  };
  return <Dialog open={open} onOpenChange={changeOpen}><DialogContent ref={dialog} className="folio-dialog top-0 left-0 translate-x-0 translate-y-0" data-still={still} showCloseButton={false}
    onOpenAutoFocus={event => { event.preventDefault(); dialog.current?.querySelector<HTMLButtonElement>(".cinema-close")?.focus({ preventScroll: true }); }}
    onCloseAutoFocus={event => { event.preventDefault(); document.querySelector<HTMLButtonElement>(".resume-button")?.focus({ preventScroll: true }); }}>
    <ResumeDocument close={() => changeOpen(false)} still={still}/>
  </DialogContent></Dialog>;
}
