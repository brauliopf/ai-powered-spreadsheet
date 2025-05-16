from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import Optional
import os
from groq import Groq
from dotenv import load_dotenv
load_dotenv()

app = FastAPI()

# Initialize Groq client
# You'll need to set GROQ_API_KEY as an environment variable
groq_client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

@app.get("/")
async def root():
    return "hello world"

class EngineerResponse(BaseModel):
    isEngineer: bool
    reasoning: str

@app.post("/check-engineer")
async def check_engineer(data: Optional[dict] = Body(default=None)):
    if not data or "major" not in data:
        return EngineerResponse(
            isEngineer=False, 
            reasoning="No major provided in request data"
        )
    
    major = data["major"]
    
    # System message for the LLM
    system_message = """
    You are an expert at evaluating educational backgrounds. 
    Determine if the given major typically leads to an engineering career.
    Respond with a JSON object containing 'isEngineer' (boolean) and 'reasoning' (string).
    """
    
    # Create chat completion with Groq
    response = groq_client.chat.completions.create(
        model="llama3-8b-8192",  # or another available Groq model
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": f"Evaluate if someone with a major in '{major}' is likely an engineer."}
        ],
        temperature=0.2,
    )
    
    # Extract the content from the response
    llm_response_content = response.choices[0].message.content
    
    # For simplicity, we'll parse the response ourselves
    # In a production app, you'd want more robust parsing and error handling
    import json
    try:
        # Attempt to parse JSON from the LLM response
        parsed_response = json.loads(llm_response_content)
        is_engineer = parsed_response.get("isEngineer", False)
        reasoning = parsed_response.get("reasoning", "No reasoning provided")
    except json.JSONDecodeError:
        # If the LLM doesn't return valid JSON, fall back to a simple heuristic
        engineering_majors = ["computer science", "software engineering", "electrical engineering", 
                            "mechanical engineering", "civil engineering", "chemical engineering"]
        is_engineer = any(eng_major in major.lower() for eng_major in engineering_majors)
        reasoning = f"Based on major '{major}'. {'Engineering-related major detected.' if is_engineer else 'Not a typical engineering major.'}"
    
    return EngineerResponse(isEngineer=is_engineer, reasoning=reasoning)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
