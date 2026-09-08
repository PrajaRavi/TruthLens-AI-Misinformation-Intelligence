
from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput
from utils.utils_func import format_research_output
from pydantic import BaseModel ,Field
from app.config import llms
from langchain.messages import SystemMessage,HumanMessage
from utils.Prompts import SUMMARIZE_RISK_ASSESSMENT_PROMPT

async def summarize_risk_assessment(state:InvestigationState)->InvestigationState:

    risk_assessment = state.get("risk_assessment", [])

    response = await llms.GROQ_LLM.ainvoke([
        SystemMessage(content=SUMMARIZE_RISK_ASSESSMENT_PROMPT),
        HumanMessage(
            content=f"""
Here is the complete risk assessment data:

{risk_assessment}

Analyze the entire dataset and generate the final
context-aware risk assessment summary.
"""
        )
    ])

    return {
        "risk_assessment_summary": response.content
    }
