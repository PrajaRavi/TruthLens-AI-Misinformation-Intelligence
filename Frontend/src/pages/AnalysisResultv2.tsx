import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileWarning,
  ShieldAlert,
  ShieldCheck,
  Info,
  ChevronLeft,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
  FileText,
  Link2,
  ExternalLink,
  PersonStanding,
} from "lucide-react";

import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { UrlType, WebPageDataType, YtDataType } from "./Analyze";
import MarkdownRenderer from "@/utils/MDRenderer";
import ContextChatbot from "@/components/ConverChatboat";

// ============================================================
// TYPES
// ============================================================

type RiskLevel =
  | "LOW"
  | "MODERATE"
  | "HIGH"
  | "CRITICAL"
  | string;

type Verdict =
  | "TRUE"
  | "FALSE"
  | "PARTIALLY_TRUE"
  | "MISLEADING"
  | "UNVERIFIED"
  | string;

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
  verdict: Verdict;
  confidence: number;
  reason: string;
  supporting_evidence: Evidence[];
  contradicting_evidence: Evidence[];
  user_input_id: string;
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
    <>
    <section className={`rounded-xl  ${background}`}>
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
    
    </>

  );
}

export interface AnalysisDashboardProps {
  risk_assessments: RiskAssessment[];
  claim_assessment: ClaimAssessment[];
  claim_summary:string;
  risk_summary:string;
  urls:UrlType[];
  title:string;
  input_type:string;
  WebPageData?:WebPageDataType;
  YtData?:YtDataType;

}

// ============================================================
// RISK LEVEL HELPERS
// ============================================================

function normalizeRiskLevel(level: string): RiskLevel {
  return level.toUpperCase();
}

function getRiskBadgeTone(
  level: RiskLevel
): "success" | "info" | "warning" | "danger" | "neutral" {
  switch (normalizeRiskLevel(level)) {
    case "CRITICAL":
      return "danger";

    case "HIGH":
      return "warning";

    case "MODERATE":
      return "info";

    case "LOW":
      return "success";

    default:
      return "neutral";
  }
}

function getRiskColor(level: RiskLevel) {
  switch (normalizeRiskLevel(level)) {
    case "CRITICAL":
      return {
        text: "text-risk-critical",
        bg: "bg-risk-critical/10",
        border: "border-risk-critical/20",
        bar: "bg-risk-critical",
      };

    case "HIGH":
      return {
        text: "text-risk-high",
        bg: "bg-risk-high/10",
        border: "border-risk-high/20",
        bar: "bg-risk-high",
      };

    case "MODERATE":
      return {
        text: "text-primary",
        bg: "bg-primary/10",
        border: "border-primary/20",
        bar: "bg-primary",
      };

    case "LOW":
      return {
        text: "text-risk-low",
        bg: "bg-risk-low/10",
        border: "border-risk-low/20",
        bar: "bg-risk-low",
      };

    default:
      return {
        text: "text-muted",
        bg: "bg-surface-2",
        border: "border-border",
        bar: "bg-muted",
      };
  }
}

// ============================================================
// VERDICT HELPERS
// ============================================================

function getVerdictTone(
  verdict: Verdict
): "success" | "info" | "warning" | "danger" | "neutral" {
  switch (verdict.toUpperCase()) {
    case "TRUE":
      return "success";

    case "FALSE":
      return "danger";

    case "PARTIALLY_TRUE":
      return "warning";

    case "MISLEADING":
      return "warning";

    case "UNVERIFIED":
      return "info";

    default:
      return "neutral";
  }
}

// ============================================================
// CONFIDENCE HELPERS
// ============================================================

function getConfidencePercentage(confidence: number) {
  // Supports both:
  // 0.85 -> 85%
  // 85   -> 85%
  return confidence <= 1
    ? Math.round(confidence * 100)
    : Math.round(confidence);
}

function getConfidenceLevel(
  confidence: number
): "LOW" | "MODERATE" | "HIGH" {
  const score = getConfidencePercentage(confidence);

  if (score > 0 && score < 30) {
    return "LOW";
  }

  if (score >= 30 && score < 80) {
    return "MODERATE";
  }

  return "HIGH";
}

function getConfidenceTone(
  confidence: number
): "success" | "info" | "warning" | "danger" | "neutral" {
  const level = getConfidenceLevel(confidence);

  if (level === "HIGH") return "success";
  if (level === "MODERATE") return "warning";

  return "neutral";
}

// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  bg
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
  bg?:string;
}) {
  return (
    <Card className={bg}>
      <CardContent className="pt-6 ">
        <div className="flex items-start   justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-muted">
              {title}
            </p>

            <p className="mt-2 text-2xl font-bold text-foreground">
              {value}
            </p>

            {description && (
              <p className="mt-1 text-xs text-muted">
                {description}
              </p>
            )}
          </div>

          {Icon && (
            <div className={`rounded-lg ${bg}  p-2`}>
              <Icon className="h-5 w-5 text-muted" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// SUMMARY CARD
// ============================================================

function SummaryCard({
  title,
  summary,
  icon: Icon,
}: {
  title: string;
  summary: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-primary" />

      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Icon className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-foreground">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-muted">
              <MarkdownRenderer content={summary}/>
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// RISK ASSESSMENT ITEM
// ============================================================

function RiskAssessmentItem({
  assessment,
  
}: {
  assessment: RiskAssessment
}) {
  const [open, setOpen] = useState(false);

  const style = getRiskColor(assessment.risk_level);

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-4">

          <div className="flex items-start gap-4">

            {/* SCORE */}

            <div
              className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl ${style.bg} ${style.text}`}
            >
              <span className="text-lg font-bold">
                {assessment.risk_score}
              </span>

              <span className="text-[9px] font-semibold uppercase">
                score
              </span>
            </div>

            {/* CONTENT */}

            <div className="min-w-0 flex-1">

              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  tone={getRiskBadgeTone(
                    assessment.risk_level
                  )}
                >
                  {assessment.risk_level}
                </Badge>

                <span className="text-xs text-muted">
                  Claim ID: {assessment.claim_id}
                </span>
              </div>

              <p className="mt-3 text-sm font-semibold leading-6 text-foreground">
                {assessment.claim_text}
              </p>
            </div>

            {/* TOGGLE */}

            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-foreground"
              aria-label={
                open
                  ? "Hide risk reasoning"
                  : "Show risk reasoning"
              }
            >
              {open ? (
                <ChevronUp className="h-5 w-5" />
              ) : (
                <ChevronDown className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* RISK BAR */}

          <div>
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Risk score</span>

              <span>
                {Math.min(
                  Math.max(assessment.risk_score, 0),
                  100
                )}
                /100
              </span>
            </div>

            <div className="h-2 overflow-hidden rounded-full bg-surface-2">
              <div
                className={`h-full rounded-full ${style.bar} transition-all duration-700`}
                style={{
                  width: `${Math.min(
                    Math.max(assessment.risk_score, 0),
                    100
                  )}%`,
                }}
              />
            </div>
          </div>

          {/* REASON */}

          {open && (
            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <div className="flex items-start gap-3">
                <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted" />

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                    Why this risk was assigned
                  </p>

                  <p className="mt-2 text-sm leading-6 text-foreground">
                    {assessment.reason}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// ============================================================
// CLAIM ASSESSMENT ITEM
// ============================================================
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

function ClaimAssessmentItem({
  assessment,
  urls,
}: {
  assessment: ClaimAssessment;urls:UrlType[];
}) {
  const [open, setOpen] = useState(false);

  const confidence = getConfidencePercentage(
    assessment.confidence
  );

  return (
    <Card>
      <CardContent className="pt-6">

        <div className="flex items-start gap-4">

          {/* ICON */}

          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <CheckCircle2 className="h-5 w-5" />
          </div>

          {/* CONTENT */}

          <div className="min-w-0 flex-1">

            <div className="flex flex-wrap items-center gap-2">

              <Badge
                tone={getVerdictTone(
                  assessment.verdict
                )}
              >
                {assessment.verdict}
              </Badge>

              <Badge
                tone={getConfidenceTone(
                  assessment.confidence
                )}
              >
                {getConfidenceLevel(
                  assessment.confidence
                )}{" "}
                confidence
              </Badge>

              <span className="text-xs text-muted">
                Claim ID: {assessment.claim_id}
              </span>
            </div>

            <p className="mt-3 text-sm font-semibold leading-6 text-foreground">
              {assessment.claim_text}
            </p>

            {/* CONFIDENCE BAR */}

            <div className="mt-4">

              <div className="mb-1 flex justify-between text-xs text-muted">
                <span>Confidence</span>

                <span>{confidence}%</span>
              </div>

              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div
                  className="h-full rounded-full bg-primary transition-all duration-700"
                  style={{
                    width: `${Math.min(
                      Math.max(confidence, 0),
                      100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* TOGGLE */}

          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="rounded-lg p-2 text-muted transition hover:bg-surface-2 hover:text-foreground"
          >
            {open ? (
              <ChevronUp className="h-5 w-5" />
            ) : (
              <ChevronDown className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* DETAILS */}

        {open && (
          <div className="mt-5 space-y-4 border-t border-border pt-5">

            {/* REASON */}

            <div className="rounded-xl border border-border bg-surface-2 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Assessment reasoning
              </p>

              <p className="mt-2 text-sm leading-6 text-foreground">
                {assessment.reason}
              </p>
            </div>

            {/* EVIDENCE */}
            <CardContent>
                          <div className="grid gap-4 lg:grid-cols-2">
                            <EvidenceGroup
                              title="Supporting evidence"
                              items={assessment.supporting_evidence_count}
                              positive
                            />
                              
    
                            <EvidenceGroup
                              title="Contradicting evidence"
                              items={assessment.contradicting_evidence_count}
                              positive={false}
                            />
                          </div>
                        </CardContent>
                        <section className="space-y-4">
                                <div className="flex items-center gap-2">
                                  <FileText className="h-5 w-5 text-primary" />
                                  <h2 className="text-lg font-semibold">Referenced URLs</h2>
                                </div>
                                <div className="grid gap-4 md:grid-cols-2">
                                  {urls?.length>0 && urls.map((url, index) => (
                                    <span className={url.claim_id==assessment.claim_id?"block min-w-0":"hidden"}>

                                    <UrlPreview  key={`${url}-${index}`} url={url.url} />
                                    </span>
                                  ))}
                                </div>
                              </section>
            {/* <div className="grid gap-3 sm:grid-cols-2">

              <div className="rounded-xl border border-risk-low/20 bg-risk-low/5 p-4">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-risk-low" />

                  <span className="text-sm font-semibold text-risk-low">
                    Supporting Evidence
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-foreground">
                  {assessment.supporting_evidence.length}
                </p>

                <p className="text-xs text-muted">
                  pieces of evidence
                </p>
              </div>

              <div className="rounded-xl border border-risk-critical/20 bg-risk-critical/5 p-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="h-4 w-4 text-risk-critical" />

                  <span className="text-sm font-semibold text-risk-critical">
                    Contradicting Evidence
                  </span>
                </div>

                <p className="mt-2 text-2xl font-bold text-foreground">
                  {assessment.contradicting_evidence.length}
                </p>

                <p className="text-xs text-muted">
                  pieces of evidence
                </p>
              </div>
            </div> */}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================
// PAGINATION
// ============================================================

function Pagination({
  page,
  totalPages,
  onPrevious,
  onNext,
}: {
  page: number;
  totalPages: number;
  onPrevious: () => void;
  onNext: () => void;
}) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between pt-2">

      <p className="text-xs text-muted">
        Page {page} of {totalPages}
      </p>

      <div className="flex items-center gap-2">

        <button
          type="button"
          disabled={page === 1}
          onClick={onPrevious}
          className="rounded-lg border border-border bg-surface p-2 text-muted transition hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        <button
          type="button"
          disabled={page === totalPages}
          onClick={onNext}
          className="rounded-lg border border-border bg-surface p-2 text-muted transition hover:bg-surface-2 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        >
          <ChevronRight className="h-4 w-4" />
        </button>

      </div>
    </div>
  );
}

// ============================================================
// MAIN DASHBOARD
// ============================================================

export function AnalysisDashboard({
  risk_assessments,
  claim_assessment,
  claim_summary,
  risk_summary,
  urls,
  title,
  input_type,
  YtData,
  WebPageData
}: AnalysisDashboardProps) {
let obj={title:title,claim_assessment:claim_assessment,risk_assessment:risk_assessments,claim_assessment_summary:claim_summary,risk_assessment_summary:risk_summary,sources_count:urls}

  const ITEMS_PER_PAGE = 2;

  const [riskPage, setRiskPage] = useState(1);
  const [claimPage, setClaimPage] = useState(1);
  let [AnalysisData,setAnalysisData]=useState(obj)

  useEffect(()=>{
    setAnalysisData({title:title,claim_assessment:claim_assessment,risk_assessment:risk_assessments,claim_assessment_summary:claim_summary,risk_assessment_summary:risk_summary,sources_count:urls})
console.log(risk_assessments)
console.log(claim_assessment)
  },[])

  // ==========================================================
  // RISK STATISTICS
  // ==========================================================

  const riskStats = useMemo(() => {

    const critical = risk_assessments.filter(
      (item) =>
        normalizeRiskLevel(item.risk_level) ===
        "CRITICAL"
    ).length;

    const high = risk_assessments.filter(
      (item) =>
        normalizeRiskLevel(item.risk_level) ===
        "HIGH"
    ).length;

    const moderate = risk_assessments.filter(
      (item) =>
        normalizeRiskLevel(item.risk_level) ===
        "MODERATE"
    ).length;

    const low = risk_assessments.filter(
      (item) =>
        normalizeRiskLevel(item.risk_level) ===
        "LOW"
    ).length;

    const scores = risk_assessments.map(
      (item) => item.risk_score
    );

    return {
      critical,
      high,
      moderate,
      low,
      total: risk_assessments.length,
      highest:
        scores.length > 0
          ? Math.max(...scores)
          : 0,
      lowest:
        scores.length > 0
          ? Math.min(...scores)
          : 0,
    };

  }, [risk_assessments]);

  // ==========================================================
  // CLAIM STATISTICS
  // ==========================================================

  const claimStats = useMemo(() => {

    const trueCount = claim_assessment.filter(
      (item) =>
        item.verdict.toUpperCase() === "TRUE"
    ).length;

    const falseCount = claim_assessment.filter(
      (item) =>
        item.verdict.toUpperCase() === "FALSE"
    ).length;

    const partiallyTrueCount =
      claim_assessment.filter(
        (item) =>
          item.verdict.toUpperCase() ===
          "PARTIALLY_TRUE"
      ).length;

    const misleadingCount =
      claim_assessment.filter(
        (item) =>
          item.verdict.toUpperCase() ===
          "MISLEADING"
      ).length;

    const unverifiedCount =
      claim_assessment.filter(
        (item) =>
          item.verdict.toUpperCase() ===
          "UNVERIFIED"
      ).length;

    const lowConfidence =
      claim_assessment.filter((item) => {
        const score = getConfidencePercentage(
          item.confidence
        );

        return score > 0 && score < 30;
      }).length;

    const moderateConfidence =
      claim_assessment.filter((item) => {
        const score = getConfidencePercentage(
          item.confidence
        );

        return score >= 30 && score < 80;
      }).length;

    const highConfidence =
      claim_assessment.filter((item) => {
        const score = getConfidencePercentage(
          item.confidence
        );

        return score >= 80;
      }).length;

    const scores = claim_assessment.map((item) =>
      getConfidencePercentage(item.confidence)
    );

    return {
      trueCount,
      falseCount,
      partiallyTrueCount,
      misleadingCount,
      unverifiedCount,

      lowConfidence,
      moderateConfidence,
      highConfidence,

      total: claim_assessment.length,

      highest:
        scores.length > 0
          ? Math.max(...scores)
          : 0,

      lowest:
        scores.length > 0
          ? Math.min(...scores)
          : 0,
    };

  }, [claim_assessment]);

  // ==========================================================
  // PAGINATION
  // ==========================================================

  const totalRiskPages = Math.ceil(
    risk_assessments.length / ITEMS_PER_PAGE
  );

  const visibleRiskAssessments =
    risk_assessments.slice(
      (riskPage - 1) * ITEMS_PER_PAGE,
      riskPage * ITEMS_PER_PAGE
    );

  const totalClaimPages = Math.ceil(
    claim_assessment.length / ITEMS_PER_PAGE
  );

  const visibleClaimAssessments =
    claim_assessment.slice(
      (claimPage - 1) * ITEMS_PER_PAGE,
      claimPage * ITEMS_PER_PAGE
    );
  const UserContent=()=>{
    

          

    
    if(input_type=="url"){
      if(YtData?.thumbnail && YtData?.thumbnail!=""){
        "youtube url"
        return <div className="min-w-0 grid-cols-1 ">
          {/* {`title-> ${YtData.title}`} */}
          
 
      <UrlPreview  key={`htijfi-120`} url={YtData.video_url} />
      
                                    
    </div>
}
else{
  "webpage url"
  return <div className="min-w-0 grid-cols-1 max-w-">
        {/* <h1>{`title-> ${WebPageData.title}`}</h1> */}
        
      <UrlPreview  key={`htijfi-120`} url={WebPageData?.webpage_url} />
                                    
    </div>
}
    }
    else if(input_type=="image"){
return <div className="min-w-0 grid-cols-1 max-w-">
      <UrlPreview  key={`htijfi-120`} url={WebPageData?.webpage_url} />
                                    
    </div>
    }
    else{
      // return <p className="bg-red-700 text-white">hello my name{input_type}</p>
      
    }
    
  }


  // ==========================================================
  // EMPTY STATE
  // ==========================================================

  if (
    risk_assessments.length === 0 &&
    claim_assessment.length === 0
  ) {
    return (
      <div className="space-y-6">

        <PageHeader
          title="Analysis Dashboard"
          description="Review the results of your content analysis."
        />

        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">

            <div className="rounded-full bg-surface-2 p-4">
              <FileWarning className="h-8 w-8 text-muted" />
            </div>

            <h3 className="mt-4 text-base font-semibold text-foreground">
              No analysis results
            </h3>

            <p className="mt-2 max-w-md text-sm text-muted">
              There are currently no risk or claim assessments
              available for this analysis.
            </p>

          </CardContent>
        </Card>

      </div>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <div className="space-y-8">

      <ContextChatbot analysisContext={AnalysisData}/>

      {/* ======================================================
          FINAL RISK ASSESSMENT
      ====================================================== */}
      <section className="space-y-5">
        <SummaryCard
          title={`You asked`}
          icon={PersonStanding}
          summary={title}
          />
        <UserContent/>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Final Risk Assessment
          </h2>

          <p className="mt-1 text-sm text-muted">
            A high-level overview of the potential risk across
            all detected claims.
          </p>
        </div>

        {/* SUMMARY */}

        <SummaryCard
          title="Context-Aware Risk Summary"
          icon={AlertTriangle}
          summary={risk_summary}
        />

        {/* RISK LEVEL COUNTS */}

        <div className="grid gap-4  sm:grid-cols-2 lg:grid-cols-4">

          <StatCard
            title="Critical Risk"
            value={riskStats.critical}
            description="Claims classified as critical"
            icon={AlertTriangle}
            bg={"bg-risk-critical/20"}
            
            
          />

          <StatCard
            title="High Risk"
            value={riskStats.high}
            description="Claims classified as high risk"
            icon={ShieldAlert}
            bg={"bg-risk-high/20"}

          />

          <StatCard
            title="Moderate Risk"
            value={riskStats.moderate}
            description="Claims classified as moderate risk"
            icon={Info}
            bg={"bg-risk-moderate/20"}

          />

          <StatCard
            title="Low Risk"
            value={riskStats.low}
            description="Claims classified as low risk"
            icon={ShieldCheck}
            bg={"bg-risk-low/20"}

          />

        </div>

        {/* SCORE INFORMATION */}

        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            title="Highest Risk Score"
            value={`${riskStats.highest}/100`}
            description="Highest score detected"
          />

          <StatCard
            title="Lowest Risk Score"
            value={`${riskStats.lowest}/100`}
            description="Lowest score detected"
          />

          <StatCard
            title="Total Assessments"
            value={riskStats.total}
            description="Risk assessments generated"
          />

        </div>

        {/* INDIVIDUAL RISK ASSESSMENTS */}

        <Card>

          <CardHeader>
            <div className="flex items-center justify-between gap-4">

              <div>
                <CardTitle>
                  Individual Risk Assessments
                </CardTitle>

                <p className="mt-1 text-sm text-muted">
                  Review each detected claim and its assigned
                  risk level.
                </p>
              </div>

              <Badge tone="neutral">
                {risk_assessments.length} total
              </Badge>

            </div>
          </CardHeader>

          <CardContent className="space-y-3">

            {visibleRiskAssessments.map(
              (assessment, index) => (
                <RiskAssessmentItem
                  key={`${assessment.claim_id}-${index}`}
                  assessment={assessment}
                 
                />
              )
            )}

            <Pagination
              page={riskPage}
              totalPages={totalRiskPages}
              onPrevious={() =>
                setRiskPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              onNext={() =>
                setRiskPage((page) =>
                  Math.min(
                    totalRiskPages,
                    page + 1
                  )
                )
              }
            />

          </CardContent>

        </Card>

      </section>

      {/* ======================================================
          FINAL CLAIM ASSESSMENT
      ====================================================== */}

      <section className="space-y-5">

        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Final Claims Assessment
          </h2>

          <p className="mt-1 text-sm text-muted">
            A high-level overview of the factual relationship
            between the claims and the available evidence.
          </p>
        </div>

        {/* SUMMARY */}

        <SummaryCard
          title="Context-Aware Claims Summary"
          icon={CheckCircle2}
          summary={claim_summary}
        />

        {/* CONFIDENCE COUNTS */}

        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            title="High Confidence"
            value={claimStats.highConfidence}
            description="80–100% confidence"
            icon={CheckCircle2}
            bg={"bg-risk-high/20"}
          />

          <StatCard
            title="Moderate Confidence"
            value={claimStats.moderateConfidence}
            description="30–79% confidence"
            icon={Info}
            bg={"bg-risk-moderate/20"}
          />

          <StatCard
            title="Low Confidence"
            value={claimStats.lowConfidence}
            description="1–29% confidence"
            icon={FileWarning}
            bg={"bg-risk-low/20"}
          />

        </div>

        {/* VERDICT COUNTS */}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">

          <StatCard
            title="TRUE"
            value={claimStats.trueCount}
          />

          <StatCard
            title="FALSE"
            value={claimStats.falseCount}
          />

          <StatCard
            title="PARTIALLY TRUE"
            value={claimStats.partiallyTrueCount}
          />

          <StatCard
            title="MISLEADING"
            value={claimStats.misleadingCount}
          />

          <StatCard
            title="UNVERIFIED"
            value={claimStats.unverifiedCount}
          />

        </div>

        {/* CONFIDENCE EXTREMES */}

        <div className="grid gap-4 sm:grid-cols-3">

          <StatCard
            title="Highest Confidence"
            value={`${claimStats.highest}%`}
            description="Highest confidence detected"
          />

          <StatCard
            title="Lowest Confidence"
            value={`${claimStats.lowest}%`}
            description="Lowest confidence detected"
          />

          <StatCard
            title="Total Assessments"
            value={claimStats.total}
            description="Claims assessed"
          />

        </div>

        {/* INDIVIDUAL CLAIM ASSESSMENTS */}

        <Card>

          <CardHeader>
            <div className="flex items-center justify-between gap-4">

              <div>
                <CardTitle>
                  Individual Claim Assessments
                </CardTitle>

                <p className="mt-1 text-sm text-muted">
                  Review the detailed assessment of each claim.
                </p>
              </div>

              <Badge tone="neutral">
                {claim_assessment.length} total
              </Badge>

            </div>
          </CardHeader>

          <CardContent className="space-y-3">

            {visibleClaimAssessments.map(
              (assessment, index) => (
                <ClaimAssessmentItem
                  key={`${assessment.claim_id}-${index}`}
                  assessment={assessment}
                  urls={urls}
                  
                />
              )
            )}

            <Pagination
              page={claimPage}
              totalPages={totalClaimPages}
              onPrevious={() =>
                setClaimPage((page) =>
                  Math.max(1, page - 1)
                )
              }
              onNext={() =>
                setClaimPage((page) =>
                  Math.min(
                    totalClaimPages,
                    page + 1
                  )
                )
              }
            />

          </CardContent>

        </Card>

      </section>

    </div>
  );
}

// ============================================================
// DEMO DATA
// ============================================================

export const demoRiskAssessments: RiskAssessment[] = [
  {
    claim_id: "1",
    claim_text:
      "Drinking alcohol helps to defeat the coronavirus.",
    risk_level: "CRITICAL",
    risk_score: 90,
    reason:
      "The claim promotes a medically dangerous idea. Available factual evidence contradicts the claim, and believing it could encourage harmful health behavior.",
    user_input_id: "RaviPraj",
  },

  {
    claim_id: "2",
    claim_text:
      "WhatsApp removed video calling globally on July 9, 2026.",
    risk_level: "HIGH",
    risk_score: 82,
    reason:
      "The claim concerns a significant platform feature but sufficient verified evidence was not found to establish that the feature was removed globally.",
    user_input_id: "RaviPraj",
  },

  {
    claim_id: "3",
    claim_text:
      "Google has decided to hire 10,000 employees for its projects in India.",
    risk_level: "LOW",
    risk_score: 18,
    reason:
      "The claim has strong supporting evidence and presents limited potential harm.",
    user_input_id: "RaviPraj",
  },

  {
    claim_id: "4",
    claim_text:
      "A new technology will completely eliminate all traffic accidents.",
    risk_level: "MODERATE",
    risk_score: 52,
    reason:
      "The claim exaggerates the expected capabilities of the technology and may create an incorrect impression.",
    user_input_id: "RaviPraj",
  },

  {
    claim_id: "5",
    claim_text:
      "A celebrity secretly owns several companies worth billions.",
    risk_level: "HIGH",
    risk_score: 74,
    reason:
      "The claim could not be sufficiently verified and concerns potentially sensitive information about an individual.",
    user_input_id: "RaviPraj",
  },
];

const demoEvidence: Evidence = {
  matching_score: 0.9,
  reason:
    "The evidence directly addresses the factual proposition made by the claim.",
  claim_id: "1",
  claim_text:
    "Drinking alcohol helps to defeat the coronavirus.",
  evidence_claim:
    "Consuming alcohol beverages or vodka will reduce risk of COVID-19 infection.",
  user_input_id: "RaviPraj",
};

export const demoClaimAssessments: ClaimAssessment[] = [
  {
    claim_id: "1",
    claim_text:
      "Drinking alcohol helps to defeat the coronavirus.",
    verdict: "FALSE",
    confidence: 0.96,
    reason:
      "The available evidence directly contradicts the claim and indicates that alcohol consumption does not prevent coronavirus infection.",
    supporting_evidence: [],
    contradicting_evidence: [demoEvidence],
    user_input_id: "RaviPraj",
  },

  {
    claim_id: "2",
    claim_text:
      "WhatsApp removed video calling globally on July 9, 2026.",
    verdict: "UNVERIFIED",
    confidence: 0.42,
    reason:
      "No sufficient verified evidence was found to establish whether WhatsApp removed video calling globally on the specified date.",
    supporting_evidence: [],
    contradicting_evidence: [],
    user_input_id: "RaviPraj",
  },

  {
    claim_id: "3",
    claim_text:
      "Google has decided to hire 10,000 employees for its projects in India.",
    verdict: "TRUE",
    confidence: 0.91,
    reason:
      "The available evidence strongly supports the claim.",
    supporting_evidence: [demoEvidence],
    contradicting_evidence: [],
    user_input_id: "RaviPraj",
  },
];

// ============================================================
// DEMO COMPONENT
// ============================================================

export default function AnalysisDashboardDemo() {
  return (
    <AnalysisDashboard
      risk_assessments={demoRiskAssessments}
      claim_assessment={demoClaimAssessments}
      urls={[{'claim_id':'1',url:"hello"}]}
      claim_summary={"jdifj"}
      risk_summary="jdifjdifj"
    />
  );
}