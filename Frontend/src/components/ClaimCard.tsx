import { useState } from "react";
import { ChevronDown, Quote } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { ClaimStatusBadge } from "@/components/RiskBadge";
import { EvidenceCard } from "@/components/EvidenceCard";
import { CONTENT_CATEGORY_LABELS } from "@/lib/constants";
import { cn, formatDate } from "@/lib/utils";
import type { Claim } from "@/types";

export function ClaimCard({
  claim,
  defaultOpen = false,
}: {
  claim: Claim;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  const supporting = claim.evidence.filter((e) => e.type === "supporting");
  const contradicting = claim.evidence.filter(
    (e) => e.type === "contradicting"
  );
  const missing = claim.evidence.filter((e) => e.type === "missing-context");

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface transition-shadow hover:shadow-sm">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-start gap-3 p-4 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Quote className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">{claim.text}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted">
            <ClaimStatusBadge status={claim.status} />
            <span>
              Risk:{" "}
              <span className="font-semibold text-foreground">
                {claim.risk}/100
              </span>
            </span>
            <span>
              Confidence:{" "}
              <span className="font-semibold text-foreground">
                {claim.confidence}%
              </span>
            </span>
            <span>
              Evidence:{" "}
              <span className="font-semibold text-foreground">
                {claim.evidence.length} items
              </span>
            </span>
            <Badge tone="info">
              {CONTENT_CATEGORY_LABELS[claim.category]}
            </Badge>
          </div>
        </div>
        <ChevronDown
          className={cn(
            "mt-0.5 h-5 w-5 shrink-0 text-muted transition-transform",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="space-y-4 border-t border-border bg-surface-2/40 px-4 py-4 animate-fade-in">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Claim Explanation
            </h4>
            <p className="mt-1.5 text-sm text-foreground/90">
              {claim.explanation}
            </p>
          </div>

          {supporting.length > 0 && (
            <div className="space-y-2">
              {supporting.map((e) => (
                <EvidenceCard key={e.id} evidence={e} />
              ))}
            </div>
          )}
          {contradicting.length > 0 && (
            <div className="space-y-2">
              {contradicting.map((e) => (
                <EvidenceCard key={e.id} evidence={e} />
              ))}
            </div>
          )}
          {missing.length > 0 && (
            <div className="space-y-2">
              {missing.map((e) => (
                <EvidenceCard key={e.id} evidence={e} />
              ))}
            </div>
          )}

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
              Cross-Referenced Sources
            </h4>
            <ul className="mt-2 space-y-1.5">
              {claim.sources.map((s) => (
                <li
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-border bg-surface px-3 py-2 text-sm"
                >
                  <span className="font-medium text-foreground">{s.name}</span>
                  <span className="text-xs text-muted">{s.domain}</span>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-2">
            Detected {formatDate(claim.createdAt)}
          </p>
        </div>
      )}
    </div>
  );
}
