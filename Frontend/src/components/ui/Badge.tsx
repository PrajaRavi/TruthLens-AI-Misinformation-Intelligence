import { cn } from "@/lib/utils";

export type BadgeTone =
  | "success"
  | "warning"
  | "danger"
  | "neutral"
  | "info"
  | "ai";

const tones: Record<BadgeTone, string> = {
  success:
    "bg-risk-low/12 text-risk-low border-risk-low/25",
  warning:
    "bg-risk-moderate/12 text-risk-moderate border-risk-moderate/25",
  danger:
    "bg-risk-critical/12 text-risk-critical border-risk-critical/25",
  neutral: "bg-surface-2 text-muted border-border-strong",
  info: "bg-primary/10 text-primary border-primary/25",
  ai: "bg-accent/10 text-accent border-accent/25",
};

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  tone?: BadgeTone;
}

export function Badge({ className, tone = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
      {...props}
    />
  );
}
