from app.Agents.Main_agent.state import InvestigationState
from app.config import llms
from typing import Literal
from pydantic import BaseModel, Field


# -----------------------------
# Structured output schema
# -----------------------------

class ContentCategory(BaseModel):
    category: Literal["GENRAL","HEALTH","POLITICS","CLIMATE","FINANCE","TECHNOLOGY","FINANACE","SCIENCE","SOCIAL MEDIA","BREAKING NEWS"] = Field(
        description="The single category that best represents the primary topic of the input content."
    )


# -----------------------------
# System prompt
# -----------------------------

CATEGORY_SYSTEM_PROMPT = """
You are a content classification component in TruthLensAI, a misinformation
analysis system.

Your task is to classify the provided input text into exactly ONE category
based on its PRIMARY topic.

Allowed categories:
- health: Medicine, diseases, healthcare, treatments, vaccines, nutrition,
  mental health, medical advice, or public health.
- politics: Governments, politicians, elections, political parties, policies,
  political conflicts, legislation, or political events.
- climate: Climate change, global warming, greenhouse gases, carbon emissions,
  extreme weather related to climate, or environmental climate issues.
- general: General everyday information that does not clearly belong to another
  category.
- finance: Banking, investments, stocks, markets, cryptocurrency, taxes,
  personal finance, financial institutions, or economics involving money.
- technology: Software, hardware, AI, cybersecurity, programming, computers,
  internet technologies, or technological products.
- science: Scientific research, physics, chemistry, biology, astronomy, or
  scientific discoveries that are not primarily medical or climate-related.
- social media: Social media platforms, posts, influencers, online communities,
  viral trends, social-media behavior, or platform-specific discussions.
- news: Reports about current or recent events where the primary focus is the
  event itself rather than a specific domain such as politics, health, finance,
  or technology.

Classification rules:
1. Return exactly ONE category.
2. Classify according to the PRIMARY subject, not individual keywords.
3. Do not classify based only on the source or writing style.
4. If multiple topics are present, choose the dominant topic.
5. Use the more specific category when one clearly applies.
6. Use "news" only when the content is primarily reporting an event and does
   not have a clearly dominant domain category.
7. Use "general" when none of the other categories reasonably applies.
8. Do not determine whether the information is true, false, misleading, or
   harmful. Only classify its topic.

Examples:
- "Drinking alcohol prevents COVID-19." → HEALTH
- "The government announced a new election law." → POLITICS
- "Global temperatures reached a new record." → CLIMATE
- "Bitcoin dropped 10% today." → FINANCE
- "OpenAI released a new AI model." → TECHNOLOGY
- "Scientists discovered a new exoplanet." → SCIENCE
- "This post is going viral on Instagram." → SOCIAL MEDIA
- "A major earthquake occurred in Japan today." → NEWS
- "How do I cook rice?" → GENRAL

Return only the structured classification.
"""


# -----------------------------
# Create structured LLM
# -----------------------------

structured_llm = llms.GEMINI_LLM.with_structured_output(ContentCategory)


# -----------------------------
# LangGraph node
# -----------------------------

def assign_category(state:InvestigationState)->InvestigationState:
    input_text = state["input_text"]

    result = structured_llm.invoke([
        {
            "role": "system",
            "content": CATEGORY_SYSTEM_PROMPT
        },
        {
            "role": "user",
            "content": input_text
        }
    ])

    return {
        "category": result.category
        
    }