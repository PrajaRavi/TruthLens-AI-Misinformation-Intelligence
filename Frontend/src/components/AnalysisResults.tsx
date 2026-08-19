import {
  CheckCircle2,
  FileText,
  ListChecks,
  Quote,
  ShieldCheck,
} from "lucide-react";
import { RiskScore } from "@/components/RiskScore";
import { RiskBadge } from "@/components/RiskBadge";
import { ClaimCard } from "@/components/ClaimCard";
import { SourceCard } from "@/components/SourceCard";
import { EvidenceCard } from "@/components/EvidenceCard";
import { MultimodalSignals } from "@/components/MultimodalSignals";
import { Disclaimer, DemoDataTag } from "@/components/states";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { CONTENT_CATEGORY_LABELS } from "@/lib/constants";
import type { Analysis } from "@/types";

function MetricPill({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-surface px-3 py-2.5">
      <div className="flex h-8 w-8 items-center justify-center rounded-md bg-surface-2 text-primary">
        {icon}
      </div>
      <div>
        <p className="text-xs text-muted">{label}</p>
        <p className="text-sm font-semibold text-foreground">{value}</p>
      </div>
    </div>
  );
}

export function AnalysisResults({ analysis }: { analysis: Analysis }) {
  // const primaryClaim = analysis.claims[0];
  // const supporting = primaryClaim?.evidence.filter(
  //   (e) => e.type === "supporting"
  // );
  // const contradicting = primaryClaim?.evidence.filter(
  //   (e) => e.type === "contradicting"
  // );
  // const missing = primaryClaim?.evidence.filter(
  //   (e) => e.type === "missing-context"
  // );

  return (
    <div className="space-y-6">
      {/* Overall risk */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Overall Misinformation Risk</CardTitle>
          <DemoDataTag />
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-[auto_1fr] md:items-center">
            <div className="flex flex-col items-center gap-2">
              <RiskScore score={analysis.riskScore} level={analysis.riskLevel} />
              <p className="max-w-[200px] text-center text-xs text-muted-2">
                AI-generated assessment based on available evidence.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:grid-cols-2 lg:grid-cols-4">
              <MetricPill
                label="Confidence"
                value={`${analysis.confidence}%`}
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
              <MetricPill
                label="Claims Detected"
                value={String(analysis.claimsCount)}
                icon={<ListChecks className="h-4 w-4" />}
              />
              <MetricPill
                label="Sources Checked"
                value={String(analysis.sourcesCount)}
                icon={<ShieldCheck className="h-4 w-4" />}
              />
              <MetricPill
                label="Evidence Strength"
                value={
                  analysis.evidenceStrength.charAt(0).toUpperCase() +
                  analysis.evidenceStrength.slice(1)
                }
                icon={<FileText className="h-4 w-4" />}
              />
              <div className="col-span-1 flex items-center rounded-lg border border-border bg-surface px-3 py-2.5">
                <RiskBadge level={analysis.riskLevel} />
              </div>
              <div className="col-span-2 flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2.5 sm:col-span-2">
                <Badge tone="info">
                  {CONTENT_CATEGORY_LABELS[analysis.category]}
                </Badge>
                <span className="text-xs text-muted">Content category</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Disclaimer />

      {/* Submitted content + Assessment summary */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submitted Content</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="rounded-lg border-l-4 border-primary/40 bg-surface-2/50 p-4 text-sm text-foreground/90">
              {analysis.submittedContent}
            </blockquote>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Assessment Summary</CardTitle>
            <p className="text-sm text-muted">Why was this flagged?</p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2.5">
              {analysis.assessmentSummary.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                  <span className="text-foreground/90">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Claim vs Evidence */}
      {/* {primaryClaim && (
        <Card>
          <CardHeader>
            <CardTitle>Claim vs. Evidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-surface-2/40 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Claim
                </p>
                <div className="flex items-start gap-2">
                  <Quote className="mt-0.5 h-4 w-4 shrink-0 text-muted-2" />
                  <p className="text-sm text-foreground">{primaryClaim.text}</p>
                </div>
              </div>
              <div className="rounded-lg border border-border bg-surface-2/40 p-4">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted">
                  Evidence
                </p>
                <p className="text-sm text-foreground/90">
                  {primaryClaim.explanation}
                </p>
              </div>
            </div>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold text-risk-low">
                  Supporting Evidence
                </p>
                {supporting && supporting.length > 0 ? (
                  supporting.map((e) => <EvidenceCard key={e.id} evidence={e} />)
                ) : (
                  <p className="text-xs text-muted-2">None identified.</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-risk-critical">
                  Contradicting Evidence
                </p>
                {contradicting && contradicting.length > 0 ? (
                  contradicting.map((e) => (
                    <EvidenceCard key={e.id} evidence={e} />
                  ))
                ) : (
                  <p className="text-xs text-muted-2">None identified.</p>
                )}
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold text-risk-moderate">
                  Missing Context
                </p>
                {missing && missing.length > 0 ? (
                  missing.map((e) => <EvidenceCard key={e.id} evidence={e} />)
                ) : (
                  <p className="text-xs text-muted-2">None identified.</p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )} */}

      {/* Detected claims */}
      {/* <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Detected Claims
          </h3>
          <Badge tone="neutral">{analysis.claims.length} claims</Badge>
        </div>
        <div className="space-y-3">
          {analysis.claims.map((claim, i) => (
            <ClaimCard key={claim.id} claim={claim} defaultOpen={i === 0} />
          ))}
        </div>
      </div> */}

      {/* Multimodal signals */}
      {/* <MultimodalSignals signals={analysis.signals} /> */}

      {/* Sources */}
      {/* <div>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Verified Source Cross-Reference
            </h3>
            <p className="text-sm text-muted">
              Credibility indicators are system-provided demo information.
            </p>
          </div>
          <DemoDataTag />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {analysis.sources.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      </div> */}
    </div>
  );
}
