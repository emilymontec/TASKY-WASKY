import { SlideShell } from "@/components/wrapped/slides/SlideShell";
import type { StreakSlideData } from "@/lib/wrapped/types";

export function StreakSlide({ data }: { data: StreakSlideData }) {
  return (
    <SlideShell kind="streak">
      <p className="text-lg text-neutral-300">Tu racha más larga</p>
      <p className="font-display text-7xl font-bold tabular-nums text-wrapped-amber sm:text-8xl">
        {data.longestStreak}
      </p>
      <p className="text-lg text-neutral-300">
        día{data.longestStreak === 1 ? "" : "s"} seguidos programando
      </p>
      {data.narrative && (
        <p className="max-w-sm text-lg leading-relaxed text-neutral-200">{data.narrative}</p>
      )}
    </SlideShell>
  );
}
