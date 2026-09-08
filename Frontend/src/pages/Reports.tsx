import { useState } from "react";
import { Download, Eye, FileText, Share2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { RiskBadge } from "@/components/RiskBadge";
import { RiskScore } from "@/components/RiskScore";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card, CardContent } from "@/components/ui/Card";
import { DemoDataTag, Disclaimer } from "@/components/states";
import { useToast } from "@/components/ui/Toast";
import { analyses, reports } from "@/data/mockData";
import { formatDate } from "@/lib/utils";
import type { Report } from "@/types";

const statusTone = {
  ready: "success",
  generating: "warning",
  archived: "neutral",
} as const;

export default function ReportsPage() {
  const { toast } = useToast();
  const [active, setActive] = useState<Report | null>(null);

  const analysis = active
    ? analyses.find((a) => a.id === active.analysisId)
    : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Reports"
        description="Generated misinformation assessment reports ready to view, download, or share."
        actions={<DemoDataTag />}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {reports.map((report) => (
          <Card key={report.id} className="flex flex-col p-5">
            <div className="flex items-start justify-between">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <FileText className="h-5 w-5" />
              </div>
              <Badge tone={statusTone[report.status]}>
                {report.status === "ready"
                  ? "Ready"
                  : report.status === "generating"
                    ? "Generating"
                    : "Archived"}
              </Badge>
            </div>
            <p className="mt-4 font-mono text-xs text-muted">{report.id}</p>
            <h3 className="mt-0.5 text-sm font-semibold text-foreground">
              {report.title}
            </h3>
            <div className="mt-3 flex items-center gap-2">
              <RiskBadge level={report.riskLevel} />
              <span className="text-xs text-muted">
                Score {report.riskScore}/100
              </span>
            </div>
            <p className="mt-2 text-xs text-muted">
              {formatDate(report.createdAt)}
            </p>
            <div className="mt-4 flex items-center gap-2 border-t border-border pt-3">
              <Button
                variant="subtle"
                size="sm"
                onClick={() => setActive(report)}
                disabled={report.status === "generating"}
              >
                <Eye className="h-3.5 w-3.5" /> View
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  toast({
                    type: "success",
                    title: "Download started (demo)",
                    description: `${report.id}.pdf`,
                  })
                }
              >
                <Download className="h-3.5 w-3.5" /> Download
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Share report"
                onClick={() =>
                  toast({ type: "info", title: "Share link copied (demo)" })
                }
              >
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Modal
        open={!!active}
        onClose={() => setActive(null)}
        title={active ? `Report ${active.id}` : undefined}
        description={active?.title}
        className="max-w-2xl"
        footer={
          <>
            <Button variant="outline" onClick={() => setActive(null)}>
              Close
            </Button>
            <Button
              onClick={() =>
                toast({ type: "success", title: "Download started (demo)" })
              }
            >
              <Download className="h-4 w-4" /> Download PDF
            </Button>
          </>
        }
      >
        {analysis && (
          <div className="space-y-5 text-sm">
            <ReportSection index={1} title="Submitted Content">
              <p className="rounded-lg border-l-4 border-primary/40 bg-surface-2/50 p-3 text-foreground/90">
                {analysis.submittedContent}
              </p>
            </ReportSection>

            <ReportSection index={2} title="Risk Assessment">
              <div className="flex items-center gap-4">
                <RiskScore
                  score={analysis.riskScore}
                  level={analysis.riskLevel}
                  size={110}
                />
                <div className="space-y-1.5 text-muted">
                  <p>
                    Confidence:{" "}
                    <span className="font-semibold text-foreground">
                      {analysis.confidence}%
                    </span>
                  </p>
                  <p>
                    Claims:{" "}
                    <span className="font-semibold text-foreground">
                      {analysis.claimsCount}
                    </span>
                  </p>
                  <p>
                    Sources:{" "}
                    <span className="font-semibold text-foreground">
                      {analysis.sourcesCount}
                    </span>
                  </p>
                </div>
              </div>
            </ReportSection>

            <ReportSection index={3} title="Detected Claims">
              <ul className="space-y-2">
                {analysis.claims.map((c) => (
                  <li
                    key={c.id}
                    className="rounded-lg border border-border p-3"
                  >
                    <p className="text-foreground">{c.text}</p>
                    <p className="mt-1 text-xs text-muted">
                      Risk {c.risk}/100 · Confidence {c.confidence}%
                    </p>
                  </li>
                ))}
              </ul>
            </ReportSection>

            <ReportSection index={4} title="Evidence">
              <ul className="list-disc space-y-1 pl-5 text-foreground/90">
                {analysis.claims
                  .flatMap((c) => c.evidence)
                  .slice(0, 4)
                  .map((e) => (
                    <li key={e.id}>{e.text}</li>
                  ))}
              </ul>
            </ReportSection>

            <ReportSection index={5} title="Sources">
              <ul className="space-y-1.5">
                {analysis.sources.map((s) => (
                  <li
                    key={s.id}
                    className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                  >
                    <span className="font-medium text-foreground">
                      {s.name}
                    </span>
                    <span className="text-xs text-muted">{s.domain}</span>
                  </li>
                ))}
              </ul>
            </ReportSection>

            <ReportSection index={6} title="Assessment Summary">
              <ul className="space-y-1.5">
                {analysis.assessmentSummary.map((p, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-foreground/90">{p}</span>
                  </li>
                ))}
              </ul>
            </ReportSection>

            <ReportSection index={7} title="Disclaimer">
              <Disclaimer />
            </ReportSection>
          </div>
        )}
      </Modal>
    </div>
  );
}

function ReportSection({
  index,
  title,
  children,
}: {
  index: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted">
        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-surface-2 text-[10px] text-foreground">
          {index}
        </span>
        {title}
      </h4>
      {children}
    </section>
  );
}
