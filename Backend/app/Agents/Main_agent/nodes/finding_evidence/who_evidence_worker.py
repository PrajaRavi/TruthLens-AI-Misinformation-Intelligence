from  app.Agents.Main_agent.state import InvestigationState,Claim
from langchain_tavily import TavilySearch
from typing import Literal
from pydantic import BaseModel,Field

async def who_evidence_worker(payload:dict) ->InvestigationState:
    tavily_tool = TavilySearch(
    max_results=2,
    topic="general",
    include_raw_content=True,
    include_domains=["who.int"],
)

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
                "source_type": "web_search"
            })
    
    print("search_web_evidence end")
    return {"who_evidence":evidence}


