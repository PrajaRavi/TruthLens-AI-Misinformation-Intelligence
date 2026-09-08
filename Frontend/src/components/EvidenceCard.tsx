import { CheckCircle2, HelpCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Evidence, EvidenceType } from "@/types";

const config: Record<
  EvidenceType,
  { label: string; icon: React.ReactNode; className: string; iconColor: string }
> = {
  supporting: {
    label: "Supporting Evidence",
    icon: <CheckCircle2 className="h-4 w-4" />,
    className: "border-risk-low/30 bg-risk-low/5",
    iconColor: "text-risk-low",
  },
  contradicting: {
    label: "Contradicting Evidence",
    icon: <XCircle className="h-4 w-4" />,
    className: "border-risk-critical/30 bg-risk-critical/5",
    iconColor: "text-risk-critical",
  },
  "missing-context": {
    label: "Missing Context",
    icon: <HelpCircle className="h-4 w-4" />,
    className: "border-risk-moderate/30 bg-risk-moderate/5",
    iconColor: "text-risk-moderate",
  },
};

export function EvidenceCard({ evidence }: { evidence: Evidence }) {
  const cfg = config[evidence.type];
  return (
    <div className={cn("rounded-lg border p-3", cfg.className)}>
      <div
        className={cn(
          "flex items-center gap-1.5 text-xs font-semibold",
          cfg.iconColor
        )}
      >
        {cfg.icon}
        {cfg.label}
      </div>
      <p className="mt-1.5 text-sm text-foreground/90">{evidence.text}</p>
      {evidence.sourceName && (
        <p className="mt-1.5 text-xs text-muted">
          Source: <span className="font-medium">{evidence.sourceName}</span>
        </p>
      )}
    </div>
  );
}
