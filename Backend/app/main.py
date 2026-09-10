# write api here
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
from fastapi.responses import Response
from imagekitio import ImageKit
from app.Agents.Search_agent.graph  import SEARCH_AGENT
from utils.validate_input import Validate_input
from utils.utils_func import retrieval_query_rewrite
from app.Agents.Analysis_agent.graph import ANALYSIS_CHAIN
from app.config import settings
from DB.faiss_db import vector_store,update_vector_store
from services.chunker import perform_chunk
from services.retriever import retrieve_data_with_flashrank
import json

from app.Agents.Main_agent.graph import MAIN_AGENT
from fastapi import (FastAPI)
origins = [
    "http://localhost:3000",      # React default port
    "http://localhost:5173",      # Vite default port
    "http://127.0.0.1:5173",
    "https://your-domain.com",    # Production frontend URL
]
import os
from pydantic import BaseModel
IMAGEKIT_PUBLIC_KEY = settings.IMAGEKIT_PUBLIC_KEY
IMAGEKIT_PRIVATE_KEY = settings.IMAGEKIT_PRIVATE_KEY
IMAGEKIT_URL_ENDPOINT_BASE = settings.IMAGEKIT_BASE_URL
img_kit_id=settings.IMAGEKIT_ID


app=FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,            # Whitelisted origins
    allow_credentials=True,           # Allow cookies / auth headers
    allow_methods=["*"],              # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],              # Allow all request headers
)

# --------------------------
# states
# --------------------------
class ValidateInput(BaseModel):
  input:str

class ResearchBody(BaseModel):
  input:str
  type:str
  thread_id:str

class AnalysisAssistantFeedData(BaseModel):
   analysis_data:str
   query:str

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

@app.post("/api/feed_data_to_analysis_assistant")
async def hello(body:dict):
  try:
      chunks=perform_chunk(800,body)
      print("="*100)
      print("chunks printing")
      print(chunks)
      await update_vector_store(chunks)
      return JSONResponse({'success':'true','msg':"chunks created and stored in db"})
  except Exception as e:
       print(str(e))
       return HTTPException(500,{'success':'false','msg':str(e)}) 

      
@app.post("/api/chat_with_analysis_assistant")
async def hello(body:dict):
  try:
      print(body['query'])
      query=await retrieval_query_rewrite(body['query'])
      print(query)
      if(str(query['is_relevant']).lower()=="false"):
         return JSONResponse({'success':'true','msg':query['query']}) 
      context=retrieve_data_with_flashrank(query['query'])
      result=await ANALYSIS_CHAIN.ainvoke({'user_query':query['query'],'analysis_data':context})
      return JSONResponse({'success':'true','msg':result})

  except Exception as e:
       print(str(e))
       return HTTPException(500,{'success':'false','msg':str(e)}) 

      






@app.get("/api/research_chatbot")
async def hello(claim_text:str):
  # return {'just':claim_text}
  response=await SEARCH_AGENT.ainvoke({'messages':[{'role':'user','content':claim_text}],'curr':1,'max':3})
  print(response['messages'][-1].content)
  return JSONResponse({'success':'true','msg':response['messages'][-1].content})
          

@app.post("/api/research")
async def hello(input:ResearchBody):
  print(input)
  try:
     final_result=await MAIN_AGENT.ainvoke({'input_text':input.input,'input_type':input.type,'thread_id':input.thread_id,"content_length_th":200,"th":0.75},config={'configurable':{'thread_id':input.thread_id}})
    #  print(final_result)
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

@app.get("/workflow")
def get_workflow():
    image_bytes = MAIN_AGENT.get_graph().draw_mermaid_png()

    return Response(
        content=image_bytes,
        media_type="image/png"
    )