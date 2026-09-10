import { SlideShell } from "@/components/wrapped/slides/SlideShell";
import type { RhythmSlideData } from "@/lib/wrapped/types";

const DAY_LABELS_ES: Record<string, string> = {
  Monday: "lunes",
  Tuesday: "martes",
  Wednesday: "miércoles",
  Thursday: "jueves",
  Friday: "viernes",
  Saturday: "sábado",
  Sunday: "domingo"
};

export function RhythmSlide({ data }: { data: RhythmSlideData }) {
  const hourLabel = data.mostActiveHour !== null ? `${data.mostActiveHour}:00` : null;
  const dayLabel = data.mostActiveDay ? DAY_LABELS_ES[data.mostActiveDay] : null;

  return (
    <SlideShell kind="rhythm">
      <p className="text-lg text-neutral-300">Tu momento más productivo</p>
      <p className="font-display text-5xl font-bold text-wrapped-amber sm:text-6xl">
        {hourLabel && dayLabel
          ? `${dayLabel}, ${hourLabel}`
          : hourLabel ?? dayLabel ?? "Sin un patrón claro todavía"}
      </p>
      {data.narrative && (
        <p className="max-w-sm text-lg leading-relaxed text-neutral-200">{data.narrative}</p>
      )}
    </SlideShell>
  );
}
