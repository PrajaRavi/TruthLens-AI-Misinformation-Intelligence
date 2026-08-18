import { useMemo, useState } from "react";
import Link from "@/router";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Flag,
  GitCompare,
} from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DataTable, type Column } from "@/components/DataTable";
import { RiskBadge } from "@/components/RiskBadge";
import { SearchBar, FilterChips } from "@/components/FilterBar";
import { DemoDataTag } from "@/components/states";
import { Card, CardContent } from "@/components/ui/Card";
import { Select } from "@/components/ui/Select";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { analyses } from "@/data/mockData";
import { INPUT_TYPE_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Analysis, RiskLevel } from "@/types";

const riskFilters = [
  { value: "all", label: "All Risk" },
  { value: "low", label: "Low" },
  { value: "moderate", label: "Moderate" },
  { value: "high", label: "High" },
  { value: "critical", label: "Critical" },
];

const PAGE_SIZE = 5;

export default function HistoryPage() {
  const { toast } = useToast();
  const [query, setQuery] = useState("");
  const [risk, setRisk] = useState("all");
  const [type, setType] = useState("all");
  const [sort, setSort] = useState("date-desc");
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    let rows = analyses.filter((a) => {
      const matchesQuery =
        a.title.toLowerCase().includes(query.toLowerCase()) ||
        a.id.toLowerCase().includes(query.toLowerCase());
      const matchesRisk = risk === "all" || a.riskLevel === risk;
      const matchesType = type === "all" || a.inputType === type;
      return matchesQuery && matchesRisk && matchesType;
    });
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "date-asc":
          return a.createdAt.localeCompare(b.createdAt);
        case "risk-desc":
          return b.riskScore - a.riskScore;
        case "risk-asc":
          return a.riskScore - b.riskScore;
        default:
          return b.createdAt.localeCompare(a.createdAt);
      }
    });
    return rows;
  }, [query, risk, type, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const current = Math.min(page, totalPages);
  const paged = filtered.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE);

  const columns: Column<Analysis>[] = [
    {
      key: "id",
      header: "ID",
      render: (a) => (
        <span className="font-mono text-xs text-muted">{a.id}</span>
      ),
    },
    {
      key: "content",
      header: "Content",
      render: (a) => (
        <div className="max-w-[220px]">
          <p className="truncate font-medium text-foreground">{a.title}</p>
          <p className="truncate text-xs text-muted">{a.submittedContent}</p>
        </div>
      ),
    },
    {
      key: "type",
      header: "Type",
      render: (a) => (
        <span className="inline-flex rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">
          {INPUT_TYPE_LABELS[a.inputType]}
        </span>
      ),
    },
    {
      key: "risk",
      header: "Risk",
      render: (a) => <RiskBadge level={a.riskLevel as RiskLevel} />,
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      render: (a) => <span className="tabular-nums">{a.confidence}%</span>,
    },
    {
      key: "sources",
      header: "Sources",
      align: "right",
      render: (a) => <span className="tabular-nums">{a.sourcesCount}</span>,
    },
    {
      key: "date",
      header: "Date",
      render: (a) => (
        <span className="text-muted">{formatDate(a.createdAt)}</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (a) => (
        <Badge tone={a.status === "completed" ? "success" : "warning"}>
          {a.status === "completed" ? "Completed" : "Processing"}
        </Badge>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      render: (a) => (
        <div className="flex items-center gap-1">
          <Link
            href={`/analyze?id=${a.id}`}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-primary"
            aria-label="View analysis"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            onClick={() => toast({ type: "info", title: "Compare (demo)" })}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
            aria-label="Compare analysis"
            title="Compare"
          >
            <GitCompare className="h-4 w-4" />
          </button>
          <button
            onClick={() =>
              toast({ type: "success", title: "Report requested (demo)" })
            }
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-foreground"
            aria-label="Report analysis"
            title="Report"
          >
            <Flag className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analysis History"
        description="Browse, search, and review all past content analyses."
        actions={<DemoDataTag />}
      />

      <Card>
        <CardContent className="space-y-4 pt-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
            <SearchBar
              value={query}
              onChange={(v) => {
                setQuery(v);
                setPage(1);
              }}
              placeholder="Search by title or ID…"
              className="lg:max-w-xs"
            />
            <div className="flex flex-wrap items-center gap-3">
              <Select
                aria-label="Filter by input type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                options={[
                  { value: "all", label: "All Types" },
                  { value: "text", label: "Text" },
                  { value: "image", label: "Image" },
                  { value: "audio", label: "Audio" },
                  { value: "video", label: "Video" },
                  { value: "url", label: "URL" },
                ]}
                className="w-36"
              />
              <Select
                aria-label="Sort analyses"
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                options={[
                  { value: "date-desc", label: "Newest first" },
                  { value: "date-asc", label: "Oldest first" },
                  { value: "risk-desc", label: "Highest risk" },
                  { value: "risk-asc", label: "Lowest risk" },
                ]}
                className="w-40"
              />
            </div>
          </div>
          <FilterChips
            options={riskFilters}
            value={risk}
            onChange={(v) => {
              setRisk(v);
              setPage(1);
            }}
          />

          <DataTable
            columns={columns}
            rows={paged}
            rowKey={(a) => a.id}
            emptyMessage="No analyses match your filters."
          />

          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p className="text-xs text-muted">
              Showing {paged.length} of {filtered.length} analyses
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={current === 1}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border-strong px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </button>
              <span className="text-xs text-muted">
                Page {current} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={current === totalPages}
                className="inline-flex h-8 items-center gap-1 rounded-md border border-border-strong px-2.5 text-xs font-medium text-foreground transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
