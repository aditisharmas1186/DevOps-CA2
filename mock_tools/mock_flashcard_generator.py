from fastapi import FastAPI

from src.schemas import FlashcardGeneratorInput

app = FastAPI()


@app.post("/create-flashcards")
async def create_flashcards(payload: FlashcardGeneratorInput) -> dict:
    return {
        "flashcards": [
            {
                "title": "Photosynthesis Basics",
                "question": "What is the primary source of energy for photosynthesis?",
                "answer": "Sunlight",
                "example": "Plants on a sunny windowsill perform photosynthesis.",
            },
            {
                "title": "Photosynthesis Reactants",
                "question": "What are the two main reactants (inputs) for photosynthesis?",
                "answer": "Carbon Dioxide (CO2) and Water (H2O)",
                "example": None,
            },
        ],
        "topic": "Photosynthesis",
        "adaptation_details": "Flashcards were generated at a medium difficulty, suitable for a student with foundational knowledge.",
        "difficulty": "medium",
    }
