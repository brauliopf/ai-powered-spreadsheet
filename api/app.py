from fastapi import FastAPI, Body
from pydantic import BaseModel
from typing import Optional
import os
import json
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
    if not data or "prompt" not in data:
        return EngineerResponse(
            isEngineer=False, 
            reasoning="No prompt provided in request data"
        )
    
    prompt = data["prompt"]
    
    # System message for the LLM
    system_message = """
    You are an expert at evaluating educational backgrounds.
    You will be given a simple context with background information, such as a major or a job title, you must determine if the given context typically leads to an engineering career.
    You must respond with a JSON object containing 'isEngineer' (boolean) and 'reasoning' (string). Your response musts only contain the object with 2 (key, values) pairs.
    """
    
    # Create chat completion with Groq
    response = groq_client.chat.completions.create(
        model="llama3-8b-8192",  # or another available Groq model
        messages=[
            {"role": "system", "content": system_message},
            {"role": "user", "content": prompt}
        ],
        temperature=0.2,
    )
    
    # Extract the content from the response
    llm_response_content = response.choices[0].message.content

    # TODO: improve parsing and error handling
    try:
        # Attempt to parse JSON from the LLM response
        parsed_response = json.loads(llm_response_content)
        print('parsed_response', parsed_response)
        is_engineer = parsed_response.get("isEngineer", False)
        reasoning = parsed_response.get("reasoning", "No reasoning provided")
    except json.JSONDecodeError:
        is_engineer = False
        reasoning = "ERROR - No reasoning provided"
    
    return EngineerResponse(isEngineer=is_engineer, reasoning=reasoning)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
