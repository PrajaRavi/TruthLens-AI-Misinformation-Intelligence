import React, { useState } from "react";
import { DataTable, Column } from "./DataTable"; // adjust import path as needed
import { cn } from "@/lib/utils";
import Link from "@/router";

import { Eye } from "lucide-react";

export interface Claim {
  claim_id: string;
  claim_text: string;
  verdict: string;
  confidence: number;
  reason: string;
  supporting_evidence?: any[];
  contradicting_evidence?: any[];
  user_input_id: string;
}

export interface RiskAssessment {
  claim_id: string;
  claim_text: string;
  risk_level: string;
  risk_score: number;
  reason: string;
  user_input_id: string;
}

export interface FactCheckReport {
  id: string;
  title: string;
  input_type: string;
  risk_score: number;
  risk_level: string;
  confidence: number;
  claims: Claim[];
  sources: string[];
  date: string;
  risk_assessment: RiskAssessment[];
}

const getRiskBadgeColor = (level: string) => {
  switch (level.toUpperCase()) {
    case "CRITICAL":
    case "HIGH":
      return "bg-red-500/10 text-red-500 border-red-500/20";
    case "MEDIUM":
      return "bg-amber-500/10 text-amber-500 border-amber-500/20";
    case "LOW":
      return "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
    default:
      return "bg-slate-500/10 text-slate-400 border-slate-500/20";
  }
};

export function DashBoardTableMe({ data }: { data: FactCheckReport[] }) {
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const toggleRow = (id: string) => {
    setExpandedRowId((prev) => (prev === id ? null : id));
  };

  const columns: Column<FactCheckReport>[] = [
    {
      key: "title",
      header: "Analysis Report",
      render: (row) => (
        <div>
          <div className="font-semibold text-foreground">{row.title}</div>
          <div className="text-xs text-muted flex gap-2 mt-0.5">
            <span>ID: {row.id}</span>
          </div>
        </div>
      ),
    },
    {
      key: "input_type",
      header: "Input Type",
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-2 border border-border capitalize text-foreground/80">
          {row.input_type.replace(/_/g, " ")}
        </span>
      ),
    },
    {
      key: "claims_count",
      header: "Claims",
      align: "center",
      render: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-surface-2 border border-border">
          {row.claims.length}
        </span>
      ),
    },
    {
      key: "sources_count",
      header: "Sources",
      align: "center",
      render: (row) => (
        <span className="font-mono text-xs font-semibold px-2 py-1 rounded bg-surface-2 border border-border">
          {row.sources.length}
        </span>
      ),
    },
    {
      key: "date",
      header: "Date",
      render: (row) => <span className="text-muted text-xs">{row.date}</span>,
    },
    {
      key: "risk_level",
      header: "Risk Level",
      render: (row) => (
        <span
          className={cn(
            "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
            getRiskBadgeColor(row.risk_level)
          )}
        >
          {row.risk_level}
        </span>
      ),
    },
    {
      key: "risk_score",
      header: "Risk Score",
      align: "right",
      render: (row) => (
        <span className="font-mono font-medium">{row.risk_score}/100</span>
      ),
    },
    {
      key: "confidence",
      header: "Confidence",
      align: "right",
      render: (row) => (
        <span className="font-mono text-muted">
          {(row.confidence * 100).toFixed(0)}%
        </span>
      ),
    },
    {
      key: "action",
      header: "Details",
      align: "center",
      render: (row) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            toggleRow(row.id);
          }}
          className="text-xs text-primary font-medium hover:underline"
        >
          <Link
            href={`/analyze?id=${row.id}`}
            className="rounded-md p-1.5 text-muted hover:bg-surface-2 hover:text-primary"
            aria-label="View analysis"
            title="View"
          >
            <Eye className="h-4 w-4" />
          </Link>
          
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        rows={data}
        rowKey={(row) => row.id}
        onRowClick={(row) => toggleRow(row.id)}
      />

      
    </div>
  );
}