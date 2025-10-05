from fastapi import FastAPI

from src.schemas import ConceptExplainerInput

app = FastAPI()


@app.post("/explain-concept")
async def explain_concept(payload: ConceptExplainerInput) -> dict:
    return {
        "explanation": "Photosynthesis is the process used by plants, algae, and certain bacteria to convert light energy into chemical energy, through a process that converts carbon dioxide and water into glucose (sugar) and oxygen.",
        "examples": [
            "A tree using sunlight to grow.",
            "Algae in a pond creating oxygen.",
        ],
        "related_concepts": [
            "Cellular Respiration",
            "Chlorophyll",
            "Ecosystems",
        ],
        "visual_aids": [
            "A diagram showing a plant taking in CO2 and sunlight and releasing O2."
        ],
        "practice_questions": [
            "What are the products of photosynthesis?"
        ],
        "source_references": [],
    }
