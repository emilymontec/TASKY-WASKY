import { SlideShell } from "@/components/wrapped/slides/SlideShell";
import type { VolumeSlideData } from "@/lib/wrapped/types";

export function VolumeSlide({ data }: { data: VolumeSlideData }) {
  return (
    <SlideShell kind="volume">
      <p className="text-lg text-neutral-300">Este año escribiste</p>
      <p className="font-display text-7xl font-bold tabular-nums text-wrapped-accent sm:text-8xl">
        {data.totalCommits.toLocaleString("es")}
      </p>
      <p className="text-lg text-neutral-300">
        commits, repartidos en {data.activeDays} días distintos —{" "}
        {data.averageCommitsPerWeek.toFixed(1)} por semana en promedio.
      </p>
    </SlideShell>
  );
}
