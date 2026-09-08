from  ....Main_agent.state import InvestigationState,Claim
from langchain_tavily import TavilySearch
from typing import Literal
from pydantic import BaseModel,Field
from app.config import llms

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

async def evidence_analysis(
    state: InvestigationState) -> InvestigationState:

    structured_llm = llms.GROQ_FALLBACK_LLM.with_structured_output(EvidenceAnalysis,method="json_schema")
    print("evidence_analysis start")
    supporting_evidence = []
    contradicting_evidence = []

    
    for claim in state['claims']:


        claim_text = claim["text"]

        # Analyze only evidence returned for this claim.
        # If your evidence list is currently global,
        # this loop can be adjusted later when you add
        # claim_id to your evidence schema.

        for evidence in state["evidence"]:

            source = evidence.get("source", "")
            evidence_claim = evidence.get("claim", "")
            rating = evidence.get("rating", "")
            url = evidence.get("url","")
            prompt = f"""
You are an evidence analysis system for a fact-checking
application.

Determine whether the following existing fact-check is
supporting, contradicting, or neutral toward the user's claim.

USER CLAIM:
{claim_text}

FACT-CHECK SOURCE:
{source}

FACT-CHECKED CLAIM:
{evidence_claim}

FACT-CHECK RATING:
{rating}

Instructions:

1. Compare the user's claim with the fact-checked claim.
2. Determine whether they are about the same factual assertion.
3. Consider the meaning, entities, actions, dates, quantities,
   and context.
4. Do not assume that similar words mean the claims are equivalent.
5. The rating describes the fact-checker's conclusion about
   the fact-checked claim.
6. If the fact-checked claim is substantially the same as the
   user's claim:
      - A False/Misleading rating generally CONTRADICTS the
        user's claim.
      - A True/Correct rating generally SUPPORTS the user's claim.
7. If the evidence is about a different claim, mark it NEUTRAL.
8. matching_score represents how strongly this fact-check
   matches the user's claim, not whether the claim is true.

Return only the structured result.
"""

            result = await structured_llm.ainvoke(prompt)
            analyzed_evidence = {
                "matching_score": result.matching_score,
                "reason": result.reason,
                "claim_id":claim['id'],
                "claim_text": claim_text,
                "url":url,
                "evidence_claim":evidence_claim,
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

    print("evidence_analysis ended")
    # prev_source_count=state['sources_count']
    return {"supporting_evidence":supporting_evidence,"contradicting_evidence":contradicting_evidence}
       
