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
from urllib.parse import urlparse
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled,VideoUnavailable,InvalidVideoId,NoTranscriptFound,NotTranslatable
from utils.utils_func import extract_video_id,format_docs
from yt_dlp import YoutubeDL
import trafilatura 

from langchain_classic.utils.math import cosine_similarity
from langchain_nomic import NomicEmbeddings
from LLM.llms import groq_llm,gemini_llm,hive_api_key,google_fact_api_key,embeddings
from LLM.ResearchChatbot import SEARCH_CHATBOT,format_research_output


from typing import Annotated,Literal
from langgraph.checkpoint.memory import InMemorySaver #!stores things in RAM
parser=StrOutputParser()
load_dotenv()



# print(GOOGLE_API_KEY)


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
    th:float #! between 0 and 1
    user_id: str
    thread_id: str #! this will act as user_input_id inside each field

    #!summary considering all the feilds of every object
    
    claim_assessment_summary:str|None
    risk_assessment_summary:str|None
    


    input_type: Literal[
        "text",
        "url",
        #! in future i will implement it
        "image",
        "audio",
        "video",
        "youtube",
        "webpage"
    ]


    input_text: str | None
    input_url: str | None
    source_url:str|None
    webpage_title:str|None

    
    # media_ids: list[str] #!useful when uploading audio and video


    # ─────────────────────────────
    # CONTENT ANALYSIS
    # ─────────────────────────────

    # modalities: list[str]  # ! what type of contents are prsent may be implement in future useful when provide multiple mix inputs[litle confusing at this point]

    extracted_text: str | None #this text is from any image beacuse pure text will be store inside input_text[futue] 
    transcript: str | None #! It will store transcript of any yt video or any video/audio having transcript or any webpage [implementing]
    transcript_summary:str|None #! i can't give whole transcript as it is to my llm hence i am summarizing it

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
    yt_thumbnail:str|None

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

async def extract_webpage_content(url: str) -> dict:

    try:

        downloaded = trafilatura.fetch_url(url)

        if not downloaded:
            raise ValueError(
                "Unable to download webpage"
            )

        # Extract structured object containing metadata + body text
        data = trafilatura.bare_extraction(downloaded)
        if data:
            title = data.title          # Extracted page title
            text = data.text         # Main article text
            author = data.author

            if not text or not text.strip():
                raise ValueError(
                    "Could not extract readable content from webpage"
                )

            return {
                "source_type": "webpage",
                "source_url": url,
                "text": text,
                "title":title,
                "author":author
            }

    except Exception as e:

        raise ValueError(
            f"Unable to extract webpage content: {str(e)}"
        )


    
async def classify_input(state:InvestigationState) ->InvestigationState:
    print('running classify input')
    """
    Classifies the user's input as text or URL-based content.

    Current implementation:
    - Normal text -> returns state unchanged
    - URL -> classifies the URL for future processing
    -and also extract transcript from videos and webpages
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
    print("chala hu mai bhai")    
    # Future implementation
    return {'input_type':input_type,"input_url":input_text}


def input_type_is_text(state:InvestigationState)->InvestigationState:
    return state
def input_type_is_url(state:InvestigationState)->InvestigationState:
    print("input_type_is_url start")
    return state
def input_router(state:InvestigationState)->Literal["input_type_is_text","input_type_is_url"]:
    if(state['input_type']=="audio"):
        pass
    elif(state['input_type']=="video"):
        pass
    elif(state['input_type']=="image"):
        pass
    elif(state['input_type']=="text"):
        return "input_type_is_text"
    elif(state['input_type']=="url" or state['input_type']=="youtube" or state['input_type']=="webpage"):
        return "input_type_is_url"

async def handling_input_type_url(state:InvestigationState)->InvestigationState:
    print("handling_input_type_url")
    if(state['input_type']=="youtube"):

        # ! Now i have to fetch the transScript of that yt video and further processing will be same

        video_id=extract_video_id(url=state['input_url'])
        if(video_id=="Invalid YouTube URL"):
                return print("Error !!!!",video_id)
                # 1. fetch transcript
        try:
            transcript_list = YouTubeTranscriptApi().fetch(video_id=video_id, languages=["en","hi"])
            transcript = " ".join(snippet.text for snippet in transcript_list)
            # 2. Fetch title and thumbnail metadata
            ydl_opts = {
                'skip_download': True,
                'quiet': True,
                    }
        except VideoUnavailable:
                print("This video is not available")
                return
                    
                    
        except NotTranslatable:
                print("This video is not translateble")
                return
                    
                    
        
        except NoTranscriptFound:
                print("This video doesn't contains any transcript")
                return
        
                    
        
        except TranscriptsDisabled:
                print("No captions available for this video.")
                return
        
                    
        
        except Exception as e:
                print("An error occured",str(e))      
                return
        print("hello mai ravi")
        with YoutubeDL(ydl_opts) as ydl:
                info = ydl.extract_info(state['input_url'], download=False)
                title = info.get('title')
                thumbnail = info.get('thumbnail')
                return {'webpage_title':title,"yt_thumbnail":thumbnail,'transcript':transcript}
    elif(state['input_type']=="webpage"):
         data=await extract_webpage_content(state['input_url'])
         title=data['title']
         return {'webpage_title':title,'transcript':data['text']}

EVENT_EXTRACTION_SYSTEM_PROMPT = """
You are an analysis-content extraction agent in a misinformation and
harmful-content detection system.

Your task is to process the provided content and retain ONLY the parts
that are relevant for factual, misinformation, safety, or harmful-content
analysis.

Do not create a normal summary.

Instead, remove irrelevant conversational content and extract the
important events, claims, statements, allegations, actions, incidents,
and their necessary context.

REMOVE content such as:
- greetings and introductions
- "welcome to my channel"
- requests to like, subscribe, or share
- advertisements and sponsorships
- repeated statements
- filler words and casual conversation
- personal introductions that are unrelated to the topic
- jokes or small talk that have no analytical relevance
- unrelated stories or discussion
- video outro content

KEEP content that may be relevant to analysis, including:

1. Factual claims
   Example:
   "Google is going to hire 10,000 employees in India."

2. Events and incidents
   Example:
   "The company announced that it closed three factories."

3. Allegations or accusations
   Example:
   "The politician was accused of accepting illegal payments."

4. Health, safety, violence, sexual, self-harm, drug, hate, or other
   potentially harmful statements.

5. Claims involving people, companies, governments, organizations,
   products, places, dates, numbers, statistics, or events.

6. Predictions or future events.
   Preserve words such as "may", "might", "expected", and "will".

7. Rumors, reports, or statements attributed to other people.
   Preserve the attribution.

8. Corrections, denials, disagreements, or contrasting statements.

9. Context that is necessary to correctly understand an important claim.

IMPORTANT:

- Do not fact-check anything.
- Do not decide whether a claim is true or false.
- Do not use outside knowledge.
- Do not invent missing information.
- Do not change the meaning of the original content.
- Preserve names, dates, numbers, locations, organizations, and other
  important entities.
- Preserve negations such as "not", "never", "didn't", and "has not".
- Preserve uncertainty such as "may", "might", "allegedly", "reportedly",
  and "according to".
- Preserve who made a statement when attribution is present.

If a statement is potentially important but its meaning depends on
nearby context, include enough surrounding context to preserve its
meaning.

The output should be a coherent piece of text containing ONLY the
analysis-relevant content.

Do not produce a verdict, risk score, fact-checking result, or claim
classification.
"""

async def event_extrator_from_transcript(state:dict):
   transcript=state['transcript']
   prompt=f"""summarize this transcript {transcript}"""
   result=await groq_llm.ainvoke([
                    {
                        "role": "system",
                        "content": EVENT_EXTRACTION_SYSTEM_PROMPT
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ])
   result=format_research_output(result.content)
   return {'input_text':result}
  
  



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
                'claim':claim['text'],'id':claim['id'],'th':th,'user_input_id':state['thread_id']
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
    user_input_id=payload["user_input_id"]
    #!here add a LLM which will extract important keywords from claim [extension]
    # ex->hello gyus drinking alcohol helps to defeat corona virus
    # it will become->drinking alcohol prevent corona virus
    
    claim_id=payload['id']

    params = {
        "query": claim,
        "key": google_fact_api_key,
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
                    "user_input_id":user_input_id
            
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
                'claim':claim['text'],'id':claim['id'],'th':th,'user_input_id':state['thread_id']
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
    user_input_id=payload['user_input_id']
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
                "user_input_id":user_input_id,
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

claim_assesment_struc_op=gemini_llm.with_structured_output(ClaimAssessmentResult)

CLAIM_ASSESSMENT_SYSTEM_PROMPT = """
You are an expert fact-checking and claim assessment analyst.

Your task is to assess ONE USER CLAIM using ALL available evidence,
including:

1. Supporting evidence
2. Contradicting evidence
3. Research Agent findings

The Research Agent is an investigator, NOT the final judge.
Its conclusion must NOT automatically be treated as true.
Evaluate the findings and the sources mentioned in the research report
before deciding the verdict.

IMPORTANT RULES:

1. Analyze the USER CLAIM as the exact proposition that needs to be
   verified.

2. Consider ALL available evidence together:
   - supporting evidence
   - contradicting evidence
   - Research Agent findings

3. Supporting evidence is evidence that directly supports the factual
   proposition of the USER CLAIM.

4. Contradicting evidence is evidence that directly opposes the factual
   proposition of the USER CLAIM.

5. Research Agent findings may contain:
   - discovered facts
   - identified entities
   - relationships between entities
   - supporting information
   - contradictory information
   - information that could not be verified

   Use these findings to improve your understanding of the claim,
   especially when the claim contains ambiguous people, organizations,
   events, dates, or relationships.

6. Do NOT blindly trust the Research Agent's conclusion.
   Treat its findings as research information and evaluate whether the
   cited evidence actually supports or contradicts the USER CLAIM.

7. Evidence that is only loosely related, discusses the same topic,
   contains similar words, or does not establish whether the claim is
   true or false must NOT be treated as strong evidence.

8. Give greater importance to evidence that directly addresses the
   exact factual proposition of the USER CLAIM.

9. When the Research Agent identifies an entity or person, use that
   information to correctly understand the context of the claim.
   However, do not assume the identified entity is correct unless the
   available evidence supports the identification.

10. If supporting and contradicting evidence conflict, compare their
    relevance, directness, and reliability.

11. If the evidence is incomplete, indirect, ambiguous, unrelated,
    or insufficient to establish whether the claim is true or false,
    DO NOT guess. Return "UNVERIFIED".

12. Do NOT make a verdict based only on the number of evidence items.
    The quality, directness, and relevance of evidence are more
    important than the quantity.

13. Do not use outside knowledge or perform additional web searches.
    Use ONLY the evidence and Research Agent findings provided in
    the input.

14. The verdict must represent the relationship between the USER CLAIM
    and the available evidence.

15. Confidence must be a value between 0 and 1.

    Confidence represents how certain you are that the selected verdict
    is correct based ONLY on the provided evidence.

    Use the following guidance:

    - 0.90 - 1.00:
      Very strong and direct evidence with little or no meaningful
      contradiction.

    - 0.75 - 0.89:
      Strong evidence supporting the verdict, but some uncertainty or
      limited conflicting information exists.

    - 0.50 - 0.74:
      Moderate evidence. The overall direction is reasonably clear,
      but important uncertainty remains.

    - 0.30 - 0.49:
      Weak, incomplete, indirect, or conflicting evidence.

    - 0.00 - 0.29:
      Very little reliable evidence exists.

    Do NOT increase confidence simply because many sources are present.
    Multiple sources repeating the same unsupported information should
    not be treated as independent strong evidence.

16. The reason must clearly explain:

    - what the USER CLAIM asserts,
    - what the strongest available evidence says,
    - what the Research Agent discovered,
    - whether the evidence supports or contradicts the claim,
    - and why the selected verdict is appropriate.

VERDICT DEFINITIONS:

TRUE:
The available evidence sufficiently supports the factual proposition
made by the USER CLAIM.

FALSE:
The available evidence sufficiently contradicts the factual proposition
made by the USER CLAIM.

PARTIALLY_TRUE:
The USER CLAIM contains multiple factual components and some of those
components are supported while other components are contradicted or
not supported.

Do NOT use PARTIALLY_TRUE simply because there are equal numbers of
supporting and contradicting sources.

Example:

Claim:
"The government launched a ₹50,000 scholarship and every student in
India is eligible."

Evidence:
The government confirms a ₹50,000 scholarship, but eligibility is
limited to students meeting specific criteria.

Therefore, the claim is PARTIALLY_TRUE.

MISLEADING:
The underlying information contains some true or relevant facts, but
the way the information is presented creates a substantially incorrect
or misleading impression.

Example:

Claim:
"Scientists say alcohol can kill coronavirus."

Evidence:
Alcohol-based sanitizer can kill certain viruses on surfaces.

The evidence contains a true fact about alcohol-based sanitizer, but
it does not establish that drinking alcohol kills coronavirus.
Therefore, the claim is MISLEADING.

UNVERIFIED:
The available evidence is insufficient, ambiguous, indirect, unrelated,
or conflicting such that the claim cannot confidently be established
as true or false.

Example:

Claim:
"A new study found that drinking a particular herbal mixture increases
immunity by 73%."

If the provided evidence does not sufficiently verify this study or
finding, return UNVERIFIED.

FINAL RULE:

Return ONLY the fields defined by the provided structured output schema.
Do not include additional fields, explanations outside the schema,
or markdown.
"""



async def claim_assessment(state:InvestigationState) -> InvestigationState:
    """
    Assesses each claim using all supporting and contradicting evidence
    associated with that claim.
    """

    assessments = []

    for claim in state["claims"]:

        claim_id = claim["id"]
        claim_text = claim["text"]
        response=await SEARCH_CHATBOT.ainvoke({'messages':[{'role':'user','content':claim_text}]})
        research_agent_report=format_research_output(response)


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
            "supporting_evidence_count": len(supporting),
            "contradicting_evidence_count": len(contradicting)
        })

    return {"claim_assessment":assessments}





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

SUMMARIZE_RISK_ASSESSMENT_PROMPT = """
You are an expert misinformation claim assessment analyst.

IMPORTANT:
Use ONLY the `reason` field to create the summary. Do not use or infer
information directly from claim_id, claim_text, verdict, confidence, or
evidence counts. The reason field already contains the important explanation
about each claim.

Read the reason of EVERY claim carefully. Compare the reasons across all
claims and identify the most important overall findings, common patterns,
differences, repeated issues, and important concerns.

Write ONE concise but detailed, context-aware summary.

LANGUAGE RULE:
Use extremely simple, plain, everyday English. Write as if you are explaining
the result to a 5-year-old child. Use short sentences and very common words.
Avoid technical, legal, insurance, academic, or complicated words.
If a difficult word is absolutely necessary, explain it using very simple words.
Do not use fancy words just to sound professional.

IMPORTANT INFORMATION RULE:
If the assessment contains the name of a person, place, event, organization,
company, product, group, or any other important named thing that helps the user
understand the risk or claim, KEEP that name in the summary.
Do not remove or replace useful names with vague words such as "a person",
"an organization", or "an event" when the actual name is available.
Only include names that are relevant to the main findings. Do not add names
that are not present in the provided data.

IMPORTANT OUTPUT RULES:
- Maximum 5–6 lines.
- Keep it concise but meaningful.
- Include the most important information from ALL claims.
- Explain the overall risk and important high/low risks.
- Mention important harmful or non-harmful content patterns.
- Keep useful names of people, places, events, organizations, or other
  important things when they help explain the result.
- Mention important concerns or mismatches.
- Do not simply list the claims.
- Do not repeat the same information.
- Do not invent any information.
- Do not leave out important findings just because the summary is short.
- Return ONLY the final summary as plain text.
"""
async def summarize_risk_assessment(state:InvestigationState)->InvestigationState:

    risk_assessment = state.get("risk_assessment", [])

    response = await groq_llm.ainvoke([
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

SUMMARIZE_CLAIM_ASSESSMENT_PROMPT = """
You are an expert misinformation claim assessment analyst.

Analyze the COMPLETE claim assessment data containing multiple claim objects.
Each object contains: claim_id, claim_text, verdict, confidence, reason,
supporting_evidence_count, and contradicting_evidence_count.

IMPORTANT:
Use ONLY the `reason` field to create the summary. Do not use or infer
information directly from claim_id, claim_text, verdict, confidence, or
evidence counts. The reason field already contains the important explanation
about each claim.

Read the reason of EVERY claim carefully. Compare the reasons across all
claims and identify the most important overall findings, common patterns,
differences, repeated issues, and important concerns.

Write ONE concise but detailed, context-aware summary.

LANGUAGE RULE:
Use VERY SIMPLE, PLAIN, EVERYDAY ENGLISH. Write as if you are explaining
the result to a 5-year-old child. Use short sentences and very common words.
Avoid technical, academic, legal, or complicated words.
If a difficult word is necessary, explain it using simple words.
Do not use fancy language.

IMPORTANT OUTPUT RULES:
- Maximum 5–6 lines.
- Keep the summary concise but meaningful.
- Include the most important findings from ALL claim reasons.
- Focus only on information clearly supported by the `reason` fields.
- Identify important common patterns and differences across the reasons.
- If a reason mentions a useful person, place, event, organization, product,
  or other important name, include that name in the summary when it helps the
  user understand the result.
- Include important harmful, false, misleading, safe, or concerning patterns
  mentioned in the reasons.
- Do not list every claim separately.
- Do not repeat the claim objects.
- Do not invent or assume any information.
- Do not use information from other fields, even if it appears useful.
- Do not leave out an important finding from the reasons just because the
  summary is short.
- Return ONLY the final summary as plain text.
"""
async def summarize_claim_assessment(state:InvestigationState)->InvestigationState:

    claim_assessment = state.get("claim_assessment", [])

    # Give the LLM the complete claim assessment.
    # Every object and every field is preserved.
    response = await groq_llm.ainvoke([
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

    return {
        "claim_assessment_summary": response.content
    }


def calc_max_risk_score_and_max_confidence(state:InvestigationState)->InvestigationState:
    max_confidence=0
    for item in state['claim_assessment']:
        if(item['confidence']>max_confidence):
            max_confidence=item['confidence']
    
    max_risk_score=state['risk_assessment'][0]['risk_score']
    max_risk_score_level=state['risk_assessment'][0]['risk_level']
    for i in range(1,len(state['risk_assessment'])):
        if(state['risk_assessment'][i]['risk_score']>max_risk_score):
            max_risk_score=state['risk_assessment'][i]['risk_score']
            max_risk_score_level=state['risk_assessment'][i]['risk_level']
    return {'risk_score':max_risk_score,'risk_level':max_risk_score_level,'confidence':max_confidence}


    
def summarize_transcript(state:InvestigationState)->InvestigationState:
    return state 
graph = StateGraph(InvestigationState)
graph.add_node("classify_input", classify_input)
graph.add_node("extract_claims", extract_claims)
graph.add_node("google_fact_checks_worker", google_fact_checks_worker)
graph.add_node("search_web_evidence_worker", search_web_evidence_worker)
graph.add_node("evidence_analysis", evidence_analysis)
graph.add_node("web_evidence_analysis", web_evidence_analysis)
graph.add_node("finding_eveidence", finding_eveidence)
graph.add_node("claim_assesment", claim_assessment)
graph.add_node("Risk_assesment", risk_assessment)
graph.add_node("summarize_claim_assessment", summarize_claim_assessment)
graph.add_node("summarize_risk_assessment", summarize_risk_assessment)
# graph.add_node("Risk_assesment", risk_assessment)
graph.add_node("handling_input_type_url", handling_input_type_url)
graph.add_node("input_type_is_text", input_type_is_text)
graph.add_node("input_type_is_url", input_type_is_url)
graph.add_node("summarize_transcript", summarize_transcript)
graph.add_node("hive_assesment_analysis_worker", hive_assesment_analysis_worker)
graph.add_node("calc_max_risk_score_and_max_confidence", calc_max_risk_score_and_max_confidence)


graph.add_edge(START, "classify_input")
# graph.add_edge("classify_input","extract_claims")
graph.add_conditional_edges("classify_input",input_router)
graph.add_edge("input_type_is_text","extract_claims")
graph.add_edge("input_type_is_url","handling_input_type_url")
graph.add_edge("handling_input_type_url","summarize_transcript")
graph.add_edge("summarize_transcript","extract_claims")
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
graph.add_edge("Risk_assesment","summarize_claim_assessment")
graph.add_edge("summarize_claim_assessment","summarize_risk_assessment")
graph.add_edge("summarize_risk_assessment","calc_max_risk_score_and_max_confidence")
graph.add_edge("calc_max_risk_score_and_max_confidence",END)

# graph.add_conditional_edges("orchestrator",fan_out_tasks, ["worker"]
# for now using InMemorySaver
checkpointer=InMemorySaver()
AGENT=graph.compile()





    
