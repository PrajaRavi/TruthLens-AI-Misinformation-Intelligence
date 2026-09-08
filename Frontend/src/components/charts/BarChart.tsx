import { cn } from "@/lib/utils";
import type { Insight } from "@/types";

interface BarChartProps {
  data: Insight[];
  colorVar?: string;
  className?: string;
}

export function BarChart({
  data,
  colorVar = "--primary",
  className,
}: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <ul className={cn("flex flex-col gap-3", className)}>
      {data.map((d) => {
        const pct = (d.value / max) * 100;
        return (
          <li key={d.id} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-sm text-muted">{d.label}</span>
            <div className="h-6 flex-1 overflow-hidden rounded-md bg-surface-2">
              <div
                className="flex h-full items-center justify-end rounded-md px-2 transition-all duration-700"
                style={{
                  width: `${Math.max(pct, 8)}%`,
                  backgroundColor: `hsl(var(${colorVar}) / 0.85)`,
                }}
              >
                <span className="text-[11px] font-semibold text-white tabular-nums">
                  {d.value}
                </span>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
