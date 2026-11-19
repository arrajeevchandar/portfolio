const clamp = (value: number) => Math.max(0, Math.min(1, value));

type StoryRegion = {
  section: HTMLElement;
  top: number;
  start: number;
  end: number;
  pinned: boolean;
};

export type StoryPosition = { section: HTMLElement; progress: number; pinned: boolean };

export function measureStory(section: HTMLElement, y: number, viewportHeight: number): StoryRegion {
  const top = section.getBoundingClientRect().top + y;
  const stage = Array.from(section.querySelectorAll<HTMLElement>(
    ":scope > :is(.opening-sticky,.mindset-sticky,.project-sticky,.journey-sticky,.phone-journey)",
  )).find(element => element.offsetHeight > 0);
  const pinned = !!stage && getComputedStyle(stage).position === "sticky";
  const prelude = section.querySelector<HTMLElement>(".project-mobile-prelude");
  const start = top + (pinned ? prelude?.offsetHeight ?? 0 : 0);
  const end = Math.max(start, top + section.offsetHeight - (pinned ? stage.offsetHeight : viewportHeight));
  return { section, top, start, end, pinned };
}

export function captureStory(regions: StoryRegion[], y: number, viewportHeight: number): StoryPosition | undefined {
  // Once the next heading is in the reading area, it owns the position.
  const region = regions.findLast(item => item.top <= y + viewportHeight * .3) ?? regions[0];
  if (!region) return;
  return {
    section: region.section,
    progress: clamp((y - region.start) / Math.max(1, region.end - region.start)),
    pinned: region.pinned,
  };
}

export function restoreStory(position: StoryPosition) {
  const region = measureStory(position.section, window.scrollY, window.innerHeight);
  let progress = position.progress;
  if (region.pinned && !position.pinned) {
    const buttons = Array.from(position.section.querySelectorAll(".chapter-controls button"));
    const step = buttons.findIndex(button => button.getAttribute("aria-current") === "step");
    if (step >= 0) progress = (step + .5) / buttons.length;
  }
  // In the stacked project layout the last selected beat still owns the copy.
  if (!region.pinned && position.pinned && position.section.matches(".project-story")) progress = 0;
  const headerInset = !region.pinned && progress === 0
    ? parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0
    : 0;
  window.scrollTo({ top: region.start + (region.end - region.start) * progress - headerInset, behavior: "instant" });
}

export function getStoryLayout() {
  return innerWidth <= 600
    ? innerHeight >= 500 ? "phone" : "short-phone"
    : innerWidth <= 900 && innerHeight < 600 ? "short-desktop" : "desktop";
}
