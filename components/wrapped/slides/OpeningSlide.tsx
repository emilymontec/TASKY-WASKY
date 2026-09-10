import { SlideShell } from "@/components/wrapped/slides/SlideShell";
import type { OpeningSlideData } from "@/lib/wrapped/types";

export function OpeningSlide({ data }: { data: OpeningSlideData }) {
  return (
    <SlideShell kind="opening">
      <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">GitHub Wrapped</p>
      <h1 className="font-display text-5xl font-bold text-white sm:text-6xl">{data.year}</h1>
      <p className="max-w-sm text-lg text-neutral-300">
        {data.username}, esto es lo que hiciste este año, commit a commit.
      </p>
    </SlideShell>
  );
}
