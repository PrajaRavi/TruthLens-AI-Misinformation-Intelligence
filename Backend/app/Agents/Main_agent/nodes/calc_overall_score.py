from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput

def calc_max_risk_score_and_max_confidence(state:InvestigationState)->InvestigationState:
    max_confidence=0
    for item in state['claim_assessment']:
        if(item['confidence']>max_confidence):
            max_confidence=item['confidence']
    
    max_risk_score=state['risk_assessment'][0]['risk_score']
    max_risk_score_level=state['risk_assessment'][0]['risk_level']
    for i in range(1,len(state['risk_assessment'])):
        if(state['risk_assessment'][i]['risk_score']>max_risk_score):
            max_risk_score=state['risk_assessment'][i]['risk_score']
            max_risk_score_level=state['risk_assessment'][i]['risk_level']
   
    return {'risk_score':max_risk_score,'risk_level':max_risk_score_level,'confidence':max_confidence,"claim_count":len(state['claims'])}
