from  app.Agents.Main_agent.state import InvestigationState,Claim
from langchain_tavily import TavilySearch
from typing import Literal
from pydantic import BaseModel,Field
from app.config import llms
from app.Agents.Main_agent.nodes.analysis.fact_evidence_analysis import EvidenceAnalysis
async def who_evidence_analysis(state:InvestigationState) -> InvestigationState:

    supporting_evidence = []
    contradicting_evidence = []

    web_evidence = state["who_evidence"]

    structured_llm = llms.GEMINI_LLM.with_structured_output(EvidenceAnalysis,method="json_schema")

    # print("*"*100)
    # print(state['claims'])
        

    for evidence_item in web_evidence:

            claim_text = evidence_item.get("claim_text", "")
            content = evidence_item.get("content", "")
            url = evidence_item.get("url","")

            relevance_score = evidence_item.get(
                "relevance_score",
                0
            )
            title = evidence_item.get("title", "")

            prompt = f"""
You are an evidence analysis system for a misinformation
verification pipeline.

USER CLAIM:
{claim_text}

WEB EVIDENCE:

Title:
{title}


Retrieved content:
{content}

Search relevance score:
{relevance_score}

Your task is to determine whether this web evidence
supports or contradicts the USER CLAIM by just reading the given input do  not call any external tool as i do not have any tool.

Classification rules:

1. "supporting"
   The content provides information that supports the
   factual proposition made by the USER CLAIM.

2. "contradicting"
   The content provides information that contradicts
   the factual proposition made by the USER CLAIM.

3. "irrelevant"
   The content does not provide meaningful evidence
   about the USER CLAIM.

Important:

- Read the actual content before making the decision.
- Do not classify evidence as supporting merely because
  the title contains similar keywords.
- Do not classify evidence as contradicting merely because
  the source discusses the same topic.
- The relevance_score is a retrieval score, NOT a truth score.
- matching_score should represent semantic/evidential
  relevance to the USER CLAIM.
- Do not invent facts that are not present in the content.

Return:
- classification
- matching_score between 0 and 1
- concise reason
"""

            result = await structured_llm.ainvoke(prompt)
            print("web_evidence_analysis_result")
            print(result.relationship)

            analyzed_evidence = {
                "matching_score": result.matching_score,
                "source":"WHO",
                "reason": result.reason,
                "claim_id":evidence_item['claim_id'],
                "claim_text": claim_text,
                "evidence_claim":title,
                "url":url,
                "user_input_id":state['thread_id']
            }
            
            if result.relationship == "supporting":
                supporting_evidence.append(
                    analyzed_evidence
                )

            elif result.relationship == "contradicting":
                contradicting_evidence.append(
                    analyzed_evidence
                )
            else:
                 print("neutral print kar raha hu mai")
                 print(analyzed_evidence)

    print("web_evidence_analysis end")
    prev_source_count=state['sources_count']
    return {"supporting_evidence":supporting_evidence,"contradicting_evidence":contradicting_evidence}
        
