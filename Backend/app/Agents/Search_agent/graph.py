from langgraph.graph import StateGraph,START,END
from .state import AgentState
from .nodes.chat import chat_node
from langgraph.prebuilt import ToolNode,tools_condition
from .tools.tools import tool_node

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


SEARCH_AGENT = graph.compile()
