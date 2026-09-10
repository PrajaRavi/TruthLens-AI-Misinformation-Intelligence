

import requests
import xml.etree.ElementTree as ET
import numpy as np
from pydantic import BaseModel,Field
from  app.Agents.Main_agent.state import InvestigationState,Claim
from app.config import llms
from langchain_classic.utils.math import cosine_similarity
from .who_evidence_worker import convert_claim_into_who_search_query

BASE_URL = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils"

def search_pubmed_detailed(query, retmax=3,api_key=None,claim_id=0,claim_text="hello",thread_id=""):
        
    # STEP 1: Search PMIDs
    search_url = f"{BASE_URL}/esearch.fcgi"
    search_params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": retmax,
        "sort": "relevance"
    }
    if api_key:
        search_params["api_key"] = api_key

    search_res = requests.get(search_url, params=search_params).json()
    pmids = search_res.get("esearchresult", {}).get("idlist", [])

    if not pmids:
        return []

    # STEP 2: Fetch full XML metadata
    fetch_url = f"{BASE_URL}/efetch.fcgi"
    fetch_params = {
        "db": "pubmed",
        "id": ",".join(pmids),
        "retmode": "xml"
    }
    if api_key:
        fetch_params["api_key"] = api_key

    response = requests.get(fetch_url, params=fetch_params)
    root = ET.fromstring(response.content)

    articles = []
    
    query_embedding=llms.embeddings.embed_query(query)
    for article in root.findall(".//PubmedArticle"):
        pmid = article.findtext(".//MedlineCitation/PMID")
        title = article.findtext(".//ArticleTitle")

        # 1. Parse Publication Date
        pub_date_node = article.find(".//Journal/JournalIssue/PubDate")
        year = pub_date_node.findtext("Year") if pub_date_node is not None else ""
        month = pub_date_node.findtext("Month") if pub_date_node is not None else ""
        day = pub_date_node.findtext("Day") if pub_date_node is not None else ""
        
        # Fallback to MedlineDate (e.g., "2024 Spring" or "2023 Nov-Dec") if standard fields are missing
        if not year:
            publish_date = pub_date_node.findtext("MedlineDate") if pub_date_node is not None else "Unknown"
        else:
            publish_date = " ".join(filter(None, [year, month, day]))

        # 2. Extract Journal & DOI
        journal_title = article.findtext(".//Journal/Title")
        
        doi = None
        for id_elem in article.findall(".//ArticleIdList/ArticleId"):
            if id_elem.get("IdType") == "doi":
                doi = id_elem.text
                break

        # 3. Construct Web URLs
        pubmed_url = f"https://pubmed.ncbi.nlm.nih.gov/{pmid}/"
        doi_url = f"https://doi.org/{doi}" if doi else None

        # 4. Extract Full Abstract
        abstract_texts = article.findall(".//Abstract/AbstractText")
        abstract = "\n".join([a.text for a in abstract_texts if a.text]) if abstract_texts else "No abstract available."

        title_embeddings=llms.embeddings.embed_query(title)
        score=cosine_similarity([query_embedding],[title_embeddings])[0][0]
        print(score)
        
        # 5. Extract Authors
        authors = []
        for author in article.findall(".//Author"):
            last_name = author.findtext("LastName")
            fore_name = author.findtext("ForeName")
            if last_name and fore_name:
                authors.append(f"{fore_name} {last_name}")

        
        if(score>0.60):
            articles.append({
                # "pmid": pmid,
                "title": title,
                "publish_date": publish_date,
                "journal": journal_title,
                # "doi": doi,
                "relevance_score":score,
                "url": pubmed_url,
                # "doi_url": doi_url,
                "content": abstract[0:401], #! during analysis first i will break whole content into individual chunks of 400char and then use flashrank for getting most relevant document
                "claim_id":claim_id,
                "claim_text":claim_text,
                "user_input_id":thread_id,
                
            })

    return articles

# --- Usage Example ---
# results = search_pubmed_detailed("alcohol prevents covid19", retmax=4)

class OptimizedQuery(BaseModel):
    query:str = Field(
        description="optimized query."
    )

structured_output=llms.GEMINI_FALLBACK_LLM.with_structured_output(OptimizedQuery,method="json_schema")
async def pubmed_evidence_worker(payload:dict)->InvestigationState:
  old_claim=payload['claim']
  result=await structured_output.ainvoke([{"role":"system","content":convert_claim_into_who_search_query},{"role":"user","content":old_claim}])
  print("pubmed_evidence_worker start")
  print(result)
#   print("pubmed_evidence_worker")
  claim=result.query
  claim_id=payload['id']
  data=search_pubmed_detailed(claim,4,None,claim_id,claim,payload['user_input_id'])
  print("pubmed_evidence_worker end")
  return {"pubmed_evidence":data}
      