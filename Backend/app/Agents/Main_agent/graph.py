from langgraph.graph import StateGraph,START,END
from app.Agents.Main_agent.state import InvestigationState,ClaimsOutput
from .nodes.Input_classification.classify_input import classify_input
from .nodes.assessments.claims.extract_claims import extract_claims
from .nodes.finding_evidence.google_fact_worker import google_fact_checks_worker
from .nodes.finding_evidence.web_evidence_worker import search_web_evidence_worker
from .nodes.analysis.fact_evidence_analysis import evidence_analysis
from .nodes.analysis.web_evidence_analysis import web_evidence_analysis
from .nodes.analysis.who_evidence_analysis import who_evidence_analysis
from .nodes.analysis.pubmed_evidence_analysis import pubmed_evidence_analysis
from .nodes.finding_evidence.finding_evidence import finding_evidence
from .nodes.assessments.claims.claim_assesment import claim_assessment
from .nodes.assessments.risk.risk_assesment import risk_assessment
from .nodes.summary.claim_assess_summary import summarize_claim_assessment
from .nodes.summary.risk_assess_summary import summarize_risk_assessment
from .nodes.Input_classification.handling_input_type_url import handling_input_type_url,input_type_is_text,input_type_is_url
from .nodes.Input_classification.handle_input_type_image import handle_input_type_image,input_type_image
from .nodes.Input_classification.input_router import input_router
from .nodes.event_extrator_from_input_text import event_extrator_from_input_text
from .nodes.finding_evidence.hive.hive_worker import hive_assesment_analysis_worker
from .nodes.finding_evidence.who_evidence_worker import who_evidence_worker
from .nodes.finding_evidence.pubmed_evidence_worker import pubmed_evidence_worker
from .nodes.calc_overall_score import calc_max_risk_score_and_max_confidence
from .nodes.fanOut.hive_fan_out import hive_assesment_fanout
from .nodes.fanOut.google_fact_fan_out import fan_out_evidence_fact
from .nodes.fanOut.web_search_fan_out import fan_out_evidence_web
from .nodes.fanOut.who_evidence_fan_out import who_evidence_fan_out
from .nodes.fanOut.pubmed_evidence_fan_out import pubmed_evidence_fan_out
from .nodes.assign_category import assign_category
from .nodes.health_and_science import health_and_science

from langgraph.checkpoint.memory import InMemorySaver #!stores things in RAM




graph = StateGraph(InvestigationState)
graph.add_node("classify_input", classify_input)
graph.add_node("extract_claims", extract_claims)
graph.add_node("google_fact_checks_worker", google_fact_checks_worker)
graph.add_node("search_web_evidence_worker", search_web_evidence_worker)
graph.add_node("pubmed_evidence_worker", pubmed_evidence_worker)
graph.add_node("evidence_analysis", evidence_analysis)
graph.add_node("web_evidence_analysis", web_evidence_analysis)
graph.add_node("finding_evidence", finding_evidence)
graph.add_node("claim_assesment", claim_assessment)
graph.add_node("Risk_assesment", risk_assessment)
graph.add_node("summarize_claim_assessment", summarize_claim_assessment)
graph.add_node("summarize_risk_assessment", summarize_risk_assessment)
# graph.add_node("Risk_assesment", risk_assessment)
graph.add_node("handling_input_type_url", handling_input_type_url)
graph.add_node("input_type_is_text", input_type_is_text)
graph.add_node("input_type_is_url", input_type_is_url)
# graph.add_node("event_extrator_from_transcript", event_extrator_from_transcript)
graph.add_node("event_extrator_from_input_text", event_extrator_from_input_text)
graph.add_node("hive_assesment_analysis_worker", hive_assesment_analysis_worker)
graph.add_node("input_type_image", input_type_image)
graph.add_node("handle_input_type_image", handle_input_type_image)
graph.add_node("assign_category", assign_category)
# graph.add_node("who_evidence_fan_out", who_evidence_fan_out)
graph.add_node("who_evidence_worker", who_evidence_worker)
# graph.add_node("pubmed_evidence_worker", pubmed_evidence_worker)
graph.add_node("who_evidence_analysis", who_evidence_analysis)
graph.add_node("health_and_science", health_and_science)
# graph.add_node("finding_evidence", finding_evidence)
graph.add_node("pubmed_evidence_analysis", pubmed_evidence_analysis)
graph.add_node("calc_max_risk_score_and_max_confidence", calc_max_risk_score_and_max_confidence)


graph.add_edge(START, "classify_input")
# graph.add_edge("classify_input","extract_claims")
graph.add_conditional_edges("classify_input",input_router)
graph.add_edge("input_type_is_text","event_extrator_from_input_text")
graph.add_edge("input_type_image","handle_input_type_image")
graph.add_edge("handle_input_type_image","event_extrator_from_input_text")
# graph.add_edge("event_extrator_from_input_text","extract_claims")
graph.add_edge("input_type_is_url","handling_input_type_url")
graph.add_edge("handling_input_type_url","event_extrator_from_input_text")
graph.add_edge("event_extrator_from_input_text","assign_category")
graph.add_edge("assign_category","extract_claims")
graph.add_edge("extract_claims", "finding_evidence")
graph.add_edge("finding_evidence","health_and_science")
graph.add_conditional_edges("finding_evidence",fan_out_evidence_fact,["google_fact_checks_worker"])
graph.add_conditional_edges("finding_evidence",fan_out_evidence_web,["search_web_evidence_worker"])
graph.add_conditional_edges("health_and_science",who_evidence_fan_out,{"who_evidence_worker":"who_evidence_worker","claim_assesment":"claim_assesment"})
graph.add_conditional_edges("health_and_science",pubmed_evidence_fan_out,{"pubmed_evidence_worker":"pubmed_evidence_worker","claim_assesment":"claim_assesment"})
graph.add_edge("google_fact_checks_worker","evidence_analysis")
graph.add_edge("who_evidence_worker","who_evidence_analysis")
graph.add_edge("pubmed_evidence_worker","pubmed_evidence_analysis")
graph.add_edge("search_web_evidence_worker", "web_evidence_analysis")

graph.add_edge("web_evidence_analysis","claim_assesment")
graph.add_edge("who_evidence_analysis","claim_assesment")
graph.add_edge("pubmed_evidence_analysis","claim_assesment")
graph.add_edge("evidence_analysis","claim_assesment")

# graph.add_edge("hive_assesment_analysis_worker","Risk_assesment")
graph.add_conditional_edges("claim_assesment",hive_assesment_fanout,["hive_assesment_analysis_worker"])
graph.add_edge("hive_assesment_analysis_worker","Risk_assesment")
graph.add_edge("Risk_assesment","summarize_claim_assessment")
graph.add_edge("summarize_claim_assessment","summarize_risk_assessment")

graph.add_edge("summarize_risk_assessment","calc_max_risk_score_and_max_confidence")
graph.add_edge("calc_max_risk_score_and_max_confidence",END)

# graph.add_conditional_edges("orchestrator",fan_out_tasks, ["worker"]
# for now using InMemorySaver
checkpointer=InMemorySaver()
MAIN_AGENT=graph.compile()
