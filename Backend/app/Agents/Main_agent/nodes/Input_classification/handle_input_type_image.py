from app.Agents.Main_agent.state import InvestigationState
from app.config import llms
from langchain_core.messages import HumanMessage,SystemMessage
async def input_type_image(state:InvestigationState)->InvestigationState:
    return state

async def handle_input_type_image(state:InvestigationState) -> InvestigationState:
    image_url=state['input_text']
    """
    Analyze a publicly accessible image URL using Gemini
    and return its important visible content as text.
    """

    prompt = """
You are an image text extraction agent for a misinformation
and claim assessment system.

Carefully read and understand the provided image.

Extract the important information that is actually visible
or clearly readable in the image.

1. Do not decide whether the claim is true or false.
2. Do not add information that is not present in the image.
3. Do not guess unclear text.
4. Preserve important names, numbers, dates, and facts accurately.
5. If some text is unclear, say that it is unclear instead of guessing.
6. Do not describe irrelevant visual details.
7. Use simple and clear English.
8. Keep the result concise but complete.

Return the result in plain english format.

"""

    message = HumanMessage(
        content=[
            {
                "type": "text",
                "text": prompt,
            },
            {
                "type": "image_url",
                "image_url": {
                    "url": image_url,
                },
            },
        ]
    )

    response = await llms.GEMINI_LLM.ainvoke([message])
    content_length_th=state['content_length_th']
    return {'input_text':str(response.content[0]['text'])[0:int(content_length_th)]}

