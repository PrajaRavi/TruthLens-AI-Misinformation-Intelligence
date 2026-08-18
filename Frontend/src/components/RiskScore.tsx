import { RISK_CONFIG, riskLevelFromScore } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { RiskLevel } from "@/types";

interface RiskScoreProps {
  score: number; // 0-100
  size?: number;
  level?: RiskLevel;
  showLabel?: boolean;
  className?: string;
}

export function RiskScore({
  score,
  size = 180,
  level,
  showLabel = true,
  className,
}: RiskScoreProps) {
  const resolvedLevel = level ?? riskLevelFromScore(score);
  const cfg = RISK_CONFIG[resolvedLevel];
  const stroke = 12;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = `hsl(var(${cfg.colorVar}))`;

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`Misinformation risk score ${score} out of 100, ${cfg.label}`}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          className="stroke-surface-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          stroke={color}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span
          className="text-4xl font-bold tabular-nums"
          style={{ color }}
        >
          {score}
        </span>
        <span className="text-xs font-medium text-muted-2">/ 100</span>
        {showLabel && (
          <span
            className="mt-1 text-xs font-semibold uppercase tracking-wide"
            style={{ color }}
          >
            {cfg.label}
          </span>
        )}
      </div>
    </div>
  );
}
