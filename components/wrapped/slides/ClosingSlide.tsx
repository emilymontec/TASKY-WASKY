import { SlideShell } from "@/components/wrapped/slides/SlideShell";
import type { ClosingSlideData } from "@/lib/wrapped/types";

export function ClosingSlide({ data }: { data: ClosingSlideData }) {
  return (
    <SlideShell kind="closing">
      <p className="text-sm uppercase tracking-[0.2em] text-neutral-500">Eso fue {data.year}</p>
      <p className="max-w-sm text-2xl font-medium text-white">
        {data.totalCommits.toLocaleString("es")} commits
        {data.topLanguage ? <> escritos, sobre todo, en {data.topLanguage}</> : null}.
      </p>
      <p className="text-neutral-400">Nos vemos el próximo año.</p>
    </SlideShell>
  );
}
