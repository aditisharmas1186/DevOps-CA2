import pytest
from unittest.mock import patch
from src.nodes import contextual_adaptation, route_query, RouterSchema

def test_adaptation_for_visual_learner():
    # Arrange
    state = {
        "user_profile": {
            "user_id": "test_user",
            "name": "Test",
            "grade_level": "10",
            "learning_style_summary": "visual",
            "emotional_state_summary": "anxious",
            "mastery_level_summary": "Level 2"
        },
        "extracted_parameters": {
            "topic": "mitochondria",
            "count": 5,
            "difficulty": "medium",
            "subject": "biology"
        }
    }

    # Act
    result = contextual_adaptation(state)

    # Assert
    assert result["extracted_parameters"]["include_analogies"] is True

@patch('src.nodes.get_router_chain')
def test_router_selects_notemaker(mock_get_chain):
    # Arrange
    # Create a mock chain object
    mock_chain = mock_get_chain.return_value

    # Configure the chain to return our desired RouterSchema
    mock_chain.invoke.return_value = RouterSchema(tool_name="NoteMaker")

    state = {
        "current_query": "make me notes",
        "user_profile": {},
        "chat_history": []
    }

    # Act
    result = route_query(state)

    # Assert
    assert result["selected_tool"] == "NoteMaker"
    mock_chain.invoke.assert_called_once_with({"query": "make me notes"})