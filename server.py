from fastapi import FastAPI, HTTPException
import google.generativeai as genai
import numpy as np
import os
import json
import re
import uvicorn
from dotenv import load_dotenv

load_dotenv()
app = FastAPI()

# Configure Gemini API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def clean_response(text):
    """Remove code block markers and extra whitespace from response."""
    text = re.sub(r'```json\s*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'```\s*', '', text)
    return text.strip()

@app.post("/embed")
async def generate_embedding(data: dict):
    try:
        text = data.get("text", "")
        if not text:
            raise HTTPException(status_code=400, detail="Text is required")
        result = genai.embed_content(
            model="gemini-embedding-001",
            content=text,
            output_dimensionality=768,
            task_type="SEMANTIC_SIMILARITY"
        )
        emb = np.array(result["embedding"]) / np.linalg.norm(result["embedding"])
        return emb.tolist()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/llm")
async def run_llm(data: dict):
    try:
        prompt = data.get("prompt", "")
        if not prompt:
            raise HTTPException(status_code=400, detail="Prompt is required")
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={"max_output_tokens": 150, "temperature": 0.7, "top_p": 0.9}
        )
        response = model.generate_content(prompt)
        response_text = clean_response(response.text)

        # Handle intent classification for substantive queries
        if "isSubstantive" in prompt:
            try:
                # Try parsing as JSON
                parsed = json.loads(response_text)
                if isinstance(parsed, dict) and "isSubstantive" in parsed:
                    return parsed
            except json.JSONDecodeError:
                # Fallback heuristic for substantive check
                is_substantive = any(keyword in prompt.lower() for keyword in ["information", "details", "what", "how", "why", "where", "when"])
                return {"isSubstantive": is_substantive}
        
        return response_text
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)