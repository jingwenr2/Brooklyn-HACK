"""
Research action — trivia-powered intel system.

Flow:
  1. Player spends 1 AP to start research on a property
  2. Backend generates a multiple-choice trivia question (via OpenAI)
  3. Player answers; correct → real intel, wrong → misleading intel
"""

import json
import uuid
import random
from openai import OpenAI

from backend.config import OPENAI_API_KEY, OPENAI_TRIVIA_MODEL

_client: OpenAI | None = None
# In-memory store for pending trivia questions (session-scoped, not persisted)
_pending_questions: dict[str, dict] = {}


def _get_client() -> OpenAI:
    global _client
    if _client is None:
        _client = OpenAI(api_key=OPENAI_API_KEY)
    return _client


def generate_question(property_name: str, tier: str) -> dict:
    """Generate a multiple-choice trivia question about real estate / finance.

    Returns dict with: question_id, question, options (list[str]), correct_index (int)
    """
    # Try OpenAI first; fall back to static questions if API fails
    try:
        return _generate_ai_question(property_name, tier)
    except Exception:
        return _generate_fallback_question(property_name)


def _generate_ai_question(property_name: str, tier: str) -> dict:
    client = _get_client()

    prompt = (
        f"Generate a real-estate or finance trivia question for a property game. "
        f"The player is researching a {tier}-tier property called '{property_name}'. "
        f"Return ONLY valid JSON with these keys:\n"
        f'  "question": a short trivia question (1 sentence),\n'
        f'  "options": array of exactly 4 answer strings,\n'
        f'  "correct_index": integer 0-3 indicating the correct answer\n'
        f"Make it fun but educational. Topics: real estate terms, investing, "
        f"Brooklyn history, urban development, finance basics."
    )

    resp = client.chat.completions.create(
        model=OPENAI_TRIVIA_MODEL,
        messages=[{"role": "user", "content": prompt}],
        temperature=0.9,
        max_tokens=250,
    )

    raw = resp.choices[0].message.content.strip()
    # Strip markdown fences if present
    if raw.startswith("```"):
        raw = raw.split("\n", 1)[1].rsplit("```", 1)[0].strip()

    data = json.loads(raw)
    question_id = uuid.uuid4().hex[:12]

    result = {
        "question_id": question_id,
        "question": data["question"],
        "options": data["options"][:4],
        "correct_index": int(data["correct_index"]),
    }

    _pending_questions[question_id] = result
    return result


# ── Static fallback pool ───────────────────────────────

_STATIC_QUESTIONS = [
    {
        "question": "What does 'LTV' stand for in real estate finance?",
        "options": ["Loan-To-Value", "Long-Term Valuation", "Land Tax Variance", "Lease Term Verification"],
        "correct_index": 0,
    },
    {
        "question": "What Brooklyn neighborhood was historically known as 'Breuckelen'?",
        "options": ["Williamsburg", "Brooklyn Heights", "All of Brooklyn", "Park Slope"],
        "correct_index": 2,
    },
    {
        "question": "In property development, what does 'cap rate' measure?",
        "options": ["Maximum rent increase", "Return on investment", "Construction capacity", "Capital gains tax rate"],
        "correct_index": 1,
    },
    {
        "question": "What is a 'triple net lease' (NNN)?",
        "options": [
            "Tenant pays rent + taxes + insurance + maintenance",
            "Three tenants share one lease",
            "A lease lasting exactly 3 years",
            "Three months of free rent upfront",
        ],
        "correct_index": 0,
    },
    {
        "question": "What is 'gentrification' in urban development?",
        "options": [
            "Building new public parks",
            "Wealthier residents moving into lower-income areas, raising costs",
            "Converting commercial zones to residential",
            "Government-funded housing projects",
        ],
        "correct_index": 1,
    },
    {
        "question": "What does ROI stand for?",
        "options": ["Rate of Inflation", "Return on Investment", "Risk of Insolvency", "Ratio of Income"],
        "correct_index": 1,
    },
    {
        "question": "What is 'equity' in real estate?",
        "options": [
            "The property's total market value",
            "The difference between market value and amount owed",
            "Monthly rental income",
            "The down payment amount",
        ],
        "correct_index": 1,
    },
    {
        "question": "What does 'flipping' a property mean?",
        "options": [
            "Renting it to multiple tenants",
            "Buying, renovating quickly, and selling for profit",
            "Converting residential to commercial",
            "Transferring ownership to a trust",
        ],
        "correct_index": 1,
    },
]


def _generate_fallback_question(property_name: str) -> dict:
    q = random.choice(_STATIC_QUESTIONS)
    question_id = uuid.uuid4().hex[:12]
    result = {
        "question_id": question_id,
        "question": q["question"],
        "options": list(q["options"]),
        "correct_index": q["correct_index"],
    }
    _pending_questions[question_id] = result
    return result


def validate_answer(question_id: str, selected_index: int) -> dict:
    """Check the player's answer against the stored correct answer.

    Returns: {"correct": bool, "correct_index": int}
    """
    q = _pending_questions.pop(question_id, None)
    if q is None:
        return {"correct": False, "correct_index": -1, "error": "Question expired or not found"}

    return {
        "correct": selected_index == q["correct_index"],
        "correct_index": q["correct_index"],
    }
