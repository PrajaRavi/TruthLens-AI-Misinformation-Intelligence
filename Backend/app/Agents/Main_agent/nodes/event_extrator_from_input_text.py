from app.Agents.Main_agent.state import InvestigationState
from utils.Prompts import EVENT_EXTRACTION_SYSTEM_PROMPT
from app.config import llms
from utils.utils_func import format_research_output
async def event_extrator_from_input_text(state:InvestigationState)->InvestigationState:
   transcript=state['input_text']
   if(state['input_type']=="text" and len(transcript)>100):
      prompt=f"""summarize this transcript {transcript}"""
      result=await llms.GROQ_LLM.ainvoke([
                     {
                           "role": "system",
                           "content": EVENT_EXTRACTION_SYSTEM_PROMPT
                     },
                     {
                           "role": "user",
                           "content": prompt
                     }
                  ])
      result=format_research_output(result.content)
      return {'input_text':result}
  
