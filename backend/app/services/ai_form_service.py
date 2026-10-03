import os
import json
import re

from dotenv import load_dotenv
import google.generativeai as genai


# =========================================================
# LOAD ENVIRONMENT
# =========================================================

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not configured")


genai.configure(
    api_key=GEMINI_API_KEY
)


# =========================================================
# AI MODEL
# =========================================================

model = genai.GenerativeModel(
    "gemini-1.5-flash"
)


# =========================================================
# GENERATE FORM
# =========================================================

def generate_form_from_description(description: str):

    prompt = f"""
You are an expert AI form designer.

Create a professional form based on the user's description.

USER REQUEST:
{description}

Return ONLY valid JSON.

The JSON must follow EXACTLY this structure:

{{
    "title": "Form title",
    "description": "Short professional description",
    "fields": [
        {{
            "id": "field_1",
            "label": "Question",
            "type": "text",
            "placeholder": "Enter your answer",
            "required": true,
            "readonly": false,
            "options": [],
            "condition": null
        }}
    ],
    "conditionalRules": []
}}

Allowed field types:

- text
- email
- number
- textarea
- select
- radio
- checkbox
- date
- phone
- rating

Rules:

1. Create only useful fields.
2. Make the form professional.
3. Use clear labels.
4. Use placeholders where useful.
5. Set required=true only for important fields.
6. For select, radio, and checkbox fields, provide options.
7. For text, email, number, textarea, date and phone fields, options should be [].
8. Generate between 4 and 10 fields.
9. Use unique field IDs.
10. conditionalRules should be [] unless conditional logic is clearly useful.
11. Do not use Markdown.
12. Do not put ``` around the JSON.
13. Return JSON only.
"""

    response = model.generate_content(prompt)

    text = response.text.strip()

    # =====================================================
    # REMOVE POSSIBLE MARKDOWN CODE BLOCK
    # =====================================================

    text = re.sub(
        r"^```json\s*",
        "",
        text,
        flags=re.IGNORECASE
    )

    text = re.sub(
        r"^```\s*",
        "",
        text
    )

    text = re.sub(
        r"\s*```$",
        "",
        text
    )

    text = text.strip()

    # =====================================================
    # PARSE JSON
    # =====================================================

    try:

        form_data = json.loads(text)

    except json.JSONDecodeError as error:

        raise ValueError(
            f"AI returned invalid JSON: {error}"
        )

    # =====================================================
    # BASIC VALIDATION
    # =====================================================

    if not isinstance(form_data, dict):

        raise ValueError(
            "AI response must be a JSON object"
        )

    if "title" not in form_data:

        raise ValueError(
            "AI response missing title"
        )

    if "description" not in form_data:

        form_data["description"] = ""

    if "fields" not in form_data:

        form_data["fields"] = []

    if "conditionalRules" not in form_data:

        form_data["conditionalRules"] = []

    return form_data