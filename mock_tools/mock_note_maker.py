from fastapi import FastAPI

from src.schemas import NoteMakerInput

app = FastAPI()


@app.post("/create-notes")
async def create_notes(payload: NoteMakerInput) -> dict:
    return {
        "topic": "Water Cycle",
        "title": "Comprehensive Notes on the Water Cycle",
        "summary": "A detailed overview of the stages of the water cycle, including evaporation, condensation, precipitation, and collection.",
        "note_sections": [
            {
                "title": "Evaporation",
                "content": "The process where liquid water turns into water vapor (a gas).",
                "key_points": [
                    "Driven by the sun's energy",
                    "Occurs from surfaces like oceans and lakes",
                ],
                "examples": ["A puddle drying up on a sunny day"],
                "analogies": ["Like a kettle boiling water into steam"],
            }
        ],
        "key_concepts": ["Evaporation", "Condensation", "Precipitation"],
        "connections_to_prior_learning": [],
        "visual_elements": [],
        "practice_suggestions": [
            "Draw a diagram of the water cycle and label each stage."
        ],
        "source_references": [],
        "note_taking_style": "structured",
    }
