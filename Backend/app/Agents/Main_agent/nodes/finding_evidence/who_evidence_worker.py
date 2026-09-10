from  app.Agents.Main_agent.state import InvestigationState,Claim
from langchain_tavily import TavilySearch
from typing import Literal
from app.config import llms
from pydantic import BaseModel,Field

convert_claim_into_who_search_query="""
You are a search-query rewriting component for TruthLensAI.

Rewrite the given claim into a concise, neutral search query optimized for WHO's website.

Rules:
- Preserve the original claim's meaning.
- Remove unnecessary wording and conversational phrases.
- Use standard medical/scientific terminology where appropriate.
- Do not add new facts or change the claim's meaning.
- Return only the rewritten query.

Example:
"Drinking alcohol helps to defeat coronavirus."
→ "Alcohol prevents COVID-19"

give strucutred output only
"""
class OptimizedQuery(BaseModel):
    query:str = Field(
        description="optimized query."
    )

structured_output=llms.GEMINI_FALLBACK_LLM.with_structured_output(OptimizedQuery,method="json_schema")

async def who_evidence_worker(payload:dict) ->InvestigationState:
    print("who evidence worker start")
    tavily_tool = TavilySearch(
    max_results=2,
    topic="general",
    include_raw_content=True,
    include_domains=["who.int"],
)
    old_claim=payload['claim']
    result=await structured_output.ainvoke([{"role":"system","content":convert_claim_into_who_search_query},{"role":"user","content":old_claim}])
    claim=result.query
    print(claim)
    
    claim_id=payload['id']
    th=payload['th']
    user_input_id=payload['user_input_id']
    response = tavily_tool.invoke(
        input=claim,
        max_results=2,
    )

    evidence = []

    #! for now i am not filtering the result on the basis of relvance_score because their is chance that if the content is irrelevant but it can be contradicting
    for result in response.get("results", []):
        evidence.append({
                "source": result.get("title"),
                "title": result.get("title"),
                "claim_text":claim,
                "claim_id":claim_id,
                "content": result.get("content"),
                "url": result.get("url"),
                "user_input_id":user_input_id,
                "relevance_score": result.get("score"),
                "source_type": "web_search",
                "user_input_id":payload['user_input_id']
            })
    
    print("who evidence worker end")
    # print(" end")
    return {"who_evidence":evidence}


