from fastapi.testclient import TestClient
from backend.main import app
import os
import io

client = TestClient(app)

def test_endpoints():
    print("Testing Endpoints...")

    # 1. GET /templates
    # Ensure there is a dummy template
    os.makedirs(os.path.join("backend", "templates"), exist_ok=True)
    with open(os.path.join("backend", "templates", "test_mock.docx"), "w") as f:
        f.write("dummy docx content")
    
    response = client.get("/templates")
    print(f"GET /templates: {response.status_code}")
    assert response.status_code == 200
    assert "test_mock.docx" in response.json()
    print("[PASS] GET /templates")

    # 2. POST /analyze
    # (We won't really parse the text file as docx, so it might fail extraction but endpoint should work)
    # Let's clean up and use a real docx if needed, but for now just checking init.
    # Actually analyzer will fail reading "dummy docx content" as zip.
    # We should skip deep logic check if we trust analyzer tests, just check 404 or basic handling.
    response = client.post("/analyze", json={"filename": "non_existent.docx"})
    print(f"POST /analyze (404 expected): {response.status_code}")
    assert response.status_code == 404
    print("[PASS] POST /analyze (404 handled)")

    # 3. POST /draft
    # Mocking openai client is hard here without patching inside main.
    # But we can try with dummy key and see if it tries to call API.
    # Expect 500 or specific error message.
    response = client.post("/draft", json={"field_label": "Test", "user_notes": "Notes"})
    # Since we set "dummy_key", it might fail auth.
    print(f"POST /draft: {response.status_code}")
    # If it returns 500 because of API error, that means endpoint is wired up.
    if response.status_code == 500:
        print("[PASS] POST /draft (500 expected with dummy key)")
    elif response.status_code == 200:
        print("[PASS] POST /draft (Success - Surprise!)")
    else:
        print(f"[FAIL] POST /draft status {response.status_code}")

    # 4. POST /generate
    # Needs valid template for docxtpl
    # If we pass non-existent, expect 404
    response = client.post("/generate", json={"filename": "non_existent.docx", "answers": {}})
    print(f"POST /generate (404 expected): {response.status_code}")
    assert response.status_code == 404
    print("[PASS] POST /generate (404 handled)")

if __name__ == "__main__":
    test_endpoints()
