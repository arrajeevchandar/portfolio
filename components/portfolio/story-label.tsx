import type { ReactNode } from "react";

export function StoryLabel({ values, step }: { values: readonly ReactNode[]; step: number }) {
  const sharedOpening = values.length === 3 && values[0] === values[1];
  return <span className="story-label">
    {values.map((value, index) => sharedOpening && index === 1 ? null : (
      <span key={index} data-story-slot={sharedOpening && index === 0 ? "0-1" : index}
        aria-hidden={index !== step && !(sharedOpening && index === 0 && step === 1)}>{value}</span>
    ))}
  </span>;
}
