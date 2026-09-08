import { PageHeader } from "@/components/layout/PageHeader";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { AreaChart } from "@/components/charts/AreaChart";
import { BarChart } from "@/components/charts/BarChart";
import { DonutChart } from "@/components/charts/DonutChart";
import { DemoDataTag } from "@/components/states";
import {
  activityData,
  claimCategoryInsights,
  contentTypeInsights,
  riskDistribution,
  sourceUsageInsights,
} from "@/data/mockData";
import { RISK_CONFIG } from "@/lib/constants";

const riskColors: Record<string, string> = {
  low: "--risk-low",
  moderate: "--risk-moderate",
  high: "--risk-high",
  critical: "--risk-critical",
};

export default function InsightsPage() {
  const total = riskDistribution.reduce((s, r) => s + r.count, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="AI Insights"
        description="Aggregate analytics across analyses, claims, and cross-referenced sources."
        actions={<DemoDataTag />}
      />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Risk Trends</CardTitle>
              <p className="mt-1 text-sm text-muted">
                Analysis activity — last 30 days
              </p>
            </div>
            <DemoDataTag />
          </CardHeader>
          <CardContent>
            <AreaChart data={activityData} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Risk Distribution</CardTitle>
            <DemoDataTag />
          </CardHeader>
          <CardContent>
            <DonutChart
              size={160}
              thickness={22}
              centerValue={total.toLocaleString()}
              centerLabel="Analyses"
              segments={riskDistribution.map((r) => ({
                label: RISK_CONFIG[r.level].label,
                value: r.count,
                colorVar: riskColors[r.level],
              }))}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Most Common Claim Categories</CardTitle>
            <DemoDataTag />
          </CardHeader>
          <CardContent>
            <BarChart data={claimCategoryInsights} colorVar="--accent" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Most Analyzed Content Types</CardTitle>
            <DemoDataTag />
          </CardHeader>
          <CardContent>
            <BarChart data={contentTypeInsights} colorVar="--primary" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Source Usage</CardTitle>
            <DemoDataTag />
          </CardHeader>
          <CardContent>
            <BarChart data={sourceUsageInsights} colorVar="--risk-low" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>Analysis Activity</CardTitle>
            <DemoDataTag />
          </CardHeader>
          <CardContent>
            <AreaChart data={activityData.slice(-14)} height={200} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
