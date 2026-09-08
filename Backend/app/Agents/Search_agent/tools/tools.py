from langchain_core.tools import tool
from app.config import llms
from langchain_tavily import TavilySearch
from langgraph.prebuilt import ToolNode,tools_condition

tavily_tool = TavilySearch(
    max_results=2,
    search_depth="advanced", # "basic" or "advanced"
    
    
)

@tool
def calculator(first_num:float,second_num:float,operation:str)->dict:
  """
  Perform a basic artihmatic operation on two number.
  supported operations:add,sub,mul,div
  """
  try:
     if operation=="add":
        result=first_num+second_num
     elif operation=="sub":
        result=first_num-second_num
     elif operation=="mul":
        result=first_num*second_num
     elif operation=="div":
        result=first_num/second_num
     return {'first_num':first_num,'second_num':second_num,'operation':operation,'result':result}   
  except:
     return {'error':"Invalid input"}

my_tool=[calculator,tavily_tool]
llm_with_tools=llms.GROQ_FALLBACK_LLM.bind_tools(tools=my_tool)
llm_with_tools1=llms.GEMINI_FALLBACK_LLM.bind_tools(tools=my_tool)
tool_node=ToolNode(tools=my_tool)
