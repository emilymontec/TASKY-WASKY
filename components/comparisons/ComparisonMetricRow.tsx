interface ComparisonMetricRowProps {
  label: string;
  valueA: string | number;
  valueB: string | number;
  higherIsA?: boolean | null;
}

export function ComparisonMetricRow({ label, valueA, valueB, higherIsA }: ComparisonMetricRowProps) {
  return (
    <div className="grid grid-cols-3 items-center gap-4 border-b border-wrapped-border py-3 last:border-0">
      <span
        className={`text-right font-display text-xl tabular-nums ${
          higherIsA === true ? "text-wrapped-accent" : "text-neutral-300"
        }`}
      >
        {valueA}
      </span>
      <span className="text-center text-xs uppercase tracking-wide text-neutral-500">{label}</span>
      <span
        className={`text-left font-display text-xl tabular-nums ${
          higherIsA === false ? "text-wrapped-accent" : "text-neutral-300"
        }`}
      >
        {valueB}
      </span>
    </div>
  );
}
