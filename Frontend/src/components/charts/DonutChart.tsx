interface DonutSegment {
  label: string;
  value: number;
  colorVar: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  size?: number;
  thickness?: number;
  centerLabel?: string;
  centerValue?: string;
}

export function DonutChart({
  segments,
  size = 200,
  thickness = 26,
  centerLabel,
  centerValue,
}: DonutChartProps) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  let cumulative = 0;

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-center sm:gap-8">
      <div
        className="relative shrink-0"
        style={{ width: size, height: size }}
        role="img"
        aria-label="Risk distribution donut chart"
      >
        <svg width={size} height={size} className="-rotate-90">
          {segments.map((s) => {
            const fraction = s.value / total;
            const dash = fraction * circumference;
            const gap = circumference - dash;
            const offset = -cumulative * circumference;
            cumulative += fraction;
            return (
              <circle
                key={s.label}
                cx={size / 2}
                cy={size / 2}
                r={radius}
                fill="none"
                strokeWidth={thickness}
                stroke={`hsl(var(${s.colorVar}))`}
                strokeDasharray={`${dash} ${gap}`}
                strokeDashoffset={offset}
              />
            );
          })}
        </svg>
        {(centerValue || centerLabel) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            {centerValue && (
              <span className="text-2xl font-bold text-foreground tabular-nums">
                {centerValue}
              </span>
            )}
            {centerLabel && (
              <span className="text-xs text-muted">{centerLabel}</span>
            )}
          </div>
        )}
      </div>
      <ul className="grid w-full grid-cols-2 gap-3 sm:flex sm:flex-col">
        {segments.map((s) => {
          const pct = Math.round((s.value / total) * 100);
          return (
            <li key={s.label} className="flex items-center gap-2.5">
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-sm"
                style={{ backgroundColor: `hsl(var(${s.colorVar}))` }}
                aria-hidden
              />
              <span className="flex-1 text-sm text-muted">{s.label}</span>
              <span className="text-sm font-semibold text-foreground tabular-nums">
                {s.value}
              </span>
              <span className="w-9 text-right text-xs text-muted-2 tabular-nums">
                {pct}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
