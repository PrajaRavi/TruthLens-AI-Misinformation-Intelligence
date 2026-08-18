import type {
  ClaimStatus,
  ContentCategory,
  CredibilityTier,
  InputType,
  RiskLevel,
  SourceCategory,
  SourceVerification,
} from "@/types";

interface RiskConfig {
  label: string;
  colorVar: string; // hsl var name
  textClass: string;
  bgClass: string;
  borderClass: string;
}

export const RISK_CONFIG: Record<RiskLevel, RiskConfig> = {
  low: {
    label: "Low Risk",
    colorVar: "--risk-low",
    textClass: "text-risk-low",
    bgClass: "bg-risk-low/10",
    borderClass: "border-risk-low/30",
  },
  moderate: {
    label: "Moderate Risk",
    colorVar: "--risk-moderate",
    textClass: "text-risk-moderate",
    bgClass: "bg-risk-moderate/10",
    borderClass: "border-risk-moderate/30",
  },
  high: {
    label: "High Risk",
    colorVar: "--risk-high",
    textClass: "text-risk-high",
    bgClass: "bg-risk-high/10",
    borderClass: "border-risk-high/30",
  },
  critical: {
    label: "Critical Risk",
    colorVar: "--risk-critical",
    textClass: "text-risk-critical",
    bgClass: "bg-risk-critical/10",
    borderClass: "border-risk-critical/30",
  },
};

export function riskLevelFromScore(score: number): RiskLevel {
  if (score >= 85) return "critical";
  if (score >= 65) return "high";
  if (score >= 40) return "moderate";
  return "low";
}

interface StatusConfig {
  label: string;
  tone: "success" | "warning" | "danger" | "neutral" | "info";
}

export const CLAIM_STATUS_CONFIG: Record<ClaimStatus, StatusConfig> = {
  verified: { label: "Verified", tone: "success" },
  supported: { label: "Supported", tone: "success" },
  "partially-supported": { label: "Partially Supported", tone: "warning" },
  unverified: { label: "Unverified", tone: "neutral" },
  misleading: { label: "Misleading", tone: "warning" },
  false: { label: "False", tone: "danger" },
  "insufficient-evidence": { label: "Insufficient Evidence", tone: "neutral" },
};

export const SOURCE_CATEGORY_LABELS: Record<SourceCategory, string> = {
  government: "Government",
  "official-organization": "Official Organization",
  academic: "Academic",
  scientific: "Scientific",
  "established-news": "Established News",
  "fact-checking": "Fact Checking",
  "primary-source": "Primary Source",
};

export const SOURCE_VERIFICATION_CONFIG: Record<
  SourceVerification,
  StatusConfig
> = {
  verified: { label: "Verified", tone: "success" },
  reviewing: { label: "Under Review", tone: "warning" },
  unverified: { label: "Unverified", tone: "neutral" },
};

export const CREDIBILITY_CONFIG: Record<CredibilityTier, StatusConfig> = {
  high: { label: "High Credibility", tone: "success" },
  medium: { label: "Medium Credibility", tone: "warning" },
  low: { label: "Low Credibility", tone: "danger" },
};

export const CONTENT_CATEGORY_LABELS: Record<ContentCategory, string> = {
  science: "Science",
  health: "Health",
  finance: "Finance",
  technology: "Technology",
  climate: "Climate",
  politics: "Politics",
  "social-media": "Social Media",
  "breaking-news": "Breaking News",
};

export const INPUT_TYPE_LABELS: Record<InputType, string> = {
  text: "Text",
  image: "Image",
  audio: "Audio",
  video: "Video",
  url: "URL",
};

export const DISCLAIMER_TEXT =
  "AI-generated assessments are probabilistic and should not be treated as definitive proof. Review the cited evidence and original sources before making important decisions.";
export const localUser="mynameisravi"