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
from utils.vector_store_manager import update_vector_store
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
      return HTTPException({'success':'false','error':str(e)})

  
@app.get("/")
def hello():
  return JSONResponse({'success':'true','msg':"All is well!!!!!! 😊😊😊😊😊🤣🤣🤣🤣🤣"})


@app.post("/api/research")
async def hello(input:ResearchBody):
  print(input)
  try:
     final_result=await AGENT.ainvoke({'input_text':input.input,'input_type':input.type,'thread_id':input.thread_id},config={'configurable':{'thread_id':input.thread_id}})
     if(final_result):
       return JSONResponse({'success':'true','msg':final_result})
     else:
       return HTTPException({'success':'false','msg':"Internal server error"})
        
    
  except Exception as e:
    return HTTPException({'success':'false','msg':str(e)})



  
  