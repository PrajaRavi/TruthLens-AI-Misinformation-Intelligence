# main.py

from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from fastapi.exceptions import HTTPException
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter,Language
from langchain_community.vectorstores import FAISS
from langchain_ollama import OllamaEmbeddings
from fastapi.responses import JSONResponse
from fastapi import Query,status
from imagekitio import ImageKit
from LLM.ResearchChatbot import SEARCH_CHATBOT
from LLM.tools import Validate_input

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


  