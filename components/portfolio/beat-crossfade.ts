import type gsap from "gsap";

/** Overlap each exit and entrance around the same point on the scroll timeline. */
export function addBeatCrossfade(
  timeline: gsap.core.Timeline,
  elements: Iterable<HTMLElement>,
  poses: { enter: gsap.TweenVars; rest: gsap.TweenVars; exit: gsap.TweenVars },
  duration: number,
) {
  const beats = Array.from(elements);
  beats.forEach((element, index) => {
    if (index === 0) return;
    const start = index / beats.length - duration / 2;
    timeline.fromTo(element, poses.enter, { ...poses.rest, duration, ease: "sine.inOut" }, start);
    timeline.to(beats[index - 1], { ...poses.exit, duration, ease: "sine.inOut" }, start);
  });
}
