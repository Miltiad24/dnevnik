type ProgressRingProps = {
  value: number;
  total: number;
};

function ProgressRing({ value, total }: ProgressRingProps) {
  const size = 56;
  const stroke = 4;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total === 0 ? 0 : Math.min(1, value / total);
  const offset = c * (1 - pct);

  return (
    <div className="relative size-14" aria-hidden="true">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          className="text-paper-deep"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={offset}
          className="text-accent transition-[stroke-dashoffset] duration-500 ease-out"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center font-display text-xs font-medium tabular-nums text-ink">
        {total === 0 ? "—" : `${value}/${total}`}
      </span>
    </div>
  );
}

export { ProgressRing };
