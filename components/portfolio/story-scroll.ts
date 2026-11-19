import gsap from "gsap";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";

let activeTravel: gsap.core.Tween | undefined;

export function stopStoryScroll() {
  activeTravel?.kill();
}

export function scrollStoryTo(top: number, still = false) {
  stopStoryScroll();
  gsap.registerPlugin(ScrollToPlugin);
  const destination = gsap.utils.clamp(0, ScrollToPlugin.max(window), top);
  const distance = Math.abs(destination - window.scrollY);

  if (still || distance < 2) {
    window.scrollTo({ top: destination, behavior: "instant" });
    return;
  }

  const input = new AbortController();
  const interrupt = () => stopStoryScroll();
  const cleanup = () => {
    input.abort();
    activeTravel = undefined;
  };

  window.addEventListener("wheel", interrupt, { passive: true, signal: input.signal });
  window.addEventListener("touchstart", interrupt, { passive: true, signal: input.signal });
  window.addEventListener("keydown", event => {
    if (!event.defaultPrevented && ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "].includes(event.key)) interrupt();
  }, { signal: input.signal });
  window.addEventListener("hashchange", interrupt, { signal: input.signal });

  activeTravel = gsap.to(window, {
    scrollTo: { y: destination, autoKill: true },
    duration: gsap.utils.clamp(.28, .72, .24 + distance / (window.innerHeight * 4)),
    ease: "power2.inOut",
    onComplete: cleanup,
    onInterrupt: cleanup,
  });
}
