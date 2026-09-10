from ..state import AgentState
from ..tools.tools import llm_with_tools,llm_with_tools1
from langchain.messages import SystemMessage
async def chat_node(
    state: AgentState
) -> AgentState:
    print(state['curr'],state['max'])
    if(int(state['curr'])>int(state['max'])):
       return state
       
    system_message=SystemMessage(content="act as a helpful and honest genral knowledge assistant")
    messages =[system_message]+ state["messages"]

    
    print(
        "🤖 [Chat Node] Processing user input..."
    )
    response=None
    if(state['curr']%2!=0):
        response =  await llm_with_tools.ainvoke(messages)
    else:
        response =  await llm_with_tools1.ainvoke(messages)  
    curr=int(state['curr'])
    
    return {
        "messages": [response],
        "curr":curr+1
    }
