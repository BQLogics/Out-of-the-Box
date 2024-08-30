from fastapi import FastAPI, UploadFile, File, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
import PyPDF2
import io
import json
import aiohttp
import logging
import traceback
import asyncio
import os
from dotenv import load_dotenv
from pydantic import BaseModel

PROMPT_IDENTIFIERS = [
    "scope_of_business_and_market_research",
    "graph_plot_and_legal_requirements",
    "finance_and_technology_tools",
    "growth_scaling_and_financial_aid",
    "market_entry_strategies",
    "competitive_analysis",
    "customer_personas",
    "swot_analysis"
]

class BusinessIdeaRequest(BaseModel):
    startup_idea: str
    country: str
    city: str

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
    except Exception as e:
        logger.error(f"WebSocket error: {str(e)}")
    finally:
        active_websockets.remove(websocket)

async def send_status_update(message: str):
    for websocket in active_websockets:
        await websocket.send_json({"status": message})

async def call_api(prompt: str, identifier: str) -> dict:
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
        "temperature": 0.7,
    }

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(API_URL, headers=headers, json=payload) as response:
                response.raise_for_status()
                raw_result = await response.json()
                logger.info(f"Raw response: {raw_result}")

                # Ensure the content is correctly parsed
                content = raw_result["choices"][0]["message"]["content"]
                logger.info(f"Content received: {content}")

                # Try to parse content as JSON
                try:
                    parsed_content = json.loads(content)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse JSON. Content: {content}")
                    parsed_content = {"response": content}

                return {"identifier": identifier, "data":parsed_content}

        except aiohttp.ClientError as e:
            error_message = f"Client error while sending request: {str(e)}"
            logger.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)
        except Exception as e:
            error_message = f"Unexpected error: {str(e)}"
            logger.error(error_message)
            raise HTTPException(status_code=500, detail=error_message)

@app.post("/analyze_idea/")
async def analyze_business_idea(request: BusinessIdeaRequest):
    startup_idea = request.startup_idea
    country = request.country
    city = request.city
    
    try:
        logger.info(f"Received startup idea: {startup_idea} for country: {country} and city: {city}")

        # Define prompts
        prompts_group1 = [
            (f"""
            You’re a seasoned business consultant with extensive experience in analyzing startup ideas and conducting market research. Your expertise lies in identifying key business scopes and performing comprehensive market analyses that benefit entrepreneurs in various regions.

            Your task is to create a detailed summary of the scope of business and market research based on the provided startup idea, country, and city. Return the results in a JSON format with the following structure:
            {{
                "scope_of_business": "Provide a detailed summary about the scope of business including key objectives and market needs, and predict percentage of success.",
                "market_research": "Provide a detailed summary of market research findings including top players, market size, and trends."
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[0]),
            (f"""
            Based on the startup idea and country, provide a graph plot of market research comparing the top 5 companies in the market, and legal requirements (tax, legal compliance, and other relevant details). Return the results in a JSON format with the following structure:
            {{
                "graph_plot_market_research": [
                    {{
                        "chart_type": "bar",
                        "title": "Top 5 Companies by Capital",
                        "data": [
                            {{"label": "Company name 1", "capital": "value 1"}},
                            # More companies
                        ]
                    }},
                    {{
                        "chart_type": "pie",
                        "title": "Capital percentage Distribution of Top 5 Companies",
                        "data": [
                            {{"label": "Company name 1", "capital": "value 1"}},
                            # More companies
                        ]
                    }}
                ],
                "legal_requirements": [
                    {{
                        "tax": "Provide detailed information about applicable taxes for the business in the specified country.",
                        "legal_compliance": "Provide detailed information about legal requirements and compliance needed for operating the business."
                    }}
                ]
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[1]),
            (f"""
            Analyze the following startup idea, country, and city. Provide a detailed report based on the following headings:
            Finance (total investment needed including labor and other requirements, and time frame to complete the idea) give finance according to country currency. Technology / Tools Required 
            Return the results in a JSON format with the following structure:
            {{
                "finance": [
                    "total_investment_needed": "Provide a detailed summary of estimate of the total investment required including labor and other expenses.give the deatils in summary how ,much",
                    "time_frame": "Provide a detailed summary estimated time frame to complete the idea and reach operational status."
                ],
                "technology_tools_required": [{{technology/tool':'value1',"purpose and importance:"value2"}}]
            
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[2]),
            (f"""
            Analyze the following startup idea, country, and city. Provide a detailed report based on the following headings:
            1. Growth and Scaling of starup idea
            2. Financial Aid Guidance (Provide detailed information on government schemes and other financial aids available for the startup, including application processes and eligibility criteria)
            Return the results in a JSON format with the following structure:
            {{
                "growth_scaling": ["Provide detailed summary of strategies and considerations for growth and scaling of the business including potential challenges and opportunities."],
                "financial_aid_guidance": [  {{'scheme':'name',"summary:"value1","type":'government/private with name,"application process":value2,"eleigibilityCritiria":value3}}]"
           
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[3]),
        ]

        prompts_group2 = [
            (f"""
            Analyze the following startup idea, country, and city. Provide a detailed report on the following aspect:
            1. Market Entry Strategies for the startuo idea
            Return the result in a JSON format with the following structure:
            {{
                "market_entry_strategies": ["Provide detailed summary1 strategies for entering the market including potential partners, market segmentation, and distribution channels."]
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[4]),
            (f"""
            Analyze the following startup idea, country, and city. Provide a detailed report on the following aspect:
            1. Competitive Analysis with other company,Provide a detailed analysis of the 5 competition including strengths, weaknesses, and market positioning of key competitors
            Return the result in a JSON format with the following structure:
            {{
                "competitive_analysis": [{{'business':'name',"stregth":"value1","weakness":value1,"marketpositioning":value2}}]
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[5]),
            (f"""
            Analyze the following startup idea, country, and city. Provide a detailed report on the following aspect:
            1. Customer Personas 
            Return the result in a JSON format with the following structure:
            {{
                "customer_personas": ["Provide detailed customer personas including demographics, behaviors, and pain points of the target customers."]
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[6]),
            (f"""
            Analyze the following startup idea, country, and city. Provide a detailed report on the following aspect:
            1. SWOT Analysis of the startup idea
            Return the result in a JSON format with the following structure:
            {{
                "swot_analysis": ["Provide a detailed SWOT analysis including strengths, weaknesses, opportunities, and threats related to the startup idea."]
            }}

            Startup Idea: {request.startup_idea}
            Country: {request.country}
            City: {request.city}
            """, PROMPT_IDENTIFIERS[7]),
        ]
        
        logger.info(f"Received request for startup idea: {request.startup_idea} in {request.city}, {request.country}")

        # Fetch results from the API with concurrency control for both groups
        results_group1 = await asyncio.gather(*[call_api(prompt, identifier) for prompt, identifier in prompts_group1])
        results_group2 = await asyncio.gather(*[call_api(prompt, identifier) for prompt, identifier in prompts_group2])

        combined_result = {}

        # Process results from group 1
        for result in results_group1:
            identifier = result.get("identifier")
            data = result.get("data", {})
            if isinstance(data, dict):
                if identifier == PROMPT_IDENTIFIERS[0]:
                    combined_result.update({
                        "scope_of_business": data.get("scope_of_business", ""),
                        "market_research": data.get("market_research", "")
                    })
                elif identifier == PROMPT_IDENTIFIERS[1]:
                    combined_result.update({
                        "graph_plot_market_research": data.get("graph_plot_market_research", ""),
                        "legal_requirements": data.get("legal_requirements", "")
                    })
                elif identifier == PROMPT_IDENTIFIERS[2]:
                    combined_result.update({
                        "finance": data.get("finance", ""),
                        "technology_tools_required": data.get("technology_tools_required", "")
                    })
                elif identifier == PROMPT_IDENTIFIERS[3]:
                    combined_result.update({
                        "growth_scaling": data.get("growth_scaling", ""),
                        "financial_aid_guidance": data.get("financial_aid_guidance", "")
                    })
                # Add other cases for the remaining identifiers
            else:
                logger.error(f"Unexpected data format for identifier {identifier}: {data}")

        # Process results from group 2
        for result in results_group2:
            identifier = result.get("identifier")
            data = result.get("data", {})
            if isinstance(data, dict):
                if identifier == PROMPT_IDENTIFIERS[4]:
                    combined_result.update({
                        "market_entry_strategies": data.get("market_entry_strategies", ""),
                    })
                elif identifier == PROMPT_IDENTIFIERS[5]:
                    combined_result.update({
                        "competitive_analysis": data.get("competitive_analysis", ""),
                    })   
                elif identifier == PROMPT_IDENTIFIERS[6]:
                    combined_result.update({
                        "customer_personas": data.get("customer_personas", ""),
                    })  
                elif identifier == PROMPT_IDENTIFIERS[7]:
                    combined_result.update({
                        "swot_analysis": data.get("swot_analysis", ""),
                    })           
                # Add other cases for the remaining identifiers
            else:
                logger.error(f"Unexpected data format for identifier {identifier}: {data}")

        logger.info(f"Combined results: {combined_result}")
        return combined_result

    except Exception as e:
        error_message = f"Error processing business idea: {str(e)}"
        await send_status_update(error_message)
        logger.error(error_message)
        raise HTTPException(status_code=500, detail="Error processing business idea")
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
