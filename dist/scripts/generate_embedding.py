# scripts/generate_embedding.py
import sys
import json
import os
import numpy as np
import google.generativeai as genai

# Configure Gemini API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def main():
    text = sys.argv[1]
    try:
        # Request a 768-dim embedding
        result = genai.embed_content(
            model="gemini-embedding-001",
            content=text,
            output_dimensionality=768,       # ← force 768 dims
            task_type="SEMANTIC_SIMILARITY"   # optionally specify task type
        )
        emb = np.array(result["embedding"])
        # Normalize so ||emb|| == 1.0
        emb = emb / np.linalg.norm(emb)
        # Print JSON array
        print(json.dumps(emb.tolist()))
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
