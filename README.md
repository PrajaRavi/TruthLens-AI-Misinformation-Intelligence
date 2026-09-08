> ### Project Overview: TruthLenseAI 🎥🎥👉👉 [Project video](https://ik.imagekit.io/k5imwrh1hh/rag_documents/Screen%20Recording%202026-09-02%20183746.mp4)
>
> **What Is It?**
> TruthLenseAI is an AI-powered platform that helps users check whether information is reliable and understand its possible risk. It can analyze text, images, webpages, and YouTube content by finding evidence from multiple sources before giving an assessment.
>
> **The Problem It Solves**
> Information can spread quickly, while checking it manually can take a lot of time. TruthLenseAI reduces this effort by automatically finding important claims, collecting relevant evidence, comparing the information, and explaining the result in simple language.
>
> **How It Works**
> 1. **Give Content:** The user provides text, an image, webpage, or YouTube video.
> 2. **Find the Claims:** The system identifies the important statements that need to be checked.
> 3. **Check the Evidence:** It searches multiple sources and checks what supports or disagrees with each claim.
> 4. **Give the Result:** It provides a factual assessment, checks possible harmful content, calculates the overall risk, and explains the result clearly. If there is not enough evidence, it can mark the claim as **Unverified** instead of guessing.
>
> **Key Features & Benefits**
> - **Multiple Input Types:** Check text, images, webpages, and YouTube content in one place.
> - **Claim-Level Checking:** Breaks large content into individual claims for more focused analysis.
> - **Multiple Evidence Sources:** Uses evidence from different sources instead of depending on only one source.
> - **Factual Assessment:** Shows whether a claim is true, false, partly true, misleading, or unverified, along with the reason.
> - **Risk Assessment:** Checks both factual reliability and possible harmful content to provide an overall risk level.
> - **Simple Explanations:** Converts complex analysis into clear, easy-to-understand results.
> - **Context-Aware Chatbot:** Lets users ask questions about the completed analysis without repeating the entire analysis process.
> - **Evidence Before Judgment:** The platform helps users understand the available evidence rather than claiming to be an absolute authority on truth.


```
sih_52
├─ Backend
│  ├─ .env
│  ├─ alcohol_readme.md
│  ├─ app
│  │  ├─ Agents
│  │  │  ├─ Analysis_agent
│  │  │  │  ├─ graph.py
│  │  │  │  ├─ state.py
│  │  │  │  └─ __init__.py
│  │  │  ├─ Main_agent
│  │  │  │  ├─ graph.py
│  │  │  │  ├─ nodes
│  │  │  │  │  ├─ analysis
│  │  │  │  │  │  ├─ fact_evidence_analysis.py
│  │  │  │  │  │  ├─ web_evidence_analysis.py
│  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  ├─ assessments
│  │  │  │  │  │  ├─ claims
│  │  │  │  │  │  │  ├─ claim_assesment.py
│  │  │  │  │  │  │  ├─ extract_claims.py
│  │  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  │  ├─ risk
│  │  │  │  │  │  │  ├─ risk_assesment.py
│  │  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  ├─ assign_category.py
│  │  │  │  │  ├─ calc_overall_score.py
│  │  │  │  │  ├─ event_extrator_from_input_text.py
│  │  │  │  │  ├─ fanOut
│  │  │  │  │  │  ├─ google_fact_fan_out.py
│  │  │  │  │  │  ├─ hive_fan_out.py
│  │  │  │  │  │  ├─ web_search_fan_out.py
│  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  ├─ finding_evidence
│  │  │  │  │  │  ├─ finding_evidence.py
│  │  │  │  │  │  ├─ google_fact_worker.py
│  │  │  │  │  │  ├─ hive
│  │  │  │  │  │  │  ├─ hive_worker.py
│  │  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  │  ├─ web_evidence_worker.py
│  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  ├─ Input_classification
│  │  │  │  │  │  ├─ classify_input.py
│  │  │  │  │  │  ├─ handle_input_type_image.py
│  │  │  │  │  │  ├─ handling_input_type_url.py
│  │  │  │  │  │  ├─ input_router.py
│  │  │  │  │  │  └─ __init__.py
│  │  │  │  │  └─ summary
│  │  │  │  │     ├─ claim_assess_summary.py
│  │  │  │  │     ├─ risk_assess_summary.py
│  │  │  │  │     └─ __init__.py
│  │  │  │  ├─ state.py
│  │  │  │  └─ __init__.py
│  │  │  └─ Search_agent
│  │  │     ├─ graph.py
│  │  │     ├─ nodes
│  │  │     │  └─ chat.py
│  │  │     ├─ state.py
│  │  │     ├─ tools
│  │  │     │  ├─ tools.py
│  │  │     │  └─ __init__.py
│  │  │     └─ __init__.py
│  │  ├─ config.py
│  │  └─ main.py
│  ├─ DB
│  │  └─ database.py
│  ├─ ImageKit
│  │  └─ learn.py
│  ├─ main_new.py
│  ├─ notebooks
│  ├─ README.md
│  ├─ requirement.txt
│  ├─ services
│  │  └─ llms.py
│  └─ utils
│     ├─ Prompts.py
│     ├─ utils_func.py
│     └─ validate_input.py
├─ Frontend
│  ├─ .env
│  ├─ index.html
│  ├─ package-lock.json
│  ├─ package.json
│  ├─ README.md
│  ├─ src
│  │  ├─ App.tsx
│  │  ├─ components
│  │  │  ├─ AnalysisProgress.tsx
│  │  │  ├─ AnalysisResult2.tsx
│  │  │  ├─ AnalysisResults.tsx
│  │  │  ├─ auth
│  │  │  │  └─ AuthShell.tsx
│  │  │  ├─ charts
│  │  │  │  ├─ AreaChart.tsx
│  │  │  │  ├─ AreaChart1.tsx
│  │  │  │  ├─ BarChart.tsx
│  │  │  │  └─ DonutChart.tsx
│  │  │  ├─ ClaimCard.tsx
│  │  │  ├─ ConfidenceIndicator.tsx
│  │  │  ├─ ConverChatboat.tsx
│  │  │  ├─ DataTable.tsx
│  │  │  ├─ DataTable2.tsx
│  │  │  ├─ EvidenceCard.tsx
│  │  │  ├─ FilterBar.tsx
│  │  │  ├─ layout
│  │  │  │  ├─ AppShell.tsx
│  │  │  │  ├─ MobileSidebar.tsx
│  │  │  │  ├─ nav.ts
│  │  │  │  ├─ PageHeader.tsx
│  │  │  │  ├─ Sidebar.tsx
│  │  │  │  └─ Topbar.tsx
│  │  │  ├─ MarkdownRenderer.tsx
│  │  │  ├─ MultimodalSignals.tsx
│  │  │  ├─ MyAnalysisResult.tsx
│  │  │  ├─ PrivateComp.tsx
│  │  │  ├─ RiskBadge.tsx
│  │  │  ├─ RiskScore.tsx
│  │  │  ├─ SourceCard.tsx
│  │  │  ├─ StatCard.tsx
│  │  │  ├─ states.tsx
│  │  │  ├─ theme.tsx
│  │  │  ├─ ui
│  │  │  │  ├─ Avatar.tsx
│  │  │  │  ├─ Badge.tsx
│  │  │  │  ├─ Button.tsx
│  │  │  │  ├─ Card.tsx
│  │  │  │  ├─ Input.tsx
│  │  │  │  ├─ Modal.tsx
│  │  │  │  ├─ Progress.tsx
│  │  │  │  ├─ Select.tsx
│  │  │  │  ├─ Skeleton.tsx
│  │  │  │  ├─ Switch.tsx
│  │  │  │  ├─ Tabs.tsx
│  │  │  │  └─ Toast.tsx
│  │  │  └─ UploadZone.tsx
│  │  ├─ context
│  │  │  └─ counterContext.tsx
│  │  ├─ data
│  │  │  └─ mockData.ts
│  │  ├─ lib
│  │  │  ├─ constants.ts
│  │  │  └─ utils.ts
│  │  ├─ main.tsx
│  │  ├─ pages
│  │  │  ├─ AnalysisResultv2.tsx
│  │  │  ├─ Analyze.tsx
│  │  │  ├─ Claims.tsx
│  │  │  ├─ Dashboard.tsx
│  │  │  ├─ Error.tsx
│  │  │  ├─ FetchUserLoading.tsx
│  │  │  ├─ ForgotPassword.tsx
│  │  │  ├─ History.tsx
│  │  │  ├─ Insights.tsx
│  │  │  ├─ Landing.tsx
│  │  │  ├─ Login.tsx
│  │  │  ├─ Reports.tsx
│  │  │  ├─ ResetPassword.tsx
│  │  │  ├─ Settings.tsx
│  │  │  ├─ Signup.tsx
│  │  │  └─ Sources.tsx
│  │  ├─ router.tsx
│  │  ├─ services
│  │  │  ├─ analysis.ts
│  │  │  ├─ reports.ts
│  │  │  └─ sources.ts
│  │  ├─ styles.css
│  │  ├─ types
│  │  │  └─ index.ts
│  │  └─ utils
│  │     ├─ CircularLoader.tsx
│  │     ├─ constant.ts
│  │     ├─ DocUploader.tsx
│  │     ├─ MDRenderer.tsx
│  │     ├─ supabase.ts
│  │     └─ WarningTyping.tsx
│  ├─ tsconfig.json
│  └─ vite.config.ts
├─ just.js
├─ just.json
├─ README.md
└─ yu.py

```