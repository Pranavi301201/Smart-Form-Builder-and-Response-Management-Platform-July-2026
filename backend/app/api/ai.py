from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from google import genai
from google.genai import types
import os
import json
from dotenv import load_dotenv


# =========================================================
# LOAD ENVIRONMENT VARIABLES
# =========================================================

load_dotenv()


# =========================================================
# AI ROUTER
# =========================================================

router = APIRouter(
    prefix="/ai",
    tags=["AI Form Generation"]
)


# =========================================================
# GEMINI CLIENT
# =========================================================

api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise RuntimeError(
        "GEMINI_API_KEY is not set in the .env file."
    )


client = genai.Client(
    api_key=api_key
)


# =========================================================
# REQUEST SCHEMA
# =========================================================

class AIChatRequest(BaseModel):

    message: str
class AIGenerateFormRequest(BaseModel):

    prompt: str

# =========================================================
# AI FORM GENERATION
# =========================================================

# =========================================================
# AI CHAT
# =========================================================

@router.post("/chat")
async def ai_chat(
    request: AIChatRequest
):

    ai_prompt = f"""
You are FormAI, an intelligent and friendly AI assistant
inside a Smart Form Builder application.

You should behave naturally like ChatGPT.

The user said:

{request.message}

Your job:

1. If the user is greeting you, greeting them naturally.
2. If the user asks a normal question, answer it helpfully.
3. If the user asks for help creating or improving a form,
   understand their request and give a helpful response.
4. If the user clearly asks you to generate or create a form,
   generate the form.

IMPORTANT:

When the user is ONLY chatting, return JSON exactly like:

{{
    "type": "chat",
    "message": "Your natural helpful response"
}}

When the user clearly wants to CREATE or GENERATE a form,
return JSON exactly like:

{{
    "type": "form",
    "message": "I created this form for you.",
    "form": {{
        "title": "Form title",
        "description": "Short form description",
        "fields": [
            {{
                "type": "text",
                "label": "Full Name",
                "placeholder": "Enter your full name",
                "required": true,
                "readonly": false,
                "options": []
            }}
        ],
        "conditionalRules": []
    }}
}}

Use only these field types:

text
email
tel
number
textarea
dropdown
radio
checkbox
date
time
datetime-local

For dropdown, radio, and checkbox fields,
provide useful options.

For all other field types,
use an empty options array.

Do not return Markdown.
Do not use ```json.
Return only valid JSON.
"""

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=ai_prompt,

            config=types.GenerateContentConfig(

                response_mime_type="application/json"

            )

        )


        ai_response = json.loads(
            response.text
        )


        return {

            "success": True,

            **ai_response

        }


    except Exception as error:

        print(
            "Gemini AI Error:",
            error
        )


        raise HTTPException(

            status_code=500,

            detail=
                "Unable to get a response from FormAI."

        )
# =========================================================
# AI FORM GENERATION ENDPOINT
# =========================================================

@router.post("/generate-form")
async def generate_ai_form(
    request: AIGenerateFormRequest
):

    ai_prompt = f"""
You are an AI form generation assistant.

The user wants this form:

{request.prompt}

Generate a complete and useful form based on the user's request.

You can decide:
- The form title
- The description
- How many fields are needed
- Appropriate labels
- Appropriate field types
- Which fields should be required
- Dropdown, radio, or checkbox options when needed

Return ONLY valid JSON in exactly this structure:

{{
    "title": "Form title",
    "description": "Short form description",
    "fields": [
        {{
            "type": "text",
            "label": "Full Name",
            "placeholder": "Enter your full name",
            "required": true,
            "readonly": false,
            "options": []
        }}
    ],
    "conditionalRules": []
}}

IMPORTANT:

Use only these field types:

text
email
tel
number
textarea
dropdown
radio
checkbox
date
time
datetime-local

For dropdown, radio, and checkbox fields,
provide useful options.

For other field types,
use an empty options array.

Do not return Markdown.
Do not use ```json.
Return only the JSON object.
"""

    try:

        response = client.models.generate_content(

            model="gemini-3.6-flash",

            contents=ai_prompt,

            config=types.GenerateContentConfig(

                response_mime_type="application/json"

            )

        )

        generated_form = json.loads(
            response.text
        )

        return {

            "success": True,

            "message":
                "Form generated successfully",

            "form":
                generated_form

        }

    except Exception as error:

        print(
            "Gemini AI Error:",
            error
        )

        raise HTTPException(

            status_code=500,

            detail=
                "Unable to generate form using AI."

        )