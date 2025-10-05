from typing import List, Literal

from pydantic import BaseModel, Field


class UserInfo(BaseModel):
    user_id: str
    name: str
    grade_level: str
    learning_style_summary: str
    emotional_state_summary: str
    mastery_level_summary: str


class ChatMessage(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class NoteMakerInput(BaseModel):
    user_info: UserInfo
    chat_history: List[ChatMessage]
    topic: str
    subject: str
    note_taking_style: Literal["outline", "bullet_points", "narrative", "structured"]
    include_examples: bool = True
    include_analogies: bool = False


class FlashcardGeneratorInput(BaseModel):
    user_info: UserInfo
    topic: str
    count: int = Field(..., ge=1, le=20)
    difficulty: Literal["easy", "medium", "hard"]
    subject: str
    include_examples: bool = True


class ConceptExplainerInput(BaseModel):
    user_info: UserInfo
    chat_history: List[ChatMessage]
    concept_to_explain: str
    current_topic: str
    desired_depth: Literal["basic", "intermediate", "advanced", "comprehensive"]
