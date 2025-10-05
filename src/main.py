from fastapi import FastAPI
from pydantic import BaseModel, Field
from typing import List, Dict, Any

# Import the compiled LangGraph app
from src.graph import app
from src.schemas import UserInfo, ChatMessage

class OrchestratorRequest(BaseModel):
    """Defines the request body for the orchestrator endpoint."""
    current_query: str
    user_profile: UserInfo
    chat_history: List[ChatMessage] = Field(default_factory=list)

class OrchestratorResponse(BaseModel):
    """Defines the response body."""
    agent_response: str
    updated_chat_history: List[ChatMessage]

# Create the FastAPI app
api = FastAPI(
    title="Autonomous AI Tutor Orchestrator",
    description="An intelligent middleware to connect an AI tutor to educational tools.",
    version="1.0.0",
)

@api.post("/orchestrate", response_model=OrchestratorResponse)
async def orchestrate(request: OrchestratorRequest):
    """
    Receives a user query and conversation history, runs it through the agent,
    and returns the agent's response.
    """
    inputs = {
        "current_query": request.current_query,
        "user_profile": request.user_profile.dict(),
        "chat_history": [msg.dict() for msg in request.chat_history],
    }
    
    # Run the graph
    final_state = await app.ainvoke(inputs)
    
    agent_response = final_state.get("final_output", "Sorry, I encountered an issue.")
    
    # Update the chat history
    updated_history = request.chat_history + [
        ChatMessage(role="user", content=request.current_query),
        ChatMessage(role="assistant", content=agent_response),
    ]
    
    return OrchestratorResponse(
        agent_response=agent_response,
        updated_chat_history=updated_history
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="0.0.0.0", port=8000)