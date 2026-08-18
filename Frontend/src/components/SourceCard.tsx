import {
  Building2,
  ExternalLink,
  FlaskConical,
  GraduationCap,
  Landmark,
  Newspaper,
  ScrollText,
  ShieldCheck,
} from "lucide-react";
import { CredibilityBadge, VerificationBadge } from "@/components/RiskBadge";
import { SOURCE_CATEGORY_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Source, SourceCategory } from "@/types";

const categoryIcon: Record<SourceCategory, React.ReactNode> = {
  government: <Landmark className="h-5 w-5" />,
  "official-organization": <Building2 className="h-5 w-5" />,
  academic: <GraduationCap className="h-5 w-5" />,
  scientific: <FlaskConical className="h-5 w-5" />,
  "established-news": <Newspaper className="h-5 w-5" />,
  "fact-checking": <ShieldCheck className="h-5 w-5" />,
  "primary-source": <ScrollText className="h-5 w-5" />,
};

export function SourceCard({ source }: { source: Source }) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-shadow hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-primary">
          {categoryIcon[source.category]}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">
            {source.name}
          </p>
          <p className="truncate text-xs text-muted">{source.domain}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Relevance</p>
          <p className="text-sm font-semibold text-foreground tabular-nums">
            {source.relevance}%
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="inline-flex items-center rounded-full bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
          {SOURCE_CATEGORY_LABELS[source.category]}
        </span>
        <VerificationBadge verification={source.verification} />
        <CredibilityBadge tier={source.credibility} />
      </div>

      <p className="text-sm text-foreground/80">{source.excerpt}</p>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted">
          Published {formatDate(source.publishedAt)}
        </span>
        <a
          href={source.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 rounded-md px-2.5 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          View Source
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  );
}
