
from langgraph.graph import StateGraph,START,END
from typing import TypedDict,List
from pydantic import Field
from langchain_groq import ChatGroq
from langchain_core.messages import BaseMessage,HumanMessage,SystemMessage,AIMessage
from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_tavily import TavilySearch
from langchain_nomic import NomicEmbeddings
from langchain_classic.retrievers import ContextualCompressionRetriever
from langgraph.prebuilt import ToolNode,tools_condition
from langchain_core.tools import tool
from LLM.llms import groq_llm,gemini_llm
from langgraph.graph.message import add_messages


import os


from typing import Annotated,Literal

#! Research chatbot agent

#! Research chatbot agent

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
llm_with_tools=groq_llm.bind_tools(tools=my_tool)
llm_with_tools1=gemini_llm.bind_tools(tools=my_tool)
tool_node=ToolNode(tools=my_tool)

class AgentState(TypedDict):
    messages: Annotated[
        List[BaseMessage],
        add_messages
    ]
    curr:int=Field(default=1,description="this will store the current loop no") #this will store the current loop no
    max:int=Field(default=3,description="this is the max loop no it can run") #this is the max loop no it can run



# =========================================================
# CHAT NODE
# =========================================================

    

async def chat_node(
    state: AgentState
) -> AgentState:
    print(state['curr'],state['max'])
    if(int(state['curr'])>int(state['max'])):
       return state
       
    system_message=SystemMessage(content="act as a helpful and honest virtual assistant")
    messages =[system_message]+ state["messages"]

    
    print(
        "🤖 [Chat Node] Processing user input..."
    )
    response=None
    if(state['curr']%2!=0):
        response =  await llm_with_tools.ainvoke(
            messages
        )
    else:
        response =  await llm_with_tools.ainvoke(
                     messages
                 )  
    curr=int(state['curr'])
    
    return {
        "messages": [response],
        "curr":curr+1
    }

graph = StateGraph(
        AgentState
    )

graph.add_node(
        "chat_node",
        chat_node
    )
graph.add_node(
        "tools",
        tool_node
    )

graph.add_edge(
        START,
        "chat_node"
    )

graph.add_conditional_edges("chat_node",tools_condition)
graph.add_edge("tools","chat_node")


SEARCH_CHATBOT = graph.compile()

import re


def format_research_output(raw_output) -> str:
    """
    Clean raw LLM research output before passing it
    to the claim assessment node.

    Removes:
    - Markdown code fences
    - Excessive whitespace
    - Repeated blank lines
    - Unnecessary formatting characters

    Preserves:
    - URLs
    - Numbers
    - Punctuation
    - Evidence content
    """

    # Handle LangChain AIMessage
    if hasattr(raw_output, "content"):
        text = raw_output.content
    else:
        text = str(raw_output)

    # Remove markdown code fences
    text = re.sub(r"```(?:text|markdown)?", "", text)
    text = text.replace("```", "")

    # Normalize different newline characters
    text = text.replace("\r\n", "\n").replace("\r", "\n")

    # Remove excessive blank lines
    text = re.sub(r"\n\s*\n+", "\n\n", text)

    # Remove leading/trailing whitespace from every line
    lines = [
        line.strip()
        for line in text.split("\n")
        if line.strip()
    ]

    # Join lines into a clean readable report
    text = "\n".join(lines)

    # Remove unnecessary repeated spaces
    text = re.sub(r"[ \t]+", " ", text)

    # Remove spaces before punctuation
    text = re.sub(r"\s+([,.!?;:])", r"\1", text)

    # Final cleanup
    return text.strip()