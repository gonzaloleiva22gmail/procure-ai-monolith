import os
import sys
from dotenv import load_dotenv

# 1. LOAD ENV
current_dir = os.path.dirname(os.path.abspath(__file__))
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(dotenv_path=env_path)

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import OpenAI
# Backend Module Imports
from backend.analyzer import analyze_document
from backend.generator import generate_document

app = FastAPI()

# 2. CORS (Allows Vercel & Localhost to talk to this API)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 3. CLIENT SETUP
XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(
    api_key=XAI_API_KEY or "dummy_key",
    base_url="https://api.x.ai/v1",
)

# --- MODELS ---
class AnalyzeRequest(BaseModel): filename: str
class GenerateRequest(BaseModel): filename: str; answers: Dict[str, str]
class ChatRequest(BaseModel): message: str; filename: Optional[str] = None; history: Optional[List[Dict[str, str]]] = []
class DraftRequest(BaseModel): field_label: str; user_notes: str; context_files: Optional[str] = ""

# --- ENDPOINTS ---

@app.get("/templates")
def get_templates():
    templates_dir = os.path.join("backend", "templates")
    if not os.path.exists(templates_dir): return []
    return [{"id": f, "name": f, "size": "Unknown", "author": "System"} for f in os.listdir(templates_dir) if f.endswith(".docx") and not f.startswith("~$")]

@app.get("/contracts")
def get_contracts():
    contracts_dir = os.path.join("backend", "Contracts")
    if not os.path.exists(contracts_dir): return []
    return [{"id": f, "name": f, "size": "Unknown", "author": "System"} for f in os.listdir(contracts_dir) if not f.startswith("~$")]

@app.post("/analyze")
def analyze_template(request: AnalyzeRequest):
    try:
        return analyze_document(os.path.join("backend", "templates", request.filename))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate")
def generate_doc(request: GenerateRequest):
    try:
        output_path = generate_document(request.filename, request.answers)
        return FileResponse(output_path, filename=os.path.basename(output_path))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/draft")
def draft_content(request: DraftRequest):
    try:
        completion = client.chat.completions.create(
            model="grok-2", # Using stable model
            messages=[
                {"role": "system", "content": "You are an expert Bid Writer."},
                {"role": "user", "content": f"Draft text for {request.field_label} based on: {request.user_notes}"}
            ]
        )
        return {"draft_text": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- THIS IS THE MISSING PIECE (Fixes your 404) ---
@app.post("/template-chat")
def template_consultant_chat(request: ChatRequest):
    analysis_context = "No template selected."
    if request.filename:
        try:
            file_path = os.path.join("backend", "templates", request.filename)
            if os.path.exists(file_path):
                res = analyze_document(file_path)
                analysis_context = f"Variables found: {str(res)}"
        except: pass

    messages = [{"role": "system", "content": f"You are a Procurement Consultant. Context: {analysis_context}. Extract data to JSON."}]
    if request.history: messages.extend(request.history)
    messages.append({"role": "user", "content": request.message})

    try:
        completion = client.chat.completions.create(
            model="grok-2", 
            messages=messages,
            temperature=0.7,
            response_format={"type": "json_object"}
        )
        import json
        return json.loads(completion.choices[0].message.content)
    except Exception as e:
        return {"response": f"Error: {str(e)}", "extracted_data": {}}

@app.get("/")
def read_root():
    return {"status": "Backend is online."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)