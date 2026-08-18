// Centralized TypeScript data models for TruthLens AI (frontend/demo).

export type RiskLevel = "low" | "moderate" | "high" | "critical";

export type InputType = "text" | "image" | "audio" | "video" | "url";

export type ClaimStatus =
  | "verified"
  | "supported"
  | "partially-supported"
  | "unverified"
  | "misleading"
  | "false"
  | "insufficient-evidence";

export type SourceCategory =
  | "government"
  | "official-organization"
  | "academic"
  | "scientific"
  | "established-news"
  | "fact-checking"
  | "primary-source";

export type SourceVerification = "verified" | "reviewing" | "unverified";

export type ContentCategory =
  | "science"
  | "health"
  | "finance"
  | "technology"
  | "climate"
  | "politics"
  | "social-media"
  | "breaking-news";

export type CredibilityTier = "high" | "medium" | "low";

export type EvidenceType = "supporting" | "contradicting" | "missing-context";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  role: string;
  plan: string;
}

export interface Source {
  id: string;
  name: string;
  domain: string;
  category: SourceCategory;
  verification: SourceVerification;
  credibility: CredibilityTier;
  relevance: number; // 0-100
  publishedAt: string;
  lastChecked: string;
  excerpt: string;
  url: string;
}

export interface Evidence {
  id: string;
  type: EvidenceType;
  text: string;
  sourceId?: string;
  sourceName?: string;
}

export interface Claim {
  id: string;
  text: string;
  status: ClaimStatus;
  risk: number; // 0-100
  confidence: number; // 0-100
  category: ContentCategory;
  explanation: string;
  evidence: Evidence[];
  sources: Source[];
  createdAt: string;
}

export interface ModalitySignal {
  modality: "text" | "image" | "audio" | "video" | "source";
  label: string;
  value: number; // 0-100
}

export interface Analysis {
  id: string;
  title: string;
  inputType: InputType;
  riskScore: number; // 0-100
  riskLevel: RiskLevel;
  confidence: number; // 0-100
  claimsCount: number;
  sourcesCount: number;
  evidenceStrength: "weak" | "moderate" | "strong";
  category: ContentCategory;
  status: "completed" | "processing" | "failed";
  createdAt: string;
  submittedContent: string;
  claims: Claim[];
  sources: Source[];
  signals: ModalitySignal[];
  assessmentSummary: string[];
}

export interface DashboardStats {
  totalAnalyses: number;
  highRiskClaims: number;
  verifiedClaims: number;
  sourcesChecked: number;
  averageConfidence: number;
  trends: {
    totalAnalyses: number;
    highRiskClaims: number;
    verifiedClaims: number;
    sourcesChecked: number;
    averageConfidence: number;
  };
}

export interface RiskDistribution {
  level: RiskLevel;
  count: number;
}

export interface ActivityPoint {
  date: string;
  analyses: number;
  highRisk: number;
}

export interface Report {
  id: string;
  analysisId: string;
  title: string;
  riskLevel: RiskLevel;
  riskScore: number;
  status: "ready" | "generating" | "archived";
  createdAt: string;
}

export interface Insight {
  id: string;
  label: string;
  value: number;
  category?: ContentCategory;
}

export interface ProcessingStep {
  id: string;
  label: string;
  status: "done" | "active" | "pending";
}
