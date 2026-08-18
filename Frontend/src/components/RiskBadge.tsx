import {
  AlertOctagon,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
} from "lucide-react";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import {
  CLAIM_STATUS_CONFIG,
  CREDIBILITY_CONFIG,
  RISK_CONFIG,
  SOURCE_VERIFICATION_CONFIG,
} from "@/lib/constants";
import type {
  ClaimStatus,
  CredibilityTier,
  RiskLevel,
  SourceVerification,
} from "@/types";

const riskTone: Record<RiskLevel, BadgeTone> = {
  low: "success",
  moderate: "warning",
  high: "danger",
  critical: "danger",
};

const riskIcon: Record<RiskLevel, React.ReactNode> = {
  low: <ShieldCheck className="h-3.5 w-3.5" />,
  moderate: <AlertTriangle className="h-3.5 w-3.5" />,
  high: <ShieldAlert className="h-3.5 w-3.5" />,
  critical: <AlertOctagon className="h-3.5 w-3.5" />,
};

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel;
  className?: string;
}) {
  return (
    <Badge tone={riskTone[level]} className={className}>
      {riskIcon[level]}
      {RISK_CONFIG[level].label}
    </Badge>
  );
}

export function ClaimStatusBadge({ status }: { status: ClaimStatus }) {
  const cfg = CLAIM_STATUS_CONFIG[status];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}

export function VerificationBadge({
  verification,
}: {
  verification: SourceVerification;
}) {
  const cfg = SOURCE_VERIFICATION_CONFIG[verification];
  return (
    <Badge tone={cfg.tone}>
      {verification === "verified" && <ShieldCheck className="h-3.5 w-3.5" />}
      {cfg.label}
    </Badge>
  );
}

export function CredibilityBadge({ tier }: { tier: CredibilityTier }) {
  const cfg = CREDIBILITY_CONFIG[tier];
  return <Badge tone={cfg.tone}>{cfg.label}</Badge>;
}
