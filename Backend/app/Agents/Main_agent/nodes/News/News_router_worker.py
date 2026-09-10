from typing import Literal, Optional
from pydantic import BaseModel, Field
from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput
from utils.Prompts import NEWS_ROUTER_PROMPT,ARTICLE_ASSESSMENT_PROMPT
from app.config import llms,settings
from utils.utils_func import extract_webpage_content
from langchain_classic.utils.math import cosine_similarity



class ArticleAssessment(BaseModel):
    relation: Literal["supports", "contradicts", "neutral"] = Field(
        description=(
            "Whether the article supports, contradicts, or is neutral toward "
            "the actual claim."
        )
    )

    reason: str = Field(
        description=(
            "A short concise explanation of why the article supports, "
            "contradicts, or is neutral toward the claim."
        )
    )

    evidence_claim: str = Field(
        description=(
            "A short concise summary of the article's relevant evidence "
            "related to the claim."
        )
    )

class NewsClassification(BaseModel):
    is_news: bool = Field(
        description="Whether the claim is primarily about a news event or current affair."
    )

    has_date_reference: bool = Field(
        description="Whether the claim explicitly refers to a specific date, day, today, yesterday, tomorrow, or another temporal reference."
    )

    date: Optional[str] = Field(
        default=None,
        description="Specific date mentioned or inferred from the claim, in YYYY-MM-DD format. Null if no specific date is present."
    )

    search_query: str = Field(
        description="Concise keyword-based search query containing the important entities and topics from the claim."
    )

structured_llm=llms.GEMINI_FALLBACK_LLM.with_structured_output(NewsClassification)

import asyncio
import httpx



async def news_search_router(state: dict) -> InvestigationState:

    claim_id = state["id"]
    claim_text = state["claim"]

    # ============================================================
    # STEP 1: LLM determines how the claim should be searched
    # ============================================================

    result = await structured_llm.ainvoke([
        {
            "role": "system",
            "content": NEWS_ROUTER_PROMPT
        },
        {
            "role": "user",
            "content": claim_text
        }
    ])

    # ============================================================
    # STEP 2: Build NewsAPI parameters
    # ============================================================

    if result.is_news:

        if result.has_date_reference and result.date:

            # Date-specific news search
            endpoint = "https://newsapi.org/v2/everything"

            params = {
                "q": result.search_query,
                "from": result.date,
                "to": result.date,
                "sortBy": "relevancy",
                "pageSize": 10,
                "apiKey": settings.NEWS_API_KEY,
            }

        else:

            # Current/top headlines
            endpoint = "https://newsapi.org/v2/top-headlines"

            params = {
                "q": result.search_query,
                "pageSize": 10,
                "apiKey": settings.NEWS_API_KEY,
            }

    else:

        # General article discovery
        endpoint = "https://newsapi.org/v2/everything"

        params = {
            "q": result.search_query,
            "sortBy": "relevancy",
            "pageSize": 10,
            "apiKey": settings.NEWS_API_KEY,
        }

    # ============================================================
    # STEP 3: Search NewsAPI
    # ============================================================

    async with httpx.AsyncClient(timeout=30.0) as client:

        response = await client.get(
            endpoint,
            params=params
        )

        response.raise_for_status()

        news_result = response.json()

    # ============================================================
    # STEP 4: Validate NewsAPI response
    # ============================================================

    if news_result.get("status") != "ok":

        return {
            "id": claim_id,
            "claim": claim_text,
            "news_articles": [],
            "relevant_articles": [],
            "supporting": [],
            "contradicting": [],
        }

    articles = news_result.get("articles", [])

    # ============================================================
    # STEP 5: Generate embedding for actual claim
    # ============================================================
    
    claim_embedding = await asyncio.to_thread(
        llms.embeddings.embed_query,
        claim_text
    )

    # ============================================================
    # STEP 6: Calculate cosine similarity
    # ============================================================

    relevant_articles = []

    for article in articles:

        title = article.get("title") or ""
        description = article.get("description") or ""

        # NewsAPI's content field is limited/truncated,
        # so don't rely on it as the main evidence.
        article_text = f"{title}. {description}".strip()

        if not article_text:
            continue

        article_embedding = await asyncio.to_thread(
            llms.embeddings.embed_query,
            article_text
        )

        score = cosine_similarity(
            [claim_embedding],
            [article_embedding]
        )[0][0]

        # Keep articles with similarity > 80%
        if score >= 0.80:

            relevant_articles.append({
                "article": article,
                "matching_score": float(score)
            })

    # ============================================================
    # STEP 7: Process relevant articles
    # ============================================================

    supporting = []
    contradicting = []

    for item in relevant_articles:

        article = item["article"]
        score = item["matching_score"]

        url = article.get("url")

        if not url:
            continue

        # --------------------------------------------------------
        # Extract actual webpage content
        # --------------------------------------------------------

        try:

            webpage = await asyncio.to_thread(
                extract_webpage_content,
                url
            )

        except Exception as e:

            print(
                f"Failed to extract webpage: {url} -> {e}"
            )

            continue

        if not webpage:
            continue

        text = webpage.get("text", "")

        if not text:
            continue

        # --------------------------------------------------------
        # LLM determines relationship
        # --------------------------------------------------------

        assessment = await structured_llm.ainvoke([
            {
                "role": "system",
                "content": ARTICLE_ASSESSMENT_PROMPT
            },
            {
                "role": "user",
                "content": f"""
ACTUAL CLAIM:
{claim_text}

ARTICLE CONTENT:
{text}
"""
            }
        ])

        # --------------------------------------------------------
        # Build evidence object
        # --------------------------------------------------------

        evidence = {
            "matching_score": float(score),

            "reason": assessment.reason,

            "claim_id": claim_id,

            "claim_text": claim_text,

            "evidence_claim": assessment.evidence_claim,

            "url": url,

            "user_input_id": state["user_input_id"],
        }

        # --------------------------------------------------------
        # Put evidence into appropriate list
        # --------------------------------------------------------

        if assessment.relation == "supports":

            supporting.append(evidence)

        elif assessment.relation == "contradicts":

            contradicting.append(evidence)

        # Neutral articles are intentionally ignored here.
        # You can store them separately if required.

    # ============================================================
    # STEP 8: Return state update
    # ============================================================

    return {"supporting_evidence":supporting,"contradicting_evidence":contradicting}