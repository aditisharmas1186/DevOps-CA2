import asyncio
from dotenv import load_dotenv
from langgraph.graph import StateGraph, END
from src.graph_state import GraphState
from src.nodes import (
    route_query,
    extract_note_maker_parameters,
    extract_flashcard_parameters,
    extract_concept_explainer_parameters,
    generate_clarification_response,
    request_missing_info,
    contextual_adaptation,
    execute_tool,
    format_final_response,
)

load_dotenv()

# --- DECIDER FUNCTIONS ---

def decide_next_node(state: GraphState) -> str:
    """Decides the next node after the router."""
    return state.get("selected_tool", "clarify")

def decide_on_extraction(state: GraphState) -> str:
    """Decides the next node after parameter extraction."""
    if state.get("extraction_status") == "success":
        return "adaptation_node"
    else:
        return "request_missing_info_node"

# --- ASSEMBLE THE GRAPH ---
workflow = StateGraph(GraphState)

# Add nodes
workflow.add_node("router", route_query)
workflow.add_node("NoteMaker", extract_note_maker_parameters)
workflow.add_node("FlashcardGenerator", extract_flashcard_parameters) # This node now has conditional outputs
workflow.add_node("ConceptExplainer", extract_concept_explainer_parameters)
workflow.add_node("clarify", generate_clarification_response)
workflow.add_node("request_missing_info_node", request_missing_info)
workflow.add_node("adaptation_node", contextual_adaptation)
workflow.add_node("tool_executor", execute_tool)
workflow.add_node("formatter_node", format_final_response)

# Set the Entry Point
workflow.set_entry_point("router")

# --- DEFINE THE EDGES ---

# From Router to specific tool extractors or clarification
workflow.add_conditional_edges(
    "router",
    decide_next_node,
    {
        "NoteMaker": "NoteMaker",
        "FlashcardGenerator": "FlashcardGenerator",
        "ConceptExplainer": "ConceptExplainer",
        "clarify": "clarify",
    },
)

# For successful paths that don't need a loop yet
workflow.add_edge("NoteMaker", "adaptation_node")
workflow.add_edge("ConceptExplainer", "adaptation_node")

# For the Flashcard path, add the new conditional loop
workflow.add_conditional_edges(
    "FlashcardGenerator",
    decide_on_extraction,
    {
        "adaptation_node": "adaptation_node",
        "request_missing_info_node": "request_missing_info_node",
    },
)

# From adaptation to execution
workflow.add_edge("adaptation_node", "tool_executor")

# From execution to formatting
workflow.add_edge("tool_executor", "formatter_node")

# Endpoints for the graph
workflow.add_edge("formatter_node", END)
workflow.add_edge("clarify", END)
workflow.add_edge("request_missing_info_node", END)

# Compile the Graph
app = workflow.compile()


# --- TEST BLOCK ---
async def main():
    """Main async function to run the graph."""
    user_profile_data = {
        "user_id": "test_user", "name": "Test", "grade_level": "10",
        "learning_style_summary": "visual", "emotional_state_summary": "anxious",
        "mastery_level_summary": "Level 2"
    }
    chat_history_data = []
    
    # Use an ambiguous query to test the failure loop
    query = "Can you make me some flashcards please?"

    inputs = {
        "current_query": query,
        "user_profile": user_profile_data,
        "chat_history": chat_history_data
    }
    
    result = await app.ainvoke(inputs)
    
    print("\n---FINAL STATE---")
    import json
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    asyncio.run(main())
