import Link from "next/link";
import type { DeveloperActivityScore } from "@/lib/analytics/score";

const DIMENSION_LABELS: Record<keyof DeveloperActivityScore["breakdown"], string> = {
  consistency: "Consistencia",
  volume: "Volumen",
  streak: "Rachas",
  diversity: "Diversidad"
};

export function ScoreCard({ score }: { score: DeveloperActivityScore }) {
  return (
    <div className="rounded-xl border border-wrapped-border bg-wrapped-card p-6">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-sm text-neutral-400">Developer Activity Score</p>
          <p className="font-display text-4xl font-semibold tabular-nums text-wrapped-accent">
            {score.score}
          </p>
        </div>
        <Link href="/score" className="text-xs text-neutral-500 underline hover:text-neutral-300">
          Cómo se calcula
        </Link>
      </div>

      <div className="flex flex-col gap-2">
        {(Object.keys(score.breakdown) as (keyof typeof score.breakdown)[]).map((key) => (
          <div key={key} className="flex items-center gap-3">
            <span className="w-24 shrink-0 text-xs text-neutral-400">{DIMENSION_LABELS[key]}</span>
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-wrapped-accent"
                style={{ width: `${score.breakdown[key]}%` }}
              />
            </div>
            <span className="w-8 shrink-0 text-right text-xs tabular-nums text-neutral-400">
              {score.breakdown[key]}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
