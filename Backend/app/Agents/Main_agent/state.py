
from typing import TypedDict,List
import operator
from pydantic import BaseModel,Field
from typing import Annotated,Literal





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
    category:Literal["GENRAL","HEALTH","POLITICS","CLIMATE","FINANCE","TECHNOLOGY","SCIENCE","SOCIAL MEDIA","BREAKING NEWS"]=Field(description="This is going to tell in which category the content recides",default="genral")

    #!summary considering all the feilds of every object
    
    claim_assessment_summary:str|None
    risk_assessment_summary:str|None
    content_length_th:int|None
    sources_count:Annotated[list[dict],operator.add]
    claim_count:int|None
    


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
    who_evidence:Annotated[list[dict],operator.add]
    supporting_evidence:Annotated[list[dict],operator.add]
    contradicting_evidence:Annotated[list[dict],operator.add]
    risk_assessment:Annotated[list[dict],operator.add]
    pubmed_evidence:Annotated[list[dict],operator.add]  #! title,publish_date,url,authors,content,claim_id,claim_text



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

