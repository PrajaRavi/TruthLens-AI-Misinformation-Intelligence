from  app.Agents.Main_agent.state import InvestigationState,Claim
from langchain_tavily import TavilySearch
from typing import Literal
from pydantic import BaseModel,Field
async def search_web_evidence_worker(payload:dict) ->InvestigationState:
    tavily_tool=TavilySearch(max_results=2,topic="general")
    print("search_web_evidence start")
    # print(payload)
    claim=payload['claim']
    claim_id=payload['id']
    th=payload['th']
    user_input_id=payload['user_input_id']
    response = tavily_tool.invoke(
        input=claim,
        max_results=2,
    )

    evidence = []

    for result in response.get("results", []):
        score=float(result.get("score"))
        if(score>th):     
            evidence.append({
                "source": result.get("title"),
                "title": result.get("title"),
                "claim_text":claim,
                "claim_id":claim_id,
                "content": result.get("content"),
                "url": result.get("url"),
                "user_input_id":user_input_id,
                "relevance_score": result.get("score"),
                "source_type": "web_search"
            })
    
    print("search_web_evidence end")
    return {"web_evidence":evidence}


class EvidenceAnalysis(BaseModel):
    relationship: Literal[
        "supporting",
        "contradicting",
        "neutral"
    ]

    matching_score: float = Field(
        ge=0.0,
        le=1.0,
        description=(
            "How strongly the evidence is related to and useful "
            "for evaluating the claim. 0 means unrelated and 1 "
            "means directly relevant."
        )
    )

    reason: str = Field(
        description=(
            "Explain why the evidence supports, contradicts, "
            "or is neutral toward the claim."
        )
        
    )
