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
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_ollama import ChatOllama,OllamaEmbeddings
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel,Field
from langgraph.types import interrupt
from dotenv import load_dotenv
from langchain_tavily import TavilySearch
from langchain_classic.utils.math import cosine_similarity
from langchain_nomic import NomicEmbeddings



from typing import Annotated,Literal
from langgraph.checkpoint.memory import InMemorySaver #!stores things in RAM
parser=StrOutputParser()
load_dotenv()


google_api_key=os.getenv("google_api_key")
TAVILY_API_KEY=os.getenv("TAVILY_API_KEY")
hive_api_key=os.getenv("hive_api_key")
gemini_api_key=os.getenv("GEMINI_API_KEY")
nomic_api_key=os.getenv("NOMIC_API_KEY")
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
embeddings = NomicEmbeddings(
    nomic_api_key=nomic_api_key,
    model="nomic-embed-text-v1.5", 
    inference_mode="remote"  # This tells LangChain to use the API, not your CPU
)



qwen=ChatOllama(
    model="qwen2.5:0.5b",
    temperature=0.4
)
qwen_coder=ChatOllama(
    model="qwen2.5-coder:3b",
    temperature=0.4
)
gemini_llm = ChatGoogleGenerativeAI(
    model="gemini-3.5-flash-lite",
    # model="gemini-3.1-flash-lite-image",
    api_key=gemini_api_key,
    
    temperature=0.7,
    max_tokens=None,
    timeout=None,
    max_retries=2,
)

llama=ChatOllama(
    model="llama3.2:1b",
    temperature=0.4
)

# print(gemini_api_key)


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
    th:float
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

    structured_llm = groq_llm.with_structured_output(ClaimsOutput,method="json_schema")

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

sturc_llm_for_hive_analysis=gemini_llm.with_structured_output(HarmAssessment,method="json_schema")

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
    th=state.get("th",0.75)
    # For each task in the plan, dispatch a Send object to the worker node
    
    return [
        Send(
            node="google_fact_checks_worker",  # Target node name registered in the graph
            arg={
                'claim':claim['text'],'id':claim['id'],'th':th
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
    th=payload["th"]
    #!here add a LLM which will extract important keywords from claim [extension]
    # ex->hello gyus drinking alcohol helps to defeat corona virus
    # it will become->drinking alcohol prevent corona virus
    
    claim_id=payload['id']

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

    #! every claim given by google fact tools api is not relevant so to find the relvant claim i have to perform cosine similarity and only claim having score>85 will be kept 
    for result in data.get("claims", []):

        claim_text = result.get("text", "")  #! This the claim done by the publisher and rating means when the publisher performed research about this text then if it was truth or rumour

        claimant = result.get("claimant", "")

        claim_review = result.get("claimReview", [])

        for review in claim_review:

            publisher = review.get("publisher", {})
            #! here we have one more data->publisher site
            source = publisher.get("name", "Unknown")
            url = review.get("url", "")
            rating = review.get("textualRating")
            document_emba=embeddings.embed_query(claim_text)
            query_emba=embeddings.embed_query(claim)
            score=cosine_similarity([query_emba],[document_emba])[0] #the both values inside 
            if(score>th):        
                evidences.append({
                    "source": source,
                    "claim": claim_text, #! this is by google fact tools api
                    "claim_id":claim_id,
                    "claim_text":claim,  #! this is my claim_text for which this google fact tool api is called
                    "rating": rating,
                    "url": url,
            
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
    th=state.get("th",0.75)

    # For each task in the plan, dispatch a Send object to the worker node
    return [
        Send(
            node="search_web_evidence_worker",  # Target node name registered in the graph
            arg={
                'claim':claim['text'],'id':claim['id'],'th':th
            }
        )
        for claim in claims
    ]




async def search_web_evidence_worker(payload:dict) ->InvestigationState:
    tavily_tool=TavilySearch(max_results=1,topic="general")
    print("search_web_evidence start")
    # print(payload)
    claim=payload['claim']
    claim_id=payload['id']
    th=payload['th']
    response = tavily_tool.invoke(
        input=claim,
        max_results=2,
    )

    evidence = []

    for result in response.get("results", []):
        score=float(result.get("score"))
        if(score>th):     
            evidence.append({
                "source": result.get("title"),
                "title": result.get("title"),
                "claim_text":claim,
                "claim_id":claim_id,
                "content": result.get("content"),
                "url": result.get("url"),
                "relevance_score": result.get("score"),
                "source_type": "web_search"
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

    structured_llm = groq_llm.with_structured_output(EvidenceAnalysis,method="json_schema")
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

    structured_llm = gemini_llm.with_structured_output(EvidenceAnalysis,method="json_schema")

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
supports or contradicts the USER CLAIM by just reading the given input do  not call any external tool as i do not have any tool.

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
CLAIM_ASSESSMENT_SYSTEM_PROMPT = """
You are an expert fact-checking and claim assessment analyst.

Your task is to assess ONE user claim using ALL of the provided
supporting and contradicting evidence.

IMPORTANT RULES:

1. Analyze the USER CLAIM as the proposition that needs to be verified.

2. Consider ALL provided evidence together. Do not make the final
   decision based on only one evidence item.

3. Supporting evidence is evidence that directly supports the factual
   proposition of the user claim.

4. Contradicting evidence is evidence that directly opposes the factual
   proposition of the user claim.

5. Evidence that is only loosely related, discusses the same topic,
   or does not establish whether the claim is true or false must not
   be treated as strong evidence.

6. Do not assume that an evidence source supports a claim merely because
   it contains similar words or discusses the same subject.

7. Give greater importance to evidence that directly addresses the
   exact claim.

8. If the evidence is conflicting, incomplete, indirect, or insufficient
   to establish the truth of the claim, do NOT guess. Use "UNVERIFIED".

9. The verdict must represent the relationship between the USER CLAIM
   and the available evidence.

10. Confidence must be a value between 0 and 1 and should represent
    how confident you are in the verdict based on only the provided
    evidence.

11. The reason must clearly explain:
    - what the claim asserts,
    - what the strongest evidence says,
    - whether the evidence supports or contradicts the claim,
    - and why the final verdict was chosen.

12. Do not use outside knowledge or perform web searches.
    Only use the evidence provided in the input.

VERDICT DEFINITIONS:

- "TRUE":
  The available evidence sufficiently supports the factual proposition
  made by the user claim.

- "FALSE":
  The available evidence sufficiently contradicts the factual proposition
  made by the user claim.

- "PARTIALLY_TRUE":
  The claims have equal no of supporting document and contradicting document but not 0
  -For example:
    -`Claim`:
    "The government launched a ₹50,000 scholarship, and every student in India is eligible."
    -`Evidence`:
    Government announcement confirms a ₹50,000 scholarship, but eligibility is limited to students meeting specific criteria.

- "MISLEADING":
  -The evidences may contain true information but creates an improper conclusion
  -Use Misleading when the underlying information isn't necessarily completely false, but the way it is presented gives a substantially incorrect impression.
  -Example:
`claim`:
    "Scientists say alcohol can kill coronavirus."
'Evidence`:
    Alcohol-based sanitizer can kill certain viruses on surfaces.

- "UNVERIFIED":
  The available evidence is insufficient, ambiguous, indirect, unrelated,
  or conflicting such that the claim cannot confidently be established
  as true or false.
  -Example:
  `claim`:"A new study found that drinking a particular herbal mixture increases immunity by 73%."

Return only the fields defined by the provided structured output schema.

"""

claim_assesment_struc_op=gemini_llm.with_structured_output(ClaimAssessmentResult,method="json_schema")

async def claim_assessment(state:InvestigationState) -> InvestigationState:
    """
    Assesses each claim using all supporting and contradicting evidence
    associated with that claim.
    """

    assessments = []

    for claim in state["claims"]:

        claim_id = claim["id"]
        claim_text = claim["text"]

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

CLAIM ID:
{claim_id}

EVIDENCE:
{evidence}

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
            "supporting_evidence_count": len(supporting),
            "contradicting_evidence_count": len(contradicting)
        })

    state["claim_assessment"] = assessments

    return state



def finding_eveidence(state:InvestigationState):
  pass


RISK_ASSESSMENT_SYSTEM_PROMPT = """
You are an AI misinformation risk assessment analyst.

Your task is to determine how risky a user claim is by combining:

1. The factual assessment of the claim.
2. The harmful-content assessment of the claim.

You MUST NOT perform new fact-checking.
You MUST NOT use outside knowledge.
You MUST NOT change or reinterpret the factual verdict.

The factual assessment and harmful-content assessment are already
provided to you. Your job is only to determine the risk created by
the combination of these two assessments.

FACTUAL VERDICT:


- "TRUE":
  The available evidence sufficiently supports the factual proposition
  made by the user claim.

- "FALSE":
  The available evidence sufficiently contradicts the factual proposition
  made by the user claim.

- "PARTIALLY_TRUE":
  The claims have equal no of supporting document and contradicting document but not 0
  -For example:
    -`Claim`:
    "The government launched a ₹50,000 scholarship, and every student in India is eligible."
    -`Evidence`:
    Government announcement confirms a ₹50,000 scholarship, but eligibility is limited to students meeting specific criteria.

- "MISLEADING":
  -The evidences may contain true information but creates an improper conclusion
  -Use Misleading when the underlying information isn't necessarily completely false, but the way it is presented gives a substantially incorrect impression.
  -Example:
`claim`:
    "Scientists say alcohol can kill coronavirus."
'Evidence`:
    Alcohol-based sanitizer can kill certain viruses on surfaces.

- "UNVERIFIED":
  The available evidence is insufficient, ambiguous, indirect, unrelated,
  or conflicting such that the claim cannot confidently be established
  as true or false.
  -Example:
  `claim`:"A new study found that drinking a particular herbal mixture increases immunity by 73%."

RISK FACTORS:

Increase the risk when:

- The claim is Contradicted.
- Confidence in the factual assessment is high.
- There is strong contradicting evidence.
- The claim could cause users to make harmful decisions.
- The harmful-content assessment indicates that the content is harmful.

A false or contradicted claim is NOT automatically Critical.
Consider the potential impact and harmfulness as well.

HARMFUL CONTENT:

If harmful = true, increase the risk according to the severity
indicated by the harmful-content assessment.

If harmful = false, do not add a harmful-content penalty.

SCORING:

0-20   = LOW
21-40  = MEDIUM
41-70  = HIGH
71-100 = CRITICAL

The risk_score must be an integer between 0 and 100.

The risk_level must correspond to the risk_score.

The reason must clearly explain:
- the factual verdict,
- confidence/evidence strength,
- harmful-content status,
- and why these factors resulted in the final risk.

Return only the fields defined by the structured output schema.
"""

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

risk_assesment_struct_output=gemini_llm.with_structured_output(RiskAssessmentResult)

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

#! calculating  overall risk_score,risk_level,confidence_score  
"""
overall_score =
    70% × average_score
    + 30% × maximum_score

Assessment 1 → 95 CRITICAL
Assessment 2 → 30 MODERATE
Assessment 3 → 25 MODERATE

average = (95 + 30 + 25) / 3
        = 50

maximum = 95

overall =
    0.70 × 50
    + 0.30 × 95

    = 63.5
    

->risk_score,risk_level,confidence[score] 
   
"""

def Calc_overall_risk_score_and_confidence(state:InvestigationState) -> InvestigationState:
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





    
