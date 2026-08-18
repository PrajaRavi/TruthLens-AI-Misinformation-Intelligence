from langgraph.graph import StateGraph,START,END
from typing import TypedDict,List
import os
import time
import asyncio
import operator
from langchain_groq import ChatGroq
from langgraph.types import interrupt, Command,Send
from datetime import datetime
from langchain_core.messages import BaseMessage,HumanMessage,SystemMessage,AIMessage
from langchain_core.prompts import PromptTemplate

from langchain_ollama import ChatOllama,OllamaEmbeddings
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel,Field
from langgraph.types import interrupt
from dotenv import load_dotenv
from langchain_tavily import TavilySearch

from typing import Annotated,Literal
from langgraph.checkpoint.memory import InMemorySaver #!stores things in RAM
parser=StrOutputParser()
load_dotenv()


groq_llm = ChatGroq(
    model="openai/gpt-oss-120b",
    temperature=0.3, #->it is between 0 to 2  and it is creativity parameter if it is 0 then for same question it will give same ans alway but as we increase this number then our model gives diffrent ans on each time on asking the  same question
    max_tokens=None,
    timeout=None,
    max_retries=2,
)
phi_llm=ChatOllama(
    model="phi4-mini:3.8b",
    temperature=0.4
)


qwen=ChatOllama(
    model="qwen2.5:0.5b",
    temperature=0.4
)
qwen_coder=ChatOllama(
    model="qwen2.5-coder:3b",
    temperature=0.4
)
llama=ChatOllama(
    model="llama3.2:1b",
    temperature=0.4
)


gorq_api_key=os.getenv("groq_api_key")
google_api_key=os.getenv("google_api_key")
TAVILY_API_KEY=os.getenv("TAVILY_API_KEY")
hive_api_key=os.getenv("hive_api_key")

#! for now my main targets are url[web_url,yt_video_url] and text 
    
class Claim(BaseModel):
    id: str = Field(description="number starting from 1")
    user_input_id:str
    text: str = Field(
        description=("A single, independently verifiable factual claim. "
            "Rewrite it with enough context from the original input "
            "so it can be understood and researched independently."))



class ClaimsOutput(BaseModel):
    claims: list[Claim]


class InvestigationState(TypedDict):

    # ─────────────────────────────
    # INPUT
    # ─────────────────────────────

    investigation_id: str
    user_id: str
    thread_id: str #! this will act as user_input_id inside each field
    


    input_type: Literal[
        "text",
        "url",

        #! in future i will implement it
        # "image",
        # "audio",
        # "video",
    ]

    input_text: str | None
    input_url: str | None
    # media_ids: list[str] #!useful when uploading audio and video


    # ─────────────────────────────
    # CONTENT ANALYSIS
    # ─────────────────────────────

    # modalities: list[str]  # ! what type of contents are prsent may be implement in future useful when provide multiple mix inputs[litle confusing at this point]

    extracted_text: str | None #this text is from any image beacuse pure text will be store inside input_text[futue] 
    transcript: str | None #It will store transcript of any yt video or any video/audio having transcript[future]

    claims: list[Claim]
    

    

    

    


    # ─────────────────────────────
    # NORMALIZED EVIDENCE
    # ─────────────────────────────

    evidence: Annotated[list[dict],operator.add]
    web_evidence:Annotated[list[dict],operator.add]
    supporting_evidence:Annotated[list[dict],operator.add]
    contradicting_evidence:Annotated[list[dict],operator.add]
    risk_assessment:Annotated[list[dict],operator.add]



    # ─────────────────────────────
    # ANALYSIS
    # ─────────────────────────────

    media_assessment: dict
    claim_assessment: dict
    context_assessment: dict
    provenance_assessment: dict

    """
    media_assessment  ->	Is the media manipulated?
    claim_assessment ->	Is the claim true/supported?
    context_assessment ->	Is genuine media being used in the right context?
    provenance_assessment ->	Can we establish and trust its origin/history?

┌─────────────────────────────────┐
│ MEDIA ASSESSMENT                 │
│ Genuine video                    │
│ Manipulation probability: 3%    │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ CLAIM ASSESSMENT                 │
│ Claim not supported              │
│ Confidence: 91%                 │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ CONTEXT ASSESSMENT               │
│ Video is from 2022               │
│ Claimed as 2026                  │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│ PROVENANCE ASSESSMENT            │
│ Original source partially found  │
│ Confidence: 78%                  │
└─────────────────────────────────┘
"""

    hive_assessment:Annotated[list[dict],operator.add]
    """
    ->now it will be for each claim
    hive_assessment = [
{
    "claim_id": "claim_1",
    "claim_text": "...",
    "harmful": False,
    "reason": "..."
}          
]
    """
    # ─────────────────────────────
    # RISK
    # ─────────────────────────────

    risk_score: float | None
    risk_level: str | None
    confidence: float | None

    insufficient_evidence: bool


    # ─────────────────────────────
    # EXPLANATION
    # ─────────────────────────────

    explanation: str | None
    key_findings: list[str]
    citations: list[dict]


    # ─────────────────────────────
    # HUMAN REVIEW
    # ─────────────────────────────

    requires_human_review: bool
    human_decision: str | None


    # ─────────────────────────────
    # ERROR / EXECUTION
    # ─────────────────────────────

    errors: list[dict]
    warnings: list[str]

from typing import Literal
from urllib.parse import urlparse

def classify_input(state:InvestigationState) ->InvestigationState:
    print('running classify input')
    """
    Classifies the user's input as text or URL-based content.

    Current implementation:
    - Normal text -> returns state unchanged
    - URL -> classifies the URL for future processing
    """

    input_text = state['input_text'].strip()

    # No input
    if not input_text:
        raise ValueError("input_text cannot be empty")

    # Check whether input looks like a URL
    parsed_url = urlparse(input_text)

    is_url = parsed_url.scheme in ("http", "https") and bool(parsed_url.netloc)

    # ─────────────────────────────────────
    # NORMAL TEXT
    # ─────────────────────────────────────
    if not is_url:
        # Your current focus is text.
        # Nothing needs to be changed.
        return state

    # ─────────────────────────────────────
    # URL
    # ─────────────────────────────────────

    hostname = parsed_url.netloc.lower()
    path = parsed_url.path.lower()

    # YouTube
    if "youtube.com" in hostname or "youtu.be" in hostname:
        input_type = "youtube"

    # Common video URLs
    elif path.endswith((".mp4", ".webm", ".mov", ".mkv", ".m3u8")):
        input_type = "video"

    # Common audio URLs
    elif path.endswith((".mp3", ".wav", ".ogg", ".m4a", ".aac")):
        input_type = "audio"

    # Everything else is treated as a webpage for now
    else:
        input_type = "webpage"

    # Future implementation
    if input_type == "youtube":
        pass

    elif input_type == "video":
        pass

    elif input_type == "audio":
        pass

    elif input_type == "webpage":
        pass

    # For now, return state
    print("classify input completed")
    return state





async def extract_claims(state:InvestigationState) -> InvestigationState:

    # input_text = state["input_text"]
    
    prompt = f"""
You are an expert factual claim extraction system.

Your task is to break the following input into individual,
independently verifiable factual claims.

IMPORTANT RULES:

1. Read and understand the ENTIRE input before extracting claims.

2. Preserve the semantic meaning of the original input.

3. Each claim should represent ONE factual assertion that
   can be independently researched or fact-checked.

4. If a claim depends on information from another part of
   the input, rewrite that claim so it contains the necessary
   context.

5. Resolve pronouns and references such as:
   - it
   - this
   - this scheme
   - the program
   - they
   - he/she
   - the announcement
   - the company

6. A returned claim MUST be understandable without reading
   the original input.

7. Do NOT simply copy sentences if they are incomplete or
   context-dependent. Rewrite them with the required context.

8. Do NOT invent facts that are not present in the input.

9. Preserve important:
   - names
   - organizations
   - locations
   - dates
   - numbers
   - amounts
   - conditions
   - relationships

10. Do not combine unrelated factual assertions into one claim.

11. Do not add your own interpretation or judgement about
    whether a claim is true or false.

12. The purpose of these claims is subsequent fact-checking.
13. the claims text should have at least 5 words 

INPUT:
{state['input_text']}

"""

    structured_llm = groq_llm.with_structured_output(ClaimsOutput)

    result = await structured_llm.ainvoke(prompt)

    # data=  [
    #     claim.model_dump()
    #     for claim in result.claims
    # ]
    data=[]
    for claim in result.claims:
        claim1=claim.model_dump()
        claim1['user_input_id']=state['thread_id']
        data.append(claim1)

    print("claims ended")
    print(data)
    return {"claims":data}

import os
import httpx


    
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
    harmful: bool
    reason: str

sturc_llm_for_hive_analysis=phi_llm.with_structured_output(HarmAssessment)

def hive_assesment_fanout(state:InvestigationState) -> List[Send]:
    """
    Fan-Out Conditional Edge:
    Reads the list of tasks generated by the orchestrator and triggers 
    an independent, parallel execution of 'worker_node' for every task.
    """
    claims: List[Claim] = state['claims']

    # For each task in the plan, dispatch a Send object to the worker node
    return [
        Send(
            node="hive_assesment_analysis_worker",  # Target node name registered in the graph
            arg={
                'claim':claim['text'],'id':claim['id'],'user_input_id':state['thread_id']
            }
        )
        for claim in claims
    ]

async def hive_assesment_analysis_worker(payload) ->InvestigationState:
    claim_id=payload['id']
    claim_text=payload['claim']
    user_input_id=payload['user_input_id']

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
    return {'hive_assessment':hive_assement}


    
def fan_out_evidence_fact(state:InvestigationState) -> List[Send]:
    """
    Fan-Out Conditional Edge:
    Reads the list of tasks generated by the orchestrator and triggers 
    an independent, parallel execution of 'worker_node' for every task.
    """
    claims: List[Claim] = state['claims']

    # For each task in the plan, dispatch a Send object to the worker node
    
    return [
        Send(
            node="google_fact_checks_worker",  # Target node name registered in the graph
            arg={
                'claim':claim['text'],'id':claim['id'],'thread_id':state['thread_id']
            }
        )
        for claim in claims
    ]

import requests


GOOGLE_FACT_CHECK_API = (
    "https://factchecktools.googleapis.com/v1alpha1/claims:search"
)


async def google_fact_checks_worker(payload: dict) -> InvestigationState:
    print("search_fact_checks start")
    """
    Search Google Fact Check Tools API for a claim and normalize
    the returned fact-checks into our internal evidence format.

    Returns:
        [
            {
                "source": str,
                "claim": str,
                "rating": str | None,
                "url": str,
                "source_type": "fact_check"
            }
        ]
    """
    # print("ravi")
    # print(payload)
    claim=payload["claim"]
    claim_id=payload['id']
    thread_id=payload['thread_id']

    params = {
        "query": claim,
        "key": google_api_key,
        "pageSize": 10,
    }

    response = requests.get(
        GOOGLE_FACT_CHECK_API,
        params=params,
        timeout=15,
    )

    response.raise_for_status()

    data = response.json()

    evidences = []

    for result in data.get("claims", []):

        claim_text = result.get("text", "")

        claimant = result.get("claimant", "")

        claim_review = result.get("claimReview", [])

        for review in claim_review:

            publisher = review.get("publisher", {})

            source = publisher.get("name", "Unknown")

            url = review.get("url", "")

            rating = review.get("textualRating")

            evidences.append({
                "source": source,
                "claim": claim_text,
                "claim_id":claim_id,
                "rating": rating,
                "url": url,
                "user_input_id":thread_id
         
            })
    print("search_fact_checks end ")

    return {"evidence":evidences}


    
def fan_out_evidence_web(state:InvestigationState) -> List[Send]:
    """
    Fan-Out Conditional Edge:
    Reads the list of tasks generated by the orchestrator and triggers 
    an independent, parallel execution of 'worker_node' for every task.
    """
    claims: List[Claim] = state['claims']

    # For each task in the plan, dispatch a Send object to the worker node
    return [
        Send(
            node="search_web_evidence_worker",  # Target node name registered in the graph
            arg={
                'claim':claim['text'],'id':claim['id'],'thread_id':state['thread_id']
            }
        )
        for claim in claims
    ]



async def search_web_evidence_worker(
    payload:dict
) ->InvestigationState:
    tavily_tool=TavilySearch(max_results=1,topic="general")
    print("search_web_evidence start")
    # print(payload)
    claim=payload['claim']
    claim_id=payload['id']
    thread_id=payload['thread_id']
    response = tavily_tool.invoke(
        input=claim,
        max_results=2,
    )

    evidence = []

    for result in response.get("results", []):

        evidence.append({
            "source": result.get("title"),
            "claim":result.get("title"),
            "claim_id":claim_id,
            "content": result.get("content"),
            "url": result.get("url"),
            "relevance_score": result.get("score"),
            "source_type": "web_search",
            "user_input_id":thread_id

        })
    print("search_web_evidence end")
    return {"web_evidence":evidence}



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

    structured_llm = llama.with_structured_output(
        EvidenceAnalysis
    )
    print("evidence_analysis start")
    supporting_evidence = []
    contradicting_evidence = []

    for claim in state["claims"]:

        claim_text = claim["text"]

        # Analyze only evidence returned for this claim.
        # If your evidence list is currently global,
        # this loop can be adjusted later when you add
        # claim_id to your evidence schema.

        for evidence in state["evidence"]:

            source = evidence.get("source", "")
            evidence_claim = evidence.get("claim", "")
            rating = evidence.get("rating", "")

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
    return {"supporting_evidence":supporting_evidence,"contradicting_evidence":contradicting_evidence}
       

async def web_evidence_analysis(state:InvestigationState) -> InvestigationState:

    supporting_evidence = []
    contradicting_evidence = []

    web_evidence = state["web_evidence"]

    structured_llm = llama.with_structured_output(EvidenceAnalysis)

    for evidence_item in web_evidence:

            claim_text = evidence_item.get("claim", "")
            content = evidence_item.get("content", "")
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
supports or contradicts the USER CLAIM.

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
                "reason": result.reason,
                "claim_id":evidence_item['claim_id'],
                "claim_text": claim_text,
                "evidence_claim":title,
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
    return {"supporting_evidence":supporting_evidence,"contradicting_evidence":contradicting_evidence}
   

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

claim_assesment_struc_op=phi_llm.with_structured_output(ClaimAssessmentResult)
async def claim_assessment(state:InvestigationState) -> InvestigationState:

    assessments = []

    for claim in state["claims"]:

        claim_id = claim["id"]
        claim_text = claim["text"]

        # Get evidence relevant to this claim
        supporting = [
            item
            for item in state["supporting_evidence"]
            if item["claim_id"] == claim_id
        ]

        contradicting = [
            item
            for item in state["contradicting_evidence"]
            if item["claim_id"] == claim_id
        ]

        # web_supporting = [
        #     item
        #     for item in state["web_supporting_evidence"]
        #     if item["claim_id"] == claim_id
        # ]

        # web_contradicting = [
        #     item
        #     for item in state["web_contradicting_evidence"]
        #     if item["claim_id"] == claim_id
        # ]

        all_supporting = supporting 
        all_contradicting = contradicting
        combined=all_supporting+all_contradicting
        print(combined)
        print("combined")
        for data in combined:
        # Send these to LLM
            result = await claim_assesment_struc_op.ainvoke(f"read the given input : {data}")

            assessments.append({
                "claim_id": claim_id,
                "claim_text": claim_text,
                "verdict": result.verdict,
                "confidence": result.confidence,
                "reason": result.reason,
                "supporting_evidence_count": len(all_supporting),
                "contradicting_evidence_count": len(all_contradicting),
                "user_input_id":state['thread_id']
            })
            

        

    state["claim_assessment"] = assessments

    return state



def finding_eveidence(state:InvestigationState):
  pass


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
        result = await phi_llm.with_structured_output(
            RiskAssessmentResult
        ).ainvoke(prompt)
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

def Calc_overall_risk_score_and_confidence(state:InvestigationState) -> InvestigationState:
    print("*********************calculating values****************************")
    final_risk_score:float=0.0
    avg_risk_score:float=0.0
    max_risk_score=state['risk_assessment'][0]['risk_score']
    sum=0
    for data in state['risk_assessment']:
        if(data['risk_score']>max_risk_score):
            max_risk_score=data['risk_score']
        sum+=data['risk_score']
    avg_risk_score=float(sum)/len(state['risk_assessment'])
    final_risk_score=0.70*float(avg_risk_score)+0.30*float(max_risk_score)
    if(final_risk_score>=0 and final_risk_score<30):
        risk_level="LOW"
    elif(final_risk_score>=30 and final_risk_score<60):
        risk_level="MODERATE"
    elif(final_risk_score>=60 and final_risk_score<90):
        risk_level="HIGH"
    else:
        risk_level="CRITICAL"
        
    sum=0
    max_confidence_score=state['claim_assessment'][0]['confidence']
    for data in state['claim_assessment']:
            if(data['confidence']>max_confidence_score):
                max_confidence_score=data['confidence']
            sum+=data['confidence']
    avg_confidence_score=float(sum)/len(state['claim_assessment'])
    final_confidence_score=0.70*float(avg_confidence_score)+0.30*float(max_confidence_score)
    return {'risk_score':final_risk_score,'risk_level':risk_level,'confidence':final_confidence_score}

graph = StateGraph(InvestigationState)
graph.add_node("classify_input", classify_input)
graph.add_node("extract_claims", extract_claims)
graph.add_node("google_fact_checks_worker", google_fact_checks_worker)
# graph.add_node("hive_text_moderation", hive_text_moderation)
graph.add_node("search_web_evidence_worker", search_web_evidence_worker)
graph.add_node("evidence_analysis", evidence_analysis)
graph.add_node("web_evidence_analysis", web_evidence_analysis)
graph.add_node("finding_eveidence", finding_eveidence)
graph.add_node("claim_assesment", claim_assessment)
graph.add_node("Risk_assesment", risk_assessment)
graph.add_node("Calc_overall_risk_score_and_confidence", Calc_overall_risk_score_and_confidence)
graph.add_node("hive_assesment_analysis_worker", hive_assesment_analysis_worker)


graph.add_edge(START, "classify_input")
graph.add_edge("classify_input","extract_claims")
graph.add_edge("extract_claims", "finding_eveidence")
# graph.add_edge("finding_eveidence","hive_text_moderation")
graph.add_conditional_edges("finding_eveidence",fan_out_evidence_fact,["google_fact_checks_worker"])
graph.add_conditional_edges("finding_eveidence",fan_out_evidence_web,["search_web_evidence_worker"])
graph.add_edge("google_fact_checks_worker","evidence_analysis")
graph.add_edge("search_web_evidence_worker", "web_evidence_analysis")
graph.add_edge("web_evidence_analysis","claim_assesment")
graph.add_edge("evidence_analysis","claim_assesment")

# graph.add_edge("hive_assesment_analysis_worker","Risk_assesment")
graph.add_conditional_edges("claim_assesment",hive_assesment_fanout,["hive_assesment_analysis_worker"])
graph.add_edge("hive_assesment_analysis_worker","Risk_assesment")
graph.add_edge("Risk_assesment","Calc_overall_risk_score_and_confidence")
graph.add_edge("Calc_overall_risk_score_and_confidence",END)

# graph.add_conditional_edges("orchestrator",fan_out_tasks, ["worker"]
# for now using InMemorySaver
checkpointer=InMemorySaver()
AGENT=graph.compile(checkpointer=checkpointer)





    
