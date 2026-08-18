import type {
  Analysis,
  ActivityPoint,
  Claim,
  DashboardStats,
  Insight,
  ModalitySignal,
  ProcessingStep,
  Report,
  RiskDistribution,
  Source,
  User,
} from "@/types";

export const currentUser: User = {
  id: "u_001",
  name: "Aditi Rao",
  email: "aditi.rao@truthlens.ai",
  role: "Lead Analyst",
  plan: "Research Pro",
};

export const dashboardStats: DashboardStats = {
  totalAnalyses: 1284,
  highRiskClaims: 187,
  verifiedClaims: 742,
  sourcesChecked: 3421,
  averageConfidence: 87,
  trends: {
    totalAnalyses: 12.4,
    highRiskClaims: -4.1,
    verifiedClaims: 8.7,
    sourcesChecked: 15.2,
    averageConfidence: 2.3,
  },
};

export const riskDistribution: RiskDistribution[] = [
  { level: "low", count: 612 },
  { level: "moderate", count: 398 },
  { level: "high", count: 187 },
  { level: "critical", count: 87 },
];

export const activityData: ActivityPoint[] = Array.from({ length: 30 }).map(
  (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const base = 28 + Math.round(18 * Math.sin(i / 3.2) + i * 0.6);
    const analyses = Math.max(8, base + ((i * 7) % 11) - 5);
    return {
      date: date.toISOString().slice(0, 10),
      analyses,
      highRisk: Math.max(1, Math.round(analyses * (0.12 + ((i % 5) * 0.03)))),
    };
  }
);

// ---- Sources -------------------------------------------------------------

export const sources: Source[] = [
  {
    id: "s_001",
    name: "World Health Organization",
    domain: "who.int",
    category: "official-organization",
    verification: "verified",
    credibility: "high",
    relevance: 96,
    publishedAt: "2025-11-04",
    lastChecked: "2026-01-08",
    excerpt:
      "Current epidemiological data does not support the claim; reported figures differ substantially from officially recorded case counts.",
    url: "https://who.int",
  },
  {
    id: "s_002",
    name: "Nature Climate Change",
    domain: "nature.com",
    category: "scientific",
    verification: "verified",
    credibility: "high",
    relevance: 93,
    publishedAt: "2025-09-22",
    lastChecked: "2026-01-06",
    excerpt:
      "Peer-reviewed measurements indicate a long-term warming trend inconsistent with the assertion of global cooling.",
    url: "https://nature.com",
  },
  {
    id: "s_003",
    name: "Reuters Fact Check",
    domain: "reuters.com",
    category: "fact-checking",
    verification: "verified",
    credibility: "high",
    relevance: 91,
    publishedAt: "2025-12-15",
    lastChecked: "2026-01-09",
    excerpt:
      "A reverse-image review found the photograph was captured in 2019 and is unrelated to the described recent event.",
    url: "https://reuters.com",
  },
  {
    id: "s_004",
    name: "U.S. Securities & Exchange Commission",
    domain: "sec.gov",
    category: "government",
    verification: "verified",
    credibility: "high",
    relevance: 88,
    publishedAt: "2025-10-30",
    lastChecked: "2026-01-05",
    excerpt:
      "No filing corroborates the claimed guaranteed returns; the described offering matches common characteristics of investment fraud.",
    url: "https://sec.gov",
  },
  {
    id: "s_005",
    name: "MIT Technology Review",
    domain: "technologyreview.com",
    category: "academic",
    verification: "verified",
    credibility: "high",
    relevance: 84,
    publishedAt: "2025-11-19",
    lastChecked: "2026-01-04",
    excerpt:
      "Independent testing shows the capability described is significantly overstated relative to published benchmarks.",
    url: "https://technologyreview.com",
  },
  {
    id: "s_006",
    name: "Associated Press",
    domain: "apnews.com",
    category: "established-news",
    verification: "verified",
    credibility: "high",
    relevance: 82,
    publishedAt: "2025-12-01",
    lastChecked: "2026-01-07",
    excerpt:
      "Official statements and on-the-ground reporting contradict several specifics contained in the viral post.",
    url: "https://apnews.com",
  },
  {
    id: "s_007",
    name: "Election Commission Official Record",
    domain: "eci.gov.in",
    category: "primary-source",
    verification: "verified",
    credibility: "high",
    relevance: 90,
    publishedAt: "2025-12-20",
    lastChecked: "2026-01-08",
    excerpt:
      "Certified turnout and results data are publicly available and do not match the figures cited in the article.",
    url: "https://eci.gov.in",
  },
  {
    id: "s_008",
    name: "PolitiFact",
    domain: "politifact.com",
    category: "fact-checking",
    verification: "reviewing",
    credibility: "medium",
    relevance: 76,
    publishedAt: "2025-11-28",
    lastChecked: "2026-01-03",
    excerpt:
      "A related statement was previously rated 'Mostly False'; the current claim shares similar unsupported assumptions.",
    url: "https://politifact.com",
  },
];

// ---- Evidence & Claims ---------------------------------------------------

export const claims: Claim[] = [
  {
    id: "c_001",
    text: "Global temperatures have been steadily declining over the past decade, disproving climate change.",
    status: "false",
    risk: 88,
    confidence: 94,
    category: "climate",
    explanation:
      "The claim contradicts long-term instrumental temperature records from multiple independent scientific bodies, which show continued warming rather than cooling.",
    evidence: [
      {
        id: "e_001",
        type: "contradicting",
        text: "Peer-reviewed datasets show the last decade contained several of the warmest years on record.",
        sourceId: "s_002",
        sourceName: "Nature Climate Change",
      },
      {
        id: "e_002",
        type: "missing-context",
        text: "Short-term year-to-year variability is misrepresented as a long-term declining trend.",
      },
      {
        id: "e_003",
        type: "contradicting",
        text: "Multiple meteorological agencies independently confirm a warming trend.",
        sourceId: "s_006",
        sourceName: "Associated Press",
      },
    ],
    sources: [sources[1], sources[5]],
    createdAt: "2026-01-09T10:20:00Z",
  },
  {
    id: "c_002",
    text: "This viral photograph shows flooding from a storm that occurred last week.",
    status: "misleading",
    risk: 74,
    confidence: 89,
    category: "social-media",
    explanation:
      "Reverse-image analysis indicates the image predates the referenced event and depicts an unrelated incident.",
    evidence: [
      {
        id: "e_004",
        type: "contradicting",
        text: "The image was originally published in 2019 in a different geographic region.",
        sourceId: "s_003",
        sourceName: "Reuters Fact Check",
      },
      {
        id: "e_005",
        type: "missing-context",
        text: "The post omits the original date and location metadata of the photograph.",
      },
    ],
    sources: [sources[2]],
    createdAt: "2026-01-08T14:05:00Z",
  },
  {
    id: "c_003",
    text: "A new investment program guarantees 40% monthly returns with zero risk.",
    status: "false",
    risk: 92,
    confidence: 96,
    category: "finance",
    explanation:
      "Guaranteed high returns with no risk are inconsistent with regulated financial products and match documented fraud patterns.",
    evidence: [
      {
        id: "e_006",
        type: "contradicting",
        text: "No regulatory filing supports the existence or legality of the described offering.",
        sourceId: "s_004",
        sourceName: "U.S. Securities & Exchange Commission",
      },
      {
        id: "e_007",
        type: "missing-context",
        text: "The claim omits standard disclosures required for legitimate investment products.",
      },
    ],
    sources: [sources[3]],
    createdAt: "2026-01-07T09:41:00Z",
  },
  {
    id: "c_004",
    text: "Voter turnout in the recent regional election exceeded 95% in every district.",
    status: "partially-supported",
    risk: 58,
    confidence: 81,
    category: "politics",
    explanation:
      "Official records confirm high turnout in some districts but not the uniform figure claimed across all districts.",
    evidence: [
      {
        id: "e_008",
        type: "supporting",
        text: "Certified data shows several districts did report turnout above 90%.",
        sourceId: "s_007",
        sourceName: "Election Commission Official Record",
      },
      {
        id: "e_009",
        type: "contradicting",
        text: "Official figures show many districts fell well below the claimed 95% threshold.",
        sourceId: "s_007",
        sourceName: "Election Commission Official Record",
      },
    ],
    sources: [sources[6]],
    createdAt: "2026-01-06T16:22:00Z",
  },
  {
    id: "c_005",
    text: "A newly released AI model can diagnose any disease with 100% accuracy.",
    status: "unverified",
    risk: 66,
    confidence: 78,
    category: "health",
    explanation:
      "No independent, peer-reviewed validation supports the claimed perfect accuracy across all conditions.",
    evidence: [
      {
        id: "e_010",
        type: "missing-context",
        text: "Published benchmarks measure narrow tasks, not universal diagnostic accuracy.",
        sourceId: "s_005",
        sourceName: "MIT Technology Review",
      },
    ],
    sources: [sources[4]],
    createdAt: "2026-01-05T11:30:00Z",
  },
  {
    id: "c_006",
    text: "Drinking this herbal tea cures viral infections within 24 hours.",
    status: "misleading",
    risk: 79,
    confidence: 90,
    category: "health",
    explanation:
      "There is no clinical evidence supporting the claimed rapid cure; health authorities report no such data.",
    evidence: [
      {
        id: "e_011",
        type: "contradicting",
        text: "Health authorities have not documented any evidence supporting the described cure.",
        sourceId: "s_001",
        sourceName: "World Health Organization",
      },
    ],
    sources: [sources[0]],
    createdAt: "2026-01-04T08:15:00Z",
  },
  {
    id: "c_007",
    text: "The company officially confirmed a merger in its latest press release.",
    status: "verified",
    risk: 12,
    confidence: 95,
    category: "finance",
    explanation:
      "The statement matches the company's official published release and corroborating news reporting.",
    evidence: [
      {
        id: "e_012",
        type: "supporting",
        text: "The official press release and multiple outlets confirm the merger announcement.",
        sourceId: "s_006",
        sourceName: "Associated Press",
      },
    ],
    sources: [sources[5]],
    createdAt: "2026-01-03T13:50:00Z",
  },
  {
    id: "c_008",
    text: "Renewable energy capacity additions reached record levels last year.",
    status: "supported",
    risk: 22,
    confidence: 88,
    category: "science",
    explanation:
      "Multiple credible datasets align with the claim, though exact totals vary slightly across sources.",
    evidence: [
      {
        id: "e_013",
        type: "supporting",
        text: "Scientific and agency datasets report record capacity additions.",
        sourceId: "s_002",
        sourceName: "Nature Climate Change",
      },
      {
        id: "e_014",
        type: "missing-context",
        text: "Different methodologies produce slightly different totals.",
      },
    ],
    sources: [sources[1]],
    createdAt: "2026-01-02T10:00:00Z",
  },
];

// ---- Signals -------------------------------------------------------------

export const defaultSignals: ModalitySignal[] = [
  { modality: "text", label: "Text Analysis", value: 82 },
  { modality: "image", label: "Image Analysis", value: 61 },
  { modality: "audio", label: "Audio Analysis", value: 42 },
  { modality: "source", label: "Source Verification", value: 91 },
];

// ---- Analyses ------------------------------------------------------------

export const analyses: Analysis[] = [
  {
    id: "AN-2041",
    title: "Viral climate claim",
    inputType: "text",
    riskScore: 78,
    riskLevel: "high",
    confidence: 91,
    claimsCount: 4,
    sourcesCount: 12,
    evidenceStrength: "moderate",  
    category: "climate",
    status: "completed",
    createdAt: "2026-01-09T10:24:00Z",
    submittedContent:
      "Global temperatures have been steadily declining over the past decade, and scientists are now admitting that climate change was exaggerated. New data shows the planet is actually cooling, disproving decades of warnings.",
    claims: [claims[0], claims[7]],
    sources: [sources[1], sources[5], sources[2]],
    signals: defaultSignals,
    assessmentSummary: [
      "Claim conflicts with information from cited scientific sources.",
      "Important context about long-term trends appears to be missing.",
      "Supporting evidence for the cooling assertion is insufficient.",
      "Multiple independent sources disagree with the claim.",
    ],
  },
  {
    id: "AN-2040",
    title: "Election-related article",
    inputType: "url",
    riskScore: 58,
    riskLevel: "moderate",
    confidence: 81,
    claimsCount: 3,
    sourcesCount: 9,
    evidenceStrength: "moderate",
    category: "politics",
    status: "completed",
    createdAt: "2026-01-08T18:12:00Z",
    submittedContent:
      "An article claims voter turnout in the recent regional election exceeded 95% in every district, citing unnamed officials.",
    claims: [claims[3]],
    sources: [sources[6], sources[7]],
    signals: [
      { modality: "text", label: "Text Analysis", value: 64 },
      { modality: "source", label: "Source Verification", value: 79 },
      { modality: "image", label: "Image Analysis", value: 0 },
      { modality: "audio", label: "Audio Analysis", value: 0 },
    ],
    assessmentSummary: [
      "Some claims are partially supported by official records.",
      "The uniform 95% figure is not corroborated across districts.",
      "Sources cited in the article could not be independently confirmed.",
    ],
  },
  {
    id: "AN-2039",
    title: "Social media image",
    inputType: "image",
    riskScore: 74,
    riskLevel: "high",
    confidence: 89,
    claimsCount: 2,
    sourcesCount: 6,
    evidenceStrength: "strong",
    category: "social-media",
    status: "completed",
    createdAt: "2026-01-08T09:47:00Z",
    submittedContent:
      "A widely shared photo captioned as showing flood damage from a storm that occurred last week.",
    claims: [claims[1]],
    sources: [sources[2]],
    signals: [
      { modality: "image", label: "Image Analysis", value: 88 },
      { modality: "text", label: "Text Analysis", value: 54 },
      { modality: "source", label: "Source Verification", value: 83 },
      { modality: "audio", label: "Audio Analysis", value: 0 },
    ],
    assessmentSummary: [
      "The image predates the referenced event.",
      "Original location and date context is missing.",
      "A fact-checking source contradicts the caption.",
    ],
  },
  {
    id: "AN-2038",
    title: "Financial market claim",
    inputType: "text",
    riskScore: 92,
    riskLevel: "critical",
    confidence: 96,
    claimsCount: 2,
    sourcesCount: 5,
    evidenceStrength: "strong",
    category: "finance",
    status: "completed",
    createdAt: "2026-01-07T11:03:00Z",
    submittedContent:
      "A message promotes a new investment program that guarantees 40% monthly returns with zero risk and urges immediate deposits.",
    claims: [claims[2]],
    sources: [sources[3]],
    signals: [
      { modality: "text", label: "Text Analysis", value: 94 },
      { modality: "source", label: "Source Verification", value: 90 },
      { modality: "image", label: "Image Analysis", value: 0 },
      { modality: "audio", label: "Audio Analysis", value: 0 },
    ],
    assessmentSummary: [
      "Guaranteed returns with zero risk are inconsistent with regulated products.",
      "No regulatory filing supports the offering.",
      "The message matches documented fraud patterns.",
    ],
  },
  {
    id: "AN-2037",
    title: "Health remedy audio clip",
    inputType: "audio",
    riskScore: 79,
    riskLevel: "high",
    confidence: 90,
    claimsCount: 1,
    sourcesCount: 4,
    evidenceStrength: "moderate",
    category: "health",
    status: "completed",
    createdAt: "2026-01-04T08:20:00Z",
    submittedContent:
      "An audio message claims a herbal tea cures viral infections within 24 hours.",
    claims: [claims[5]],
    sources: [sources[0]],
    signals: [
      { modality: "audio", label: "Audio Analysis", value: 71 },
      { modality: "text", label: "Text Analysis", value: 68 },
      { modality: "source", label: "Source Verification", value: 84 },
      { modality: "image", label: "Image Analysis", value: 0 },
    ],
    assessmentSummary: [
      "No clinical evidence supports the claimed cure.",
      "Health authorities report no such data.",
      "The claim omits important safety context.",
    ],
  },
  {
    id: "AN-2036",
    title: "AI capability announcement",
    inputType: "url",
    riskScore: 66,
    riskLevel: "moderate",
    confidence: 78,
    claimsCount: 2,
    sourcesCount: 7,
    evidenceStrength: "moderate",
    category: "technology",
    status: "completed",
    createdAt: "2026-01-05T11:35:00Z",
    submittedContent:
      "A blog post claims a newly released AI model can diagnose any disease with 100% accuracy.",
    claims: [claims[4]],
    sources: [sources[4]],
    signals: [
      { modality: "text", label: "Text Analysis", value: 62 },
      { modality: "source", label: "Source Verification", value: 74 },
      { modality: "image", label: "Image Analysis", value: 0 },
      { modality: "audio", label: "Audio Analysis", value: 0 },
    ],
    assessmentSummary: [
      "No peer-reviewed validation supports perfect accuracy.",
      "Benchmarks measure narrow tasks, not universal diagnosis.",
      "The claim overstates published capabilities.",
    ],
  },
  {
    id: "AN-2035",
    title: "Corporate merger confirmation",
    inputType: "text",
    riskScore: 12,
    riskLevel: "low",
    confidence: 95,
    claimsCount: 1,
    sourcesCount: 5,
    evidenceStrength: "strong",
    category: "finance",
    status: "completed",
    createdAt: "2026-01-03T13:55:00Z",
    submittedContent:
      "A statement reports that a company officially confirmed a merger in its latest press release.",
    claims: [claims[6]],
    sources: [sources[5]],
    signals: [
      { modality: "text", label: "Text Analysis", value: 34 },
      { modality: "source", label: "Source Verification", value: 92 },
      { modality: "image", label: "Image Analysis", value: 0 },
      { modality: "audio", label: "Audio Analysis", value: 0 },
    ],
    assessmentSummary: [
      "The statement matches the official press release.",
      "Multiple credible outlets corroborate the announcement.",
      "No contradicting evidence was found.",
    ],
  },
];

export const featuredAnalysis: Analysis = analyses[0];

// ---- Processing steps ----------------------------------------------------

export const processingSteps: ProcessingStep[] = [
  { id: "p1", label: "Content received", status: "done" },
  { id: "p2", label: "Extracting content", status: "done" },
  { id: "p3", label: "Detecting claims", status: "active" },
  { id: "p4", label: "Running multimodal analysis", status: "pending" },
  { id: "p5", label: "Cross-referencing sources", status: "pending" },
  { id: "p6", label: "Calculating risk", status: "pending" },
  { id: "p7", label: "Preparing assessment", status: "pending" },
];

// ---- Reports -------------------------------------------------------------

export const reports: Report[] = [
  {
    id: "RPT-8842",
    analysisId: "AN-2041",
    title: "Viral climate claim",
    riskLevel: "high",
    riskScore: 78,
    status: "ready",
    createdAt: "2026-01-09T10:40:00Z",
  },
  {
    id: "RPT-8841",
    analysisId: "AN-2038",
    title: "Financial market claim",
    riskLevel: "critical",
    riskScore: 92,
    status: "ready",
    createdAt: "2026-01-07T11:20:00Z",
  },
  {
    id: "RPT-8840",
    analysisId: "AN-2039",
    title: "Social media image",
    riskLevel: "high",
    riskScore: 74,
    status: "ready",
    createdAt: "2026-01-08T10:05:00Z",
  },
  {
    id: "RPT-8839",
    analysisId: "AN-2040",
    title: "Election-related article",
    riskLevel: "moderate",
    riskScore: 58,
    status: "generating",
    createdAt: "2026-01-08T18:30:00Z",
  },
  {
    id: "RPT-8838",
    analysisId: "AN-2035",
    title: "Corporate merger confirmation",
    riskLevel: "low",
    riskScore: 12,
    status: "archived",
    createdAt: "2026-01-03T14:10:00Z",
  },
];

// ---- Insights ------------------------------------------------------------

export const claimCategoryInsights: Insight[] = [
  { id: "cat1", label: "Health", value: 284, category: "health" },
  { id: "cat2", label: "Politics", value: 241, category: "politics" },
  { id: "cat3", label: "Climate", value: 198, category: "climate" },
  { id: "cat4", label: "Finance", value: 176, category: "finance" },
  { id: "cat5", label: "Technology", value: 152, category: "technology" },
  { id: "cat6", label: "Science", value: 121, category: "science" },
  { id: "cat7", label: "Social Media", value: 289, category: "social-media" },
  { id: "cat8", label: "Breaking News", value: 143, category: "breaking-news" },
];

export const contentTypeInsights: Insight[] = [
  { id: "ct1", label: "Text", value: 486 },
  { id: "ct2", label: "URL", value: 371 },
  { id: "ct3", label: "Image", value: 248 },
  { id: "ct4", label: "Video", value: 112 },
  { id: "ct5", label: "Audio", value: 67 },
];

export const sourceUsageInsights: Insight[] = [
  { id: "su1", label: "Fact Checking", value: 842 },
  { id: "su2", label: "Established News", value: 731 },
  { id: "su3", label: "Government", value: 612 },
  { id: "su4", label: "Scientific", value: 498 },
  { id: "su5", label: "Academic", value: 421 },
  { id: "su6", label: "Primary Source", value: 317 },
];
