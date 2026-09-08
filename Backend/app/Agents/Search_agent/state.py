from typing import TypedDict,List
from langchain_core.messages import BaseMessage,HumanMessage,SystemMessage,AIMessage
from langgraph.graph.message import add_messages

from pydantic import BaseModel,Field
from typing import Annotated,Literal

class AgentState(TypedDict):
    messages: Annotated[
        List[BaseMessage],
        add_messages
    ]
    curr:int=Field(default=1,description="this will store the current loop no") #this will store the current loop no
    max:int=Field(default=3,description="this is the max loop no it can run") #this is the max loop no it can run
