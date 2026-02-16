import os
import sys
import json
from dotenv import load_dotenv

# Add backend to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.append(current_dir)

# Load ENV
env_path = os.path.join(current_dir, '..', '.env')
load_dotenv(dotenv_path=env_path)

from main import client, get_knowledge_base_content

def test_ai_accuracy():
    print("Simulating AI Analysis of Finance Data...")
    
    kb_path = os.path.join(current_dir, "knowledge_base")
    kb_context = get_knowledge_base_content(kb_path)
    
    print(f"Context loaded. Size: {len(kb_context)} chars.")
    
    message = "what are the top 3 categories with the higher sales in 2025"
    
    system_prompt = (
        "You are a Data Analyst. Answer the user's question based strictly on the following context:\n\n"
        f"{kb_context}\n\n"
        "If the answer is not in the context, say you don't have that information."
    )
    
    print("Sending request to AI...")
    completion = client.chat.completions.create(
        model="grok-3",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": message}
        ],
        temperature=0.0 # Strict for math
    )
    
    print("\nAI Response:")
    print(completion.choices[0].message.content)

if __name__ == "__main__":
    try:
        test_ai_accuracy()
    except Exception as e:
        print(f"ERROR: {e}")
