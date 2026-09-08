
from langchain_core.output_parsers import StrOutputParser
from pydantic import BaseModel,Field
from langgraph.types import interrupt
from langchain_tavily import TavilySearch
from app.config import llms
from typing import Annotated,Literal
parser=StrOutputParser()


groq_llm=llms.GROQ_FALLBACK_LLM
class InputValidation(BaseModel):
    is_valid: bool
    reason: str

async def Validate_input(text:str):
  input_text=text
  validate_input_prompt = f"""
  You are an input validation system for a misinformation
  verification platform.

  Determine whether the provided input contains meaningful
  linguistic content or a valid Web resource (URL) that can be 
  investigated for factual claims.

  Return False if the input:
  - consists primarily of random symbols, gibberish, or characters
  - is meaningless or unintelligible
  - contains no meaningful statement, question, claim, or URL

  Return True if the input contains:
  - Meaningful text/language, even if the statement itself may be false, 
    misleading, or factually incorrect.
  - A valid URL (e.g., starting with http:// or https://) pointing to content 
    to be verified.

  Important:
  Do NOT determine whether the content or URL destination is true or false.
  Only determine whether the input is valid, intelligible, or a URL suitable 
  for further misinformation analysis.

  INPUT:
  {input_text}
  """
  struct_output=groq_llm.with_structured_output(InputValidation,method="json_schema")
  result=await struct_output.ainvoke(validate_input_prompt)
  print("resultof validate input") 
  print(result)
  return {'is_valid':result.is_valid,'reason':result.reason}




