import { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  FileText,
  Link2,
  ShieldAlert,
  ThumbsDown,
  ThumbsUp,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "CRITICAL" | string;

export interface RiskAssessment {
  claim_id: string;
  claim_text: string;
  risk_level: RiskLevel;
  risk_score: number;
  reason: string;
  user_input_id: string;
}

export interface Evidence {
  matching_score: number;
  reason: string;
  claim_id: string;
  claim_text: string;
  evidence_claim: string;
  user_input_id: string;
}

export interface ClaimAssessment {
  claim_id: string;
  claim_text: string;
  verdict: string;
  confidence: number;
  reason: string;
  supporting_evidence: Evidence[];
  contradicting_evidence: Evidence[];
  user_input_id: string;
}

export interface AnalysisResultProps {
  risk_assessments: RiskAssessment[];
  claim_assessment: ClaimAssessment[];
  urls: string[];
}

function riskStyle(score: number) {
  if (score > 90)
    return {
      label: "Critical",
      color: "text-risk-critical",
      bar: "bg-risk-critical",
      bg: "bg-risk-critical/10",
      ring: "stroke-risk-critical",
      badge: "danger" as const,
    };
  if (score > 50)
    return {
      label: "High",
      color: "text-risk-high",
      bar: "bg-risk-high",
      bg: "bg-risk-high/10",
      ring: "stroke-risk-high",
      badge: "warning" as const,
    };
  if (score > 30)
    return {
      label: "Moderate",
      color: "text-primary",
      bar: "bg-primary",
      bg: "bg-primary/10",
      ring: "stroke-primary",
      badge: "info" as const,
    };
  return {
    label: "Low",
    color: "text-risk-low",
    bar: "bg-risk-low",
    bg: "bg-risk-low/10",
    ring: "stroke-risk-low",
    badge: "success" as const,
  };
}

function CircularRisk({ score }: { score: number }) {
  const style = riskStyle(score);
  const radius = 66;
  const circumference = Math.PI * radius * 2;
  return (
    <div className="flex flex-col items-center gap-2">
      <div
        className="relative h-44 w-44"
        role="img"
        aria-label={`Average risk score ${score} out of 100`}
      >
        <svg viewBox="0 0 160 160" className="h-full w-full -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="11"
            className="stroke-surface-2"
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            strokeWidth="11"
            strokeLinecap="round"
            className={style.ring}
            strokeDasharray={circumference}
            strokeDashoffset={
              circumference - (Math.min(score, 100) / 100) * circumference
            }
            style={{ transition: "stroke-dashoffset 1s ease-out" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-4xl font-bold ${style.color}`}>{score}</span>
          <span className="text-xs text-muted">out of 100</span>
        </div>
      </div>
      <Badge tone={style.badge}>{style.label} risk</Badge>
    </div>
  );
}

function EvidenceGroup({
  title,
  items,
  positive,
}: {
  title: string;
  items: Evidence[];
  positive: boolean;
}) {
  const [open, setOpen] = useState(false);
  const tone = positive ? "text-risk-low" : "text-risk-critical";
  const background = positive
    ? "bg-risk-low/5 border-risk-low/20"
    : "bg-risk-critical/5 border-risk-critical/20";
  const Icon = positive ? ThumbsUp : ThumbsDown;

  return (
    <section className={`rounded-xl border ${background}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-3 p-4 text-left"
        aria-expanded={open}
      >
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-lg bg-surface ${tone}`}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1">
          <span className={`block text-sm font-semibold ${tone}`}>{title}</span>
          <span className="block text-xs text-muted">
            {items.length} {items.length === 1 ? "item" : "items"}
          </span>
        </span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-muted" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted" />
        )}
      </button>
      {open && (
        <div className="space-y-3 border-t border-border/70 p-4">
          {items.length === 0 ? (
            <p className="text-sm text-muted">
              No evidence returned by the API.
            </p>
          ) : (
            items.map((item, index) => (
              <article
                key={`${item.claim_id}-${index}`}
                className="rounded-lg border border-border bg-surface p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Evidence {index + 1}
                  </span>
                  <span className="text-xs font-medium text-muted">
                    Match: {(item.matching_score * 100).toFixed(0)}%
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium leading-6 text-foreground">
                  {item.evidence_claim}
                </p>
                <p className="mt-3 text-sm leading-6 text-muted">
                  {item.reason}
                </p>
              </article>
            ))
          )}
        </div>
      )}
    </section>
  );
}

function UrlPreview({ url }: { url: string }) {
  let host = url;
  let title = "Referenced source";
  try {
    const parsed = new URL(url);
    host = parsed.hostname.replace("www.", "");
    title =
      parsed.pathname.split("/").filter(Boolean).pop()?.replace("-", " ") ||
      host;
  } catch {
    /* preserve the API value if it is not a valid URL */
  }
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="group block rounded-xl border border-border bg-surface p-4 transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5"
    >
      <div className="flex items-start gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Link2 className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2 text-xs text-muted">
            <span className="truncate">{host}</span>
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </span>
          <span className="mt-1 block capitalize text-sm font-semibold text-foreground">
            {title}
          </span>
          <span className="mt-1 block truncate text-xs text-muted">{url}</span>
        </span>
      </div>
    </a>
  );
}

export function AnalysisResult2({
  risk_assessments,
  claim_assessment,
  urls,
}: AnalysisResultProps) {
  const overallScore = risk_assessments.length
    ? Math.round(
        risk_assessments.reduce((total, item) => total + item.risk_score, 0) /
          risk_assessments.length,
      )
    : 0;
  const overall = riskStyle(overallScore);

  return (
    <div className="space-y-6">
      
      <Card className="overflow-hidden">
        <div className={`h-1.5 ${overall.bar}`} />
        <CardHeader>
          <CardTitle>Average Misinformation Risk</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
            <CircularRisk score={overallScore} />
            <div className="space-y-5">
              <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${overall.bar} transition-all duration-1000`}
                  style={{ width: `${overallScore}%` }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs text-muted">Claims assessed</p>
                  <p className="mt-1 text-xl font-bold">
                    {risk_assessments.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs text-muted">Evidence groups</p>
                  <p className="mt-1 text-xl font-bold">
                    {claim_assessment.length}
                  </p>
                </div>
                <div className="rounded-xl border border-border bg-surface p-4">
                  <p className="text-xs text-muted">Source URLs</p>
                  <p className="mt-1 text-xl font-bold">{urls.length}</p>
                </div>
              </div>
              <p className="text-xs text-muted">
                Color scale: 0–30 green · 31–50 blue · 51–90 orange · over 90
                red.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Risk Assessments</h2>
          <p className="text-sm text-muted">
            Risk score and reasoning for every detected claim.
          </p>
        </div>
        {risk_assessments.map((assessment) => {
          const style = riskStyle(assessment.risk_score);
          return (
            <Card key={assessment.claim_id}>
              <CardContent className="pt-6">
                <div className="flex flex-col gap-5 md:flex-row md:items-start">
                  <div
                    className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${style.bg} ${style.color}`}
                  >
                    <span className="text-lg font-bold">
                      {assessment.risk_score}
                    </span>
                    <span className="text-[9px] font-semibold uppercase">
                      score
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge tone={style.badge}>{assessment.risk_level}</Badge>
                      <span className="text-xs text-muted">
                        Claim ID: {assessment.claim_id}
                      </span>
                    </div>
                    <p className="mt-3 text-sm font-semibold leading-6">
                      {assessment.claim_text}
                    </p>
                    <p className="mt-3 text-sm leading-6 text-muted">
                      {assessment.reason}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Claim vs. Evidence</h2>
          <p className="text-sm text-muted">
            Expand an evidence group to review the API-provided data.
          </p>
        </div>
        {claim_assessment.map((claim) => (
          <Card key={claim.claim_id}>
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <CardTitle>{claim.claim_text}</CardTitle>
                <Badge tone="info">{claim.verdict}</Badge>
                <Badge tone="neutral">
                  {(claim.confidence * 100).toFixed(0)}% confidence
                </Badge>
              </div>
              <p className="text-sm text-muted">{claim.reason}</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 lg:grid-cols-2">
                <EvidenceGroup
                  title="Supporting evidence"
                  items={claim.supporting_evidence}
                  positive
                />
                <EvidenceGroup
                  title="Contradicting evidence"
                  items={claim.contradicting_evidence}
                  positive={false}
                />
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">Referenced URLs</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {urls.map((url, index) => (
            <UrlPreview key={`${url}-${index}`} url={url} />
          ))}
        </div>
      </section>
    </div>
  );
}

export const demoRiskAssessments: RiskAssessment[] = [
  {
    claim_id: "1",
    claim_text: "Drinking alcohol helps to defeat the coronavirus.",
    risk_level: "CRITICAL",
    risk_score: 90,
    reason:
      "The claim is medically inaccurate. Alcohol can impair the immune system and interfere with COVID-19 vaccine effectiveness, increasing the risk of severe illness.",
    user_input_id: "RaviPraj",
  },
  {
    claim_id: "2",
    claim_text: "Drinking alcohol helps to defeat the coronavirus.",
    risk_level: "CRITICAL",
    risk_score: 30,
    reason:
      "The claim is medically inaccurate. Alcohol can impair the immune system and interfere with COVID-19 vaccine effectiveness, increasing the risk of severe illness.",
    user_input_id: "RaviPraj",
  },
];
const demoEvidence: Evidence = {
  matching_score: 0.9,
  reason:
    "The fact-checked claim substantially matches the user claim and includes a fact-checker conclusion.",
  claim_id: "1",
  claim_text: "Drinking alcohol helps to defeat the coronavirus.",
  evidence_claim:
    "Consuming alcohol beverages or vodka will reduce risk of COVID-19 infection",
  user_input_id: "RaviPraj",
};
export const demoClaimAssessments: ClaimAssessment[] = [
  {
    claim_id: "1",
    claim_text: "Drinking alcohol helps to defeat the coronavirus.",
    verdict: "Supported",
    confidence: 0.9,
    reason: "The API's supplied fact-checking assessment for this claim.",
    supporting_evidence: [demoEvidence],
    contradicting_evidence: [demoEvidence],
    user_input_id: "RaviPraj",
  },
  {
    claim_id: "1",
    claim_text: "Drinking alcohol helps to defeat the coronavirus.",
    verdict: "Supported",
    confidence: 0.3,
    reason: "The API's supplied fact-checking assessment for this claim.",
    supporting_evidence: [demoEvidence],
    contradicting_evidence: [demoEvidence],
    user_input_id: "RaviPraj",
  },
];

export default function AnalysisResultDemo() {
  return (
    <AnalysisResult2
      risk_assessments={demoRiskAssessments}
      claim_assessment={demoClaimAssessments}
      urls={[
        "https://www.boomlive.in/health/does-drinking-alcohol-prevent-coronavirus-6935",
      ]}
    />
  );
}
