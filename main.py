from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import json
import aiohttp
import logging
import os
from dotenv import load_dotenv

load_dotenv()

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_URL = "https://api.ai71.ai/v1/chat/completions"
API_KEY = os.getenv("FALCON_API_KEY")

active_websockets = set()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    active_websockets.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    finally:
        active_websockets.remove(websocket)

async def send_status_update(message: str):
    for websocket in active_websockets:
        await websocket.send_json({"status": message})

@app.post("/analyze_idea/")
async def analyze_business_idea(
    startup_idea: str,
    country: str,
):
    try:
        logger.info(f"Received startup idea: {startup_idea} for country: {country}")
        analysis = await analyze_idea(startup_idea, country)
        return analysis
    except Exception as e:
        error_message = f"Error analyzing idea: {str(e)}"
        logger.error(error_message)
        raise HTTPException(status_code=500, detail=error_message)

async def analyze_idea(idea: str, country: str) -> dict:
    prompt = f"""
     
    Analyze the following startup idea and provide a detailed report based on the following headings: give each json response
    1. Scope of Business
    2. Market Research of Idea
    3. Graph Plot of Market Research (compare top 5 companies in the market)
    4. Legal Requirements (tax, legal compliance)
    5. Finance (total investment needed including labor and other requirements, and time frame to complete the idea)
    6. Technology / Tools Required
    7. Growth and Scaling
    8. Financial Aid Guidance (government schemes and other financial aids)
    Return the results in a JSON format with the following structure:
    {{
    "scope of business": "A brief summary about the scope of business",
    "market_research": "A brief summary of market research findings including top players, market size, and trends.",
    "graph_plot_market_research": "URL or base64 encoded image of the graph comparing the top 5 companies in the market.",
    "legal_requirements": [{{ 
        "tax": "Information about applicable taxes for the business in the specified country.",}}
       {{"legal_compliance": "Information about legal requirements and compliance needed for operating the business."}}
    ],
    "finance": {{
        "total_investment_needed": "Estimated total investment required including labor and other expenses.",
        "time_frame": "Estimated time frame to complete the idea and reach operational status."
    }},
    "technology_tools_required": "List of technologies and tools needed for the startup idea.",
    "growth_scaling": "Strategies and considerations for growth and scaling of the business.",
    "financial_aid_guidance": "Information on government schemes and other financial aids available for the startup."
}}

    Startup Idea: {idea}
    Country: {country}
    """

    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {API_KEY}",
    }
    payload = {
        "model": "tiiuae/falcon-180B-chat",
        "messages": [
            {"role": "system", "content": "You are an expert business analyst."},
            {"role": "user", "content": prompt},
        ],
        "max_tokens": 1500,
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(API_URL, headers=headers, json=payload) as response:
                response.raise_for_status()
                raw_result = await response.text()
                logger.info(f"Raw response: {raw_result}")

                try:
                    # Attempt to load JSON
                    result = json.loads(raw_result)
                    content = result["choices"][0]["message"]["content"]
                    logger.info(f"Content received: {content}")

                    # Handle cases where the content might not be valid JSON
                    try:
                        parsed_content = json.loads(content)
                    except json.JSONDecodeError:
                        parsed_content = {"response": content}
                    
                    return parsed_content

                except json.JSONDecodeError as e:
                    error_message = f"Error decoding JSON response: {str(e)}"
                    logger.error(error_message)
                    logger.error(f"Raw response content: {raw_result}")
                    raise HTTPException(status_code=500, detail=error_message)

        except aiohttp.ClientError as e:
            error_message = f"Client error while sending request: {str(e)}"
            logger.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)
        except Exception as e:
            error_message = f"Unexpected error: {str(e)}"
            logger.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
