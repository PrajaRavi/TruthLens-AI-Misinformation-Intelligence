from  app.Agents.Main_agent.state import InvestigationState,Claim
from langchain_tavily import TavilySearch
from typing import Literal
from app.config import settings
from pydantic import BaseModel,Field
tavily_tool=TavilySearch(max_results=2,topic="general",TAVILY_API_KEY=settings.TAVILY_API_KEY)
async def search_web_evidence_worker(payload:dict) ->InvestigationState:
    print("search_web_evidence start")
    # print(payload)
    claim=payload['claim']
    claim_id=payload['id']
    th=payload['th']
    print(claim)
    user_input_id=payload['user_input_id']
    response = tavily_tool.invoke(claim)
    print(response)
    evidence = []

    for result in response.get("results", []):
        score=float(result.get("score"))
        if(score>th):     
            evidence.append({
                "source":"WEB",
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


