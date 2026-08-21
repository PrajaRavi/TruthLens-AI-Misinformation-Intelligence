import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { cn, formatNumber } from "@/lib/utils";
import { CircularLoader } from "@/utils/CircularLoader";
import { useUser } from "@/context/counterContext";

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  icon: React.ReactNode;
  trend?: number;
  trendPositiveIsGood?: boolean;
  accentClass?: string;
}

export function StatCard({
  label,
  value,
  suffix = "",
  icon,
  trend,
  trendPositiveIsGood = true,
  accentClass = "text-primary bg-primary/10",
}: StatCardProps) {
  const positive = trend !== undefined && trend >= 0;
  const good = positive === trendPositiveIsGood;
  const {GlobalLoadingState}=useUser()

  return (
    <Card className="p-5 transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-lg",
            accentClass
          )}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium",
              good
                ? "bg-risk-low/10 text-risk-low"
                : "bg-risk-critical/10 text-risk-critical"
            )}
          >
            {positive ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : (
              <ArrowDownRight className="h-3 w-3" />
            )}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      {GlobalLoadingState?<div className="w-10 h-10">
          <CircularLoader/>
          </div>:<div>

      <p className="mt-4 text-2xl font-bold tracking-tight text-foreground tabular-nums">
        {formatNumber(value)}
        {suffix}
      </p>

      <p className="mt-0.5 text-sm text-muted">{label}</p>
      </div>}
      
    </Card>
  );
}
