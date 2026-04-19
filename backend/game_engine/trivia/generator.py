"""
Trivia generator — calls OpenAI Chat Completions to produce a multiple-choice
question tied to a catalyst's theme/category. Falls back to a bundled JSON bank
if no API key is set or the API call fails.

Architecture.md §6.
"""
from __future__ import annotations

import json
import random
from dataclasses import dataclass
from pathlib import Path
from typing import Optional

from backend.config import OPENAI_API_KEY, OPENAI_TRIVIA_MODEL

_FALLBACK_PATH = Path(__file__).parent / "questions_fallback.json"
_FALLBACK: dict[str, list[dict]] = {}


@dataclass
class TriviaQuestion:
    question: str
    options: list[str]
    correct_index: int
    category: str
    source: str  # "openai" or "fallback"


def _load_fallback() -> dict[str, list[dict]]:
    global _FALLBACK
    if not _FALLBACK:
        with _FALLBACK_PATH.open() as f:
            _FALLBACK = json.load(f)
    return _FALLBACK


def _fallback_question(category: str) -> TriviaQuestion:
    bank = _load_fallback()
    pool = bank.get(category) or next(iter(bank.values()))
    pick = random.choice(pool)
    return TriviaQuestion(
        question=pick["question"],
        options=list(pick["options"]),
        correct_index=int(pick["correct_index"]),
        category=category,
        source="fallback",
    )


def _openai_question(theme: str, category: str, difficulty: str) -> Optional[TriviaQuestion]:
    if not OPENAI_API_KEY:
        return None
    try:
        # Imported lazily so the backend still boots without the package in dev.
        from openai import OpenAI
    except ImportError:
        return None

    client = OpenAI(api_key=OPENAI_API_KEY)
    prompt = (
        f"Generate a {difficulty} multiple-choice trivia question related to: "
        f"{theme}. Category: {category} (gaming, tech, urban, finance, culture). "
        "Return STRICT JSON with this shape and no extra prose:\n"
        '{"question": "...", "options": ["a","b","c","d"], "correct_index": 0}\n'
        "Rules:\n"
        "- Exactly 4 options.\n"
        "- correct_index is the 0-based index of the right answer.\n"
        "- Keep each option under 80 characters.\n"
        "- Do not reference the catalyst itself; make it a real trivia question."
    )

    try:
        resp = client.chat.completions.create(
            model=OPENAI_TRIVIA_MODEL,
            messages=[
                {"role": "system", "content": "You write tight, accurate pop-culture trivia. Output valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.8,
            max_tokens=300,
            response_format={"type": "json_object"},
        )
        raw = resp.choices[0].message.content
        if not raw:
            return None
        data = json.loads(raw)
        options = data.get("options") or []
        correct = data.get("correct_index")
        question = data.get("question")
        if (
            not isinstance(options, list)
            or len(options) != 4
            or not isinstance(correct, int)
            or not (0 <= correct < 4)
            or not isinstance(question, str)
        ):
            return None
        return TriviaQuestion(
            question=question,
            options=[str(o) for o in options],
            correct_index=correct,
            category=category,
            source="openai",
        )
    except Exception:
        return None


def generate_trivia(theme: str, category: str, difficulty: str = "medium") -> TriviaQuestion:
    """
    Primary entry point. Always returns a TriviaQuestion. Uses OpenAI if a key
    is configured and the call succeeds; otherwise pulls from the offline bank.
    """
    q = _openai_question(theme, category, difficulty)
    if q is not None:
        return q
    return _fallback_question(category)
