from typing import Literal
from app.Agents.Main_agent.state import InvestigationState
def input_router(state:InvestigationState)->Literal["input_type_is_text","input_type_is_url","input_type_image"]:
    if(state['input_type']=="audio"):
        pass
    elif(state['input_type']=="video"):
        pass
    elif(state['input_type']=="image"):
        return "input_type_image"
    elif(state['input_type']=="text"):
        return "input_type_is_text"
    elif(state['input_type']=="url" or state['input_type']=="youtube" or state['input_type']=="webpage"):
        return "input_type_is_url"
