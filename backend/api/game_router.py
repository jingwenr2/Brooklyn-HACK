"""
FastAPI router — game loop + player action endpoints.
"""
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models.core import Catalyst, GameState, Player, Property
import backend.game_engine.core as engine

router = APIRouter(prefix="/game", tags=["Game"])


# ── Request bodies ──────────────────────────
class ActionRequest(BaseModel):
    property_id: str


class ResearchRequest(BaseModel):
    property_id: str
    difficulty: str = "medium"


class TriviaAnswerRequest(BaseModel):
    answer_index: int


# ── Game lifecycle ──────────────────────────

@router.post("/start/{session_id}")
def start_game(session_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Create a new game session (wipes any existing one with same id)."""
    game = engine.create_new_game(db, session_id)
    # Warm the trivia cache so the first Research click is instant.
    background_tasks.add_task(engine.pregen_next_trivia, session_id)
    return {"message": "Game started", "session_id": game.id, "turn": game.turn}


@router.post("/{session_id}/turn/start")
def start_turn(session_id: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    """Roll AP for the turn & drip-feed new listings."""
    game = _get_game(db, session_id)
    if game.current_ap > 0:
        return {"message": "Already rolled for this turn", "ap": game.current_ap}
    result = engine.start_turn(db, game)
    # Refresh the trivia cache in case the previously cached event has fired.
    background_tasks.add_task(engine.pregen_next_trivia, session_id)
    return result


@router.post("/{session_id}/turn/end")
def end_turn(session_id: str, db: Session = Depends(get_db)):
    """End the current turn — collect rent, expire listings, check victory."""
    game = _get_game(db, session_id)
    result = engine.end_turn(db, game)
    return result


@router.post("/{session_id}/turn/activate_timer")
def activate_timer(session_id: str, db: Session = Depends(get_db)):
    """Start the 40-second speed timer after the player proceeds from the dice roll."""
    game = _get_game(db, session_id)
    result = engine.activate_timer(db, game)
    return result


@router.post("/{session_id}/pause")
def pause_game(session_id: str, db: Session = Depends(get_db)):
    """Freeze the speed timer."""
    game = _get_game(db, session_id)
    result = engine.pause_game(db, game)
    return result


@router.post("/{session_id}/resume")
def resume_game_timer(session_id: str, db: Session = Depends(get_db)):
    """Unfreeze the speed timer."""
    game = _get_game(db, session_id)
    result = engine.resume_game(db, game)
    return result


# ── Player actions (each costs 1 AP) ───────

@router.post("/{session_id}/action/buy")
def action_buy(session_id: str, body: ActionRequest, db: Session = Depends(get_db)):
    """Buy a listed property."""
    game = _get_game(db, session_id)
    player = _get_user(db, session_id)
    result = engine.buy_property(db, game, player, body.property_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{session_id}/action/develop")
def action_develop(session_id: str, body: ActionRequest, db: Session = Depends(get_db)):
    """Develop an owned property (increase dev level, rent, and value)."""
    game = _get_game(db, session_id)
    player = _get_user(db, session_id)
    result = engine.develop_property(db, game, player, body.property_id)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{session_id}/action/research")
def action_research(session_id: str, body: ResearchRequest, db: Session = Depends(get_db)):
    """Start research: generate (or resume) a trivia question for the player."""
    game = _get_game(db, session_id)
    player = _get_user(db, session_id)
    result = engine.research_action(db, game, player, body.property_id, body.difficulty)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@router.post("/{session_id}/action/research/answer")
def action_research_answer(
    session_id: str,
    body: TriviaAnswerRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    """Submit a trivia answer — spends 1 AP and reveals (or misleads about) the catalyst."""
    game = _get_game(db, session_id)
    player = _get_user(db, session_id)
    result = engine.answer_trivia(db, game, player, body.answer_index)
    if not result["success"]:
        raise HTTPException(status_code=400, detail=result["error"])
    # Warm the cache for the NEXT catalyst so the follow-up Research is instant too.
    background_tasks.add_task(engine.pregen_next_trivia, session_id)
    return result


# ── Status / full state ────────────────────

@router.get("/{session_id}/status")
def get_status(session_id: str, db: Session = Depends(get_db)):
    """Full game state snapshot for the frontend."""
    game = _get_game(db, session_id)
    user = _get_user(db, session_id)
    flipper = db.query(Player).filter(
        Player.game_id == session_id, Player.role == "FLIPPER"
    ).first()

    props = db.query(Property).filter(Property.game_id == session_id).all()

    catalysts = db.query(Catalyst).filter(Catalyst.game_id == session_id).all()
    # Only expose revealed events to the player; active/expired are always visible.
    visible_catalysts = [
        {
            "id": c.id,
            "theme": c.theme,
            "category": c.category,
            "direction": c.direction,
            "copy": c.copy,
            "scheduled_turn": c.scheduled_turn,
            "fired_turn": c.fired_turn,
            "duration": c.duration,
            "rent_multiplier": c.rent_multiplier,
            "value_multiplier": c.value_multiplier,
            "status": c.status,
            # Hide the scheduled turn for unrevealed pending events.
            "revealed": c.revealed,
        }
        for c in catalysts
        if c.revealed or c.status in ("active", "expired")
    ]

    return {
        "turn": game.turn,
        "max_turns": game.max_turns,
        "ap_remaining": game.current_ap,
        "turn_expires_at": game.turn_expires_at,
        "finance_tier": game.finance_tier,
        "player": {
            "cash": user.cash,
            "debt": user.debt,
            "reputation": user.reputation,
            "is_bankrupt": user.is_bankrupt,
            "net_worth": engine._calc_net_worth(db, user),
        },
        "flipper": {
            "cash": flipper.cash if flipper else 0,
            "is_bankrupt": flipper.is_bankrupt if flipper else False,
        },
        "properties": [
            {
                "id": p.id,
                "name": p.name,
                "tier": p.tier,
                "base_value": p.base_value,
                "market_value": p.market_value,
                "rent_value": p.rent_value,
                "dev_level": p.dev_level,
                "owner_id": p.owner_id,
                "is_listed": p.is_listed,
                "unlock_turn": p.unlock_turn,
                "expiry_turn": p.expiry_turn,
                "sprite_key": p.sprite_key,
                "is_flipper_target": p.is_flipper_target,
                "flipper_acquire_turn": p.flipper_acquire_turn,
            }
            for p in props
        ],
        "catalysts": visible_catalysts,
    }


# ── Helpers ─────────────────────────────────

def _get_game(db: Session, session_id: str) -> GameState:
    game = db.query(GameState).filter(GameState.id == session_id).first()
    if not game:
        raise HTTPException(status_code=404, detail="Game session not found")
    return game


def _get_user(db: Session, session_id: str) -> Player:
    player = db.query(Player).filter(
        Player.game_id == session_id, Player.role == "USER"
    ).first()
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    return player
