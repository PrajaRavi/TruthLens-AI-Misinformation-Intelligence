from typing import Literal, Optional
from pydantic import BaseModel, Field
from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput
from utils.Prompts import NEWS_ROUTER_PROMPT,ARTICLE_ASSESSMENT_PROMPT
from app.config import llms,settings
from utils.utils_func import extract_webpage_content,get_result,create_context
from langchain_classic.utils.math import cosine_similarity
from langchain_classic.text_splitter import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(chunk_size=600,chunk_overlap=30)




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

structured_llm=llms.GEMINI_LLM.with_structured_output(NewsClassification,method="json_schema")
structured_llm_Article=llms.PRIMARY_GEMINI_LLM.with_structured_output(ArticleAssessment,method="json_schema")

import asyncio
import httpx



import asyncio
import httpx
from typing import Literal, Optional
from pydantic import BaseModel, Field

# Ensure you have your imports/utilities defined:
# from langchain_classic.utils.math import cosine_similarity
# from langchain_classic.text_splitter import RecursiveCharacterTextSplitter
# splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=30)

THENEWSAPI_KEY =settings.THENEWSAPI_KEY  # Replace with your API token


async def news_search_router(state: InvestigationState) -> InvestigationState:
    print("-----------news_search_router----------------")
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
    # STEP 2: Build TheNewsAPI parameters
    # ============================================================

    if result.is_news:

        if result.has_date_reference and result.date:

            # Date-specific news search using /v1/news/all
            endpoint = "https://api.thenewsapi.com/v1/news/all"

            params = {
                "search": result.search_query,
                "published_after": result.date,
                "published_before": result.date,
                "limit": 5,
                "api_token": THENEWSAPI_KEY,
            }

        else:

            # Current/top headlines using /v1/news/top
            endpoint = "https://api.thenewsapi.com/v1/news/top"

            params = {
                "search": result.search_query,
                "limit": 5,
                "api_token": THENEWSAPI_KEY,
            }

    else:

        # General article discovery using /v1/news/all
        endpoint = "https://api.thenewsapi.com/v1/news/all"

        params = {
            "search": result.search_query,
            "limit": 10,
            "api_token": THENEWSAPI_KEY,
        }

    # ============================================================
    # STEP 3: Search TheNewsAPI
    # ============================================================

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:

            response = await client.get(
                endpoint,
                params=params
            )

            response.raise_for_status()
            news_result = response.json()

    except Exception as e:
        print(f"Failed to fetch articles from TheNewsAPI: {e}")
        return {
            "supporting_evidence": [],
            "contradicting_evidence": []
        }

    # ============================================================
    # STEP 4: Extract articles from TheNewsAPI response
    # ============================================================

    # TheNewsAPI returns articles inside the "data" array key
    print("-----------------theNewsApi result-------------------")
    articles = news_result.get("data", [])
    print(articles)

    if not articles:
        return {
            "supporting_evidence": [],
            "contradicting_evidence": []
        }

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

        # TheNewsAPI provides snippet/description fields
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

        # Keep articles with similarity >= 80%
        if score >= 0.70:
            
            relevant_articles.append({
                "article": article,
                "matching_score": float(score)
            })

    # ============================================================
    # STEP 7: Process relevant articles
    # ============================================================
    print("-----------------------relevant articles-----------------------")
    print(relevant_articles)
    supporting = []
    contradicting = []


    for item in relevant_articles:

        article = item["article"]
        score = item["matching_score"]
        print("-------------------articles----------------")
        print(article)
        
        print("-------------------scores----------------")
        print(score)
        url = article.get("url")

        if not url:
            continue

        # --------------------------------------------------------
        # Extract actual webpage content
        # --------------------------------------------------------

        try:

            # webpage = await asyncio.to_thread(
            #     extract_webpage_content,
            #     url
            # )
            webpage=await extract_webpage_content(url)

        except Exception as e:

            print(
                f"Failed to extract webpage: {url} -> {e}"
            )

            continue

        if not webpage:
            continue
        print("--------------webpage part-------------------------")
        print(webpage)
        text = webpage.get("text", "")
        if not text:
            continue

        print("-------------webpage content-----------------------")
        print(text)
        print("-------------webpage content end-----------------------")

        # --------------------------------------------------------
        # Chunking & Reranking via FlashRank
        # --------------------------------------------------------

        print("-------------chunks content-----------------------")
        chunks = splitter.split_text(text)
        print(chunks)
        print("-------------chunks end-----------------------")

        print("-----------------passages content------------------")
        passages = [{"id": i, "text": chunk_text} for i, chunk_text in enumerate(chunks)]    
        print(passages)
        print("-----------------passages content end------------------")

        flashrank_result = get_result(claim_text, passages, "Nano")[:2]
        print("----------------- context ------------------")
        context = create_context(flashrank_result)

        # --------------------------------------------------------
        # LLM determines relationship
        # --------------------------------------------------------

        assessment = await structured_llm_Article.ainvoke([
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
{context}
"""
            }
        ])

        # --------------------------------------------------------
        # Build evidence object
        # --------------------------------------------------------
        
        evidence = {
            "matching_score": float(score),
            "source":"TheNewsApi",

            "reason": assessment.reason,

            "claim_id": claim_id,

            "claim_text": claim_text,

            "evidence_claim": assessment.evidence_claim,

            "url": url,

            "user_input_id": state["user_input_id"],
        }
        print("---------------------evidence---------------")
        print(evidence)

        # --------------------------------------------------------
        # Put evidence into appropriate list
        # --------------------------------------------------------

        if assessment.relation == "supports":

            supporting.append(evidence)

        elif assessment.relation == "contradicts":

            contradicting.append(evidence)

    # ============================================================
    # STEP 8: Return state update
    # ============================================================

    return {
        "supporting_evidence": supporting,
        "contradicting_evidence": contradicting
    }