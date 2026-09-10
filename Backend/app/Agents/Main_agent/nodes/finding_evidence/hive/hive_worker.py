import os
import httpx
from app.config import settings,llms
from  app.Agents.Main_agent.state import InvestigationState,Claim
from typing import List
from langgraph.types import Send
from pydantic import BaseModel,Field


hive_api_key=settings.HIVE_API_KEY
async def hive_text_moderation(text:str):

    api_key = hive_api_key
    
    

    headers = {
        "authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }

    json_data = {
        "input": [
            {
                "text": text
            }
        ]
    }

    async with httpx.AsyncClient() as client:

        response = await client.post(
            "https://api.thehive.ai/api/v3/hive/text-moderation",
            headers=headers,
            json=json_data,
            timeout=30.0
        )

        response.raise_for_status()

        result = response.json()

    # Get the first moderation result
    output = result["output"][0]

    # Extract classes
    classes = {}
    for item in output['classes']:
      classes[item['class']]=item['value']

    return classes
# hive text anylasis it will be basically a fan out architecture 
class HarmAssessment(BaseModel):
    harmful:str=Field(...,description="return True or False")
    reason: str

sturc_llm_for_hive_analysis=llms.GROQ_FALLBACK_LLM.with_structured_output(HarmAssessment,method="json_schema")


async def hive_assesment_analysis_worker(payload) ->InvestigationState:
    claim_id=payload['id']
    claim_text=payload['claim']
    user_input_id=payload['user_input_id']
    print("hive worker starts ")
    print("payload")
    print(payload)
    data=await hive_text_moderation(claim_text)

    
    prompt=f"""
You are a content safety assessment model.

Determine whether the given claim should be considered harmful based on the claim and the provided moderation signals.

Do not determine whether the claim is true or false.
Only determine whether the content is harmful.

CLAIM:
{claim_text}

HIVE MODERATION RESULT:
{data}
"""
    result=await sturc_llm_for_hive_analysis.ainvoke(prompt)
    hive_assement=[{'claim_id':claim_id,'claim_text':claim_text,'reason':result.reason,'harmful':result.harmful,"user_input_id":user_input_id}]
    print("hive worker ends")

    return {'hive_assessment':hive_assement}

