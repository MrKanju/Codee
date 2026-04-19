from fastapi import FastAPI
from pydantic import BaseModel
from fastapi.middleware.cors import CORSMiddleware
from fastapi import Request as FastAPIRequest
from google import genai
import time

app = FastAPI()

# 🔥 CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 🔑 Gemini client (replace with env later)
import os
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
if not os.getenv("GEMINI_API_KEY"):
    raise Exception("GEMINI_API_KEY not set")
# 🔥 CACHE (Feature 10)
cache = {}
CACHE_TTL = 300  # 5 min

# 🔥 RATE LIMIT (Feature 9)
rate_limit = {}
REQUEST_LIMIT = 5
TIME_WINDOW = 60


# 🧠 Request Model
class Request(BaseModel):
    title: str
    description: str
    code: str
    hint_level: int


@app.get("/")
def home():
    return {"message": "Backend running"}


@app.post("/hint")
def get_hint(req: Request, request: FastAPIRequest):
    try:
        print("Request received")

        # ==========================
        # 🔒 RATE LIMIT
        # ==========================
        user_ip = request.client.host
        current_time = time.time()

        if user_ip not in rate_limit:
            rate_limit[user_ip] = []

        rate_limit[user_ip] = [
            t for t in rate_limit[user_ip]
            if current_time - t < TIME_WINDOW
        ]

        if len(rate_limit[user_ip]) >= REQUEST_LIMIT:
            return {
                "hint": "Too many requests. Please wait.",
                "next_step": ""
            }

        rate_limit[user_ip].append(current_time)

        # ==========================
        # ⚡ CACHE CHECK
        # ==========================
        cache_key = f"{req.title}_{req.code}_{req.hint_level}"

        if cache_key in cache:
            entry = cache[cache_key]
            if time.time() - entry["time"] < CACHE_TTL:
                print("CACHE HIT")
                return entry["value"]
            else:
                del cache[cache_key]

        # ==========================
        # 🤖 PROMPT
        # ==========================
        prompt = f"""
You are a coding interview assistant.

Problem: {req.title}
Description: {req.description}

User Code:
{req.code}

Hint level: {req.hint_level}

Rules:
- Level 1: subtle hint
- Level 2: clear direction
- Level 3: almost full logic
- Do NOT give full code
- Keep it short

IMPORTANT:
Return ONLY valid JSON.

{{
  "hint": "...",
  "next_step": "..."
}}
"""

        # ==========================
        # 🤖 GEMINI CALL
        # ==========================
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt
        )

        # ==========================
        # 🧠 PARSE RESPONSE
        # ==========================
        import json
        import re

        raw_text = response.candidates[0].content.parts[0].text

        try:
            # Extract JSON safely
            json_match = re.search(r'\{.*\}', raw_text, re.DOTALL)

            if json_match:
                parsed = json.loads(json_match.group())
                hint = parsed.get("hint", "")
                next_step = parsed.get("next_step", "")
            else:
                hint = raw_text
                next_step = "Think about the next logical step."

        except Exception as e:
            print("Parsing error:", e)
            hint = raw_text
            next_step = ""

        # ==========================
        # 💾 SAVE CACHE
        # ==========================
        cache[cache_key] = {
            "value": {
                "hint": hint,
                "next_step": next_step
            },
            "time": time.time()
        }

        return {
            "hint": hint,
            "next_step": next_step
        }

    except Exception as e:
        import traceback
        print("ERROR:", e)
        traceback.print_exc()
        return {
            "hint": "Backend error",
            "next_step": ""
        }
import uvicorn

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000)