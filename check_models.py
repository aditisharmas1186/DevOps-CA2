import os
import google.generativeai as genai
from dotenv import load_dotenv

# Load the environment variables from the .env file
load_dotenv()

try:
    # Configure the genai library with the API key
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY not found in .env file.")

    genai.configure(api_key=api_key)

    print("\n--- Finding Available Gemini Models ---")

    # List all available models
    for m in genai.list_models():
        # Check if the model supports the 'generateContent' method
        if "generateContent" in m.supported_generation_methods:
            print(f"Found model: {m.name}")

    print("--------------------------------------\n")

except Exception as e:
    print(f"An error occurred: {e}")
