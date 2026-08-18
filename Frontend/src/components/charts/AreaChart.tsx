import { useId } from "react";
import type { ActivityPoint } from "@/types";
import { formatDate } from "@/lib/utils";

interface AreaChartProps {
  data: ActivityPoint[];
  height?: number;
}

export function AreaChart({ data, height = 220 }: AreaChartProps) {
  const gradientId = useId();
  const width = 720;
  const pad = { top: 16, right: 12, bottom: 26, left: 30 };
  const innerW = width - pad.left - pad.right;
  const innerH = height - pad.top - pad.bottom;

  const max = Math.max(...data.map((d) => d.analyses), 10);
  const stepX = innerW / (data.length - 1);

  const points = data.map((d, i) => ({
    x: pad.left + i * stepX,
    y: pad.top + innerH - (d.analyses / max) * innerH,
    d,
  }));

  const linePath = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L ${points[points.length - 1].x.toFixed(
    1
  )} ${pad.top + innerH} L ${pad.left} ${pad.top + innerH} Z`;

  const gridLines = 4;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      className="w-full"
      preserveAspectRatio="none"
      role="img"
      aria-label="Analysis activity over the last 30 days"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.28" />
          <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
        </linearGradient>
      </defs>

      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const y = pad.top + (innerH / gridLines) * i;
        const val = Math.round(max - (max / gridLines) * i);
        return (
          <g key={i}>
            <line
              x1={pad.left}
              y1={y}
              x2={width - pad.right}
              y2={y}
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              x={pad.left - 6}
              y={y + 3}
              textAnchor="end"
              className="fill-muted-2"
              fontSize={10}
            >
              {val}
            </text>
          </g>
        );
      })}

      <path d={areaPath} fill={`url(#${gradientId})`} />
      <path
        d={linePath}
        fill="none"
        stroke="hsl(var(--primary))"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {points.map((p, i) =>
        i % 5 === 0 ? (
          <text
            key={i}
            x={p.x}
            y={height - 8}
            textAnchor="middle"
            className="fill-muted-2"
            fontSize={10}
          >
            {formatDate(p.d.date).replace(/,.*/, "")}
          </text>
        ) : null
      )}
    </svg>
  );
}
