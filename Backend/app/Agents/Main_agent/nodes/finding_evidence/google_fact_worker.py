from  app.Agents.Main_agent.state import InvestigationState,Claim
from app.config import settings,llms
import requests
from langchain_community.utils.math import cosine_similarity

embeddings=llms.embeddings
google_fact_api_key=settings.GOOGLE_FACT_API
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
