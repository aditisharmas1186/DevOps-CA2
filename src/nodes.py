import os

from dotenv import load_dotenv
from typing import Literal

from pydantic import BaseModel, Field

from langchain.prompts import ChatPromptTemplate
from src.graph_state import GraphState
from src.schemas import NoteMakerInput, FlashcardGeneratorInput, ConceptExplainerInput
import httpx

load_dotenv()

class RouterSchema(BaseModel):
    """Schema for the router's output."""

    tool_name: Literal[
        "NoteMaker", "FlashcardGenerator", "ConceptExplainer", "clarify"
    ] = Field(
        description="The name of the tool to use.",
    )

def get_router_chain():
    """Get the router chain - created on demand to avoid import issues."""
    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm_route = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0)
        structured_llm_route = llm_route.with_structured_output(RouterSchema)

        system_prompt_route = """You are an expert AI agent. Your job is to analyze the user's query and route it to the most appropriate educational tool. You must choose one of the following tools:

            - **NoteMaker**: Use this tool when the user asks to summarize, take notes, or create a study guide on a topic.
            - **FlashcardGenerator**: Use this tool when the user wants to test their knowledge, create flashcards, or practice questions.
            - **ConceptExplainer**: Use this tool when the user asks 'what is...?', 'explain...', or expresses confusion about a specific concept.
            - **clarify**: Use this if the query is a greeting, is ambiguous, or doesn't clearly fit any other tool."""

        prompt_route = ChatPromptTemplate.from_messages(
            [("system", system_prompt_route), ("human", "{query}")]
        )

        return prompt_route | structured_llm_route
    except ImportError as e:
        print(f"Warning: Could not import langchain_google_genai: {e}")
        raise

def route_query(state: GraphState) -> dict:
    """The router node for the agent."""

    print("---ROUTING QUERY---")

    chain = get_router_chain()
    response = chain.invoke({"query": state["current_query"]})

    print(f"Router decision: {response.tool_name}")
    return {"selected_tool": response.tool_name}


def extract_note_maker_parameters(state: GraphState) -> dict:
    """Node to extract parameters for the Note Maker tool."""

    print("---EXTRACTING NOTE MAKER PARAMETERS---")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0)
        llm_with_tool = llm.bind_tools([NoteMakerInput])

        system_prompt = """You are a powerful AI assistant. Your sole job is to analyze the user's request and call the `NoteMakerInput` tool with the appropriate parameters.
        Do not respond with conversational text. You MUST call the tool.
        If a parameter like `subject` or `topic` is not explicitly mentioned, infer it from the context of the conversation.
        The user's query is: '{query}'"""

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", state["chat_history"]),
                ("human", "Current user query: {query}"),
            ]
        )

        chain = prompt | llm_with_tool

        response = chain.invoke({"query": state["current_query"]})

        if not response.tool_calls:
            print(f"ERROR: AI did not call a tool. Response: {response.content}")
            raise ValueError("No tool call found in the response.")

        extracted_args = response.tool_calls[0]["args"]

        extracted_args["user_info"] = state["user_profile"]
        extracted_args["chat_history"] = state["chat_history"]

        print(f"Extracted parameters: {extracted_args}")
        return {"extracted_parameters": extracted_args}
    except ImportError as e:
        print(f"Warning: Could not import langchain_google_genai: {e}")
        raise


def handle_flashcard_generator(state: GraphState) -> dict:
    print("---ROUTED TO FLASHCARD GENERATOR---")
    return {}


def handle_concept_explainer(state: GraphState) -> dict:
    print("---ROUTED TO CONCEPT EXPLAINER---")
    return {}


def handle_clarification(state: GraphState) -> dict:
    print("---ROUTED TO CLARIFICATION---")
    return {}


def contextual_adaptation(state: GraphState) -> dict:
    print("---ADAPTING PARAMETERS FOR USER---")

    parameters = state.get("extracted_parameters", {}) or {}
    user_profile = state.get("user_profile", {}) or {}

    emotional_state = user_profile.get("emotional_state_summary", "").lower()
    learning_style = user_profile.get("learning_style_summary", "").lower()
    mastery_level = user_profile.get("mastery_level_summary", "")

    if any(trigger in emotional_state for trigger in ["confused", "anxious"]):
        parameters["include_examples"] = True

    if "visual" in learning_style:
        parameters["include_analogies"] = True

    if any(level in mastery_level for level in ["level 1", "level 2", "level 3"]):
        parameters["note_taking_style"] = "structured"

    state["extracted_parameters"] = parameters

    print("Adapted parameters:", parameters)

    return {"extracted_parameters": parameters}


async def execute_tool(state: GraphState) -> dict:
    print("---EXECUTING TOOL---")

    tool_endpoints = {
        "NoteMaker": "http://127.0.0.1:8001/create-notes",
        "FlashcardGenerator": "http://127.0.0.1:8002/create-flashcards",
        "ConceptExplainer": "http://127.0.0.1:8003/explain-concept",
    }

    selected_tool = state.get("selected_tool")
    if not selected_tool:
        raise ValueError("No tool selected for execution.")

    endpoint = tool_endpoints.get(selected_tool)
    if not endpoint:
        raise ValueError(f"No endpoint configured for tool '{selected_tool}'.")

    payload = state.get("extracted_parameters", {})

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(endpoint, json=payload)

    if response.status_code != 200:
        raise RuntimeError(
            f"Tool '{selected_tool}' call failed with status {response.status_code}: {response.text}"
        )

    state["api_response"] = response.json()

    print(f"Tool '{selected_tool}' response:", state["api_response"])

    return {"api_response": state["api_response"]}


def extract_flashcard_parameters(state: GraphState) -> dict:
    """
    Node to extract parameters for the Flashcard Generator tool.
    It now checks if a topic was successfully extracted.
    """
    print("---EXTRACTING FLASHCARD PARAMETERS---")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0)
        llm_with_tool = llm.bind_tools([FlashcardGeneratorInput])

        system_prompt = "You are an expert at extracting information from a user's query to fill out the arguments for the `FlashcardGeneratorInput` tool. You must call the tool."

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", state["chat_history"]),
                ("human", "Current user query: {query}"),
            ]
        )

        chain = prompt | llm_with_tool

        response = chain.invoke({"query": state["current_query"]})

        if not response.tool_calls:
            print("ERROR: AI did not call a tool.")
            # If the AI fails, we signal a failure to the graph
            return {"extraction_status": "failure"}

        extracted_args = response.tool_calls[0]["args"]

        # Check if the most important parameter was found
        if not extracted_args.get("topic"):
            print("ERROR: Topic not found in extraction.")
            return {"extraction_status": "failure", "extracted_parameters": extracted_args}

        extracted_args["user_info"] = state["user_profile"]

        print(f"Extracted flashcard parameters: {extracted_args}")
        return {"extraction_status": "success", "extracted_parameters": extracted_args}
    except ImportError as e:
        print(f"Warning: Could not import langchain_google_genai: {e}")
        return {"extraction_status": "failure"}


def extract_concept_explainer_parameters(state: GraphState) -> dict:
    """Node to extract parameters for the Concept Explainer tool."""

    print("---EXTRACTING CONCEPT EXPLAINER PARAMETERS---")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0)
        llm_with_tool = llm.bind_tools([ConceptExplainerInput])

        system_prompt = """You are a powerful AI assistant. Analyze the user's request and call the `ConceptExplainerInput` tool with the appropriate parameters.
        Do not respond with conversational text. You MUST call the tool.
        If some parameters like `concept` or `context` are implied, infer them from the conversation context.
        The user's query is: '{query}'"""

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", state["chat_history"]),
                ("human", "Current user query: {query}"),
            ]
        )

        chain = prompt | llm_with_tool

        response = chain.invoke({"query": state["current_query"]})

        if not response.tool_calls:
            print(f"ERROR: AI did not call a tool. Response: {response.content}")
            raise ValueError("No tool call found in the response.")

        extracted_args = response.tool_calls[0]["args"]

        extracted_args["user_info"] = state["user_profile"]
        extracted_args["chat_history"] = state["chat_history"]

        print(f"Extracted concept explainer parameters: {extracted_args}")
        return {"extracted_parameters": extracted_args}
    except ImportError as e:
        print(f"Warning: Could not import langchain_google_genai: {e}")
        raise


def generate_clarification_response(state: GraphState) -> dict:
    print("---GENERATING CLARIFICATION---")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0.5)

        system_prompt = """You are a friendly and helpful AI tutor. The user has said something that isn't a clear request for a specific tool. Your job is to ask a polite, clarifying question. Ask them what topic they are studying or what they would like to do (e.g., get notes, flashcards, or an explanation)."""

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{query}"),
            ]
        )

        chain = prompt | llm

        response = chain.invoke({"query": state["current_query"]})

        state["final_output"] = response.content

        print(f"Clarification response: {state['final_output']}")

        return {"final_output": state["final_output"]}
    except ImportError as e:
        print(f"Warning: Could not import langchain_google_genai: {e}")
        state["final_output"] = "I need to know what topic you'd like help with. Could you please specify?"
        return {"final_output": state["final_output"]}


def request_missing_info(state: GraphState) -> dict:
    print("---REQUESTING MISSING INFO---")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0)

        system_prompt = "You are a friendly AI tutor. The user has asked for flashcards but did not provide a topic. Ask them a clear and simple question to get the topic for the flashcards."

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{query}"),
            ]
        )

        chain = prompt | llm

        response = chain.invoke({"query": state["current_query"]})

        state["final_output"] = response.content

        print(f"Missing info request: {state['final_output']}")

        return {"final_output": state["final_output"]}
    except ImportError as e:
        print(f"Warning: Could not import langchain_google_genai: {e}")
        state["final_output"] = "Could you please tell me what topic you'd like flashcards for?"
        return {"final_output": state["final_output"]}


def format_final_response(state: GraphState) -> dict:
    print("---FORMATTING FINAL RESPONSE---")

    try:
        from langchain_google_genai import ChatGoogleGenerativeAI

        llm = ChatGoogleGenerativeAI(model="models/gemini-pro-latest", temperature=0.5)

        system_prompt = "You are a helpful AI tutor. You have just received the raw JSON output from a tool. Your job is to format this data into a clear, friendly, and helpful message for the student. Use markdown for formatting, like lists or bold text, to make the information easy to read."

        prompt = ChatPromptTemplate.from_messages(
            [
                ("system", system_prompt),
                ("human", "{api_response}"),
            ]
        )

        chain = prompt | llm

        response = chain.invoke({"api_response": state["api_response"]})

        state["final_output"] = response.content

        print(f"Formatted final response: {state['final_output']}")

        return {"final_output": state["final_output"]}
    except ImportError as e:
        print(f"Warning: Could not import langchain_google_genai: {e}")
        state["final_output"] = f"Here's the information: {state['api_response']}"
        return {"final_output": state["final_output"]}
