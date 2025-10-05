from typing import List, TypedDict

from src.schemas import ChatMessage, UserInfo


class GraphState(TypedDict):
    user_profile: UserInfo
    chat_history: List[ChatMessage]
    current_query: str
    selected_tool: str
    extracted_parameters: dict
    contextual_notes: str
    api_response: dict
    final_output: str
