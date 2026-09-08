import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  FileText,
  ListChecks,
  Quote,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";

export interface ApiAnalysisResultData {
  id: string;
  title: string;
  submittedContent: string;
  inputType: string;
  category: string;
  riskScore: number;
  riskLevel: string;
  confidence: number;
  claimsCount: number;
  sourcesCount: number;
  evidenceStrength: string;
  status: string;
  createdAt: string;
  claims: string[];
  assessmentSummary: string[];
  supporting_evidence:EvidenceItem[],
  contradicting_evidence:EvidenceItem[],

}

export interface EvidenceItem {
  claim_text: string;
  evidence_claim: string;
}

export interface ApiAnalysisResultProps {
  analysisResult: ApiAnalysisResultData;
  // supporting_evidence?: EvidenceItem[];
  // contradicting_evidence?: EvidenceItem[];
}

// Demo data keeps the existing /analysis-result route useful until a real API is connected.
const demoResult: ApiAnalysisResultData = {
  id: "4b70a2c0-58aa-4d9f-9a4a-db8c1ab3902a",
  title: "drinking alcohol helps to defeat the coronavirus",
  submittedContent: "drinking alcohol helps to defeat corona virus",
  inputType: "text",
  category: "climate",
  riskScore: 92.2,
  riskLevel: "CRITICAL",
  confidence: 0.9678,
  claimsCount: 1,
  sourcesCount: 0,
  evidenceStrength: "moderate",
  status: "completed",
  createdAt: "2026-08-18T23:47:56.006Z",
  claims: ["Drinking alcohol helps to defeat the coronavirus."],
   supporting_evidence :[],
  contradicting_evidence: [],
  assessmentSummary: [
    "Drinking alcoholic beverages prevents coronavirus infection",
    "People who drink alcohol will not be infected by the Coronavirus",
    "Consuming alcohol beverages or vodka will reduce risk of COVID-19 infection",
    "Saint Luke’s Hospital recommends alcohol consumption to reduce the risk of COVID-19",
  ],
};

// Score colors are determined here from the number received from the API.
// You can adjust these thresholds later without changing the user interface.
function scoreStyle(score: number) {
  if (score < 30) {
    return {
      label: "Low risk",
      color: "text-risk-moderate",
      bar: "bg-risk-moderate",
      bg: "bg-risk-moderate/10",
      ring: "stroke-risk-moderate",
    };
  }
  if (score < 60) {
    return {
      label: "Moderate risk",
      color: "text-primary",
      bar: "bg-primary",
      bg: "bg-primary/10",
      ring: "stroke-primary",
    };
  }
  if (score < 90) {
    return {
      label: "High risk",
      color: "text-risk-high",
      bar: "bg-risk-high",
      bg: "bg-risk-high/10",
      ring: "stroke-risk-high",
    };
  }
  return {
    label: "Critical risk",
    color: "text-risk-critical",
    bar: "bg-risk-critical",
    bg: "bg-risk-critical/10",
    ring: "stroke-risk-critical",
  };
}

function ScoreDisplay({ score }: { score: number }) {
  const style = scoreStyle(score);
  const radius = 66;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center">
      <div
        className="relative flex h-44 w-44 items-center justify-center"
        aria-label={`Risk score ${score} out of 100`}
      >
        <svg
          className="absolute h-full w-full -rotate-90"
          viewBox="0 0 160 160"
          aria-hidden="true"
        >
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
            strokeDashoffset={dashOffset}
            style={{ transition: "stroke-dashoffset 1.2s ease-out" }}
          />
        </svg>
        <div className="text-center">
          <p className={`text-4xl font-bold tabular-nums ${style.color}`}>
            {score.toFixed(1)}
          </p>
          <p className="text-xs font-medium text-muted">out of 100</p>
        </div>
      </div>
      <span
        className={`mt-1 rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide ${style.bg} ${style.color}`}
      >
        {style.label}
      </span>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface px-3.5 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </span>
      <span>
        <span className="block text-xs text-muted">{label}</span>
        <span className="block text-sm font-semibold text-foreground">
          {value}
        </span>
      </span>
    </div>
  );
}

function EvidenceColumn({
  title,
  items,
  variant,
}: {
  title: string;
  items: EvidenceItem[];
  variant: "supporting" | "contradicting";
}) {
  const isSupporting = variant === "supporting";
  const accent = isSupporting ? "text-risk-low" : "text-risk-critical";
  const surface = isSupporting
    ? "border-risk-low/25 bg-risk-low/5"
    : "border-risk-critical/25 bg-risk-critical/5";

  return (
    <div className="space-y-3">
      <p className={`text-sm font-semibold ${accent}`}>{title}</p>
      {items.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border-strong p-4 text-sm text-muted">
          No evidence was returned.
        </p>
      ) : (
        items.map((item, index) => (
          <article
            key={`${item.claim_text}-${index}`}
            className={`rounded-xl border p-4 ${surface}`}
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-muted">
              Claim
            </p>
            <p className="mt-1.5 text-sm leading-6 text-foreground">
              {item.claim_text}
            </p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-muted">
              Evidence
            </p>
            <p className="mt-1.5 text-sm leading-6 text-foreground/90">
              {item.evidence_claim}
            </p>
          </article>
        ))
      )}
    </div>
  );
}

export function ApiAnalysisResult({analysisResult}: ApiAnalysisResultProps) {
  const style = scoreStyle(analysisResult.riskScore);
  const confidence = `${(analysisResult.confidence * 100).toFixed(2)}%`;

  return (
    <div className="space-y-6">
      {/* <PageHeader
        title="Analysis Result"
        description="AI-generated misinformation assessment based on your submitted content."
        actions={
          <Badge tone="danger">
            <AlertTriangle className="h-3.5 w-3.5" /> Critical risk
          </Badge>
        }
      /> */}

      <Card className="overflow-hidden">
        <div className={`h-1.5 ${style.bar}`} />
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Overall Misinformation Risk</CardTitle>
          <span className="text-xs text-muted">
            Analysis ID: {analysisResult.id.slice(0, 8)}…
          </span>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 lg:grid-cols-[220px_1fr] lg:items-center">
            <ScoreDisplay score={analysisResult.riskScore} />
            <div className="space-y-5">
              <div className="h-3 overflow-hidden rounded-full bg-surface-2">
                <div
                  className={`h-full rounded-full ${style.bar} transition-all duration-1000`}
                  style={{ width: `${analysisResult.riskScore}%` }}
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <Metric
                  label="Confidence"
                  value={confidence}
                  icon={<CheckCircle2 className="h-4 w-4" />}
                />
                <Metric
                  label="Claims detected"
                  value={String(analysisResult.claimsCount)}
                  icon={<ListChecks className="h-4 w-4" />}
                />
                <Metric
                  label="Sources checked"
                  value={String(analysisResult.sourcesCount)}
                  icon={<ShieldAlert className="h-4 w-4" />}
                />
                <Metric
                  label="Status"
                  value="Completed"
                  icon={<Clock3 className="h-4 w-4" />}
                />
              </div>
              <p className="text-xs text-muted">
                Score-color guide: under 30 yellow · 30–59 blue · 60–89 orange ·
                90–100 red.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Submitted Content</CardTitle>
          </CardHeader>
          <CardContent>
            <blockquote className="rounded-lg border-l-4 border-primary/40 bg-surface-2/50 p-4 text-sm leading-6 text-foreground">
              “{analysisResult.submittedContent}”
            </blockquote>
            <div className="mt-4 flex flex-wrap gap-2">
              <Badge tone="info">Text input</Badge>
              <Badge tone="neutral">{analysisResult.category}</Badge>
              <Badge tone="neutral">
                {new Date(analysisResult.createdAt).toLocaleString()}
              </Badge>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Assessment Summary</CardTitle>
            <p className="text-sm text-muted">
              Statements identified during the analysis
            </p>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {analysisResult.assessmentSummary.map((summary) => (
                <li
                  key={summary}
                  className="flex gap-3 rounded-lg bg-surface-2/40 p-3 text-sm leading-6"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${style.bar}`}
                  />
                  {summary}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Claim vs. Evidence</CardTitle>
          <p className="text-sm text-muted">
            Supporting and contradicting evidence returned by the analysis API.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 lg:grid-cols-2">
            <EvidenceColumn
              title="Supporting Evidence"
              items={analysisResult.supporting_evidence}
              variant="supporting"
            />
            <EvidenceColumn
              title="Contradicting Evidence"
              items={analysisResult.contradicting_evidence}
              variant="contradicting"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Detected Claim</CardTitle>
          <p className="text-sm text-muted">
            One claim was identified in the submitted text.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-border bg-surface-2/40 p-5">
              <div className="flex gap-3">
                <Quote className="mt-0.5 h-5 w-5 shrink-0 text-muted" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Claim 01
                  </p>
                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {analysisResult.claims[0]}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex min-w-44 flex-col justify-center rounded-xl border border-risk-critical/25 bg-risk-critical/5 p-5">
              <span className="flex items-center gap-2 text-sm font-bold text-risk-critical">
                <ShieldAlert className="h-4 w-4" /> High concern
              </span>
              <p className="mt-2 text-xs leading-5 text-muted">
                The claim is presented with a critical misinformation risk score
                and requires source verification.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Source Cross-Reference</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border-strong bg-surface-2/35 px-6 py-10 text-center">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-surface text-muted shadow-sm">
              <FileText className="h-5 w-5" />
            </span>
            <p className="mt-4 text-sm font-semibold">
              No sources were returned
            </p>
            <p className="mt-1 max-w-sm text-sm text-muted">
              The API response reported 0 checked sources. Add
              source-verification data to show supporting and contradicting
              evidence here.
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" /> Ready for API evidence data
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function ApiAnalysisResultDemo() {
  return (
    <ApiAnalysisResult
      analysisResult={demoResult}
     
    />
  );
}
