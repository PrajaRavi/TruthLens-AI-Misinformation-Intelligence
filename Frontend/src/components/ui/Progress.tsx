import { cn } from "@/lib/utils";

interface ProgressProps {
  value: number; // 0-100
  className?: string;
  indicatorClassName?: string;
  colorVar?: string;
}

export function Progress({
  value,
  className,
  indicatorClassName,
  colorVar,
}: ProgressProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cn(
        "h-2 w-full overflow-hidden rounded-full bg-surface-2",
        className
      )}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={cn(
          "h-full rounded-full bg-primary transition-all duration-500 ease-out",
          indicatorClassName
        )}
        style={{
          width: `${clamped}%`,
          ...(colorVar ? { backgroundColor: `hsl(var(${colorVar}))` } : {}),
        }}
      />
    </div>
  );
}
