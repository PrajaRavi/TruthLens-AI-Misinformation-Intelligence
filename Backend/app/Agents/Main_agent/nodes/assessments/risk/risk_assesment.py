from pydantic import BaseModel ,Field
from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput

from app.config import llms
from utils.Prompts import RISK_ASSESSMENT_SYSTEM_PROMPT

class RiskAssessmentResult(BaseModel):
    risk_level: str = Field(
        description="LOW, MEDIUM, HIGH, or CRITICAL"
    )

    risk_score: int = Field(
        description="Risk score from 0 to 100"
    )

    reason: str = Field(
        description="Brief explanation of why this risk level was assigned"
    )

risk_assesment_struct_output=llms.GEMINI_FALLBACK_LLM.with_structured_output(RiskAssessmentResult,method="json_schema")

async def risk_assessment(state:InvestigationState) -> InvestigationState:
    """
      what it will do->How dangerous or risky is this piece of content, considering both whether its claims are misleading/false and whether the content contains harmful characteristics?
      """

    print("="*100)
    print("risk assessment start")
    
    claim_assessments = state["claim_assessment"]
    hive_assessments = state["hive_assessment"]

    final_result=[]

    for claim in claim_assessments:

        claim_id = claim["claim_id"]

        # Find Hive assessment belonging to this claim
        idx=0
        for i in range(len(hive_assessments)):
            if(hive_assessments[i]['claim_id']==claim_id):
                idx=i
                break
        hive_result=hive_assessments[idx]
        
        prompt = f"""
You are a misinformation risk assessment analyst.

Assess the overall risk of the claim using ONLY the provided
factual assessment and harmful-content assessment.

Consider:
- Whether the claim is TRUE, FALSE, MISLEADING, PARTIALLY_TRUE,
  or UNVERIFIED.
- Confidence in the factual assessment.
- Number and strength of supporting/contradicting evidence.
- Whether the content is classified as harmful.

Do not perform new fact-checking.
Do not change the factual verdict.
Return a risk level of LOW, MEDIUM, HIGH, or CRITICAL
and a score from 0 to 100.

CLAIM:
{claim["claim_text"]}

FACTUAL ASSESSMENT:
{claim}

hive moderation api assesment:
{hive_result}

"""     
# HARMFUL-CONTENT ASSESSMENT:
# {hive_result}
        result = await risk_assesment_struct_output.ainvoke([
                        {
                            "role": "system",
                            "content": RISK_ASSESSMENT_SYSTEM_PROMPT
                        },
                        {
                            "role": "user",
                            "content": prompt
                        }
                    ])
        print("risk_assessment result")
        print(result)

        final_result.append({
            "claim_id": claim_id,
            "claim_text": claim["claim_text"],
            "risk_level": result.risk_level,
            "risk_score": result.risk_score,
            "reason": result.reason,
            "user_input_id":state['thread_id']
        })

    return {"risk_assessment":final_result}

