from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput
from app.config import llms
groq_llm=llms.GROQ_FALLBACK_LLM

async def extract_claims(state:InvestigationState) -> InvestigationState:

    # input_text = state["input_text"]
   
    prompt = f"""
You are an expert factual claim extraction system.

Your task is to break the following input into individual,
independently verifiable factual claims.

IMPORTANT RULES:

1. Read and understand the ENTIRE input before extracting claims.

2. Preserve the semantic meaning of the original input.

3. Each claim should represent ONE factual assertion that
   can be independently researched or fact-checked.

4. If a claim depends on information from another part of
   the input, rewrite that claim so it contains the necessary
   context.

5. Resolve pronouns and references such as:
   - it
   - this
   - this scheme
   - the program
   - they
   - he/she
   - the announcement
   - the company

6. A returned claim MUST be understandable without reading
   the original input.

7. Do NOT simply copy sentences if they are incomplete or
   context-dependent. Rewrite them with the required context.

8. Do NOT invent facts that are not present in the input.

9. Preserve important:
   - names
   - organizations
   - locations
   - dates
   - numbers
   - amounts
   - conditions
   - relationships

10. Do not combine unrelated factual assertions into one claim.

11. Do not add your own interpretation or judgement about
    whether a claim is true or false.

12. The purpose of these claims is subsequent fact-checking.
13. the claims text should have at least 5 words 

INPUT:
{state['input_text']}

"""

    structured_llm = groq_llm.with_structured_output(ClaimsOutput,method="json_schema")

    result = await structured_llm.ainvoke(prompt)

    # data=  [
    #     claim.model_dump()
    #     for claim in result.claims
    # ]
    data=[]
    for claim in result.claims:
        claim1=claim.model_dump()
        claim1['user_input_id']=state['thread_id']
        data.append(claim1)

    print("claims ended")
    print(data)
    return {"claims":data}
