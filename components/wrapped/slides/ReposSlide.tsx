import { SlideShell } from "@/components/wrapped/slides/SlideShell";
import type { ReposSlideData } from "@/lib/wrapped/types";

export function ReposSlide({ data }: { data: ReposSlideData }) {
  return (
    <SlideShell kind="repos">
      <p className="text-lg text-neutral-300">Tu repositorio del año</p>
      <p className="font-display text-4xl font-bold text-emerald-400 sm:text-5xl">
        {data.topRepository ?? "—"}
      </p>
      <p className="text-lg text-neutral-300">
        Tocaste {data.activeRepositories} repositorio{data.activeRepositories === 1 ? "" : "s"} en
        total este año.
      </p>
      {data.narrative && (
        <p className="max-w-sm text-lg leading-relaxed text-neutral-200">{data.narrative}</p>
      )}
    </SlideShell>
  );
}
