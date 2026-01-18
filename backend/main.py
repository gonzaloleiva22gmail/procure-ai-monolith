from dotenv import load_dotenv
load_dotenv()

import os
import time
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import List, Dict, Optional
from openai import OpenAI

# Import backend modules
# Assuming running fro root with -m or setting PYTHONPATH, but standard uvicorn backend.main:app works if backend is a package
from backend.analyzer import analyze_document
from backend.generator import generate_document
from backend.file_utils import get_knowledge_base_content

app = FastAPI()

# Setup CORS
origins = [
    "*", # Allow all origins for development flexibility (port changes)
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI Client for Grok-3
XAI_API_KEY = os.getenv("XAI_API_KEY")
client = OpenAI(
    api_key=XAI_API_KEY or "dummy_key", # Fallback for local testing without key
    base_url="https://api.x.ai/v1",
)

# Pydantic Models
class AnalyzeRequest(BaseModel):
    filename: str

class DraftRequest(BaseModel):
    field_label: str
    user_notes: str
    context_files: Optional[str] = ""

class GenerateRequest(BaseModel):
    filename: str
    answers: Dict[str, str]

class ChatRequest(BaseModel):
    message: str
    filename: Optional[str] = None
    history: Optional[List[Dict[str, str]]] = []

# Endpoints

@app.get("/templates")
def get_templates():
    """Returns a list of available .docx templates with metadata."""
    templates_dir = os.path.join("backend", "templates")
    if not os.path.exists(templates_dir):
        return []
    
    files = [f for f in os.listdir(templates_dir) if f.endswith(".docx") and not f.startswith("~$")]
    
    template_list = []
    for filename in files:
        file_path = os.path.join(templates_dir, filename)
        try:
            stats = os.stat(file_path)
            # Format size to KB
            size_kb = stats.st_size / 1024
            formatted_size = f"{size_kb:.1f} KB"
            
            # Format date
            last_updated = time.strftime('%Y-%m-%d', time.localtime(stats.st_mtime))
            
            template_list.append({
                "id": filename, # Use filename as unique ID
                "name": filename,
                "date": last_updated,
                "size": formatted_size,
                "author": "System"
            })
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue
            
    return template_list

@app.get("/contracts")
def get_contracts():
    """Returns a list of available contract files with metadata."""
    contracts_dir = os.path.join("backend", "Contracts")
    if not os.path.exists(contracts_dir):
        return []
    
    files = [f for f in os.listdir(contracts_dir) if os.path.isfile(os.path.join(contracts_dir, f)) and not f.startswith("~$")]
    
    contract_list = []
    for filename in files:
        file_path = os.path.join(contracts_dir, filename)
        try:
            stats = os.stat(file_path)
            # Format size to KB
            size_kb = stats.st_size / 1024
            formatted_size = f"{size_kb:.1f} KB"
            
            # Format date
            last_updated = time.strftime('%Y-%m-%d', time.localtime(stats.st_mtime))
            
            contract_list.append({
                "id": filename, # Use filename as unique ID
                "name": filename,
                "date": last_updated,
                "size": formatted_size,
                "author": "System"
            })
        except Exception as e:
            print(f"Error processing {filename}: {e}")
            continue
            
    return contract_list

@app.post("/analyze")
def analyze_template(request: AnalyzeRequest):
    """
    Analyzes the document to extract variables and infer types.
    """
    try:
        file_path = os.path.join("backend", "templates", request.filename)
        result = analyze_document(file_path)
        return result
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Template not found")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate")
def generate_doc(request: GenerateRequest):
    """
    Generates a filled document from the template and extracted variables.
    """
    try:
        # Generate the document
        output_path = generate_document(request.filename, request.answers)
        
        # Return as file stream
        return FileResponse(
            output_path, 
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document", 
            filename=os.path.basename(output_path)
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/draft")
def draft_content(request: DraftRequest):
    """
    Uses Grok-3 to draft content based on user notes.
    """
    # UPGRADED PROMPT (Expert Mode)
    system_instruction = (
        "You are an expert Bid Writer for government tenders. "
        "Your goal is to write a persuasive, compliant, and professional response. "
        "Use active voice. Do not invent facts not present in the notes."
    )
    
    user_prompt = f"Expand these notes into a polished paragraph for the section '{request.field_label}':\n\n{request.user_notes}"
    
    if request.context_files:
         user_prompt += f"\n\nAdditional Context:\n{request.context_files}"

    try:
        completion = client.chat.completions.create(
            model="grok-3",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7
        )
        draft_text = completion.choices[0].message.content
        return {"draft_text": draft_text}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Generation failed: {str(e)}")

@app.post("/generate")
def generate_contract(request: GenerateRequest):
    """
    Generates the final document and returns it as a file download.
    """
    try:
        output_path = generate_document(request.filename, request.answers)
        
        # Check if file exists
        if not os.path.exists(output_path):
             raise HTTPException(status_code=500, detail="Generated file not found on disk")
             
        filename = os.path.basename(output_path)
        return FileResponse(
            path=output_path, 
            filename=filename, 
            media_type='application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        )
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/chat")
def chat_agent(request: ChatRequest):
    """
    Handles the Data Analyst / Knowledge Base chat.
    System Persona: You are the Data Analyst.
    Goal: Answer general questions about the organization's knowledge base.
    """
    # Define the persona
    kb_path = os.path.join("backend", "knowledge_base")
    kb_content = get_knowledge_base_content(kb_path)
    
    system_prompt = f"You are a helpful Knowledge Base Assistant. Your goal is to answer user questions about the organization's knowledge base.\n\nContext:\n{kb_content}"
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]
    
    # Append conversation history to maintain context
    if request.history:
        messages.extend(request.history)
        
    # Append the new user message
    messages.append({"role": "user", "content": request.message})

    try:
        completion = client.chat.completions.create(
            model="grok-3",
            messages=messages,
            temperature=0.7
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

@app.post("/template-chat")
def template_consultant_chat(request: ChatRequest):
    """
    Dedicated 'Interviewer' for the Template Consultant.
    CRASH-PROOF IMPLEMENTATION
    """
    try:
        # 1. READ CONTEXT (Analyze Document)
        analysis_context = "No template selected."
        analysis_result = []
        try:
            if request.filename:
                file_path = os.path.join("backend", "templates", request.filename)
                if os.path.exists(file_path):
                    # Re-use the existing analyzer logic
                    analysis_result = analyze_document(file_path)
                    analysis_context = f"Template Variables found:\\n{str(analysis_result)}"
        except Exception as e:
            print(f"Analysis Error (Non-fatal): {e}")

        # 2. DEFINE SYSTEM PROMPT
        system_instruction = (
            "You are an expert Procurement Consultant and Data Extractor.\\n"
            "Your Goal: Help the user fill in the variables found in the template analysis.\\n"
            f"TEMPLATE VARIABLES LIST ({len(analysis_result)} detected):\\n{analysis_context}\\n\\n"
            "PHASE 1: BULK EXTRACTION (Priority)\\n"
            "When the user provides a project brief or document:\\n"
            "1. Scan the text against EVERY variable in the list (v1 to v100+).\\n"
            "2. Extract values for as many variables as possible.\\n"
            "3. OUTPUT FORMAT: strictly a JSON object with two keys:\\n"
            "   - 'response': Your conversational response to the user (e.g. 'I have auto-filled...').\\n"
            "   - 'extracted_data': A dictionary of key-value pairs for the variables you found.\\n"
            "4. Only AFTER extraction, identify which variables are still missing and ask about them in the 'response'.\\n"
            "CRITICAL: You MUST output valid JSON inside a code block, e.g.\\n"
            "```json\\n{\\\"response\\\": \\\"...\\\", \\\"extracted_data\\\": {...}}\\n```"
        )

        messages = [{"role": "system", "content": system_instruction}]
        
        if request.history:
            messages.extend(request.history)
            
        messages.append({"role": "user", "content": request.message})

        # 3. CALL LLM (Wrapped try/catch)
        raw_response = ""
        try:
            completion = client.chat.completions.create(
                model="grok-3",
                messages=messages,
                temperature=0.7
            )
            raw_response = completion.choices[0].message.content
        except Exception as llm_error:
            print(f"LLM Crash: {llm_error}")
            return {"response": "I am having trouble connecting to my brain right now. Please try again.", "extracted_data": {}}

        # 4. ROBUST EXTRACTION (Regex Safety Net)
        extracted_data = {}
        clean_response = raw_response

        try:
            import json
            import re
            
            # Find JSON block using Regex
            match = re.search(r"```json\s*(\{.*?\})\s*```", raw_response, re.DOTALL)
            if not match:
                # Try finding just a JSON block without labels
                match = re.search(r"```\s*(\{.*?\})\s*```", raw_response, re.DOTALL)
                
            if match:
                json_str = match.group(1)
                content_json = json.loads(json_str)
                
                extracted_data = content_json.get("extracted_data", {})
                clean_response = content_json.get("response", raw_response)
            else:
                # Attempt to parse entire string if strict JSON mode was used
                try:
                    content_json = json.loads(raw_response)
                    extracted_data = content_json.get("extracted_data", {})
                    clean_response = content_json.get("response", raw_response)
                except:
                     pass # Not JSON, just treat as text

        except Exception as parse_error:
            print(f"JSON Parse Error: {parse_error}")
            # If parsing fails, clean_response remains the raw text, extracted_data is empty
            # We do NOT crash.

        # 5. RETURN SUCCESS
        return {
            "response": clean_response,
            "extracted_data": extracted_data
        }

    except Exception as fatal_error:
        # THE ULTIMATE FALLBACK
        print(f"FATAL ERROR 500: {fatal_error}")
        return {
            "response": "An internal error occurred, but I am still listening. Please try simplifying your request.",
            "extracted_data": {}
        }

# --- Contracts Assistant Endpoints ---

class ContractExtractRequest(BaseModel):
    filename: str

@app.post("/contracts/extract")
def extract_contract_terms(request: ContractExtractRequest):
    """
    Extracts key terms from a contract using backend/key_terms.json.
    """
    import json
    from backend.file_utils import read_word
    
    # 1. Load Key Terms
    try:
        with open(os.path.join("backend", "key_terms.json"), "r") as f:
            key_terms = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load key_terms.json: {e}")

    # 2. Read Contract Content
    file_path = os.path.join("backend", "Contracts", request.filename)
    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Contract file not found")
        
    contract_text = read_word(file_path)
    
    # 3. Prompt LLM
    system_prompt = "You are an expert Legal AI. Extract the following key terms from the contract text. Return strictly a JSON object string with keys matching the list provided."
    user_prompt = f"Key Terms to Extract: {key_terms}\n\nContract Text:\n{contract_text[:50000]}..." # Truncate if too long

    try:
        completion = client.chat.completions.create(
            model="grok-3", 
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.0,
            response_format={"type": "json_object"}
        )
        result_json = completion.choices[0].message.content
        return json.loads(result_json)
    except Exception as e:
         # Fallback if valid JSON isn't returned
        print(f"Extraction error: {e}")
        return {"error": "Failed to extract terms", "details": str(e)}

@app.post("/contract-chat")
def chat_contract(request: ChatRequest):
    """
    Chat strictly with the context of the specific contract. 
    OR if no filename is provided, answer generally about the available contracts.
    """
    from backend.file_utils import read_word
    
    # 1. Specific Contract Chat
    if request.filename:
        file_path = os.path.join("backend", "Contracts", request.filename)
        if not os.path.exists(file_path):
             # Try to see if it's just a name match in case of extension mismatch, or return error
             raise HTTPException(status_code=404, detail="Contract file not found")

        contract_text = read_word(file_path)

        system_prompt = (
            "You are a Contract Assistant. "
            "Answer questions STRICTLY based on the contract text provided below. "
            "If the answer is not in the document, say so.\n\n"
            f"--- CONTRACT TEXT ---\n{contract_text}"
        )
    else:
        # 2. General Contract Repo Chat
        # For now, list the available files relative to backend/Contracts
        contracts_dir = os.path.join("backend", "Contracts")
        available_files = []
        if os.path.exists(contracts_dir):
            available_files = [f for f in os.listdir(contracts_dir) if not f.startswith("~$")]
        
        system_prompt = (
            "You are the Contract Repository Assistant. "
            "The user has not selected a specific contract yet. "
            "You can help them find a contract or answer general questions. "
            f"Reviewing the repository, here are the available contracts:\n{', '.join(available_files)}\n\n"
            "If the user asks about a specific file, ask them to select it from the list on the left."
        )

    messages = [{"role": "system", "content": system_prompt}]
    
    if request.history:
        messages.extend(request.history)
        
    messages.append({"role": "user", "content": request.message})

    try:
        completion = client.chat.completions.create(
            model="grok-3",
            messages=messages,
            temperature=0.5
        )
        return {"response": completion.choices[0].message.content}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
# ---------------------------------------------------------
# PRODUCTION UI SERVING (Monolithic Setup)
# ---------------------------------------------------------

import os
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

# 1. MOUNT STATIC ASSETS (CSS, JS, Images)
# This serves the files inside 'dist/assets' at the URL '/assets'
# We wrap this in a try-catch or check to prevent crashes during 'Builder Mode' if dist is missing
if os.path.exists("backend/dist/assets"):
    app.mount("/assets", StaticFiles(directory="backend/dist/assets"), name="assets")
elif os.path.exists("dist/assets"): # Fallback if running from backend dir
     app.mount("/assets", StaticFiles(directory="dist/assets"), name="assets")

# 2. CATCH-ALL ROUTE (Serves the React App)
# If the user visits the root "/" or any other path not defined above, serve React.
@app.get("/{full_path:path}")
async def serve_react_app(full_path: str):
    # Security check: Prevent escaping the directory
    if ".." in full_path:
        return FileResponse("backend/dist/index.html")
    
    # Check if a specific file exists (e.g., favicon.ico, robots.txt)
    # Try backend/dist first
    file_path = os.path.join("backend", "dist", full_path)
    if os.path.exists(file_path) and os.path.isfile(file_path):
        return FileResponse(file_path)
    
    # Default: Serve the main React App (index.html)
    if os.path.exists("backend/dist/index.html"):
        return FileResponse("backend/dist/index.html")
        
    return {"error": "Frontend not built. Run 'npm run build' and move dist folder to backend."}
