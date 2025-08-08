import sys
import os
import google.generativeai as genai
import json
import re

# Configure Gemini API
genai.configure(api_key=os.environ["GEMINI_API_KEY"])

def is_json_prompt(prompt):
    """Check if the prompt requests a JSON response."""
    return "isSubstantive" in prompt or "Respond with a JSON object" in prompt

def clean_response(text):
    """Remove code block markers and extra whitespace from response."""
    text = re.sub(r'```json\s*', '', text)
    text = re.sub(r'```\s*', '', text)
    return text.strip()

def main():
    prompt = sys.argv[1]
    try:
        model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "max_output_tokens": 150,
                "temperature": 0.7,
                "top_p": 0.9,
            }
        )
        response = model.generate_content(prompt)
        response_text = clean_response(response.text)

        if is_json_prompt(prompt):
            # If the prompt requests JSON, ensure the output is valid JSON
            try:
                # Try to parse the response as JSON
                json_response = json.loads(response_text)
                print(json.dumps(json_response))
            except json.JSONDecodeError:
                # If the response isn't valid JSON, generate a fallback JSON response
                is_substantive = "information" in prompt.lower() or "details" in prompt.lower()
                print(json.dumps({"isSubstantive": is_substantive}))
        else:
            # Output plain text for other prompts
            print(response_text)
    except Exception as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()