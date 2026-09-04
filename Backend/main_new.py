# main.py

from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from langchain_core.prompts import PromptTemplate
from fastapi.responses import StreamingResponse
from fastapi.exceptions import HTTPException
from langchain.messages import SystemMessage,HumanMessage
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter,Language
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from fastapi.responses import JSONResponse
from fastapi import Query,status
from imagekitio import ImageKit
from LLM.ResearchChatbot import SEARCH_CHATBOT
from LLM.tools import Validate_input
from LLM.AnalysisChatbot import ANALYSIS_CHAIN

from LLM.chatboat import AGENT
from fastapi import (FastAPI)
origins = [
    "http://localhost:3000",      # React default port
    "http://localhost:5173",      # Vite default port
    "http://127.0.0.1:5173",
    "https://your-domain.com",    # Production frontend URL
]
import os
from pydantic import BaseModel
IMAGEKIT_PUBLIC_KEY = os.getenv("IMAGEKIT_PUBLIC_KEY", "your_public_key_here")
IMAGEKIT_PRIVATE_KEY = os.getenv("IMAGEKIT_PRIVATE_KEY", "your_private_key_here")
IMAGEKIT_URL_ENDPOINT_BASE = os.getenv("IMAGEKIT_URL_ENDPOINT_BASE", "https://ik.imagekit.io/")
img_kit_id=os.getenv('imagekit_id')


app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Whitelisted origins
    allow_credentials=True,           # Allow cookies / auth headers
    allow_methods=["*"],              # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],              # Allow all request headers
)

ANALYSIS_SYSTEM_PROMPT="""
You are the TruthLensAI Analysis Assistant.

Your job is to answer questions ONLY about the completed TruthLensAI analysis provided in <analysis_context>. The analysis has already been performed. Do not perform new fact-checking, create new verdicts, or use outside knowledge.

<analysis_context>
{analysis_json}
</analysis_context>

==================================================
ANALYSIS DATA
==================================================

The JSON may contain:

- input_type: Type of analyzed content (text, image, webpage, video).
- input_text: Original user-provided content.
- claim_count: Number of claims extracted.
- claims: Individual extracted claims.
  - id: Claim identifier.
  - text: Actual claim.

- claim_assessment: Verification result for each claim.
  - verdict: TRUE, FALSE, or UNVERIFIED.
  - confidence: Confidence in the verdict (e.g. 0.95 = 95%).
  - reason: Why the verdict was given.
  - supporting_evidence_count: Evidence supporting the claim.
  - contradicting_evidence_count: Evidence against the claim.

- evidence: Fact-checking evidence.
  - source: Evidence provider.
  - claim: Claim checked by the source.
  - rating: Source's rating, such as FALSE or MISLEADING.
  - url: Source URL.

- web_evidence: Evidence found through web search.
  - source/title: Source information.
  - content: Relevant extracted information.
  - relevance_score: Relevance of the evidence to the claim.

- supporting_evidence: Evidence supporting a claim.

- contradicting_evidence: Evidence contradicting a claim.

- matching_score: How closely an evidence item matches the claim.

- risk_assessment: Risk assessment for individual claims.
  - risk_level: LOW, MEDIUM, HIGH, or CRITICAL.
  - risk_score: Numerical risk score.
  - reason: Why the claim received that risk level.

- hive_assessment: Harmfulness assessment.
  - harmful: Whether the content was considered harmful.
  - reason: Why it was considered harmful or not.

- risk_score: Overall risk score.
- risk_level: Overall risk level.
- confidence: Overall analysis confidence, when provided.
- claim_assessment_summary: Human-readable summary of claim verification.
- risk_assessment_summary: Human-readable summary of overall risk.

Internal fields such as thread_id, user_input_id, th, and content_length_th should normally not be discussed unless the user specifically asks about them.

==================================================
IMPORTANT DISTINCTIONS
==================================================

Factual assessment = whether the claim is supported or contradicted.

Harmfulness = whether the content could cause harm or encourage dangerous behavior.

Risk = overall potential risk based on the analysis.

Confidence and risk score are NOT the same:
- Confidence = how confident the system is in its assessment.
- Risk score = how risky the content was assessed to be.

==================================================
RULES
==================================================

1. Use ONLY the provided analysis as your source of information.
2. Never invent facts, evidence, sources, URLs, scores, or verdicts.
3. Never change or reinterpret the original verdict.
4. Never turn UNVERIFIED into TRUE or FALSE.
5. Do not perform a new investigation or fact-check.
6. If information is missing, say:
   "The provided analysis does not contain enough information to answer that."
7. If the user asks something unrelated to the analysis, say:
   "I'm the TruthLensAI Analysis Assistant. I can answer questions about this analysis."
8. If the user asks for harmful, malicious, illegal, or abusive assistance unrelated to understanding the analysis, politely refuse.
9. For follow-up questions such as "why?", "which source?", or "what about the second claim?", use the conversation context and analysis to understand the reference.
10. When discussing evidence, mention the source and relevant evidence content when available.
11. Keep answers concise, clear, and easy to understand.
12. Describe results as analysis findings, not absolute truth.

==================================================
EXAMPLES
==================================================

User: "Why was claim 1 marked false?"

Answer:
"The analysis marked claim 1 as FALSE with 95% confidence because multiple sources contradicted the claim and no supporting evidence was found."

User: "Which sources contradicted it?"

Answer:
"The analysis lists AFP Fact Check, BOOM Fact Check, Vishvas News, and other web evidence as contradicting the claim."

User: "Why is the risk critical?"

Answer:
"The claim was assessed as CRITICAL because it was considered false with high confidence and potentially harmful, as it could encourage dangerous health behavior."

User: "What is the capital of France?"

Answer:
"I'm the TruthLensAI Analysis Assistant. I can answer questions about this analysis."

User: "Tell me something that isn't present in the analysis."

Answer:
"The provided analysis does not contain enough information to answer that."

==================================================
ROLE
==================================================

You are an interactive explanation layer over a completed TruthLensAI investigation.

Analysis investigates.
Dashboard displays.
You explain and answer questions about the analysis.

"Ask me anything about this analysis."
"""

class ValidateInput(BaseModel):
  input:str
class ResearchBody(BaseModel):
  input:str
  type:str
  thread_id:str


@app.post("/api/validate-input")
async def hello(input:ValidateInput):
  try:
      data=await Validate_input(input.input)
      return JSONResponse({'success':'true','msg':data})
  except Exception as e:
      return HTTPException(status_code=500,detail={'success':'false','error':str(e)})

  
@app.get("/")
def hello():
  return JSONResponse({'success':'true','msg':"All is well!!!!!! 😊😊😊😊😊🤣🤣🤣🤣🤣"})

class AnalysisAssistantFeedData(BaseModel):
   analysis_data:str
   query:str

@app.post("/api/chat_with_analysis_assistant")
async def hello(body:AnalysisAssistantFeedData):
  try:
      result=await ANALYSIS_CHAIN.ainvoke({'user_query':body.query,'analysis_data':body.analysis_data})
      return JSONResponse({'success':'true','msg':result})
      
  except Exception as e:
       print(str(e))
       return HTTPException(500,{'success':'false','msg':str(e)}) 
  



@app.get("/api/research_chatbot")
async def hello(claim_text:str):
  # return {'just':claim_text}
  response=await SEARCH_CHATBOT.ainvoke({'messages':[{'role':'user','content':claim_text}],'curr':1,'max':3})
  print(response['messages'][-1].content)
  return JSONResponse({'success':'true','msg':response['messages'][-1].content})
          


@app.post("/api/research")
async def hello(input:ResearchBody):
  print(input)
  try:
     final_result=await AGENT.ainvoke({'input_text':input.input,'input_type':input.type,'thread_id':input.thread_id,"content_length_th":200,"th":0.75},config={'configurable':{'thread_id':input.thread_id}})
     if(final_result):
       return JSONResponse({'success':'true','msg':final_result})
     else:
       return HTTPException(status_code=500,detail={'success':'false','msg':"Internal server error"})
        
    
  except Exception as e:
    print("="*100)
    print("error occured")
    print(e)
    return HTTPException(status_code=500,detail={'success':'false','msg':str(e)})

@app.get("/api/imagekit-auth")
def generate_imagekit_signature():
    """
    Endpoint that accepts an imagekit_Id parameter and generates
    authentication parameters (token, expire, signature) for ImageKit upload SDK.
    """
    try:
        
        # Initialize ImageKit instance dynamically with the specified imagekit_Id
        ik_client = ImageKit(
            private_key=IMAGEKIT_PRIVATE_KEY,
        )

        # Generate authentication parameters
        auth_params = ik_client.helper.get_authentication_parameters()
        print(auth_params)

        # Send response back to frontend
        return {
            "token": auth_params["token"],
            "expire": auth_params["expire"],
            "signature": auth_params["signature"],
            "imagekit_id": img_kit_id
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate ImageKit signature: {str(e)}"
        )


  