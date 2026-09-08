from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput
from utils.utils_func import format_research_output
from pydantic import BaseModel ,Field
from app.config import llms
from ......Agents.Search_agent.graph import SEARCH_AGENT
from utils.Prompts import CLAIM_ASSESSMENT_SYSTEM_PROMPT
class ClaimAssessmentResult(BaseModel):
    
    verdict: str = Field(
        description=(
            "TRUE, FALSE, MISLEADING, PARTIALLY_TRUE, "
            "or UNVERIFIED"
        )
    )

    confidence: float = Field(
        description="Confidence from 0 to 1"
    )

    
    reason: str = Field(
        description="Explanation for the verdict based on evidence"
    )

    supporting_evidence_count: int

    contradicting_evidence_count: int

claim_assesment_struc_op=llms.GEMINI_LLM.with_structured_output(ClaimAssessmentResult,method="json_schema")

async def claim_assessment(state:InvestigationState) -> InvestigationState:
    """
    Assesses each claim using all supporting and contradicting evidence
    associated with that claim.
    """

    assessments = []

    for claim in state["claims"]:

        claim_id = claim["id"]
        claim_text = claim["text"]
        response=await SEARCH_AGENT.ainvoke({'messages':[{'role':'user','content':claim_text}],'curr':1,'max':3})
        research_agent_report=format_research_output(response['messages'][-1].content)


        # Evidence supporting this claim
        supporting = [
            item
            for item in state.get("supporting_evidence", [])
            if item["claim_id"] == claim_id
        ]

        # Evidence contradicting this claim
        contradicting = [
            item
            for item in state.get("contradicting_evidence", [])
            if item["claim_id"] == claim_id
        ]

        # Combine both types of evidence
        evidence = {
            "supporting_evidence": supporting,
            "contradicting_evidence": contradicting
        }

        prompt = f"""
USER CLAIM:
{claim_text}
--------------------------------------------------
EVIDENCE[supporting+contradicting]:
{evidence}
--------------------------------------------------
RESEARCH AGENT REPORT:
{research_agent_report}

Assess this claim using ALL of the evidence provided.

Remember:
- Do not assess each evidence item independently.
- Consider the evidence collectively.
- Do not use outside knowledge.
- Do not search the web.
- If the evidence is insufficient or ambiguous, return "Not Entailed".
"""

        result = await claim_assesment_struc_op.ainvoke(
            [
                {
                    "role": "system",
                    "content": CLAIM_ASSESSMENT_SYSTEM_PROMPT
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ]
        )

        assessments.append({
            "claim_id": claim_id,
            "claim_text": claim_text,
            "verdict": result.verdict,
            "confidence": result.confidence,
            "reason": result.reason,
            "user_input_id":state['thread_id'],
            "supporting_evidence_count": supporting,
            "contradicting_evidence_count":contradicting
        })
    return {"claim_assessment":assessments,"sources_count":supporting+contradicting}

