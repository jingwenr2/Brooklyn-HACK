"""
Catalyst engine — schedules market-shifting events, fires them on turn end,
and exposes hooks for Research/Trivia to reveal upcoming ones.

Architecture.md §5. Events are stored in the `catalysts` table (see models/core).
"""
from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Optional

from sqlalchemy.orm import Session

from backend.config import BALANCE
from backend.models.core import Catalyst, GameState, Property

_TEMPLATES_PATH = Path(__file__).parent / "templates.json"
_TEMPLATES: list[dict] = []


def _load_templates() -> list[dict]:
    global _TEMPLATES
    if not _TEMPLATES:
        with _TEMPLATES_PATH.open() as f:
            _TEMPLATES = json.load(f)["templates"]
    return _TEMPLATES


# ──────────────────────────────────────────────
#  GAME START — schedule the event queue
# ──────────────────────────────────────────────

def generate_catalysts_for_game(db: Session, game: GameState, count: int = 4) -> list[Catalyst]:
    """
    Generate `count` catalyst events with random effects + future turns.
    Called once at create_new_game. Events target the whole district (all props).
    """
    templates = _load_templates()
    chosen = random.sample(templates, min(count, len(templates)))

    # Space events across turns 3..(max_turns-2)
    lo = 3
    hi = max(lo + 1, game.max_turns - 2)
    turns = sorted(random.sample(range(lo, hi + 1), len(chosen)))

    events = []
    for tpl, turn in zip(chosen, turns):
        is_boom = random.random() < 0.55  # slight boom bias
        # Rent effect: boom 1.25-1.50, bust 0.70-0.90
        rent_mult = random.uniform(1.25, 1.50) if is_boom else random.uniform(0.70, 0.90)
        # Value effect: boom 1.15-1.30, bust 0.75-0.90
        value_mult = random.uniform(1.15, 1.30) if is_boom else random.uniform(0.75, 0.90)

        cat = Catalyst(
            id=f"{game.id}_cat_{turn}_{random.randint(1000, 9999)}",
            game_id=game.id,
            theme=tpl["theme"],
            category=tpl["category"],
            copy=tpl["boom_copy"] if is_boom else tpl["bust_copy"],
            direction="boom" if is_boom else "bust",
            scheduled_turn=turn,
            rent_multiplier=round(rent_mult, 3),
            value_multiplier=round(value_mult, 3),
            duration=random.randint(2, 4),
            status="pending",
            revealed=False,
        )
        db.add(cat)
        events.append(cat)

    db.commit()
    return events


# ──────────────────────────────────────────────
#  TURN END — fire due events, expire old ones
# ──────────────────────────────────────────────

def fire_catalysts_for_turn(db: Session, game: GameState) -> list[dict]:
    """
    Apply any catalyst whose scheduled_turn == game.turn.
    Expire any active catalyst whose effect window has passed.
    Returns list of event summaries for the UI.
    """
    fired: list[dict] = []

    # 1. Fire newly-due events
    due = db.query(Catalyst).filter(
        Catalyst.game_id == game.id,
        Catalyst.scheduled_turn == game.turn,
        Catalyst.status == "pending",
    ).all()

    for cat in due:
        props = db.query(Property).filter(Property.game_id == game.id).all()
        for p in props:
            p.market_value = int(p.market_value * cat.value_multiplier)
            p.rent_value = int(p.rent_value * cat.rent_multiplier)
        cat.status = "active"
        cat.fired_turn = game.turn
        fired.append({
            "id": cat.id,
            "theme": cat.theme,
            "direction": cat.direction,
            "copy": cat.copy,
            "rent_multiplier": cat.rent_multiplier,
            "value_multiplier": cat.value_multiplier,
            "duration": cat.duration,
        })

    # 2. Expire events whose window closed
    expiring = db.query(Catalyst).filter(
        Catalyst.game_id == game.id,
        Catalyst.status == "active",
    ).all()
    for cat in expiring:
        if cat.fired_turn is not None and game.turn - cat.fired_turn >= cat.duration:
            # Revert the multipliers
            inv_value = 1.0 / cat.value_multiplier
            inv_rent = 1.0 / cat.rent_multiplier
            props = db.query(Property).filter(Property.game_id == game.id).all()
            for p in props:
                p.market_value = int(p.market_value * inv_value)
                p.rent_value = int(p.rent_value * inv_rent)
            cat.status = "expired"

    db.commit()
    return fired


# ──────────────────────────────────────────────
#  RESEARCH — pick a catalyst to quiz about
# ──────────────────────────────────────────────

def pick_catalyst_for_research(db: Session, game: GameState) -> Optional[Catalyst]:
    """
    Find an unrevealed future catalyst the user hasn't seen yet.
    If none left, generate one on the fly (hybrid fallback from architecture.md §5).
    Returns None only if no future turns remain in the game.
    """
    candidate = db.query(Catalyst).filter(
        Catalyst.game_id == game.id,
        Catalyst.status == "pending",
        Catalyst.revealed == False,
        Catalyst.scheduled_turn > game.turn,
    ).order_by(Catalyst.scheduled_turn.asc()).first()

    if candidate:
        return candidate

    # Hybrid fallback: generate a new event if there's room
    if game.turn >= game.max_turns - 1:
        return None

    templates = _load_templates()
    tpl = random.choice(templates)
    is_boom = random.random() < 0.55
    rent_mult = random.uniform(1.25, 1.50) if is_boom else random.uniform(0.70, 0.90)
    value_mult = random.uniform(1.15, 1.30) if is_boom else random.uniform(0.75, 0.90)
    turn = random.randint(game.turn + 1, max(game.turn + 2, game.max_turns - 1))

    cat = Catalyst(
        id=f"{game.id}_cat_{turn}_{random.randint(1000, 9999)}",
        game_id=game.id,
        theme=tpl["theme"],
        category=tpl["category"],
        copy=tpl["boom_copy"] if is_boom else tpl["bust_copy"],
        direction="boom" if is_boom else "bust",
        scheduled_turn=turn,
        rent_multiplier=round(rent_mult, 3),
        value_multiplier=round(value_mult, 3),
        duration=random.randint(2, 4),
        status="pending",
        revealed=False,
    )
    db.add(cat)
    db.commit()
    return cat


def reveal_catalyst(db: Session, catalyst: Catalyst) -> None:
    catalyst.revealed = True
    db.commit()
