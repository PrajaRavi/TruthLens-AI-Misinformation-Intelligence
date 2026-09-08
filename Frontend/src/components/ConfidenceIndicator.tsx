import { cn } from "@/lib/utils";

interface ConfidenceIndicatorProps {
  value: number; // 0-100
  label?: string;
  className?: string;
  showBar?: boolean;
}

export function ConfidenceIndicator({
  value,
  label = "Confidence",
  className,
  showBar = true,
}: ConfidenceIndicatorProps) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium text-muted">{label}</span>
        <span className="font-semibold text-foreground tabular-nums">
          {value}%
        </span>
      </div>
      {showBar && (
        <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${value}%` }}
          />
        </div>
      )}
    </div>
  );
}
