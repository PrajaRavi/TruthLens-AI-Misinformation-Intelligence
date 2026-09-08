import Link from "@/router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Eye,
  FileCheck2,
  GitCompare,
  ListChecks,
  Search,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { StatCard } from "@/components/StatCard";
import { RiskBadge } from "@/components/RiskBadge";
import { DonutChart } from "@/components/charts/DonutChart";
import { AreaChart } from "@/components/charts/AreaChart1";
import { DashBoardTableMe, FactCheckReport } from "@/components/DataTable2";
import { DemoDataTag } from "@/components/states";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  activityData,
  analyses,
  // dashboardStats,
  // riskDistribution,
} from "@/data/mockData";
import { INPUT_TYPE_LABELS, RISK_CONFIG } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import type { Analysis, DashboardStats, RiskDistribution } from "@/types";
import { useState } from "react";
import { useUser } from "@/context/counterContext";
import { supabase } from "@/utils/supabase";
import { useToast } from "@/components/ui/Toast";
import { DataPoint, sampleFactCheckData} from "./Signup";
import { CircularLoader } from "@/utils/CircularLoader";

const riskColors: Record<string, string> = {
  low: "--risk-low",
  moderate: "--risk-moderate",
  high: "--risk-high",
  critical: "--risk-critical",
};

export default function DashboardPage({dashboardStats,riskDistribution,sampleActivityData,RecentAnalysis}:{dashboardStats:DashboardStats,riskDistribution:RiskDistribution[],sampleActivityData:DataPoint[],RecentAnalysis:FactCheckReport[]}) {

const {toast}=useToast()
  // let [totalRisk,settotalRisk]=useState<number>(riskDistribution.reduce((s, r) => s + r.count, 0))
  const totalRisk = riskDistribution.reduce((s, r) => s + r.count, 0);

  
  
  return (
    <div className="space-y-6">
      {/* Hero */}
      <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-primary/8 via-surface to-accent/8">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs font-medium text-accent">
              <Sparkles className="h-3.5 w-3.5" />
              AI Misinformation Intelligence
            </span>
            {/* <DemoDataTag /> */}
          </div>
          <h2 className="mt-4 max-w-3xl text-2xl font-bold leading-tight tracking-tight text-foreground sm:text-3xl">
            Detect Misinformation. Verify Claims. Trust Better Sources.
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-muted sm:text-base">
            Analyze multimodal content, identify suspicious claims, and
            cross-reference evidence from trusted sources.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link
              href="/analyze"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              <Search className="h-4 w-4" />
              Start New Analysis
            </Link>
            <Link
              href="/history"
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-border-strong px-6 text-sm font-medium text-foreground transition-colors hover:bg-surface-2"
            >
              View History
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-muted">Overview</h3>
          {/* <DemoDataTag /> */}
        </div>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <StatCard
            label="Total Analyses"
            value={dashboardStats.totalAnalyses}
            icon={<BarChart3 className="h-5 w-5" />}
            // trend={dashboardStats.trends.totalAnalyses}
          />
          <StatCard
            label="High-Risk Claims"
            value={dashboardStats.highRiskClaims}
            icon={<ShieldAlert className="h-5 w-5" />}
            // trend={dashboardStats.trends.highRiskClaims}
            trendPositiveIsGood={false}
            accentClass="text-risk-high bg-risk-high/10"
          />
          {/* <StatCard
            label="Verified Claims"
            value={dashboardStats.verifiedClaims}
            icon={<FileCheck2 className="h-5 w-5" />}
            trend={dashboardStats.trends.verifiedClaims}
            accentClass="text-risk-low bg-risk-low/10"
          /> */}
          <StatCard
            label="Sources Checked"
            value={dashboardStats.sourcesChecked}
            icon={<ListChecks className="h-5 w-5" />}
            // trend={dashboardStats.trends.sourcesChecked}
            accentClass="text-accent bg-accent/10"
          />
          <StatCard
            label="Average Confidence"
            value={dashboardStats.averageConfidence}
            suffix="%"
            icon={<Activity className="h-5 w-5" />}
            // trend={dashboardStats.trends.averageConfidence}
          />
        </div>
      </div>

      {/* Charts */}
      <div className="grid gap-6 lg:grid-cols-5">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Misinformation Risk Distribution</CardTitle>
            {/* <DemoDataTag /> */}
          </CardHeader>
          <CardContent>
            <DonutChart
              size={180}
              centerValue={totalRisk.toLocaleString()}
              centerLabel="Total"
              segments={riskDistribution.map((r) => ({
                label: RISK_CONFIG[r.level].label,
                value: r.count,
                colorVar: riskColors[r.level],
              }))}
            />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Analysis Activity</CardTitle>
              <p className="mt-1 text-sm text-muted">Last 30 days</p>
            </div>
            {/* <DemoDataTag /> */}
          </CardHeader>
          <CardContent>
            <AreaChart data={sampleActivityData} />
          </CardContent>
        </Card>
      </div>

      {/* Recent analyses */}
      <Card>
        <CardHeader className="flex-row items-center justify-between">
          <CardTitle>Recent Analyses</CardTitle>
          <Link
            href="/history"
            className="inline-flex h-8 items-center rounded-md border border-border-strong px-3 text-xs font-medium text-foreground transition-colors hover:bg-surface-2"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          <DashBoardTableMe data={RecentAnalysis} />
              
        </CardContent>
      </Card>
    </div>
  );
}
