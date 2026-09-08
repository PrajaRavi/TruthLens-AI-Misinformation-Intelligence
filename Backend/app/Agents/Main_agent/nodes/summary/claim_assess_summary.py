from app.Agents.Main_agent.state import InvestigationState
from utils.utils_func import format_research_output
from pydantic import BaseModel ,Field
from app.config import llms
from langchain_core.messages import SystemMessage,HumanMessage
from utils.Prompts import SUMMARIZE_CLAIM_ASSESSMENT_PROMPT

async def summarize_claim_assessment(state:InvestigationState)->InvestigationState:

    claim_assessment = state.get("claim_assessment", [])

    # Give the LLM the complete claim assessment.
    # Every object and every field is preserved.
    response = await llms.GROQ_LLM.ainvoke([
        SystemMessage(content=SUMMARIZE_CLAIM_ASSESSMENT_PROMPT),
        HumanMessage(
            content=f"""
Here is the complete claim assessment data:

{claim_assessment}

Analyze the entire dataset and generate the final
context-aware claim assessment summary.
"""
        )
    ])
    print("claim assessment summary")
    print(response.content)
    return {
        "claim_assessment_summary": response.content
    }
